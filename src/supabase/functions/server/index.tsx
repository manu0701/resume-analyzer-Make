import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Initialize storage bucket for resumes
const BUCKET_NAME = 'make-bd77ee63-resumes';

async function initializeStorage() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (error) {
        console.log('Error creating bucket:', error);
      } else {
        console.log('Storage bucket created successfully');
      }
    } else {
      console.log('Storage bucket already exists');
    }
  } catch (error) {
    console.log('Error initializing storage:', error);
  }
}

// Initialize storage on startup
initializeStorage();

// User Registration
app.post('/make-server-bd77ee63/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Error during user registration:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      createdAt: new Date().toISOString()
    });

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Failed to register user' }, 500);
  }
});

// Extract text from PDF
app.post('/make-server-bd77ee63/extract-pdf', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized - please log in' }, 401);
    }

    const body = await c.req.json();
    const { pdfBase64, fileName } = body;

    if (!pdfBase64) {
      return c.json({ error: 'PDF data is required' }, 400);
    }

    console.log('Starting PDF extraction for user:', user.id);

    // Decode base64 PDF to buffer
    const binaryString = atob(pdfBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    console.log('PDF bytes length:', bytes.length);
    
    // Write to temp file
    const tempPath = `/tmp/${crypto.randomUUID()}.pdf`;
    
    try {
      await Deno.writeFile(tempPath, bytes);
      console.log('PDF written to temp file:', tempPath);
      
      // Import pdf-parse
      const pdfParse = (await import('npm:pdf-parse@1.1.1')).default;
      
      // Read file and parse
      const dataBuffer = await Deno.readFile(tempPath);
      console.log('PDF buffer read, size:', dataBuffer.length);
      
      // Parse PDF
      const pdfData = await pdfParse(dataBuffer, {
        max: 0, // process all pages
        version: 'default'
      });
      
      const extractedText = pdfData.text;
      console.log('Extracted text length:', extractedText.length);
      console.log('First 100 chars:', extractedText.substring(0, 100));

      // Clean up temp file
      try {
        await Deno.remove(tempPath);
        console.log('Temp file removed');
      } catch (e) {
        console.log('Failed to remove temp file:', e);
      }

      if (!extractedText || extractedText.trim().length === 0) {
        console.log('No text extracted from PDF');
        return c.json({ 
          error: 'Could not extract text from PDF. The PDF might be an image-based PDF, scanned document, or encrypted. Please try using the "Paste Text" tab instead.' 
        }, 400);
      }

      // Upload PDF to Supabase Storage
      const resumeId = crypto.randomUUID();
      const storagePath = `${user.id}/${resumeId}/${fileName || 'resume.pdf'}`;
      
      console.log('Uploading PDF to storage:', storagePath);
      
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, bytes, {
          contentType: 'application/pdf',
          upsert: false
        });
      
      if (uploadError) {
        console.log('Storage upload error:', uploadError);
        // Continue anyway - we still have the text
      } else {
        console.log('PDF uploaded to storage successfully');
      }

      // Store the resume metadata in KV store
      await kv.set(`resume:${user.id}:${resumeId}`, {
        id: resumeId,
        userId: user.id,
        fileName: fileName || 'resume.pdf',
        storagePath: uploadError ? null : storagePath,
        uploadedAt: new Date().toISOString()
      });

      console.log('PDF text extracted and stored successfully');

      return c.json({ 
        success: true, 
        text: extractedText,
        resumeId 
      });
    } catch (parseError) {
      // Clean up temp file on error
      try {
        await Deno.remove(tempPath);
      } catch (e) {
        console.log('Failed to remove temp file on error:', e);
      }
      
      console.log('PDF parsing error:', parseError.message);
      console.log('Error name:', parseError.name);
      console.log('Error stack:', parseError.stack);
      
      return c.json({ 
        error: 'Could not extract text from PDF. Please use the "Paste Text" tab: copy your resume text and paste it directly.',
        technicalDetails: parseError.message 
      }, 400);
    }
  } catch (error) {
    console.log('PDF extraction error:', error);
    console.log('Error stack:', error.stack);
    return c.json({ 
      error: `Failed to process PDF. Please use the "Paste Text" tab instead: ${error.message}` 
    }, 500);
  }
});

// Get AI suggestions for resume
app.post('/make-server-bd77ee63/get-suggestions', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized - please log in' }, 401);
    }

    const { resumeText, resumeId } = await c.req.json();

    if (!resumeText) {
      return c.json({ error: 'Resume text is required' }, 400);
    }

    console.log('Getting suggestions for user:', user.id);
    console.log('Resume text length:', resumeText.length);

    // Store resume text if it's a new resume (not from PDF extraction)
    const existingResume = await kv.get(`resume:${user.id}:${resumeId}`);
    if (!existingResume) {
      // This is from paste text option, save it
      await kv.set(`resume:${user.id}:${resumeId}`, {
        id: resumeId,
        userId: user.id,
        fileName: 'pasted-resume.txt',
        storagePath: null,
        uploadedAt: new Date().toISOString()
      });
      console.log('Saved pasted resume text to KV store');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return c.json({ error: 'OpenAI API key not configured' }, 500);
    }

    console.log('Calling OpenAI API...');

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional resume coach. Analyze the provided resume and give specific, actionable suggestions for improvement. Also provide a brief summary including the professional role/title of the candidate and your overall assessment of the resume. Return your response as a JSON object with: "summary" (object with "professionalTitle" string, "overallAssessment" string describing strengths and areas for improvement in 2-3 sentences), and "suggestions" array. Each suggestion should have: "category" (string), "title" (string), "description" (string), "priority" (high/medium/low), and "status" (pending).'
          },
          {
            role: 'user',
            content: `Please analyze this resume and provide improvement suggestions:\\n\\n${resumeText}`
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    console.log('OpenAI API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('OpenAI API error response:', errorText);
      return c.json({ error: `OpenAI API error: ${errorText}` }, 500);
    }

    const aiResponse = await response.json();
    console.log('OpenAI API response received');
    
    const suggestionsText = aiResponse.choices[0].message.content;
    console.log('Suggestions text:', suggestionsText.substring(0, 200));
    
    const parsed = JSON.parse(suggestionsText);
    let suggestions = parsed.suggestions || parsed.improvements || parsed.items || [];
    const summary = parsed.summary || { professionalTitle: 'Professional', overallAssessment: 'Resume analysis completed.' };
    
    // Ensure each suggestion has status field
    suggestions = suggestions.map((s: any) => ({
      ...s,
      status: s.status || 'pending'
    }));

    console.log('Parsed suggestions count:', suggestions.length);

    if (!suggestions || suggestions.length === 0) {
      return c.json({ 
        error: 'No suggestions generated. Please ensure your resume has sufficient content.' 
      }, 400);
    }

    // Store suggestions in KV store
    const feedbackId = crypto.randomUUID();
    await kv.set(`feedback:${user.id}:${feedbackId}`, {
      id: feedbackId,
      userId: user.id,
      resumeId,
      suggestions,
      createdAt: new Date().toISOString()
    });

    console.log('Suggestions stored successfully');

    return c.json({ 
      success: true, 
      suggestions,
      feedbackId,
      summary
    });
  } catch (error) {
    console.log('AI suggestion error:', error);
    console.log('Error message:', error.message);
    console.log('Error stack:', error.stack);
    return c.json({ error: `Failed to generate suggestions: ${error.message}` }, 500);
  }
});

// Get user's resume history
app.get('/make-server-bd77ee63/history', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized - please log in' }, 401);
    }

    // Get all resumes for this user
    const resumes = await kv.getByPrefix(`resume:${user.id}:`);
    
    // Get all feedback for this user
    const feedbacks = await kv.getByPrefix(`feedback:${user.id}:`);

    // Combine, add signed URLs, and sort by date
    const historyPromises = resumes.map(async (resume) => {
      const relatedFeedback = feedbacks.find(f => f.value.resumeId === resume.value.id);
      
      // Generate signed URL if storage path exists
      let downloadUrl = null;
      if (resume.value.storagePath) {
        const { data: signedUrlData } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(resume.value.storagePath, 3600); // 1 hour expiry
        
        downloadUrl = signedUrlData?.signedUrl || null;
      }
      
      return {
        ...resume.value,
        downloadUrl,
        feedback: relatedFeedback?.value
      };
    });

    const history = (await Promise.all(historyPromises))
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    return c.json({ success: true, history });
  } catch (error) {
    console.log('History retrieval error:', error);
    return c.json({ error: `Failed to retrieve history: ${error.message}` }, 500);
  }
});

// Update suggestion status
app.post('/make-server-bd77ee63/update-suggestion-status', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized - please log in' }, 401);
    }

    const { feedbackId, suggestionIndex, status } = await c.req.json();

    // Get existing feedback
    const feedback = await kv.get(`feedback:${user.id}:${feedbackId}`);
    
    if (!feedback) {
      return c.json({ error: 'Feedback not found' }, 404);
    }

    // Update the suggestion status
    if (feedback.suggestions[suggestionIndex]) {
      feedback.suggestions[suggestionIndex].status = status;
    }

    // Save back to KV store
    await kv.set(`feedback:${user.id}:${feedbackId}`, feedback);

    return c.json({ success: true });
  } catch (error) {
    console.log('Status update error:', error);
    return c.json({ error: `Failed to update status: ${error.message}` }, 500);
  }
});

Deno.serve(app.fetch);
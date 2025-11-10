import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Upload, FileText, AlertCircle, Type, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Suggestion } from './Dashboard';
import { toast } from 'sonner@2.0.3';

interface UploadSectionProps {
  accessToken: string;
  onSuggestionsReceived: (suggestions: Suggestion[], feedbackId: string, summary?: { professionalTitle: string; overallAssessment: string }) => void;
}

export function UploadSection({ accessToken, onSuggestionsReceived }: UploadSectionProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [manualText, setManualText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError(null);
    } else {
      setError('Please select a valid PDF file');
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Read file as base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      
      await new Promise((resolve, reject) => {
        reader.onload = resolve;
        reader.onerror = reject;
      });

      const base64 = (reader.result as string).split(',')[1];

      // Extract text from PDF
      const extractResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bd77ee63/extract-pdf`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            pdfBase64: base64,
            fileName: selectedFile.name
          })
        }
      );

      const extractData = await extractResponse.json();

      if (!extractResponse.ok) {
        throw new Error(extractData.error || 'Failed to extract text from PDF');
      }

      // Get AI suggestions
      const suggestionsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bd77ee63/get-suggestions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            resumeText: extractData.text,
            resumeId: extractData.resumeId
          })
        }
      );

      const suggestionsData = await suggestionsResponse.json();

      if (!suggestionsResponse.ok) {
        throw new Error(suggestionsData.error || 'Failed to get suggestions');
      }

      onSuggestionsReceived(suggestionsData.suggestions, suggestionsData.feedbackId, suggestionsData.summary);
      setSelectedFile(null);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!manualText.trim()) {
      setError('Please enter your resume text');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Get AI suggestions directly from text
      const suggestionsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bd77ee63/get-suggestions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            resumeText: manualText,
            resumeId: crypto.randomUUID()
          })
        }
      );

      const suggestionsData = await suggestionsResponse.json();

      if (!suggestionsResponse.ok) {
        throw new Error(suggestionsData.error || 'Failed to get suggestions');
      }

      onSuggestionsReceived(suggestionsData.suggestions, suggestionsData.feedbackId, suggestionsData.summary);
      setManualText('');
      toast.success('Suggestions received successfully!');
    } catch (err: any) {
      console.error('Text submission error:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">Upload Your Resume</CardTitle>
        <CardDescription className="text-base">
          Upload a PDF file or paste your resume text directly for analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pdf" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pdf">
              <FileText className="w-4 h-4 mr-2" />
              PDF Upload
            </TabsTrigger>
            <TabsTrigger value="text">
              <Type className="w-4 h-4 mr-2" />
              Paste Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pdf" className="space-y-4">
            {uploading ? (
              <div className="border-2 border-dashed rounded-lg p-12 text-center space-y-4">
                <div className="flex justify-center">
                  <Loader2 className="w-16 h-16 text-violet-600 animate-spin" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg text-gray-900">Analyzing your resume...</p>
                  <p className="text-sm text-gray-600">This may take a few moments</p>
                </div>
                <div className="flex justify-center gap-1">
                  <div className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 bg-violet-50 rounded-lg border border-violet-200">
                  <p className="text-sm text-violet-800">
                    <strong>📄 PDF Upload:</strong> Upload your resume in PDF format for automatic text extraction and analysis.
                  </p>
                </div>
                
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-violet-300 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label htmlFor="pdf-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="mb-2">
                      {selectedFile ? selectedFile.name : 'Click to select a PDF file'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Maximum file size: 10MB
                    </p>
                  </label>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Get Suggestions'
                  )}
                </Button>
              </>
            )}
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> Open your PDF resume, select all text (Ctrl+A or Cmd+A), copy it, and paste it below for instant analysis.
              </p>
            </div>
            
            <Textarea
              placeholder="Paste your resume text here..."
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <Button
              onClick={handleTextSubmit}
              disabled={!manualText.trim() || uploading}
              className="w-full"
            >
              {uploading ? 'Processing...' : 'Get Suggestions'}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
import { useState, useEffect } from 'react';
import { User } from '../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { FileText, Calendar, TrendingUp, Download } from 'lucide-react';
import { projectId } from '../utils/supabase/info';

interface ProfilePageProps {
  user: User;
  accessToken: string;
}

type HistoryItem = {
  id: string;
  fileName: string;
  uploadedAt: string;
  extractedText: string;
  downloadUrl?: string | null;
  storagePath?: string | null;
  feedback?: {
    id: string;
    suggestions: any[];
    createdAt: string;
  };
};

export function ProfilePage({ user, accessToken }: ProfilePageProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bd77ee63/history`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const result = await response.json();

      if (response.ok) {
        setHistory(result.history);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalSuggestions = history.reduce((sum, item) => {
    return sum + (item.feedback?.suggestions.length || 0);
  }, 0);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold text-gray-900">Profile</h1>
        <p className="text-lg text-gray-600">View your account information and resume history</p>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-gray-600">Name</div>
              <div className="text-gray-900">{user.name}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-600">Email</div>
              <div className="text-gray-900">{user.email}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="space-y-1">
                <div className="text-gray-900">{history.length}</div>
                <div className="text-sm text-gray-600">Resumes Uploaded</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="space-y-1">
                <div className="text-gray-900">{totalSuggestions}</div>
                <div className="text-sm text-gray-600">Total Suggestions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="space-y-1">
                <div className="text-gray-900">
                  {history.length > 0 ? formatDate(history[0].uploadedAt).split(',')[0] : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Last Upload</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle>Resume History</CardTitle>
          <CardDescription>
            View your previously uploaded resumes and suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-600">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No resumes uploaded yet. Go to the dashboard to upload your first resume!
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">{item.fileName}</span>
                      </div>
                      <div className="text-sm text-gray-600 ml-8">
                        Uploaded {formatDate(item.uploadedAt)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {item.downloadUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(item.downloadUrl!, '_blank')}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </Button>
                      )}
                      {item.feedback && (
                        <Badge variant="outline">
                          {item.feedback.suggestions.length} suggestions
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {item.feedback && item.feedback.suggestions.length > 0 && (
                    <div className="ml-8 space-y-2">
                      <div className="text-sm text-gray-600">Top Suggestions:</div>
                      <ul className="space-y-1">
                        {item.feedback.suggestions.slice(0, 3).map((suggestion: any, idx: number) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-gray-400">•</span>
                            <span>{suggestion.title}</span>
                          </li>
                        ))}
                      </ul>
                      {item.feedback.suggestions.length > 3 && (
                        <div className="text-sm text-gray-500">
                          +{item.feedback.suggestions.length - 3} more suggestions
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
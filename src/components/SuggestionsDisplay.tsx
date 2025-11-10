import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle2, XCircle, Circle, Upload } from 'lucide-react';
import { Suggestion } from './Dashboard';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner';

interface SuggestionsDisplayProps {
  suggestions: Suggestion[];
  setSuggestions: (suggestions: Suggestion[]) => void;
  feedbackId: string | null;
  accessToken: string;
  onReset: () => void;
}

export function SuggestionsDisplay({ 
  suggestions, 
  setSuggestions, 
  feedbackId, 
  accessToken,
  onReset 
}: SuggestionsDisplayProps) {
  const updateSuggestionStatus = async (index: number, status: 'implemented' | 'ignored' | 'pending') => {
    if (!feedbackId) return;

    try {
      // Update locally first for immediate feedback
      const updatedSuggestions = [...suggestions];
      updatedSuggestions[index].status = status;
      setSuggestions(updatedSuggestions);

      // Update on server
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bd77ee63/update-suggestion-status`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            feedbackId,
            suggestionIndex: index,
            status
          })
        }
      );

      // Show success toast
      if (status === 'implemented') {
        toast.success('Suggestion marked as implemented!');
      } else if (status === 'ignored') {
        toast.success('Suggestion marked as ignored.');
      } else {
        toast.success('Suggestion marked as pending.');
      }
    } catch (error) {
      console.error('Error updating suggestion status:', error);
      toast.error('Failed to update suggestion status');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const stats = {
    total: suggestions.length,
    implemented: suggestions.filter(s => s.status === 'implemented').length,
    pending: suggestions.filter(s => s.status === 'pending').length,
    ignored: suggestions.filter(s => s.status === 'ignored').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold text-gray-900">Your Resume Suggestions</h2>
          <p className="text-base text-gray-600">Review and track your improvement progress</p>
        </div>
        <Button variant="outline" onClick={onReset}>
          <Upload className="w-4 h-4 mr-2" />
          Upload New Resume
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-1">
              <div className="text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-1">
              <div className="text-green-600">{stats.implemented}</div>
              <div className="text-sm text-gray-600">Implemented</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-1">
              <div className="text-blue-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-1">
              <div className="text-gray-600">{stats.ignored}</div>
              <div className="text-sm text-gray-600">Ignored</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suggestions List */}
      <div className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-gray-900">{suggestion.title}</CardTitle>
                    <Badge 
                      variant="outline" 
                      className={getPriorityColor(suggestion.priority)}
                    >
                      {suggestion.priority}
                    </Badge>
                  </div>
                  {suggestion.category && (
                    <div className="text-sm text-gray-600">{suggestion.category}</div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {suggestion.status === 'pending' && (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                  {suggestion.status === 'implemented' && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                  {suggestion.status === 'ignored' && (
                    <XCircle className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">{suggestion.description}</p>
              
              <div className="flex items-center gap-2">
                {suggestion.status !== 'implemented' && (
                  <Button
                    size="sm"
                    onClick={() => updateSuggestionStatus(index, 'implemented')}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark as Implemented
                  </Button>
                )}
                {suggestion.status !== 'ignored' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateSuggestionStatus(index, 'ignored')}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Ignore
                  </Button>
                )}
                {(suggestion.status === 'implemented' || suggestion.status === 'ignored') && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateSuggestionStatus(index, 'pending')}
                  >
                    <Circle className="w-4 h-4 mr-2" />
                    Mark as Pending
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
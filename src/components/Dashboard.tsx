import { useState } from 'react';
import { User } from '../App';
import { UploadSection } from './UploadSection';
import { SuggestionsDisplay } from './SuggestionsDisplay';
import { ResumeSummary } from './ResumeSummary';

interface DashboardProps {
  user: User;
  accessToken: string;
}

export type Suggestion = {
  category: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status?: 'pending' | 'implemented' | 'ignored';
};

export type ResumeSummaryType = {
  professionalTitle: string;
  overallAssessment: string;
};

export function Dashboard({ user, accessToken }: DashboardProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [currentFeedbackId, setCurrentFeedbackId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<ResumeSummaryType | null>(null);

  const handleSuggestionsReceived = (newSuggestions: Suggestion[], feedbackId: string, newSummary?: ResumeSummaryType) => {
    setSuggestions(newSuggestions);
    setCurrentFeedbackId(feedbackId);
    if (newSummary) {
      setSummary(newSummary);
    }
  };

  const handleReset = () => {
    setSuggestions([]);
    setCurrentFeedbackId(null);
    setSummary(null);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold text-gray-900">Welcome back, {user.name}</h1>
        <p className="text-lg text-gray-600">Upload your resume to receive personalized improvement suggestions</p>
      </div>

      {suggestions.length === 0 ? (
        <UploadSection
          accessToken={accessToken}
          onSuggestionsReceived={handleSuggestionsReceived}
          loading={loading}
          setLoading={setLoading}
        />
      ) : (
        <div className="space-y-6">
          {summary && (
            <ResumeSummary
              professionalTitle={summary.professionalTitle}
              overallAssessment={summary.overallAssessment}
            />
          )}
          <SuggestionsDisplay
            suggestions={suggestions}
            setSuggestions={setSuggestions}
            feedbackId={currentFeedbackId}
            accessToken={accessToken}
            onReset={handleReset}
          />
        </div>
      )}
    </div>
  );
}
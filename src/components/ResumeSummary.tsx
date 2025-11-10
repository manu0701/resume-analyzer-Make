import { Card } from './ui/card';
import { Briefcase, FileCheck } from 'lucide-react';

interface ResumeSummaryProps {
  professionalTitle: string;
  overallAssessment: string;
}

export function ResumeSummary({ professionalTitle, overallAssessment }: ResumeSummaryProps) {
  return (
    <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Briefcase className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">Professional Role</p>
            <h3 className="text-2xl font-semibold text-gray-900">{professionalTitle}</h3>
          </div>
        </div>

        <div className="border-t border-primary/20 pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileCheck className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-2">AI Assessment</p>
              <p className="text-gray-700 leading-relaxed">{overallAssessment}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

import React, { useState } from 'react';
import { Download, FileSpreadsheet, Users, UserCheck, QrCode, Trophy, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Card, Button, Badge } from '../../components/common';
import {
  exportParticipantsCsv,
  exportTeamsCsv,
  exportAttendanceCsv,
  exportSubmissionsScoresCsv,
} from '../../services/reportExportService';
import { downloadCsvFile } from '../../utils/csvExport';

interface ExportCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  badge: string;
  filename: string;
  onExport: () => Promise<string>;
}

const ExportCard: React.FC<ExportCardProps> = ({
  title,
  description,
  icon: Icon,
  badge,
  filename,
  onExport,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDownload = async () => {
    setIsExporting(true);
    setSuccess(false);
    try {
      const csv = await onExport();
      downloadCsvFile(filename, csv);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="flex flex-col justify-between h-full border-slate-200 hover:border-indigo-300 transition-colors">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Icon className="w-5 h-5" />
          </div>
          <Badge variant="indigo">{badge}</Badge>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
        <span className="text-[11px] font-mono text-slate-400">RFC 4180 • Injection Safe</span>
        <Button
          variant={success ? 'outline' : 'primary'}
          size="sm"
          onClick={handleDownload}
          disabled={isExporting}
          data-testid={`export-btn-${filename}`}
        >
          {isExporting ? (
            'Exporting...'
          ) : success ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" /> Exported
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-1" /> Export CSV
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

export const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
            Comprehensive Reports & Data Exports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate RFC 4180 compliant CSV exports with formula-injection defenses for event audits, accreditation, and jury deliberations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Sanitized CSV Generation
          </Badge>
        </div>
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ExportCard
          title="Export Participants Roster"
          description="Full attendee registration directory including Name, Email, Role, Status, College, assigned Team, and badge Check-in timestamp."
          icon={Users}
          badge="Registration"
          filename="vertothon_participants_roster"
          onExport={exportParticipantsCsv}
        />

        <ExportCard
          title="Export Teams & Rosters"
          description="Formed teams directory with Team name, Join code, Leader, Member rosters, Hackathon Track, and Submission progress."
          icon={UserCheck}
          badge="Formations"
          filename="vertothon_teams_roster"
          onExport={exportTeamsCsv}
        />

        <ExportCard
          title="Export Attendance & Check-in Logs"
          description="Auditable check-in security logs capturing Entry Timestamp, Check-in Operator, Barcode Token, and Participant details."
          icon={QrCode}
          badge="Operations"
          filename="vertothon_attendance_logs"
          onExport={exportAttendanceCsv}
        />

        <ExportCard
          title="Export Submissions & Jury Scores"
          description="Hackathon project deliverables, repository URLs, live demo links, judging evaluation scores, and final rank standing."
          icon={Trophy}
          badge="Evaluation"
          filename="vertothon_submissions_scores"
          onExport={exportSubmissionsScoresCsv}
        />
      </div>

      {/* Technical Standards Callout */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
        <span className="font-semibold text-slate-800">Security & Compliance Notice:</span>
        <p>
          All exported records strictly adhere to RFC 4180 standard escaping. Any cells starting with dynamic formula operators (<code className="font-mono bg-slate-200 px-1 py-0.5 rounded text-[11px]">=, +, -, @</code>) are automatically prefixed with a single quotation mark to protect downstream spreadsheet software from CSV formula execution vulnerabilities.
        </p>
      </div>
    </div>
  );
};

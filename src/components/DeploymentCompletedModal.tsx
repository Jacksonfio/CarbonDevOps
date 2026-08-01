import React from 'react';
import {
  CheckCircle,
  X,
  FileText,
  ExternalLink,
  ShieldCheck,
  TreeDeciduous,
  Terminal,
  Download
} from 'lucide-react';
import { DeploymentCompletedData } from '../types';

interface DeploymentCompletedModalProps {
  data: DeploymentCompletedData | null;
  onClose: () => void;
  onNavigateToReports: () => void;
}

export const DeploymentCompletedModal: React.FC<DeploymentCompletedModalProps> = ({
  data,
  onClose,
  onNavigateToReports
}) => {
  if (!data) return null;

  const handleDownloadS3Report = () => {
    const report = {
      title: 'Amazon S3 Sustainability Audit Report',
      repository: data.repo,
      branch: data.branch,
      commitSha: data.commitSha,
      awsRegion: data.awsRegion,
      carbonIntensity: `${data.carbonIntensity} gCO2eq/kWh`,
      renewablePct: `${data.renewablePct}%`,
      savedCarbonKg: `${data.savedCarbonKg} kg CO2e`,
      duration: `${data.durationSeconds}s`,
      cloudWatchLogs: data.cloudWatchLogGroup,
      s3StorageBucket: data.s3ReportUrl,
      timestamp: data.timestamp
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `S3_Audit_Report_${data.repo}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] max-w-xl w-full p-6 shadow-2xl text-[#E0E0E0] space-y-6 relative">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#00FF41]/10 text-[#00FF41] rounded-2xl border border-[#00FF41]/30">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <span className="font-code text-[10px] font-bold text-[#00FF41] uppercase tracking-widest block">
                STEP 8: DEPLOYMENT SUCCESSFUL
              </span>
              <h3 className="font-headline font-bold text-xl text-white">
                Pipeline Executed Cleanly
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#71717A] hover:text-white p-1 rounded-full hover:bg-[#1A1A1A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
            <span className="font-code text-[10px] text-[#A1A1AA] uppercase block">
              Repository & Branch
            </span>
            <span className="font-bold text-sm text-white block truncate">
              {data.repo}
            </span>
            <span className="font-code text-xs text-[#00FF41]">
              {data.branch} ({data.commitSha})
            </span>
          </div>

          <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
            <span className="font-code text-[10px] text-[#A1A1AA] uppercase block">
              Execution Duration
            </span>
            <span className="font-headline text-lg font-bold text-white block">
              {data.durationSeconds} Seconds
            </span>
            <span className="font-code text-xs text-[#A1A1AA]">
              GitHub Actions → Lambda
            </span>
          </div>

          <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
            <span className="font-code text-[10px] text-[#A1A1AA] uppercase block">
              Carbon Used
            </span>
            <span className="font-headline text-lg font-bold text-[#00FF41] block">
              {data.carbonIntensity} gCO2/kWh
            </span>
            <span className="font-code text-xs text-[#A1A1AA]">
              {data.renewablePct}% Renewable Grid
            </span>
          </div>

          <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
            <span className="font-code text-[10px] text-[#00FF41] uppercase font-bold block">
              CO₂ Prevented
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <TreeDeciduous className="w-4 h-4 text-[#00FF41]" />
              <span className="font-headline text-lg font-bold text-white">
                {data.savedCarbonKg} kg
              </span>
            </div>
          </div>
        </div>

        {/* Logs & AWS Integration Box */}
        <div className="bg-[#0A0A0A] rounded-xl border border-[#2A2A2A] p-4 space-y-2 font-code text-xs">
          <div className="flex items-center justify-between text-[#A1A1AA]">
            <span className="flex items-center gap-1.5 text-white font-semibold">
              <Terminal className="w-4 h-4 text-[#00FF41]" />
              Amazon CloudWatch Logs
            </span>
            <span className="text-[10px] text-[#00FF41]">Active Stream</span>
          </div>
          <p className="text-[#A1A1AA] text-[11px] truncate">
            {data.cloudWatchLogGroup}
          </p>
          <div className="border-t border-[#2A2A2A] pt-2 flex items-center justify-between text-[#A1A1AA]">
            <span className="flex items-center gap-1.5 text-white font-semibold">
              <FileText className="w-4 h-4 text-[#3B82F6]" />
              Amazon S3 Audit Report
            </span>
            <button
              onClick={handleDownloadS3Report}
              className="text-[#00FF41] hover:underline text-[11px] flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>Download JSON</span>
            </button>
          </div>
          <p className="text-[#A1A1AA] text-[11px] truncate">
            {data.s3ReportUrl}
          </p>
        </div>

        {/* Buttons */}
        <div className="pt-2 flex justify-between items-center">
          <button
            onClick={() => {
              onClose();
              onNavigateToReports();
            }}
            className="text-xs text-[#00FF41] hover:underline font-semibold flex items-center gap-1"
          >
            <span>View All S3 Reports & Analytics</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#00FF41] text-black font-bold text-xs rounded-xl hover:bg-[#00e038] transition-all shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

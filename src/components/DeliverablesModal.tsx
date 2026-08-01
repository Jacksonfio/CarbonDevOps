import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Download,
  X,
  FileCode,
  Terminal,
  Layers,
  BookOpen,
  FileJson,
  Cpu
} from 'lucide-react';
import { CODE_DELIVERABLES } from '../data/deliverables';

interface DeliverablesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeliverablesModal: React.FC<DeliverablesModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<keyof typeof CODE_DELIVERABLES>('githubWorkflow');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const tabs: { key: keyof typeof CODE_DELIVERABLES; name: string; icon: any; filename: string }[] = [
    { key: 'githubWorkflow', name: 'GitHub Actions', icon: FileCode, filename: '.github/workflows/carbon-aware-deploy.yml' },
    { key: 'lambdaChecker', name: 'Carbon Checker Lambda', icon: Cpu, filename: 'lambda/carbon_checker.py' },
    { key: 'lambdaSqsProcessor', name: 'SQS EventBridge Lambda', icon: Cpu, filename: 'lambda/sqs_processor.py' },
    { key: 'electricityMapsService', name: 'Electricity Maps API', icon: Terminal, filename: 'services/electricity_maps.py' },
    { key: 'awsSqsService', name: 'Amazon SQS Service', icon: Layers, filename: 'services/aws_sqs.py' },
    { key: 'awsS3Service', name: 'Amazon S3 Service', icon: Layers, filename: 'services/aws_s3.py' },
    { key: 'configSettings', name: 'Config (.env)', icon: FileCode, filename: 'config/settings.env' },
    { key: 'sampleReportJson', name: 'Sample S3 Report', icon: FileJson, filename: 'reports/sample_report.json' },
    { key: 'readmeDoc', name: 'Architecture & README', icon: BookOpen, filename: 'README.md' }
  ];

  const currentContent = CODE_DELIVERABLES[activeTab] || '';
  const currentTabInfo = tabs.find((t) => t.key === activeTab)!;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentTabInfo.filename.split('/').pop() || 'deliverable.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 z-50">
      <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden text-[#E0E0E0]">
        {/* Header */}
        <div className="p-5 border-b border-[#2A2A2A] bg-[#111111] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00FF41] text-black rounded-xl">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg text-white">
                Carbon-Aware CI/CD Deliverables & AWS Source Code
              </h3>
              <p className="font-body text-xs text-[#A1A1AA]">
                Production-ready Python 3.12 Lambdas, GitHub Actions workflow, SQS/S3 integration & docs.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#71717A] hover:text-white hover:bg-[#1A1A1A] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Sidebar Tabs + Code Display */}
        <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
          {/* File Selector Sidebar */}
          <div className="w-full md:w-64 bg-[#0D0D0D] border-r border-[#2A2A2A] p-3 space-y-1 overflow-y-auto flex-shrink-0">
            <span className="font-code text-[10px] font-bold text-[#71717A] uppercase px-3 py-1.5 block">
              Deliverable Files
            </span>

            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-code text-xs text-left transition-all ${
                    isActive
                      ? 'bg-[#00FF41] text-black font-bold shadow-xs'
                      : 'text-[#A1A1AA] hover:bg-[#1A1A1A] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-grow flex flex-col bg-[#0A0A0A] text-white overflow-hidden">
            <div className="px-4 py-3 bg-[#1A1A1A] border-b border-[#2A2A2A] flex justify-between items-center text-xs font-code">
              <span className="text-[#00FF41]">{currentTabInfo.filename}</span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 bg-[#2A2A2A] hover:bg-[#333333] text-white rounded-md flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#00FF41]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="px-3 py-1 bg-[#00FF41] hover:bg-[#00e038] text-black rounded-md flex items-center gap-1.5 transition-colors font-bold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            <div className="flex-grow p-4 overflow-auto font-code text-xs leading-relaxed text-[#E0E0E0]">
              <pre>
                <code>{currentContent}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

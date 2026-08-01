import React, { useState } from 'react';
import {
  FileText,
  Download,
  Filter,
  Calendar,
  CheckCircle2,
  TreeDeciduous,
  BarChart3,
  Globe,
  Layers,
  Sparkles,
  Printer
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const [reportType, setReportType] = useState('EXECUTIVE');
  const [exportFormat, setExportFormat] = useState<'PDF' | 'CSV' | 'JSON'>('PDF');
  const [dateRange, setDateRange] = useState('30D');
  const [selectedRepo, setSelectedRepo] = useState('ALL');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Mock Report Data
  const reportData = [
    {
      id: 'S3-AUDIT-901',
      repo: 'payment-api-gateway',
      region: 'us-east-1',
      environment: 'Production',
      carbonIntensity: 214,
      threshold: 250,
      decision: 'DEPLOYED',
      savedCarbon: '4.2 kg',
      timestamp: '2026-07-31 12:04'
    },
    {
      id: 'S3-AUDIT-902',
      repo: 'user-auth-service',
      region: 'eu-central-1',
      environment: 'Production',
      carbonIntensity: 420,
      threshold: 250,
      decision: 'QUEUED',
      savedCarbon: '18.5 kg',
      timestamp: '2026-07-31 11:58'
    },
    {
      id: 'S3-AUDIT-903',
      repo: 'data-pipeline-ingest',
      region: 'ap-southeast-1',
      environment: 'Staging',
      carbonIntensity: 612,
      threshold: 250,
      decision: 'QUEUED',
      savedCarbon: '22.0 kg',
      timestamp: '2026-07-31 11:45'
    },
    {
      id: 'S3-AUDIT-904',
      repo: 'frontend-dashboard-kit',
      region: 'us-west-2',
      environment: 'Production',
      carbonIntensity: 198,
      threshold: 250,
      decision: 'DEPLOYED',
      savedCarbon: '3.8 kg',
      timestamp: '2026-07-31 12:12'
    },
    {
      id: 'S3-AUDIT-905',
      repo: 'order-processing-engine',
      region: 'ca-central-1',
      environment: 'Production',
      carbonIntensity: 45,
      threshold: 250,
      decision: 'DEPLOYED',
      savedCarbon: '12.4 kg',
      timestamp: '2026-07-31 10:30'
    }
  ];

  const handleDownloadReport = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);

    const reportTitle = `CarbonOps_${reportType}_Report_${Date.now()}`;

    if (exportFormat === 'JSON') {
      const data = {
        title: 'CarbonOps Sustainability Audit Report',
        generatedAt: new Date().toISOString(),
        dateRange,
        selectedRepo,
        selectedRegion,
        summaryMetrics: {
          totalAbatementKg: 1240.5,
          treesEquivalent: 62,
          complianceRate: '100%',
          totalRuns: 142
        },
        reportData
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportTitle}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (exportFormat === 'CSV') {
      const headers = ['Report ID', 'Repository', 'AWS Region', 'Environment', 'Carbon Intensity (gCO2)', 'Threshold', 'Decision', 'CO2 Saved', 'Timestamp'];
      const rows = reportData.map((r) => [
        r.id,
        r.repo,
        r.region,
        r.environment,
        r.carbonIntensity,
        r.threshold,
        r.decision,
        r.savedCarbon,
        r.timestamp
      ]);
      const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportTitle}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // PDF Printable View
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${reportTitle}</title>
              <style>
                body { font-family: monospace; padding: 30px; background: #0d0d0d; color: #e0e0e0; }
                h1 { color: #00ff41; font-size: 24px; border-bottom: 2px solid #00ff41; padding-bottom: 10px; }
                .meta { margin-bottom: 20px; font-size: 12px; color: #a1a1aa; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
                th, td { border: 1px solid #2a2a2a; padding: 8px; text-align: left; }
                th { background: #1a1a1a; color: #00ff41; }
                .summary { background: #141414; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #2a2a2a; }
              </style>
            </head>
            <body>
              <h1>CarbonOps Sustainability & S3 Audit Report</h1>
              <div class="meta">
                <p>Generated At: ${new Date().toLocaleString()}</p>
                <p>Filter Criteria: Date Range: ${dateRange} | Repo: ${selectedRepo} | Region: ${selectedRegion}</p>
              </div>

              <div class="summary">
                <h3>Executive Summary</h3>
                <p>Total Carbon Abatement: <strong>1,240.5 kg CO2e</strong></p>
                <p>Tree Sequestration Equivalent: <strong>62 Trees</strong></p>
                <p>S3 Audit Verification Status: <strong>100% Passed ESG Compliance</strong></p>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Report ID</th>
                    <th>Repository</th>
                    <th>Region</th>
                    <th>Environment</th>
                    <th>Carbon Intensity</th>
                    <th>Decision</th>
                    <th>CO2 Saved</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  ${reportData
                    .map(
                      (r) => `
                    <tr>
                      <td>${r.id}</td>
                      <td>${r.repo}</td>
                      <td>${r.region}</td>
                      <td>${r.environment}</td>
                      <td>${r.carbonIntensity} gCO2</td>
                      <td>${r.decision}</td>
                      <td>${r.savedCarbon}</td>
                      <td>${r.timestamp}</td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>
              <script>window.print();</script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto text-[#E0E0E0]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#00FF41]/10 text-[#00FF41] font-code text-xs font-bold border border-[#00FF41]/30">
              STEP 10: REPORTS GENERATOR
            </span>
          </div>
          <h2 className="font-headline text-2xl md:text-3xl font-bold text-white tracking-tight">
            Sustainability Audit & Amazon S3 Reports
          </h2>
          <p className="font-body text-sm text-[#A1A1AA] mt-1">
            Generate and download enterprise ESG compliance reports in PDF, CSV, and JSON formats.
          </p>
        </div>

        <button
          onClick={handleDownloadReport}
          className="bg-[#00FF41] text-black font-headline text-xs font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-[#00e038] transition-all shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Download {exportFormat} Report</span>
        </button>
      </div>

      {downloadSuccess && (
        <div className="p-4 bg-[#00FF41]/10 border border-[#00FF41]/30 rounded-xl text-[#00FF41] font-semibold text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5" />
          <span>Report generated successfully in {exportFormat} format! Downloading file...</span>
        </div>
      )}

      {/* Control Panel */}
      <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Export Format */}
          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-1 bg-[#1A1A1A] p-1 rounded-xl border border-[#2A2A2A]">
              {(['PDF', 'CSV', 'JSON'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setExportFormat(fmt)}
                  className={`py-1.5 font-code text-xs font-bold rounded-lg transition-all ${
                    exportFormat === fmt
                      ? 'bg-[#00FF41] text-black shadow-xs'
                      : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
              Time Horizon
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white text-xs rounded-xl p-2.5 focus:border-[#00FF41] outline-none"
            >
              <option value="24H">Last 24 Hours</option>
              <option value="7D">Last 7 Days</option>
              <option value="30D">Last 30 Days</option>
              <option value="Q3-2026">Q3 2026 Compliance</option>
            </select>
          </div>

          {/* Repository Filter */}
          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
              Repository
            </label>
            <select
              value={selectedRepo}
              onChange={(e) => setSelectedRepo(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white text-xs rounded-xl p-2.5 focus:border-[#00FF41] outline-none"
            >
              <option value="ALL">All Repositories</option>
              <option value="payment-api-gateway">payment-api-gateway</option>
              <option value="user-auth-service">user-auth-service</option>
              <option value="data-pipeline-ingest">data-pipeline-ingest</option>
            </select>
          </div>

          {/* AWS Region Filter */}
          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
              AWS Region
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white text-xs rounded-xl p-2.5 focus:border-[#00FF41] outline-none font-code"
            >
              <option value="ALL">All Regions</option>
              <option value="us-east-1">us-east-1</option>
              <option value="us-west-2">us-west-2</option>
              <option value="eu-central-1">eu-central-1</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#141414] p-6 rounded-2xl border border-[#2A2A2A]">
          <span className="font-code text-xs font-bold text-[#00FF41] uppercase">Total Abatement</span>
          <div className="font-headline text-3xl font-bold text-white mt-2">1,240.5 kg</div>
          <p className="text-xs text-[#A1A1AA] mt-2">CO2e prevented across 142 deployment runs</p>
        </div>

        <div className="bg-[#141414] p-6 rounded-2xl border border-[#2A2A2A]">
          <span className="font-code text-xs font-bold text-[#00FF41] uppercase">Tree Equivalent</span>
          <div className="font-headline text-3xl font-bold text-white mt-2">62 Trees</div>
          <p className="text-xs text-[#A1A1AA] mt-2">Sequestration equivalent over 10 years</p>
        </div>

        <div className="bg-[#141414] p-6 rounded-2xl border border-[#2A2A2A]">
          <span className="font-code text-xs font-bold text-[#3B82F6] uppercase">Compliance Status</span>
          <div className="font-headline text-3xl font-bold text-white mt-2">100% Passed</div>
          <p className="text-xs text-[#A1A1AA] mt-2">S3 audit logs verified against ESG framework</p>
        </div>
      </div>

      {/* Report Table Preview */}
      <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-headline text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#00FF41]" />
            <span>Amazon S3 Sustainability Audit Logs Preview</span>
          </h3>
          <span className="font-code text-xs text-[#A1A1AA]">
            Showing {reportData.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1A1A1A] text-[#A1A1AA] font-code text-xs uppercase">
                <th className="p-3 font-bold">Report ID</th>
                <th className="p-3 font-bold">Repository</th>
                <th className="p-3 font-bold">Region</th>
                <th className="p-3 font-bold">Environment</th>
                <th className="p-3 font-bold">Carbon Intensity</th>
                <th className="p-3 font-bold">Decision</th>
                <th className="p-3 font-bold">Saved CO2</th>
                <th className="p-3 font-bold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A] font-body text-xs">
              {reportData.map((r) => (
                <tr key={r.id} className="hover:bg-[#1A1A1A]/50 transition-colors">
                  <td className="p-3 font-code font-bold text-[#00FF41]">{r.id}</td>
                  <td className="p-3 font-semibold text-white">{r.repo}</td>
                  <td className="p-3 font-code text-[#A1A1AA]">{r.region}</td>
                  <td className="p-3 font-code text-white">{r.environment}</td>
                  <td className="p-3 font-code text-[#E0E0E0]">{r.carbonIntensity} gCO2</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded font-code text-[10px] font-bold border ${
                        r.decision === 'DEPLOYED'
                          ? 'bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30'
                          : 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
                      }`}
                    >
                      {r.decision}
                    </span>
                  </td>
                  <td className="p-3 font-code font-bold text-[#00FF41]">{r.savedCarbon}</td>
                  <td className="p-3 text-[#A1A1AA]">{r.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

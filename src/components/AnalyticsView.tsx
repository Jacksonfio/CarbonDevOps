import React from 'react';
import { BarChart3, Download, TreeDeciduous, Leaf, FileText, CheckCircle } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const reports = [
    {
      id: 'rep-1',
      repo: 'carbon-aware-scheduler',
      region: 'us-east-1',
      carbonIntensity: 182,
      threshold: 250,
      decision: 'DEPLOY',
      savedCarbon: '3.40 kg CO2e',
      timestamp: 'Today, 03:12 UTC',
      trees: 0.2
    },
    {
      id: 'rep-2',
      repo: 'analytics-worker',
      region: 'ap-southeast-1',
      carbonIntensity: 612,
      threshold: 250,
      decision: 'HOLD_IN_SQS',
      savedCarbon: '18.50 kg CO2e',
      timestamp: 'Today, 02:45 UTC',
      trees: 0.9
    },
    {
      id: 'rep-3',
      repo: 'user-auth-service',
      region: 'eu-central-1',
      carbonIntensity: 210,
      threshold: 250,
      decision: 'DEPLOY',
      savedCarbon: '2.10 kg CO2e',
      timestamp: 'Yesterday, 22:10 UTC',
      trees: 0.1
    }
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto text-[#E0E0E0]">
      <div>
        <h2 className="font-headline text-2xl md:text-3xl font-bold text-white tracking-tight">
          Sustainability Analytics & S3 Audit Reports
        </h2>
        <p className="font-body text-sm text-[#A1A1AA] mt-1">
          Historical carbon abatement metrics, Amazon S3 report logs, and carbon offset equivalence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#141414] p-6 rounded-2xl border border-[#2A2A2A] shadow-xs">
          <span className="font-code text-xs font-bold text-[#00FF41] uppercase">Monthly Abatement</span>
          <div className="font-headline text-3xl font-bold text-white mt-2">1,240.5 kg</div>
          <p className="text-xs text-[#A1A1AA] mt-2">CO2e prevented across 142 deployment runs</p>
        </div>

        <div className="bg-[#141414] p-6 rounded-2xl border border-[#2A2A2A] shadow-xs">
          <span className="font-code text-xs font-bold text-[#00FF41] uppercase">Tree Equivalent</span>
          <div className="font-headline text-3xl font-bold text-white mt-2">62 Trees</div>
          <p className="text-xs text-[#A1A1AA] mt-2">Sequestration equivalent over 10 years</p>
        </div>

        <div className="bg-[#141414] p-6 rounded-2xl border border-[#2A2A2A] shadow-xs">
          <span className="font-code text-xs font-bold text-[#3B82F6] uppercase">Compliance Status</span>
          <div className="font-headline text-3xl font-bold text-white mt-2">100% Passed</div>
          <p className="text-xs text-[#A1A1AA] mt-2">S3 audit logs verified against ESG framework</p>
        </div>
      </div>

      <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] shadow-xs p-6">
        <h3 className="font-headline text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#00FF41]" />
          <span>Amazon S3 Sustainability Audit Logs</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1A1A1A] text-[#A1A1AA] font-code text-xs uppercase">
                <th className="p-3 font-bold">Report ID</th>
                <th className="p-3 font-bold">Repository</th>
                <th className="p-3 font-bold">Region</th>
                <th className="p-3 font-bold">Carbon</th>
                <th className="p-3 font-bold">Decision</th>
                <th className="p-3 font-bold">Saved CO2</th>
                <th className="p-3 font-bold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A] font-body text-xs">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-[#1A1A1A]/50 transition-colors">
                  <td className="p-3 font-code font-bold text-[#00FF41]">{r.id}</td>
                  <td className="p-3 font-semibold text-white">{r.repo}</td>
                  <td className="p-3 font-code text-[#A1A1AA]">{r.region}</td>
                  <td className="p-3 font-code text-[#E0E0E0]">{r.carbonIntensity} gCO2</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded font-code text-[10px] font-bold border ${
                        r.decision === 'DEPLOY'
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

import React, { useState } from 'react';
import {
  Gauge,
  Download,
  Calendar,
  TreeDeciduous,
  ArrowDown,
  ArrowUp,
  Lightbulb,
  X,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { DeploymentActivity } from '../types';

interface DashboardViewProps {
  onNavigateToQueue: () => void;
  onOpenAiOptimize: () => void;
  onStartNewDeployment?: (region?: string) => void;
  activities: DeploymentActivity[];
  currentThreshold: number;
  onSelectProfilerActivity?: (act: DeploymentActivity) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToQueue,
  onOpenAiOptimize,
  onStartNewDeployment,
  activities,
  currentThreshold,
  onSelectProfilerActivity
}) => {
  const [showAlertPill, setShowAlertPill] = useState(true);
  const [timeFilter, setTimeFilter] = useState('24h');

  // Dummy Export Handler
  const handleExportReport = () => {
    const reportData = {
      title: 'CarbonOps Global Dashboard Summary',
      generatedAt: new Date().toISOString(),
      currentIntensity: 342,
      targetThreshold: currentThreshold,
      todaySavingsKg: 124.5,
      treesEquivalent: 6,
      deferredWorkloads: 18,
      activityCount: activities.length
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CarbonOps_Report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto text-[#E0E0E0]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="font-headline text-2xl md:text-3xl font-bold text-white tracking-tight">
            Global Carbon Dashboard
          </h2>
          <p className="font-body text-sm text-[#A1A1AA] mt-1">
            Monitoring real-time grid intensity for your scheduled CI/CD workloads.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {onStartNewDeployment && (
            <button
              onClick={onStartNewDeployment}
              className="bg-[#00FF41] text-black font-headline text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-[#00e038] transition-all shadow-xs"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Start New Deployment</span>
            </button>
          )}
          <button
            onClick={() => setTimeFilter(timeFilter === '24h' ? '7d' : '24h')}
            className="bg-[#141414] text-[#E0E0E0] font-headline text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-[#1A1A1A] transition-all border border-[#2A2A2A]"
          >
            <Calendar className="w-4 h-4 text-[#A1A1AA]" />
            <span>{timeFilter === '24h' ? 'Last 24 Hours' : 'Last 7 Days'}</span>
          </button>
          <button
            onClick={handleExportReport}
            className="bg-[#141414] border border-[#2A2A2A] text-[#E0E0E0] font-headline text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-[#1A1A1A] transition-all shadow-xs"
          >
            <Download className="w-4 h-4 text-[#00FF41]" />
            <span>Export Summary</span>
          </button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Current Intensity */}
        <div className="bg-[#141414] p-6 rounded-2xl border border-[#2A2A2A] shadow-xs relative overflow-hidden group">
          <div className="flex justify-between items-start mb-2">
            <span className="font-code text-xs uppercase tracking-wider text-[#A1A1AA]">
              Current Intensity
            </span>
            <span className="material-symbols-outlined text-3xl text-[#00FF41]/30 group-hover:text-[#00FF41]/60 transition-colors">
              speed
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline text-3xl font-bold text-white">342</span>
            <span className="text-xs font-medium text-[#A1A1AA]">gCO₂/kWh</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-[#00FF41]/10 text-[#00FF41] font-code text-[10px] font-bold border border-[#00FF41]/30">
              OPTIMAL
            </span>
            <span className="text-[#00FF41] text-xs font-semibold flex items-center gap-0.5">
              <ArrowDown className="w-3.5 h-3.5" /> 12% vs avg
            </span>
          </div>
        </div>

        {/* Carbon Threshold */}
        <div className="bg-[#141414] p-6 rounded-2xl border border-[#2A2A2A] shadow-xs relative overflow-hidden group">
          <div className="flex justify-between items-start mb-2">
            <span className="font-code text-xs uppercase tracking-wider text-[#A1A1AA]">
              Target Threshold
            </span>
            <span className="material-symbols-outlined text-3xl text-[#F59E0B]/30">
              tune
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline text-3xl font-bold text-white">{currentThreshold}</span>
            <span className="text-xs font-medium text-[#A1A1AA]">gCO₂/kWh</span>
          </div>
          <div className="mt-4 w-full bg-[#2A2A2A] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#00FF41] h-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((342 / currentThreshold) * 100))}%` }}
            ></div>
          </div>
          <p className="mt-2 text-[11px] text-[#A1A1AA]">
            {Math.round((342 / currentThreshold) * 100)}% of carbon budget utilized
          </p>
        </div>

        {/* Deferred Workloads */}
        <div className="bg-[#141414] p-6 rounded-2xl border border-[#2A2A2A] shadow-xs relative overflow-hidden group">
          <div className="flex justify-between items-start mb-2">
            <span className="font-code text-xs uppercase tracking-wider text-[#A1A1AA]">
              Deferred Workloads
            </span>
            <span className="material-symbols-outlined text-3xl text-[#F59E0B]/30">
              hourglass_top
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline text-3xl font-bold text-white">18</span>
            <span className="text-xs font-medium text-[#A1A1AA]">Pipelines</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] font-code text-[10px] font-bold border border-[#F59E0B]/30">
              QUEUED
            </span>
            <span className="text-[#A1A1AA] text-xs italic">Next slot in ~12m</span>
          </div>
        </div>

        {/* Carbon Saved */}
        <div className="bg-[#141414] p-6 rounded-2xl border-t-4 border-t-[#00FF41] border-x border-b border-[#2A2A2A] shadow-xs relative overflow-hidden group">
          <div className="flex justify-between items-start mb-2">
            <span className="font-code text-xs uppercase tracking-wider text-[#00FF41] font-bold">
              Today's Savings
            </span>
            <TreeDeciduous className="w-5 h-5 text-[#00FF41]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline text-3xl font-bold text-white">124.5</span>
            <span className="text-xs font-medium text-[#A1A1AA]">kg CO2e</span>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[#00FF41] text-xs font-semibold">
            <TreeDeciduous className="w-4 h-4 fill-current" />
            <span>≈ 6 mature trees equivalent</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Intensity Timeline Bar Chart */}
        <div className="lg:col-span-2 bg-[#141414] p-6 rounded-2xl border border-[#2A2A2A] shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
            <div>
              <h3 className="font-headline text-lg font-bold text-white">
                Carbon Intensity Timeline
              </h3>
              <p className="font-body text-xs text-[#A1A1AA]">
                Grid emission intensity profile over 24 hours (gCO2eq/kWh)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#00FF41]"></span> Forecast
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#F59E0B]"></span> Historical
              </span>
            </div>
          </div>

          {/* Timeline Bar Visualizer */}
          <div className="h-56 flex items-end justify-between gap-1.5 pt-6 pb-2 border-b border-[#2A2A2A]">
            {[
              { time: '00:00', val: 320, isForecast: false, height: '50%' },
              { time: '02:00', val: 380, isForecast: false, height: '65%' },
              { time: '04:00', val: 210, isForecast: false, height: '35%' },
              { time: '06:00', val: 450, isForecast: false, height: '75%' },
              { time: '08:00', val: 310, isForecast: false, height: '50%' },
              { time: '10:00', val: 180, isForecast: false, height: '28%' },
              { time: '12:00', val: 260, isForecast: false, height: '42%' },
              { time: '14:00', val: 520, isForecast: true, height: '88%' },
              { time: '16:00', val: 342, isForecast: false, height: '55%' },
              { time: '18:00', val: 610, isForecast: true, height: '95%' },
              { time: '20:00', val: 430, isForecast: true, height: '70%' },
              { time: '22:00', val: 290, isForecast: false, height: '48%' },
              { time: '23:59', val: 210, isForecast: false, height: '35%' },
            ].map((bar, idx) => (
              <div
                key={idx}
                className="flex-grow flex flex-col items-center group relative h-full justify-end"
              >
                {/* Tooltip */}
                <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-all bg-[#2A2A2A] text-white font-code text-[10px] px-2 py-1 rounded border border-[#3F3F46] shadow-md pointer-events-none whitespace-nowrap z-10">
                  {bar.val} gCO2/kWh ({bar.time})
                </div>
                <div
                  className={`w-full rounded-t-sm transition-all duration-300 ${
                    bar.isForecast
                      ? 'bg-[#F59E0B] group-hover:bg-[#D97706]'
                      : 'bg-[#00FF41] group-hover:bg-[#00e038]'
                  }`}
                  style={{ height: bar.height }}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-xs font-code text-[#A1A1AA]">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:59</span>
          </div>
        </div>

        {/* Regional Distribution Donut */}
        <div className="bg-[#141414] p-6 rounded-2xl border border-[#2A2A2A] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-headline text-lg font-bold text-white mb-1">
              Regional Distribution
            </h3>
            <p className="font-body text-xs text-[#A1A1AA] mb-4">
              Current clean energy mix across target deployment zones
            </p>
          </div>

          <div className="flex-grow flex items-center justify-center my-4">
            <div className="relative w-40 h-40 rounded-full border-[18px] border-[#2A2A2A] flex items-center justify-center">
              <div className="absolute inset-[-18px] rounded-full border-[18px] border-[#00FF41] border-t-transparent border-l-transparent -rotate-45"></div>
              <div className="text-center">
                <span className="font-headline text-2xl font-bold text-white block leading-none">
                  64%
                </span>
                <span className="font-body text-xs text-[#A1A1AA] mt-1 block">Low Carbon</span>
              </div>
            </div>
          </div>

          <ul className="space-y-3 pt-2">
            <li className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-2 text-white font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00FF41]"></span> US-East-1
              </span>
              <span className="font-code font-bold text-[#00FF41]">210g (Optimal)</span>
            </li>
            <li className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-2 text-white font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></span> EU-Central-1
              </span>
              <span className="font-code text-[#A1A1AA]">145g (Low)</span>
            </li>
            <li className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-2 text-white font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span> AP-South-1
              </span>
              <span className="font-code text-[#EF4444] font-bold">540g (High)</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#2A2A2A] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111111]">
          <div>
            <h3 className="font-headline text-lg font-bold text-white">
              Recent Deployment Activity
            </h3>
            <p className="font-body text-xs text-[#A1A1AA]">
              Audit log of carbon intensity checks, decision matrix, and pipeline status
            </p>
          </div>
          <button
            onClick={onNavigateToQueue}
            className="text-xs font-bold text-[#00FF41] hover:underline flex items-center gap-1"
          >
            <span>Manage Deployment Queue</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1A1A1A] text-[#A1A1AA] font-code text-xs uppercase tracking-wider">
                <th className="px-6 py-3.5 font-bold">Repository</th>
                <th className="px-6 py-3.5 font-bold">Grid Score</th>
                <th className="px-6 py-3.5 font-bold">Decision</th>
                <th className="px-6 py-3.5 font-bold">Carbon Impact</th>
                <th className="px-6 py-3.5 font-bold">Status</th>
                <th className="px-6 py-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A] font-body text-xs">
              {activities.map((act) => (
                <tr key={act.id} className="hover:bg-[#1A1A1A]/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#2A2A2A] text-[#00FF41] border border-[#3F3F46] flex items-center justify-center font-code font-bold text-[10px]">
                        GH
                      </div>
                      <div>
                        <p className="font-semibold text-white">{act.repo}</p>
                        <p className="font-code text-[11px] text-[#A1A1AA]">
                          {act.branch} • {act.commitSha}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-code font-bold ${
                          act.gridScore > 70
                            ? 'text-[#00FF41]'
                            : act.gridScore > 40
                            ? 'text-[#F59E0B]'
                            : 'text-[#EF4444]'
                        }`}
                      >
                        {act.gridScore}/100
                      </span>
                      <div className="w-16 h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            act.gridScore > 70
                              ? 'bg-[#00FF41]'
                              : act.gridScore > 40
                              ? 'bg-[#F59E0B]'
                              : 'bg-[#EF4444]'
                          }`}
                          style={{ width: `${act.gridScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-md font-code text-[10px] font-bold uppercase border ${
                        act.decision === 'PROCEED'
                          ? 'bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30'
                          : act.decision === 'QUEUE'
                          ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
                          : 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30'
                      }`}
                    >
                      {act.decision}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-code text-[#A1A1AA]">{act.carbonImpact}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          act.status === 'Running'
                            ? 'bg-[#00FF41] animate-pulse'
                            : act.status === 'Scheduled'
                            ? 'bg-[#F59E0B]'
                            : 'bg-[#3B82F6]'
                        }`}
                      ></span>
                      <span className="font-medium text-white">{act.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    {onSelectProfilerActivity && (
                      <button
                        onClick={() => onSelectProfilerActivity(act)}
                        className="text-[#3B82F6] hover:underline font-semibold text-xs"
                      >
                        Profile Runner Steps
                      </button>
                    )}
                    <button
                      onClick={onNavigateToQueue}
                      className="text-[#00FF41] hover:underline font-semibold text-xs"
                    >
                      View Queue
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Grid Efficiency Alert Pill */}
      {showAlertPill && (
        <div className="fixed bottom-6 right-6 bg-[#141414] shadow-2xl border border-[#2A2A2A] rounded-2xl p-5 w-80 sm:w-96 z-50 transition-all animate-bounce-short">
          <div className="flex justify-between items-start mb-2">
            <div className="bg-[#00FF41]/10 border border-[#00FF41]/30 p-2 rounded-xl text-[#00FF41]">
              <Lightbulb className="w-5 h-5" />
            </div>
            <button
              onClick={() => setShowAlertPill(false)}
              className="text-[#71717A] hover:text-white p-1 rounded-full hover:bg-[#1A1A1A]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <h4 className="font-headline font-bold text-sm text-white mb-1">
            Grid Efficiency Alert
          </h4>
          <p className="font-body text-xs text-[#A1A1AA] mb-4 leading-relaxed">
            Winds are picking up in <b className="text-white">EU-Central-1</b>. We recommend migrating 4 non-critical
            batch jobs now for an estimated <b className="text-[#00FF41]">15kg CO2</b> saving.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onOpenAiOptimize}
              className="w-full bg-[#00FF41] text-black py-2 rounded-xl font-headline text-xs font-bold hover:bg-[#00e038] transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Relocate Workloads</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

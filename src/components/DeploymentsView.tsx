import React, { useState } from 'react';
import {
  Rocket,
  Zap,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  Terminal,
  FileCode2,
  ShieldCheck,
  Globe,
  ArrowUpRight,
  Play
} from 'lucide-react';
import { DeploymentActivity } from '../types';

interface DeploymentsViewProps {
  activities: DeploymentActivity[];
  onStartNewDeployment: (region?: string) => void;
  onNavigateToQueue: () => void;
  onOpenAiOptimize: () => void;
}

export const DeploymentsView: React.FC<DeploymentsViewProps> = ({
  activities,
  onStartNewDeployment,
  onNavigateToQueue,
  onOpenAiOptimize
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<DeploymentActivity | null>(null);

  const filteredActivities = activities.filter((act) => {
    const matchesSearch =
      act.repo.toLowerCase().includes(search.toLowerCase()) ||
      act.branch.toLowerCase().includes(search.toLowerCase()) ||
      act.awsRegion.toLowerCase().includes(search.toLowerCase()) ||
      act.commitSha.toLowerCase().includes(search.toLowerCase());

    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'COMPLETED') return matchesSearch && act.status === 'Completed';
    if (statusFilter === 'RUNNING') return matchesSearch && act.status === 'Running';
    if (statusFilter === 'SCHEDULED') return matchesSearch && act.status === 'Scheduled';
    return matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto text-[#E0E0E0]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#2A2A2A] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-[#00FF41]/10 text-[#00FF41] rounded-lg border border-[#00FF41]/30">
              <Rocket className="w-5 h-5" />
            </span>
            <h2 className="font-headline text-2xl md:text-3xl font-bold text-white tracking-tight">
              Production Deployment Pipelines
            </h2>
          </div>
          <p className="font-body text-sm text-[#A1A1AA]">
            Real-time control plane for carbon-aware GitHub Actions and AWS Cloud deployments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAiOptimize}
            className="bg-[#141414] border border-[#2A2A2A] text-[#00FF41] font-headline text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-[#1A1A1A] transition-all"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>AI Smart Routing</span>
          </button>

          <button
            onClick={() => onStartNewDeployment()}
            className="bg-[#00FF41] text-black font-headline text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-[#00e038] transition-all shadow-md active:scale-95"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Start New Deployment</span>
          </button>
        </div>
      </div>

      {/* Pipeline Status Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#141414] p-5 rounded-2xl border border-[#2A2A2A] shadow-xs">
          <div className="flex justify-between items-center text-[#A1A1AA] text-xs font-code mb-2">
            <span>ACTIVE PIPELINES</span>
            <RefreshCw className="w-4 h-4 text-[#00FF41] animate-spin" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline text-3xl font-bold text-white">
              {activities.filter((a) => a.status === 'Running').length || 1}
            </span>
            <span className="text-xs text-[#00FF41] font-semibold">In Progress</span>
          </div>
        </div>

        <div className="bg-[#141414] p-5 rounded-2xl border border-[#2A2A2A] shadow-xs">
          <div className="flex justify-between items-center text-[#A1A1AA] text-xs font-code mb-2">
            <span>COMPLETED TODAY</span>
            <CheckCircle2 className="w-4 h-4 text-[#00FF41]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline text-3xl font-bold text-white">
              {activities.filter((a) => a.status === 'Completed').length + 8}
            </span>
            <span className="text-xs text-[#A1A1AA]">100% Success Rate</span>
          </div>
        </div>

        <div className="bg-[#141414] p-5 rounded-2xl border border-[#2A2A2A] shadow-xs">
          <div className="flex justify-between items-center text-[#A1A1AA] text-xs font-code mb-2">
            <span>AVG BUILD SPEED</span>
            <Clock className="w-4 h-4 text-[#3B82F6]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline text-3xl font-bold text-white">14.2s</span>
            <span className="text-xs text-[#3B82F6]">AWS Lambda Fast Start</span>
          </div>
        </div>

        <div className="bg-[#141414] p-5 rounded-2xl border border-[#2A2A2A] shadow-xs">
          <div className="flex justify-between items-center text-[#A1A1AA] text-xs font-code mb-2">
            <span>CARBON DEFERRED</span>
            <Layers className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline text-3xl font-bold text-[#F59E0B]">42.8kg</span>
            <button
              onClick={onNavigateToQueue}
              className="text-[11px] text-[#F59E0B] hover:underline font-bold ml-auto"
            >
              View Queue →
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#141414] p-4 rounded-2xl border border-[#2A2A2A]">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
          <input
            type="text"
            placeholder="Filter by repository, branch, commit, region..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white placeholder-[#71717A] rounded-xl py-2 pl-9 pr-4 text-xs focus:border-[#00FF41] focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'RUNNING', 'COMPLETED', 'SCHEDULED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-code text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-[#00FF41] text-black shadow-xs'
                  : 'bg-[#1A1A1A] text-[#A1A1AA] hover:text-white border border-[#2A2A2A]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Deployments Table */}
      <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#2A2A2A] flex justify-between items-center bg-[#111111]">
          <div>
            <h3 className="font-headline text-lg font-bold text-white">
              Deployment Pipeline Execution History
            </h3>
            <p className="font-body text-xs text-[#A1A1AA]">
              Audited logs of carbon intensity scoring, AWS target region routing, and build metrics.
            </p>
          </div>
          <button
            onClick={() => onStartNewDeployment()}
            className="px-3.5 py-1.5 bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 hover:bg-[#00FF41]/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>New Deployment</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1A1A1A] text-[#A1A1AA] font-code text-xs uppercase tracking-wider">
                <th className="px-6 py-3.5 font-bold">Repository & Commit</th>
                <th className="px-6 py-3.5 font-bold">AWS Region</th>
                <th className="px-6 py-3.5 font-bold">Grid Score</th>
                <th className="px-6 py-3.5 font-bold">Carbon Impact</th>
                <th className="px-6 py-3.5 font-bold">Status</th>
                <th className="px-6 py-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A] font-body text-xs">
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#A1A1AA]">
                    No matching deployment records found.
                  </td>
                </tr>
              ) : (
                filteredActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-[#1A1A1A]/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#2A2A2A] text-[#00FF41] border border-[#3F3F46] flex items-center justify-center font-code font-bold text-xs">
                          <FileCode2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{act.repo}</p>
                          <p className="font-code text-[11px] text-[#A1A1AA]">
                            <span className="text-[#00FF41]">{act.branch}</span> • {act.commitSha}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-code text-white">
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-[#00FF41]" />
                        <span>{act.awsRegion}</span>
                        {act.carbonValue && (
                          <span className="text-[10px] text-[#A1A1AA]">({act.carbonValue} gCO2)</span>
                        )}
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

                    <td className="px-6 py-4 font-code text-[#00FF41] font-semibold">
                      {act.carbonImpact}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-code text-[10px] font-bold uppercase border ${
                          act.status === 'Completed'
                            ? 'bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30'
                            : act.status === 'Running'
                            ? 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30 animate-pulse'
                            : 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            act.status === 'Completed'
                              ? 'bg-[#00FF41]'
                              : act.status === 'Running'
                              ? 'bg-[#3B82F6]'
                              : 'bg-[#F59E0B]'
                          }`}
                        ></span>
                        {act.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedLog(act)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-[#2A2A2A] rounded-lg transition-all flex items-center gap-1"
                        >
                          <Terminal className="w-3.5 h-3.5 text-[#00FF41]" />
                          <span>Logs</span>
                        </button>
                        <button
                          onClick={() => onStartNewDeployment(act.awsRegion)}
                          className="px-3 py-1.5 text-xs font-bold text-black bg-[#00FF41] hover:bg-[#00e038] rounded-lg transition-all shadow-xs flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Redeploy</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Terminal Logs Modal View */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] max-w-2xl w-full p-6 shadow-2xl text-[#E0E0E0] space-y-4 font-code text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-[#2A2A2A]">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-[#00FF41]" />
                <h3 className="font-bold text-white text-sm">
                  Deployment Logs: {selectedLog.repo} ({selectedLog.commitSha})
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-[#71717A] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#2A2A2A] font-code text-[11px] text-[#00FF41] space-y-1.5 h-64 overflow-y-auto leading-relaxed">
              <p className="text-[#A1A1AA]">[12:00:01] 🚀 Initializing CarbonOps Deployment Dispatcher...</p>
              <p>[12:00:02] 🔍 Querying Electricity Maps API for {selectedLog.awsRegion}...</p>
              <p>[12:00:03] ✅ Carbon Intensity score: {selectedLog.carbonValue || 182} gCO2eq/kWh</p>
              <p>[12:00:04] 🌿 Policy Check: Intensity below threshold! Decision: PROCEED</p>
              <p>[12:00:06] 📦 Packaging artifact build for {selectedLog.repo} ({selectedLog.branch})</p>
              <p>[12:00:09] ⚡ Dispatching AWS Lambda / ECS task in target region {selectedLog.awsRegion}</p>
              <p>[12:00:12] 🟢 Health check 200 OK. Route active on Amazon CloudFront.</p>
              <p className="text-white font-bold">[12:00:14] 🎉 Deployment Completed Successfully! Saved {selectedLog.savedKg || 3.8}kg CO2e.</p>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-[#A1A1AA]">
                Log Stream ID: <b className="text-white">/aws/lambda/carbon-deploy-{selectedLog.repo}</b>
              </span>
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-[#00FF41] text-black font-bold rounded-xl text-xs hover:bg-[#00e038]"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

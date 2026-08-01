import React, { useState } from 'react';
import {
  Layers,
  Timer,
  Leaf,
  Globe,
  Filter,
  Download,
  Play,
  XCircle,
  Plus,
  RefreshCw,
  Zap,
  SlidersHorizontal,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Cpu,
  ShieldAlert,
  Radio,
  Activity
} from 'lucide-react';
import { QueuedPipeline } from '../types';
import { InterceptorMonitorModal } from './InterceptorMonitorModal';

interface QueueViewProps {
  queue: QueuedPipeline[];
  onDeploy: (id: string) => void;
  onCancel: (id: string) => void;
  onEnqueue: (data: {
    repo: string;
    branch: string;
    commitSha: string;
    awsRegion: string;
    carbonIntensity: number;
    commitAuthor: string;
  }) => void;
  threshold: number;
  onThresholdChange: (val: number) => void;
  onTriggerEventBridge: () => void;
  isTriggering: boolean;
}

export const QueueView: React.FC<QueueViewProps> = ({
  queue,
  onDeploy,
  onCancel,
  onEnqueue,
  threshold,
  onThresholdChange,
  onTriggerEventBridge,
  isTriggering
}) => {
  const [showEnqueueModal, setShowEnqueueModal] = useState(false);
  const [showInterceptorModal, setShowInterceptorModal] = useState(false);
  const [newRepo, setNewRepo] = useState('payment-gateway-service');
  const [newBranch, setNewBranch] = useState('main');
  const [newRegion, setNewRegion] = useState('us-east-1');
  const [newIntensity, setNewIntensity] = useState(380);
  const [newAuthor, setNewAuthor] = useState('DevOps Bot');

  const handleCreateEnqueue = (e: React.FormEvent) => {
    e.preventDefault();
    onEnqueue({
      repo: newRepo,
      branch: newBranch,
      commitSha: Math.random().toString(36).substring(2, 9),
      awsRegion: newRegion,
      carbonIntensity: Number(newIntensity),
      commitAuthor: newAuthor
    });
    setShowEnqueueModal(false);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto text-[#E0E0E0]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>Deployment Queue (Amazon SQS)</span>
            <span className="text-[11px] font-code bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-pulse" />
              Interceptor Resilient
            </span>
          </h2>
          <p className="font-body text-sm text-[#A1A1AA] mt-1">
            Manage scheduled workloads held based on regional carbon intensity forecasts with automatic timeout & SQS retry recovery.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowInterceptorModal(true)}
            className="bg-[#18181C] hover:bg-[#222228] text-cyan-400 border border-cyan-500/30 font-headline text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-xs"
          >
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <span>Error Interceptor & SQS Resiliency</span>
          </button>

          <button
            onClick={onTriggerEventBridge}
            disabled={isTriggering}
            className="bg-[#141414] hover:bg-[#1A1A1A] text-[#00FF41] border border-[#2A2A2A] font-headline text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-xs"
            title="Simulate EventBridge 5-minute cron check"
          >
            <RefreshCw className={`w-4 h-4 ${isTriggering ? 'animate-spin' : ''}`} />
            <span>{isTriggering ? 'Polling SQS...' : 'Trigger EventBridge Check'}</span>
          </button>

          <button
            onClick={() => setShowEnqueueModal(true)}
            className="bg-[#00FF41] text-black font-headline text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-[#00e038] transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Enqueue Test Pipeline</span>
          </button>
        </div>
      </div>

      {/* SQS Error Interceptor Live Protection Banner */}
      <div className="bg-[#141418] border border-[#27272A] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-body">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#00FF41]/10 rounded-xl text-[#00FF41] border border-[#00FF41]/20">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white font-display">SQS Queue Connection Interceptor</span>
              <span className="text-[10px] font-code bg-[#00FF41]/15 text-[#00FF41] px-2 py-0.5 rounded font-semibold">
                PROTECTED
              </span>
            </div>
            <p className="text-xs text-[#A1A1AA] font-code mt-0.5">
              Catches API timeouts & SQS socket drops • Exponential Backoff: 400ms base, max 3 retries with jitter
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowInterceptorModal(true)}
          className="text-xs font-code text-cyan-400 hover:text-cyan-300 font-bold underline underline-offset-4 flex items-center gap-1 shrink-0"
        >
          View Live Backoff Logs & Test Simulation →
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Queued */}
        <div className="bg-[#141414] p-6 rounded-2xl border-t-4 border-t-[#00FF41] border-x border-b border-[#2A2A2A] shadow-xs relative overflow-hidden">
          <span className="text-[#A1A1AA] font-code text-xs uppercase font-medium">Active Queued</span>
          <span className="font-headline text-3xl font-bold text-white block mt-1">
            {queue.length}
          </span>
          <div className="mt-4 flex items-center gap-1 text-[#00FF41] text-xs font-bold">
            <span>-2 from last hour</span>
          </div>
          <Layers className="w-16 h-16 absolute -right-3 -bottom-3 text-[#00FF41]/5" />
        </div>

        {/* Avg Wait Time */}
        <div className="bg-[#141414] p-6 rounded-2xl border-t-4 border-t-[#F59E0B] border-x border-b border-[#2A2A2A] shadow-xs relative overflow-hidden">
          <span className="text-[#A1A1AA] font-code text-xs uppercase font-medium">Avg. Wait Time</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-headline text-3xl font-bold text-white">18</span>
            <span className="text-sm text-[#A1A1AA]">min</span>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[#F59E0B] text-xs font-bold">
            <Timer className="w-3.5 h-3.5" />
            <span>+3 min vs avg</span>
          </div>
        </div>

        {/* CO2 Avoidance */}
        <div className="bg-[#141414] p-6 rounded-2xl border-t-4 border-t-[#00FF41] border-x border-b border-[#2A2A2A] shadow-xs relative overflow-hidden">
          <span className="text-[#A1A1AA] font-code text-xs uppercase font-medium">CO2 Avoidance</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-headline text-3xl font-bold text-white">42.8</span>
            <span className="text-sm text-[#A1A1AA]">kg</span>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[#00FF41] text-xs font-bold">
            <Leaf className="w-3.5 h-3.5" />
            <span>Optimizing now</span>
          </div>
        </div>

        {/* Target Region */}
        <div className="bg-[#141414] p-6 rounded-2xl border-t-4 border-t-[#3B82F6] border-x border-b border-[#2A2A2A] shadow-xs relative overflow-hidden">
          <span className="text-[#A1A1AA] font-code text-xs uppercase font-medium">Target Region</span>
          <span className="font-headline text-3xl font-bold text-white block mt-1">US-East</span>
          <div className="mt-4 flex items-center gap-1 text-[#3B82F6] text-xs font-bold">
            <Globe className="w-3.5 h-3.5" />
            <span>Optimal intensity</span>
          </div>
        </div>
      </div>

      {/* Main SQS Queue Table */}
      <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#2A2A2A] flex justify-between items-center bg-[#111111]">
          <div className="flex items-center gap-3">
            <h3 className="font-headline text-lg font-bold text-white">
              Amazon SQS Pipeline Queue
            </h3>
            <span className="px-2 py-0.5 rounded bg-[#3B82F6]/20 text-[#93C5FD] border border-[#3B82F6]/30 font-code text-[10px] font-bold uppercase">
              LIVE SQS
            </span>
          </div>
          <p className="text-xs font-code text-[#A1A1AA]">
            Holding threshold: <b className="text-[#00FF41]">{threshold} gCO2eq/kWh</b>
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1A1A1A] text-[#A1A1AA] font-code text-xs uppercase tracking-wider">
                <th className="px-6 py-3.5 font-bold">Repository</th>
                <th className="px-6 py-3.5 font-bold">Commit SHA</th>
                <th className="px-6 py-3.5 font-bold">AWS Region</th>
                <th className="px-6 py-3.5 font-bold">Carbon Intensity</th>
                <th className="px-6 py-3.5 font-bold">Queue Time</th>
                <th className="px-6 py-3.5 font-bold">Estimated Wait</th>
                <th className="px-6 py-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A] font-body text-xs">
              {queue.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#A1A1AA]">
                    <CheckCircle className="w-8 h-8 text-[#00FF41] mx-auto mb-2" />
                    <p className="font-semibold text-sm text-white">No queued pipelines!</p>
                    <p className="text-xs mt-1">All deployment requests have been cleared or executed.</p>
                  </td>
                </tr>
              ) : (
                queue.map((item) => {
                  const isGreen = item.carbonIntensity <= threshold;
                  return (
                    <tr key={item.id} className="hover:bg-[#1A1A1A]/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-[#2A2A2A] text-[#00FF41]">
                            <Cpu className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{item.repo}</p>
                            <p className="font-code text-[11px] text-[#A1A1AA]">
                              {item.branch} • {item.commitAuthor}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-code text-[11px] bg-[#1A1A1A] border border-[#2A2A2A] px-2 py-1 rounded text-[#E0E0E0]">
                          {item.commitSha}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-code text-white">
                        <span className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-[#71717A]" />
                          {item.awsRegion}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded font-code text-[10px] font-bold uppercase border ${
                              isGreen
                                ? 'bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30'
                                : item.carbonIntensity > 500
                                ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30'
                                : 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
                            }`}
                          >
                            {isGreen ? 'Optimal' : item.carbonIntensity > 500 ? 'High Avoid' : 'Moderate'}
                          </span>
                          <span className="font-code text-xs text-[#A1A1AA]">
                            {item.carbonIntensity} gCO2/kWh
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-code text-[#A1A1AA]">{item.queueTime}</td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isGreen ? 'bg-[#00FF41] animate-pulse' : 'bg-[#EF4444]'
                            }`}
                          ></span>
                          <span className="font-medium text-white">{item.estWait}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => onDeploy(item.id)}
                            className="px-3 py-1.5 text-xs font-bold text-black bg-[#00FF41] hover:bg-[#00e038] rounded-lg transition-all shadow-xs flex items-center gap-1"
                            title="Force Deploy / Approve Deployment"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Deploy Now</span>
                          </button>
                          <button
                            onClick={() => onCancel(item.id)}
                            className="p-1.5 text-[#71717A] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-all"
                            title="Cancel Pipeline"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Threshold Slider & Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Slider Controls */}
        <div className="lg:col-span-2 bg-[#141414] p-6 md:p-8 rounded-2xl border border-[#2A2A2A] shadow-xs">
          <h4 className="font-headline text-lg font-bold text-white mb-2 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-[#00FF41]" />
            <span>Carbon Efficiency Sensitivity Threshold</span>
          </h4>
          <p className="font-body text-xs text-[#A1A1AA] mb-6">
            Adjust maximum tolerable carbon intensity (gCO2eq/kWh). Deployments exceeding this value will be automatically held in SQS.
          </p>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-code text-xs font-bold text-[#00FF41]">
                  Threshold: {threshold} gCO2eq/kWh
                </span>
                <span className="font-code text-xs text-[#A1A1AA]">
                  Sensitivity Mode:{' '}
                  <b className="text-white">{threshold < 200 ? 'Strict Green' : threshold < 400 ? 'Balanced' : 'High Throughput'}</b>
                </span>
              </div>

              <input
                type="range"
                min="100"
                max="600"
                step="10"
                value={threshold}
                onChange={(e) => onThresholdChange(Number(e.target.value))}
                className="w-full accent-[#00FF41] cursor-pointer h-2 bg-[#2A2A2A] rounded-lg"
              />
              <div className="flex justify-between text-[11px] font-code text-[#71717A] mt-1">
                <span>100 (Ultra Low Carbon)</span>
                <span>350 (Standard)</span>
                <span>600 (High Limit)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]">
                <span className="font-code text-[11px] font-bold text-[#A1A1AA] uppercase">
                  Queued Savings
                </span>
                <div className="text-lg font-bold text-[#00FF41] mt-1">12.4kg CO2</div>
              </div>
              <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]">
                <span className="font-code text-[11px] font-bold text-[#A1A1AA] uppercase">
                  Deferred Jobs
                </span>
                <div className="text-lg font-bold text-[#3B82F6] mt-1">
                  {queue.filter((q) => q.status === 'HELD').length} Pipelines
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]">
                <span className="font-code text-[11px] font-bold text-[#A1A1AA] uppercase">
                  Next Low Window
                </span>
                <div className="text-lg font-bold text-[#F59E0B] mt-1">~ 12m 40s</div>
              </div>
            </div>
          </div>
        </div>

        {/* Regional Insights */}
        <div className="bg-[#0D0D0D] border border-[#00FF41]/30 text-white p-6 md:p-8 rounded-2xl shadow-md flex flex-col justify-between relative overflow-hidden">
          <div>
            <h4 className="font-headline text-lg font-bold text-[#00FF41] mb-2">Regional Grid Forecast</h4>
            <p className="font-body text-xs text-[#A1A1AA] leading-relaxed">
              US-East-1 current grid intensity is 12% lower than the daily average. Ideal window for heavy database migrations & batch workloads.
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between items-center text-xs border-b border-[#2A2A2A] pb-2">
                <span>US-West (Oregon)</span>
                <span className="font-bold text-[#00FF41]">110g ✓ Optimal</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-[#2A2A2A] pb-2">
                <span>EU-West (Ireland)</span>
                <span className="font-bold text-[#F59E0B]">240g • Moderate</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-[#2A2A2A] pb-2">
                <span>AP-South (Mumbai)</span>
                <span className="font-bold text-[#EF4444]">710g ⚠ High</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4">
            <span className="font-code text-[11px] text-[#A1A1AA] block mb-2">
              Auto-Polling SQS every 5 mins
            </span>
            <div className="w-full bg-[#2A2A2A] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#00FF41] h-full w-[65%] animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Enqueue Modal */}
      {showEnqueueModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline font-bold text-lg text-white">
                Enqueue Test Pipeline
              </h3>
              <button
                onClick={() => setShowEnqueueModal(false)}
                className="text-[#71717A] hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEnqueue} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                  Repository Name
                </label>
                <input
                  type="text"
                  value={newRepo}
                  onChange={(e) => setNewRepo(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-xs text-white font-code focus:outline-none focus:border-[#00FF41]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                    Branch
                  </label>
                  <input
                    type="text"
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-xs text-white font-code focus:outline-none focus:border-[#00FF41]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                    Target Region
                  </label>
                  <select
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-xs text-white font-code focus:outline-none focus:border-[#00FF41]"
                  >
                    <option value="us-east-1">us-east-1 (N. Virginia)</option>
                    <option value="us-west-2">us-west-2 (Oregon)</option>
                    <option value="eu-central-1">eu-central-1 (Frankfurt)</option>
                    <option value="ap-southeast-1">ap-southeast-1 (Singapore)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                  Current Carbon Intensity (gCO2/kWh)
                </label>
                <input
                  type="number"
                  value={newIntensity}
                  onChange={(e) => setNewIntensity(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-xs text-white font-code focus:outline-none focus:border-[#00FF41]"
                />
                <p className="text-[11px] text-[#71717A] mt-1">
                  Threshold is {threshold}. {newIntensity <= threshold ? 'Will DEPLOY immediately.' : 'Will HOLD in SQS queue.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                  Commit Author
                </label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-xs text-white font-code focus:outline-none focus:border-[#00FF41]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEnqueueModal(false)}
                  className="px-4 py-2 border border-[#2A2A2A] rounded-lg text-xs font-semibold text-[#A1A1AA] hover:bg-[#1A1A1A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00FF41] text-black rounded-lg text-xs font-bold hover:bg-[#00e038]"
                >
                  Push to SQS Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interceptor Monitor Modal */}
      <InterceptorMonitorModal
        isOpen={showInterceptorModal}
        onClose={() => setShowInterceptorModal(false)}
      />
    </div>
  );
};

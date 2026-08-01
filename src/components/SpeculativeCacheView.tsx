import React, { useState } from 'react';
import {
  Zap,
  Clock,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  Play,
  Database,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  Info,
  Server,
  Code
} from 'lucide-react';
import { SpeculativeCacheItem } from '../types';

interface SpeculativeCacheViewProps {
  onTriggerInstantDeploy: (item: SpeculativeCacheItem) => void;
}

export const SpeculativeCacheView: React.FC<SpeculativeCacheViewProps> = ({
  onTriggerInstantDeploy
}) => {
  const [cacheItems, setCacheItems] = useState<SpeculativeCacheItem[]>([
    {
      id: 'spec-1',
      repo: 'payment-api-gateway',
      branch: 'main',
      commitSha: 'a81d9f2',
      predictedDeployProbability: 96,
      cleanWindowPrebuiltAt: '12 mins ago (Grid: 82 gCO2/kWh - Swedish Hydro)',
      prepaidRegion: 'eu-north-1',
      prepaidGridScore: 92,
      prepaidCarbonValue: 82,
      artifactImageDigest: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      cacheStatus: 'PREBUILT_READY',
      latencySavedSeconds: 179.8
    },
    {
      id: 'spec-2',
      repo: 'auth-service-v2',
      branch: 'release/2.4',
      commitSha: 'c4e910a',
      predictedDeployProbability: 88,
      cleanWindowPrebuiltAt: '28 mins ago (Grid: 110 gCO2/kWh - Oregon Solar)',
      prepaidRegion: 'us-west-2',
      prepaidGridScore: 86,
      prepaidCarbonValue: 110,
      artifactImageDigest: 'sha256:7a92b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
      cacheStatus: 'PREBUILT_READY',
      latencySavedSeconds: 145.2
    },
    {
      id: 'spec-3',
      repo: 'analytics-worker-node',
      branch: 'main',
      commitSha: 'f9a21e4',
      predictedDeployProbability: 79,
      cleanWindowPrebuiltAt: '42 mins ago (Grid: 95 gCO2/kWh - Ireland Wind)',
      prepaidRegion: 'eu-west-1',
      prepaidGridScore: 89,
      prepaidCarbonValue: 95,
      artifactImageDigest: 'sha256:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      cacheStatus: 'PREBUILT_READY',
      latencySavedSeconds: 210.0
    }
  ]);

  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const handleSynthesizeNewPrebuild = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      const newItem: SpeculativeCacheItem = {
        id: `spec-${Date.now()}`,
        repo: 'search-indexing-service',
        branch: 'main',
        commitSha: Math.random().toString(36).substring(2, 9),
        predictedDeployProbability: Math.floor(Math.random() * 15) + 85,
        cleanWindowPrebuiltAt: 'Just now (Grid: 74 gCO2/kWh - Hydro Peak)',
        prepaidRegion: 'eu-north-1',
        prepaidGridScore: 95,
        prepaidCarbonValue: 74,
        artifactImageDigest: `sha256:${Math.random().toString(36).substring(2, 15)}...`,
        cacheStatus: 'PREBUILT_READY',
        latencySavedSeconds: 165.0
      };
      setCacheItems((prev) => [newItem, ...prev]);
      setIsSynthesizing(false);
    }, 1200);
  };

  const handleDeploy = (item: SpeculativeCacheItem) => {
    setCacheItems((prev) =>
      prev.map((c) => (c.id === item.id ? { ...c, cacheStatus: 'DISPATCHED_INSTANT' } : c))
    );
    onTriggerInstantDeploy(item);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto text-[#E0E0E0]">
      {/* Header Banner */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-[#00FF41]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] font-code text-xs font-bold rounded-lg flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>Zero-Latency Carbon Engine</span>
              </span>
              <span className="text-xs text-[#A1A1AA] font-code">
                Solving Deferral Latency via Predictive Clean-Grid Caching
              </span>
            </div>
            <h2 className="font-headline text-2xl md:text-3xl font-bold text-white tracking-tight">
              Speculative Pre-Build & Hold Cache
            </h2>
            <p className="font-body text-sm text-[#A1A1AA] max-w-3xl mt-2 leading-relaxed">
              When the grid is green, CarbonOps ML predicts merge velocity and pre-compiles Docker container artifacts in advance. 
              When developers hit <b className="text-white">Deploy</b> during a dirty grid window, the pre-built clean artifact dispatches <b className="text-[#00FF41]">instantly (&lt; 250ms)</b> — zero build wait time, 100% clean energy paid in advance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSynthesizeNewPrebuild}
              disabled={isSynthesizing}
              className="bg-[#00FF41] text-black font-headline text-xs font-bold px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-[#00e038] transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSynthesizing ? 'animate-spin' : ''}`} />
              <span>{isSynthesizing ? 'Compiling Clean Artifact...' : 'Predict & Pre-Build Now'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Latency Comparison Card & Predictive Velocity Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#141414] p-6 rounded-2xl border border-[#2A2A2A] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center text-xs font-code text-[#A1A1AA] mb-3">
              <span>DEPLOYMENT LATENCY COMPARISON</span>
              <Zap className="w-4 h-4 text-[#00FF41]" />
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#A1A1AA]">Standard On-Demand Build (Dirty Grid)</span>
                  <span className="font-code font-bold text-[#EF4444]">180.0 sec</span>
                </div>
                <div className="w-full bg-[#2A2A2A] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#EF4444] h-full w-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white font-bold">CarbonOps Speculative Dispatch</span>
                  <span className="font-code font-bold text-[#00FF41]">0.2 sec (Instant)</span>
                </div>
                <div className="w-full bg-[#2A2A2A] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#00FF41] h-full w-[2%]"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#2A2A2A] flex items-center gap-2 text-xs text-[#00FF41]">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>99.8% Latency Reduction while preserving 100% clean energy footprint.</span>
          </div>
        </div>

        <div className="bg-[#141414] p-6 rounded-2xl border border-[#2A2A2A] shadow-xs">
          <div className="flex justify-between items-center text-xs font-code text-[#A1A1AA] mb-3">
            <span>PRE-PAID CLEAN ENERGY CACHE</span>
            <Database className="w-4 h-4 text-[#3B82F6]" />
          </div>
          <div className="font-headline text-3xl font-bold text-white mb-2">
            3 Artifacts <span className="text-xs font-normal text-[#A1A1AA]">Held in Clean Storage</span>
          </div>
          <p className="text-xs text-[#A1A1AA] leading-relaxed mb-4">
            Compiled during high renewable hydro/wind peak windows in Stockholm (<b className="text-white">eu-north-1</b>) & Oregon (<b className="text-white">us-west-2</b>).
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs font-code bg-[#1A1A1A] p-3 rounded-xl border border-[#2A2A2A]">
            <div>
              <span className="text-[#71717A] block">Avg Pre-paid Grid</span>
              <span className="text-[#00FF41] font-bold">89.6 gCO2/kWh</span>
            </div>
            <div>
              <span className="text-[#71717A] block">Time Window Paid</span>
              <span className="text-white font-bold">Green Peak 11:00</span>
            </div>
          </div>
        </div>

        <div className="bg-[#141414] p-6 rounded-2xl border border-[#2A2A2A] shadow-xs">
          <div className="flex justify-between items-center text-xs font-code text-[#A1A1AA] mb-3">
            <span>ML COMMIT VELOCITY PREDICTOR</span>
            <TrendingUp className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="font-headline text-3xl font-bold text-white mb-2">
            94.2% <span className="text-xs font-normal text-[#00FF41]">Prediction Accuracy</span>
          </div>
          <p className="text-xs text-[#A1A1AA] leading-relaxed mb-4">
            Analyzes GitHub commit cadence, PR review approvals, and CI pass rates to trigger speculative pre-compilation 20 minutes before PR merge.
          </p>
          <div className="flex items-center gap-2 text-xs text-[#F59E0B] font-code bg-[#F59E0B]/10 p-2.5 rounded-xl border border-[#F59E0B]/30">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>Zero extra cloud cost — builds run on pre-allocated idle runners.</span>
          </div>
        </div>
      </div>

      {/* Speculative Cache Registry Table */}
      <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#2A2A2A] flex justify-between items-center bg-[#111111]">
          <div>
            <h3 className="font-headline text-lg font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-[#00FF41]" />
              <span>Pre-Built Clean Artifact Registry (Hold Buffer)</span>
            </h3>
            <p className="font-body text-xs text-[#A1A1AA]">
              Pre-compiled container layers ready for instantaneous zero-latency deployment trigger.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1A1A1A] text-[#A1A1AA] font-code text-xs uppercase tracking-wider">
                <th className="px-6 py-3.5 font-bold">Service Repository</th>
                <th className="px-6 py-3.5 font-bold">Pre-Paid Clean Region</th>
                <th className="px-6 py-3.5 font-bold">Grid Score & Paid Intensity</th>
                <th className="px-6 py-3.5 font-bold">ML Prediction</th>
                <th className="px-6 py-3.5 font-bold">Container Image Digest</th>
                <th className="px-6 py-3.5 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A] font-body text-xs">
              {cacheItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#1A1A1A]/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#2A2A2A] text-[#00FF41] border border-[#3F3F46] flex items-center justify-center font-code font-bold">
                        <Code className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{item.repo}</p>
                        <p className="font-code text-[11px] text-[#A1A1AA]">
                          <span className="text-[#00FF41]">{item.branch}</span> • {item.commitSha}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 font-code text-white">
                    <div>
                      <span className="font-bold text-sm text-[#00FF41]">{item.prepaidRegion}</span>
                      <p className="text-[10px] text-[#A1A1AA]">{item.cleanWindowPrebuiltAt}</p>
                    </div>
                  </td>

                  <td className="px-6 py-4 font-code">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#00FF41] text-sm">{item.prepaidGridScore}/100</span>
                      <span className="text-[10px] text-[#A1A1AA]">({item.prepaidCarbonValue} gCO2/kWh)</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 font-code">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{item.predictedDeployProbability}% Confidence</span>
                      <span className="px-1.5 py-0.5 bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 rounded text-[10px]">
                        HIGH VELOCITY
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 font-code text-[11px] text-[#71717A] max-w-xs truncate">
                    <span className="bg-[#1A1A1A] px-2 py-1 rounded border border-[#2A2A2A] text-[#A1A1AA]">
                      {item.artifactImageDigest.substring(0, 24)}...
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    {item.cacheStatus === 'DISPATCHED_INSTANT' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 rounded-xl text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Dispatched (0.2s)</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDeploy(item)}
                        className="bg-[#00FF41] text-black font-bold px-4 py-2 rounded-xl hover:bg-[#00e038] transition-all shadow-xs flex items-center gap-1.5 ml-auto text-xs active:scale-95"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>Instant Deploy Now</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

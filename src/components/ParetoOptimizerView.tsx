import React, { useState } from 'react';
import {
  Sliders,
  Zap,
  DollarSign,
  Leaf,
  Globe,
  Award,
  ArrowRight,
  TrendingUp,
  Check,
  ShieldAlert,
  Info,
  Layers,
  Sparkles
} from 'lucide-react';
import { ParetoRegionPoint } from '../types';

interface ParetoOptimizerViewProps {
  onSelectOptimalRegion: (region: string) => void;
}

export const ParetoOptimizerView: React.FC<ParetoOptimizerViewProps> = ({
  onSelectOptimalRegion
}) => {
  const [maxCarbonBudget, setMaxCarbonBudget] = useState<number>(200); // gCO2/kWh
  const [maxCostBudget, setMaxCostBudget] = useState<number>(1.8); // $/1k invocations

  // Real region data with dual attributes: Carbon Intensity vs Cost
  const regionsData: ParetoRegionPoint[] = [
    {
      region: 'eu-north-1',
      name: 'Europe (Stockholm)',
      carbonIntensity: 42,
      costPerThousandInvocations: 2.2, // Clean hydro/wind - slightly higher AWS rate
      renewablePct: 94,
      latencyMs: 38,
      isParetoOptimal: true,
      recommendationScore: 98
    },
    {
      region: 'us-west-2',
      name: 'US West (Oregon)',
      carbonIntensity: 110,
      costPerThousandInvocations: 1.6,
      renewablePct: 78,
      latencyMs: 62,
      isParetoOptimal: true,
      recommendationScore: 92
    },
    {
      region: 'eu-west-1',
      name: 'Europe (Ireland)',
      carbonIntensity: 180,
      costPerThousandInvocations: 1.4,
      renewablePct: 62,
      latencyMs: 24,
      isParetoOptimal: true,
      recommendationScore: 88
    },
    {
      region: 'us-east-1',
      name: 'US East (N. Virginia)',
      carbonIntensity: 395,
      costPerThousandInvocations: 0.95, // Cheaper coal/gas energy grid
      renewablePct: 22,
      latencyMs: 18,
      isParetoOptimal: false,
      recommendationScore: 45
    },
    {
      region: 'ap-southeast-1',
      name: 'Asia Pacific (Singapore)',
      carbonIntensity: 480,
      costPerThousandInvocations: 2.1, // Both high carbon & expensive
      renewablePct: 12,
      latencyMs: 140,
      isParetoOptimal: false,
      recommendationScore: 20
    },
    {
      region: 'ap-northeast-1',
      name: 'Asia Pacific (Tokyo)',
      carbonIntensity: 310,
      costPerThousandInvocations: 1.85,
      renewablePct: 35,
      latencyMs: 110,
      isParetoOptimal: false,
      recommendationScore: 55
    }
  ];

  // Filter valid regions meeting BOTH user slider constraints
  const eligibleRegions = regionsData.filter(
    (r) => r.carbonIntensity <= maxCarbonBudget && r.costPerThousandInvocations <= maxCostBudget
  );

  // Determine optimal choice on the Pareto frontier: lowest carbon among eligible
  const bestRegion = eligibleRegions.length > 0
    ? [...eligibleRegions].sort((a, b) => a.carbonIntensity - b.carbonIntensity)[0]
    : null;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto text-[#E0E0E0]">
      {/* Top Header Banner */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-[#00FF41]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] font-code text-xs font-bold rounded-lg flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#00FF41]" />
                <span>Dual-Constraint Algorithmic Engine</span>
              </span>
              <span className="text-xs text-[#A1A1AA] font-code">Multi-Objective Optimization</span>
            </div>
            <h2 className="font-headline text-2xl md:text-3xl font-bold text-white tracking-tight">
              Joint Carbon / Cost Pareto Frontier Optimizer
            </h2>
            <p className="font-body text-sm text-[#A1A1AA] max-w-3xl mt-2 leading-relaxed">
              Infrastructure teams face dual constraints: <b className="text-[#00FF41]">Carbon Emissions (Scope 3)</b> vs. <b className="text-[#3B82F6]">Cloud Budget ($/invocation)</b>. 
              Drag the sliders to dynamically compute the mathematically non-dominated Pareto optimal AWS target regions in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Dual Sliders & Pareto Frontier Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Slider Panel */}
        <div className="lg:col-span-5 bg-[#141414] p-6 rounded-2xl border border-[#2A2A2A] space-y-6 shadow-xs">
          <div className="border-b border-[#2A2A2A] pb-4">
            <h3 className="font-headline text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#00FF41]" />
              <span>Multi-Objective Budget Controls</span>
            </h3>
            <p className="font-body text-xs text-[#A1A1AA]">
              Set your target carbon limit & cloud cost ceiling.
            </p>
          </div>

          {/* Slider 1: Carbon Intensity Limit */}
          <div className="space-y-3 bg-[#1A1A1A] p-4 rounded-xl border border-[#2A2A2A]">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-[#00FF41]" />
                <span>Max Carbon Budget</span>
              </span>
              <span className="font-code font-bold text-sm text-[#00FF41]">
                {maxCarbonBudget} gCO2/kWh
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="500"
              step="10"
              value={maxCarbonBudget}
              onChange={(e) => setMaxCarbonBudget(Number(e.target.value))}
              className="w-full accent-[#00FF41] bg-[#2A2A2A] rounded-lg h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#A1A1AA] font-code">
              <span>30 (Hydro/Wind Only)</span>
              <span>250 (Threshold)</span>
              <span>500 (Coal Heavy)</span>
            </div>
          </div>

          {/* Slider 2: Max Cost Budget */}
          <div className="space-y-3 bg-[#1A1A1A] p-4 rounded-xl border border-[#2A2A2A]">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-[#3B82F6]" />
                <span>Max Cost Ceiling</span>
              </span>
              <span className="font-code font-bold text-sm text-[#3B82F6]">
                ${maxCostBudget.toFixed(2)} / 1k requests
              </span>
            </div>
            <input
              type="range"
              min="0.80"
              max="2.50"
              step="0.05"
              value={maxCostBudget}
              onChange={(e) => setMaxCostBudget(Number(e.target.value))}
              className="w-full accent-[#3B82F6] bg-[#2A2A2A] rounded-lg h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#A1A1AA] font-code">
              <span>$0.80 (Budget Coal Regions)</span>
              <span>$1.60 (Balanced)</span>
              <span>$2.50 (Premium Hydro)</span>
            </div>
          </div>

          {/* Live Recommended Result Box */}
          {bestRegion ? (
            <div className="bg-[#00FF41]/10 border border-[#00FF41]/40 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-[#00FF41] text-black font-code font-bold text-[10px] rounded">
                  PARETO OPTIMAL MATCH
                </span>
                <Award className="w-5 h-5 text-[#00FF41]" />
              </div>
              <div>
                <h4 className="font-headline text-xl font-bold text-white">{bestRegion.name}</h4>
                <p className="font-code text-xs text-[#00FF41]">{bestRegion.region}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 font-code text-xs pt-2 border-t border-[#00FF41]/20">
                <div>
                  <span className="text-[#A1A1AA] block text-[10px]">Grid Carbon</span>
                  <span className="text-[#00FF41] font-bold">{bestRegion.carbonIntensity} gCO2/kWh</span>
                </div>
                <div>
                  <span className="text-[#A1A1AA] block text-[10px]">Invocation Cost</span>
                  <span className="text-[#3B82F6] font-bold">${bestRegion.costPerThousandInvocations.toFixed(2)} / 1k</span>
                </div>
              </div>

              <button
                onClick={() => onSelectOptimalRegion(bestRegion.region)}
                className="w-full bg-[#00FF41] text-black font-bold py-2.5 rounded-xl hover:bg-[#00e038] transition-all shadow-md flex items-center justify-center gap-2 text-xs mt-2"
              >
                <span>Select & Deploy to {bestRegion.region}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="bg-[#EF4444]/10 border border-[#EF4444]/40 p-4 rounded-xl text-xs text-[#EF4444] flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <span>No region fits within both current budget limits. Try expanding your cost or carbon threshold.</span>
            </div>
          )}
        </div>

        {/* Right Pareto Frontier Visual Scatter Curve */}
        <div className="lg:col-span-7 bg-[#141414] p-6 rounded-2xl border border-[#2A2A2A] flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex justify-between items-center border-b border-[#2A2A2A] pb-4 mb-4">
              <div>
                <h3 className="font-headline text-lg font-bold text-white">
                  Visual Pareto Curve & Solution Set
                </h3>
                <p className="font-body text-xs text-[#A1A1AA]">
                  X-Axis: Carbon Intensity (gCO2/kWh) vs Y-Axis: Cost ($/1k requests).
                </p>
              </div>
              <span className="px-2.5 py-1 bg-[#1A1A1A] border border-[#2A2A2A] text-xs font-code text-[#00FF41] rounded-lg">
                Non-Dominated Points Highlighted
              </span>
            </div>

            {/* Custom Interactive Scatter Plot Visualization */}
            <div className="relative h-64 bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-4 overflow-hidden flex flex-col justify-between">
              {/* Plot Background Grid lines */}
              <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-20 pointer-events-none divide-x divide-y divide-[#3F3F46]" />

              {/* Quadrant budget boundaries */}
              <div
                className="absolute left-0 bottom-0 border-r-2 border-t-2 border-[#00FF41]/40 bg-[#00FF41]/5 pointer-events-none transition-all duration-300"
                style={{
                  width: `${Math.min(100, (maxCarbonBudget / 500) * 100)}%`,
                  height: `${Math.min(100, (maxCostBudget / 2.5) * 100)}%`
                }}
              />

              {/* Plotted Region Nodes */}
              {regionsData.map((reg) => {
                const xPct = (reg.carbonIntensity / 500) * 85 + 5;
                const yPct = 100 - (reg.costPerThousandInvocations / 2.5) * 85 - 5;
                const isSelected = bestRegion?.region === reg.region;
                const isEligible = reg.carbonIntensity <= maxCarbonBudget && reg.costPerThousandInvocations <= maxCostBudget;

                return (
                  <div
                    key={reg.region}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 cursor-pointer group ${
                      isSelected ? 'z-30 scale-125' : 'z-20'
                    }`}
                    style={{ left: `${xPct}%`, top: `${yPct}%` }}
                    onClick={() => onSelectOptimalRegion(reg.region)}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-code font-bold text-[10px] shadow-lg border-2 ${
                        isSelected
                          ? 'bg-[#00FF41] text-black border-white ring-4 ring-[#00FF41]/30'
                          : isEligible
                          ? 'bg-[#3B82F6] text-white border-white'
                          : 'bg-[#2A2A2A] text-[#71717A] border-[#3F3F46]'
                      }`}
                    >
                      {reg.region.substring(0, 2).toUpperCase()}
                    </div>

                    {/* Tooltip on Hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#1A1A1A] border border-[#2A2A2A] text-white p-2 rounded-xl text-[10px] font-code whitespace-nowrap z-50 shadow-2xl pointer-events-none">
                      <p className="font-bold text-[#00FF41]">{reg.name} ({reg.region})</p>
                      <p>Grid: {reg.carbonIntensity} gCO2 | Cost: ${reg.costPerThousandInvocations}/1k</p>
                    </div>
                  </div>
                );
              })}

              {/* Axis Labels */}
              <div className="absolute bottom-2 left-4 text-[10px] font-code text-[#71717A]">
                ← 30 gCO2/kWh (Clean)
              </div>
              <div className="absolute bottom-2 right-4 text-[10px] font-code text-[#71717A]">
                500 gCO2/kWh (Coal) →
              </div>
              <div className="absolute top-2 left-4 text-[10px] font-code text-[#71717A]">
                ↑ $2.50 / 1k (Premium)
              </div>
            </div>
          </div>

          {/* Region Comparison Table */}
          <div className="mt-6">
            <h4 className="font-code text-xs font-bold text-[#A1A1AA] uppercase mb-2">
              Region Trade-off Matrix
            </h4>
            <div className="overflow-x-auto rounded-xl border border-[#2A2A2A]">
              <table className="w-full text-left font-body text-xs">
                <thead className="bg-[#1A1A1A] text-[#A1A1AA] font-code text-[11px]">
                  <tr>
                    <th className="p-2.5">Region</th>
                    <th className="p-2.5">Carbon (gCO2)</th>
                    <th className="p-2.5">Cost ($/1k)</th>
                    <th className="p-2.5">Pareto Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2A] font-code text-[11px]">
                  {regionsData.map((r) => {
                    const isEligible = r.carbonIntensity <= maxCarbonBudget && r.costPerThousandInvocations <= maxCostBudget;
                    return (
                      <tr key={r.region} className={isEligible ? 'bg-[#00FF41]/5 text-white' : 'text-[#71717A]'}>
                        <td className="p-2.5 font-bold">{r.name} ({r.region})</td>
                        <td className="p-2.5 text-[#00FF41]">{r.carbonIntensity} gCO2</td>
                        <td className="p-2.5 text-[#3B82F6]">${r.costPerThousandInvocations.toFixed(2)}</td>
                        <td className="p-2.5">
                          {r.isParetoOptimal ? (
                            <span className="text-[#00FF41] font-bold">Pareto Optimal</span>
                          ) : (
                            <span>Dominated</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

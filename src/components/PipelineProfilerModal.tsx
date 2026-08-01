import React from 'react';
import {
  Terminal,
  Cpu,
  Clock,
  Layers,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  X,
  Code,
  HardDrive,
  Globe,
  Share2
} from 'lucide-react';
import { PipelineStepCarbon, DeploymentActivity } from '../types';

interface PipelineProfilerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: DeploymentActivity | null;
}

export const PipelineProfilerModal: React.FC<PipelineProfilerModalProps> = ({
  isOpen,
  onClose,
  activity
}) => {
  if (!isOpen || !activity) return null;

  // Standard step profile breakdown for CI/CD runners
  const stepBreakdown: PipelineStepCarbon[] = activity.pipelineStepBreakdown || [
    {
      stepName: 'Checkout Repository & Lint Audit',
      durationSeconds: 18,
      cpuCoresUsed: 2,
      runnerRegion: 'us-east-1 (GitHub Hosted)',
      runnerGridIntensity: 380,
      calculatedCarbonGrams: 42,
      pctOfTotalPipeline: 5,
      category: 'CHECKOUT'
    },
    {
      stepName: 'Unit, Integration & E2E Test Suite (3,240 tests)',
      durationSeconds: 145,
      cpuCoresUsed: 8,
      runnerRegion: 'us-east-1 (GitHub Hosted)',
      runnerGridIntensity: 380,
      calculatedCarbonGrams: 3480,
      pctOfTotalPipeline: 44, // 44% of total pipeline carbon!
      category: 'TEST_SUITE'
    },
    {
      stepName: 'Multi-Stage Docker Layer Build & Cache Compression',
      durationSeconds: 98,
      cpuCoresUsed: 4,
      runnerRegion: 'us-east-1 (GitHub Hosted)',
      runnerGridIntensity: 380,
      calculatedCarbonGrams: 2350,
      pctOfTotalPipeline: 30,
      category: 'DOCKER_BUILD'
    },
    {
      stepName: 'Static Security Scan & SAST Vulnerability Analysis',
      durationSeconds: 32,
      cpuCoresUsed: 4,
      runnerRegion: 'us-east-1 (GitHub Hosted)',
      runnerGridIntensity: 380,
      calculatedCarbonGrams: 760,
      pctOfTotalPipeline: 10,
      category: 'SECURITY_SCAN'
    },
    {
      stepName: 'AWS ECR Container Push & Lambda Target Dispatch',
      durationSeconds: 24,
      cpuCoresUsed: 2,
      runnerRegion: activity.awsRegion || 'eu-north-1',
      runnerGridIntensity: activity.carbonValue || 82,
      calculatedCarbonGrams: 880,
      pctOfTotalPipeline: 11,
      category: 'DEPLOYMENT'
    }
  ];

  const totalGrams = stepBreakdown.reduce((acc, curr) => acc + curr.calculatedCarbonGrams, 0);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] max-w-3xl w-full p-6 shadow-2xl text-[#E0E0E0] space-y-6 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#00FF41]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-[#2A2A2A] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] rounded-lg">
                <Cpu className="w-4 h-4" />
              </span>
              <span className="font-code text-xs text-[#00FF41] font-bold">
                CI/CD RUNNER CARBON PROFILER
              </span>
            </div>
            <h3 className="font-headline text-2xl font-bold text-white">
              Full Pipeline Carbon Accounting: {activity.repo}
            </h3>
            <p className="font-body text-xs text-[#A1A1AA]">
              Commit <b className="text-white">{activity.commitSha}</b> • Branch <b className="text-[#00FF41]">{activity.branch}</b>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#71717A] hover:text-white hover:bg-[#1A1A1A] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Insight Highlight Banner */}
        <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold text-white block">
              Test Suite Runner produces 44% of total pipeline carbon!
            </span>
            <p className="text-[#A1A1AA] leading-relaxed">
              Standard GitHub-hosted runners execute in <b className="text-white">us-east-1</b> (380 gCO2/kWh coal-heavy grid). 
              Rerouting test runner execution to clean region runners (<b className="text-[#00FF41]">eu-north-1</b> hydro) saves <b className="text-[#00FF41]">3.1 kg CO2e per build run</b>.
            </p>
          </div>
        </div>

        {/* Total Carbon KPI Banner */}
        <div className="grid grid-cols-3 gap-4 font-code">
          <div className="bg-[#1A1A1A] p-3.5 rounded-xl border border-[#2A2A2A]">
            <span className="text-[10px] text-[#A1A1AA] block">Total Pipeline Footprint</span>
            <span className="text-lg font-bold text-[#00FF41]">{(totalGrams / 1000).toFixed(2)} kg CO2e</span>
          </div>
          <div className="bg-[#1A1A1A] p-3.5 rounded-xl border border-[#2A2A2A]">
            <span className="text-[10px] text-[#A1A1AA] block">CI Runner CPU Seconds</span>
            <span className="text-lg font-bold text-white">1,840 CPU-sec</span>
          </div>
          <div className="bg-[#1A1A1A] p-3.5 rounded-xl border border-[#2A2A2A]">
            <span className="text-[10px] text-[#A1A1AA] block">Runner Grid Intensity</span>
            <span className="text-lg font-bold text-[#F59E0B]">380 gCO2/kWh</span>
          </div>
        </div>

        {/* Step Breakdown Table & Visual Bar */}
        <div className="space-y-3">
          <h4 className="font-code text-xs font-bold text-white uppercase">
            Per-Step Runner Carbon Breakdown
          </h4>

          {/* Visual Segmented Progress Bar */}
          <div className="h-3 w-full bg-[#1A1A1A] rounded-full overflow-hidden flex divide-x divide-[#0A0A0A]">
            {stepBreakdown.map((step) => {
              const bg =
                step.category === 'TEST_SUITE'
                  ? 'bg-[#EF4444]'
                  : step.category === 'DOCKER_BUILD'
                  ? 'bg-[#F59E0B]'
                  : step.category === 'DEPLOYMENT'
                  ? 'bg-[#00FF41]'
                  : 'bg-[#3B82F6]';
              return (
                <div
                  key={step.stepName}
                  className={`${bg} h-full transition-all`}
                  style={{ width: `${step.pctOfTotalPipeline}%` }}
                  title={`${step.stepName}: ${step.pctOfTotalPipeline}%`}
                />
              );
            })}
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#2A2A2A]">
            <table className="w-full text-left font-body text-xs">
              <thead className="bg-[#1A1A1A] text-[#A1A1AA] font-code text-[11px] uppercase">
                <tr>
                  <th className="p-3">Pipeline Step</th>
                  <th className="p-3">Duration & CPU</th>
                  <th className="p-3">Runner Location</th>
                  <th className="p-3">Carbon (gCO2)</th>
                  <th className="p-3">% Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A] font-code text-[11px]">
                {stepBreakdown.map((step) => (
                  <tr key={step.stepName} className="hover:bg-[#1A1A1A]/50">
                    <td className="p-3 font-bold text-white flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          step.category === 'TEST_SUITE'
                            ? 'bg-[#EF4444]'
                            : step.category === 'DOCKER_BUILD'
                            ? 'bg-[#F59E0B]'
                            : step.category === 'DEPLOYMENT'
                            ? 'bg-[#00FF41]'
                            : 'bg-[#3B82F6]'
                        }`}
                      />
                      <span>{step.stepName}</span>
                    </td>
                    <td className="p-3 text-[#A1A1AA]">
                      {step.durationSeconds}s ({step.cpuCoresUsed} Cores)
                    </td>
                    <td className="p-3 text-white">{step.runnerRegion}</td>
                    <td className="p-3 text-[#00FF41] font-bold">
                      {step.calculatedCarbonGrams} g
                    </td>
                    <td className="p-3 font-bold text-white">{step.pctOfTotalPipeline}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex justify-between items-center pt-2 border-t border-[#2A2A2A]">
          <span className="text-[11px] text-[#A1A1AA] font-code">
            Calculated via CPU-sec × Grid Intensity (v2.4 Audit Specification)
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#00FF41] text-black font-bold rounded-xl text-xs hover:bg-[#00e038] shadow-xs"
          >
            Close Profiler Report
          </button>
        </div>
      </div>
    </div>
  );
};

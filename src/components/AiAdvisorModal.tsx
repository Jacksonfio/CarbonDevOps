import React, { useState } from 'react';
import { Sparkles, X, RefreshCw, ArrowRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

interface AiAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyRecommendation?: () => void;
}

export const AiAdvisorModal: React.FC<AiAdvisorModalProps> = ({
  isOpen,
  onClose,
  onApplyRecommendation
}) => {
  const [loading, setLoading] = useState(false);
  const [advisory, setAdvisory] = useState<{
    recommendation: string;
    potentialSavingsKg: number;
    optimalRegion: string;
    actionableSteps: string[];
  } | null>(null);

  if (!isOpen) return null;

  const handleFetchOptimization = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setAdvisory(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] max-w-xl w-full p-6 shadow-2xl space-y-6 text-[#E0E0E0]">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00FF41]/20 text-[#00FF41] rounded-xl">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg text-white">
                Gemini AI Carbon Optimizer
              </h3>
              <p className="font-body text-xs text-[#A1A1AA]">
                AI-driven pipeline scheduling & regional load balancing
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#71717A] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!advisory && !loading && (
          <div className="text-center py-6 space-y-4">
            <p className="font-body text-xs text-[#A1A1AA]">
              Analyze your current SQS queue, Electricity Maps grid forecasts, and AWS region carbon intensities with Gemini AI.
            </p>
            <button
              onClick={handleFetchOptimization}
              className="bg-[#00FF41] text-black px-6 py-3 rounded-xl font-headline text-xs font-bold hover:bg-[#00e038] transition-all flex items-center gap-2 mx-auto shadow-xs"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>Generate AI Optimization Advisory</span>
            </button>
          </div>
        )}

        {loading && (
          <div className="text-center py-12 space-y-3">
            <RefreshCw className="w-8 h-8 text-[#00FF41] animate-spin mx-auto" />
            <p className="font-code text-xs font-bold text-[#00FF41]">
              Evaluating regional energy grids with Gemini AI...
            </p>
          </div>
        )}

        {advisory && !loading && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-[#00FF41]/10 border border-[#00FF41]/30 rounded-xl">
              <span className="font-code text-[11px] font-bold text-[#00FF41] uppercase block mb-1">
                AI Recommendation
              </span>
              <p className="font-body text-xs text-white font-medium leading-relaxed">
                {advisory.recommendation}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
                <span className="font-code text-[10px] font-bold text-[#A1A1AA] block">
                  POTENTIAL SAVINGS
                </span>
                <span className="font-headline text-xl font-bold text-[#00FF41]">
                  {advisory.potentialSavingsKg} kg CO2
                </span>
              </div>
              <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
                <span className="font-code text-[10px] font-bold text-[#A1A1AA] block">
                  RECOMMENDED REGION
                </span>
                <span className="font-headline text-xl font-bold text-[#3B82F6]">
                  {advisory.optimalRegion}
                </span>
              </div>
            </div>

            <div>
              <span className="font-code text-xs font-bold text-[#A1A1AA] uppercase block mb-2">
                Actionable DevOps Steps
              </span>
              <ul className="space-y-2">
                {advisory.actionableSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-white">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF41] flex-shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                onClick={handleFetchOptimization}
                className="px-4 py-2 border border-[#2A2A2A] text-[#A1A1AA] hover:bg-[#1A1A1A] hover:text-white rounded-lg text-xs font-semibold"
              >
                Re-Analyze
              </button>
              <button
                onClick={() => {
                  if (onApplyRecommendation) onApplyRecommendation();
                  onClose();
                }}
                className="px-4 py-2 bg-[#00FF41] text-black rounded-lg text-xs font-bold hover:bg-[#00e038] flex items-center gap-1.5"
              >
                <span>Apply Optimizations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

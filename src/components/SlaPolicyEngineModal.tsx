import React, { useState } from 'react';
import {
  ShieldAlert,
  Clock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  FileCode,
  X,
  Play,
  Layers,
  ChevronRight
} from 'lucide-react';
import { SlaPolicyRule } from '../types';

interface SlaPolicyEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SlaPolicyEngineModal: React.FC<SlaPolicyEngineModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const [policies, setPolicies] = useState<SlaPolicyRule[]>([
    {
      tier: 'P1_HOTFIX',
      label: 'P1 Critical Security & Hotfix',
      description: 'Zero deferral permitted. Immediate dispatch regardless of grid carbon intensity.',
      maxDeferralMinutes: 0,
      escalationAction: 'FORCE_DISPATCH_LOG',
      allowedGridDeviationPct: 100
    },
    {
      tier: 'P2_FEATURE',
      label: 'P2 Production Feature Deployment',
      description: 'Defer up to 120 mins for clean window. Auto-escalate to force deploy if SLA window expires.',
      maxDeferralMinutes: 120,
      escalationAction: 'FORCE_DISPATCH_LOG',
      allowedGridDeviationPct: 20
    },
    {
      tier: 'P3_BATCH',
      label: 'P3 Batch Job & Non-Urgent Refactor',
      description: 'Defer up to 720 mins (12 hours) to target maximum solar/wind renewable peaks.',
      maxDeferralMinutes: 720,
      escalationAction: 'HOLD_FOR_NEXT_WINDOW',
      allowedGridDeviationPct: 5
    }
  ]);

  const [auditLog, setAuditLog] = useState([
    {
      id: 'sla-1',
      time: '10 mins ago',
      repo: 'payment-gateway-service',
      tier: 'P1_HOTFIX',
      action: 'BYPASSED_DEFERRAL',
      reason: 'P1 Hotfix SLA window (0m) active. Dispatched immediately with trade-off log.',
      carbonGrams: 210
    },
    {
      id: 'sla-2',
      time: '2 hours ago',
      repo: 'user-profile-v3',
      tier: 'P2_FEATURE',
      action: 'AUTO_ESCALATED',
      reason: '120m SLA expired without clean grid window. Auto-escalated to force dispatch.',
      carbonGrams: 260
    }
  ]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] max-w-3xl w-full p-6 shadow-2xl text-[#E0E0E0] space-y-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-[#2A2A2A] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] rounded-lg">
                <ShieldAlert className="w-4 h-4" />
              </span>
              <span className="font-code text-xs text-[#00FF41] font-bold">
                PRODUCTION RELIABILITY ENGINE
              </span>
            </div>
            <h3 className="font-headline text-2xl font-bold text-white">
              SLA-Tiered Auto-Escalation Policy
            </h3>
            <p className="font-body text-xs text-[#A1A1AA]">
              Guarantees zero production blockages by automatically escalating deferred builds when max SLA time expires.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#71717A] hover:text-white hover:bg-[#1A1A1A] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SLA Policy Rules List */}
        <div className="space-y-3">
          <h4 className="font-code text-xs font-bold text-white uppercase">
            Service Criticality Rules
          </h4>

          <div className="grid grid-cols-1 gap-3">
            {policies.map((p) => (
              <div
                key={p.tier}
                className="bg-[#1A1A1A] p-4 rounded-xl border border-[#2A2A2A] space-y-2 flex flex-col justify-between"
              >
                <div className="flex justify-between items-center">
                  <span
                    className={`px-2.5 py-1 rounded font-code text-xs font-bold ${
                      p.tier === 'P1_HOTFIX'
                        ? 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30'
                        : p.tier === 'P2_FEATURE'
                        ? 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30'
                        : 'bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30'
                    }`}
                  >
                    {p.label}
                  </span>
                  <span className="font-code text-xs font-bold text-white flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#00FF41]" />
                    <span>Max Defer: {p.maxDeferralMinutes} mins</span>
                  </span>
                </div>

                <p className="font-body text-xs text-[#A1A1AA] leading-relaxed">
                  {p.description}
                </p>

                <div className="flex justify-between items-center pt-2 text-[11px] font-code border-t border-[#2A2A2A]/50">
                  <span className="text-[#71717A]">Escalation Action:</span>
                  <span className="text-white font-bold">{p.escalationAction}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Tradeoff Log */}
        <div className="space-y-3">
          <h4 className="font-code text-xs font-bold text-white uppercase">
            Recent Auto-Escalation Tradeoff Audit
          </h4>

          <div className="bg-[#0A0A0A] p-3 rounded-xl border border-[#2A2A2A] space-y-2 font-code text-xs">
            {auditLog.map((log) => (
              <div key={log.id} className="flex justify-between items-center p-2 bg-[#141414] rounded-lg border border-[#2A2A2A]">
                <div>
                  <span className="text-[#00FF41] font-bold">{log.repo}</span>
                  <span className="text-[#71717A] ml-2">({log.time})</span>
                  <p className="text-[#A1A1AA] text-[11px]">{log.reason}</p>
                </div>
                <span className="px-2 py-0.5 bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 rounded text-[10px] font-bold">
                  {log.action}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-[#2A2A2A]">
          <span className="text-[11px] text-[#A1A1AA] font-code">
            Auto-Escalation SLA Active in SQS Queue Processor
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#00FF41] text-black font-bold rounded-xl text-xs hover:bg-[#00e038] shadow-xs"
          >
            Save Policy Rules
          </button>
        </div>
      </div>
    </div>
  );
};

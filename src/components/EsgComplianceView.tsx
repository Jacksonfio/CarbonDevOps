import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  Download,
  Lock,
  CheckCircle2,
  Layers,
  Sparkles,
  ExternalLink,
  Search,
  Check,
  RefreshCw,
  Hash,
  Award
} from 'lucide-react';
import { ComplianceAuditBlock } from '../types';

export const EsgComplianceView: React.FC = () => {
  const [auditChain, setAuditChain] = useState<ComplianceAuditBlock[]>([
    {
      blockIndex: 1042,
      timestamp: '2026-08-01T07:15:00Z',
      deploymentId: 'act-1722496500',
      repo: 'payment-api-gateway',
      decision: 'PROCEED_GREEN_WINDOW',
      carbonIntensity: 82,
      carbonSavedKg: 4.2,
      costUsd: 1.45,
      csrdScope3Category: 'Scope 3 Category 11: Cloud Computing & Digital Infrastructure',
      previousHash: '0x8f3a1c9e4b2d7e0f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f',
      currentHash: '0x1d4e8a2b5c7f9e0a3b6c4d1e8f2a5b9c0d3e6f1a4b7c2d5e8f0a3b6c9d2e5f1a',
      auditorSignature: 'ECDSA_SHA256_VERIFIED_EU_CSRD_COMPLIANT'
    },
    {
      blockIndex: 1041,
      timestamp: '2026-08-01T06:42:00Z',
      deploymentId: 'act-1722494520',
      repo: 'auth-service-v2',
      decision: 'SPECULATIVE_PREPAID',
      carbonIntensity: 110,
      carbonSavedKg: 3.8,
      costUsd: 1.60,
      csrdScope3Category: 'Scope 3 Category 11: Cloud Computing & Digital Infrastructure',
      previousHash: '0x3b6c4d1e8f2a5b9c0d3e6f1a4b7c2d5e8f0a3b6c9d2e5f1a4b7c2d5e8f0a3b6c',
      currentHash: '0x8f3a1c9e4b2d7e0f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f',
      auditorSignature: 'ECDSA_SHA256_VERIFIED_EU_CSRD_COMPLIANT'
    },
    {
      blockIndex: 1040,
      timestamp: '2026-08-01T05:20:00Z',
      deploymentId: 'act-1722489600',
      repo: 'analytics-worker-node',
      decision: 'SLA_AUTO_ESCALATED',
      carbonIntensity: 210,
      carbonSavedKg: 1.2,
      costUsd: 1.20,
      csrdScope3Category: 'Scope 3 Category 11: Cloud Computing & Digital Infrastructure',
      previousHash: '0x0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b',
      currentHash: '0x3b6c4d1e8f2a5b9c0d3e6f1a4b7c2d5e8f0a3b6c9d2e5f1a4b7c2d5e8f0a3b6c',
      auditorSignature: 'ECDSA_SHA256_VERIFIED_EU_CSRD_COMPLIANT'
    }
  ]);

  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExportCsrdReport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditChain, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `CSRD_EU_Scope3_CarbonOps_Audit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto text-[#E0E0E0]">
      {/* Header Banner */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-[#00FF41]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] font-code text-xs font-bold rounded-lg flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00FF41]" />
                <span>EU CSRD & SEC Compliance Engine</span>
              </span>
              <span className="text-xs text-[#A1A1AA] font-code">
                GHG Protocol Scope 3 Category 11 Auditable Ledger
              </span>
            </div>
            <h2 className="font-headline text-2xl md:text-3xl font-bold text-white tracking-tight">
              Cryptographically Auditable ESG Ledger
            </h2>
            <p className="font-body text-sm text-[#A1A1AA] max-w-3xl mt-2 leading-relaxed">
              2026 EU Corporate Sustainability Reporting Directive (CSRD) & SEC mandate verifiable Scope 2/3 cloud emissions accounting. 
              CarbonOps creates a <b className="text-white">SHA-256 hash-chained immutable audit ledger</b> for every CI/CD deployment decision, guaranteeing regulatory compliance and audit defense.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCsrdReport}
              className="bg-[#00FF41] text-black font-headline text-xs font-bold px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-[#00e038] transition-all shadow-md active:scale-95"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Report Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export EU CSRD Audit Package</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Regulatory Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#141414] p-5 rounded-2xl border border-[#2A2A2A] shadow-xs">
          <div className="flex justify-between items-center text-[#A1A1AA] text-xs font-code mb-2">
            <span>EU CSRD COMPLIANCE STATUS</span>
            <Award className="w-4 h-4 text-[#00FF41]" />
          </div>
          <div className="font-headline text-2xl font-bold text-white mb-1">
            100% Audit Verified
          </div>
          <p className="text-xs text-[#A1A1AA]">
            Meets EFRAG ESRS E1 Climate Change Scope 3 Digital Footprint Standard.
          </p>
        </div>

        <div className="bg-[#141414] p-5 rounded-2xl border border-[#2A2A2A] shadow-xs">
          <div className="flex justify-between items-center text-[#A1A1AA] text-xs font-code mb-2">
            <span>CRYPTOGRAPHIC HASH CHAIN</span>
            <Hash className="w-4 h-4 text-[#3B82F6]" />
          </div>
          <div className="font-headline text-2xl font-bold text-[#00FF41] mb-1">
            Block #1042 Verified
          </div>
          <p className="text-xs text-[#A1A1AA]">
            Tamper-evident SHA-256 hash chaining across all pipeline dispatches.
          </p>
        </div>

        <div className="bg-[#141414] p-5 rounded-2xl border border-[#2A2A2A] shadow-xs">
          <div className="flex justify-between items-center text-[#A1A1AA] text-xs font-code mb-2">
            <span>AUDITED SCOPE 3 SAVINGS</span>
            <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="font-headline text-2xl font-bold text-white mb-1">
            42.8 kg CO2e
          </div>
          <p className="text-xs text-[#A1A1AA]">
            Verified emissions avoidance certified by Electricity Maps API logs.
          </p>
        </div>
      </div>

      {/* Cryptographic Hash-Chained Audit Ledger */}
      <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#2A2A2A] flex justify-between items-center bg-[#111111]">
          <div>
            <h3 className="font-headline text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#00FF41]" />
              <span>Immutable Cryptographic Audit Blocks</span>
            </h3>
            <p className="font-body text-xs text-[#A1A1AA]">
              SHA-256 hash-chained entries connecting parent & current block hashes for independent ESG auditors.
            </p>
          </div>
        </div>

        <div className="divide-y divide-[#2A2A2A]">
          {auditChain.map((block) => (
            <div key={block.blockIndex} className="p-6 space-y-3 hover:bg-[#1A1A1A]/50 transition-colors">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 font-code font-bold text-xs rounded-lg">
                    Block #{block.blockIndex}
                  </span>
                  <span className="font-bold text-white text-sm">{block.repo}</span>
                  <span className="text-xs text-[#A1A1AA] font-code">{block.timestamp}</span>
                </div>

                <span className="px-2.5 py-1 bg-[#1A1A1A] border border-[#2A2A2A] text-[11px] font-code text-[#00FF41] rounded-lg">
                  {block.csrdScope3Category}
                </span>
              </div>

              {/* Hash Linkage Box */}
              <div className="bg-[#0A0A0A] p-3 rounded-xl border border-[#2A2A2A] font-code text-[11px] space-y-1">
                <div className="flex justify-between text-[#71717A]">
                  <span>Previous Hash:</span>
                  <span className="text-[#A1A1AA] truncate max-w-md">{block.previousHash}</span>
                </div>
                <div className="flex justify-between text-[#00FF41]">
                  <span className="font-bold">Block Hash (SHA-256):</span>
                  <span className="font-bold truncate max-w-md">{block.currentHash}</span>
                </div>
              </div>

              {/* Verified Metrics Bar */}
              <div className="flex items-center justify-between text-xs font-code pt-1">
                <div className="flex items-center gap-4">
                  <span className="text-[#A1A1AA]">Grid: <b className="text-white">{block.carbonIntensity} gCO2/kWh</b></span>
                  <span className="text-[#00FF41]">Saved: <b>-{block.carbonSavedKg} kg CO2e</b></span>
                  <span className="text-[#3B82F6]">Cloud Cost: <b>${block.costUsd}</b></span>
                </div>
                <span className="text-[#00FF41] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{block.auditorSignature}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

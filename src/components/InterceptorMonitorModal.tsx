import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  RefreshCw,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  X,
  Server,
  Play,
  RotateCcw,
  Clock,
  Radio,
  Layers
} from 'lucide-react';
import { InterceptorLogEntry, InterceptorMetrics } from '../services/deploymentInterceptor';

interface InterceptorMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InterceptorMonitorModal: React.FC<InterceptorMonitorModalProps> = ({
  isOpen,
  onClose
}) => {
  const [metrics, setMetrics] = useState<InterceptorMetrics>({
    totalIntercepted: 0,
    successfulRecoveries: 0,
    failedRetries: 0,
    circuitBreakerState: 'CLOSED',
    sqsConnectionStatus: 'HEALTHY',
    averageBackoffDelayMs: 400
  });

  const [logs, setLogs] = useState<InterceptorLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/deployment/interceptor-status');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.warn('Failed to fetch interceptor status:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      const interval = setInterval(fetchStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSimulate = async (failureType: string, serviceName: string) => {
    setSimulating(true);
    setSimResult(null);

    try {
      const res = await fetch('/api/deployment/simulate-failure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ failureType, serviceName })
      });

      const data = await res.json();
      setMetrics(data.metrics);
      setLogs(data.logs || []);

      if (data.success) {
        setSimResult(`✅ Interceptor caught ${failureType} and successfully recovered using Exponential Backoff!`);
      } else {
        setSimResult(`❌ Interceptor exhausted retries or Circuit Breaker opened: ${data.interceptResult?.error || 'Failed'}`);
      }
    } catch (err: any) {
      setSimResult(`Error running simulation: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  const handleResetCircuit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/deployment/reset-circuit', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setLogs(data.logs || []);
        setSimResult('🔄 Circuit Breaker reset to CLOSED. SQS Queue connection restored to HEALTHY.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBg = () => {
    if (metrics.circuitBreakerState === 'OPEN') return 'bg-red-500/10 border-red-500/30 text-red-400';
    if (metrics.sqsConnectionStatus === 'RETRYING') return 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse';
    return 'bg-[#00FF41]/10 border-[#00FF41]/30 text-[#00FF41]';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#2A2A2A] flex items-center justify-between bg-[#1A1A1A]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#00FF41]/10 rounded-xl border border-[#00FF41]/30 text-[#00FF41]">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-display font-bold text-white">
                  Deployment Error Interceptor & SQS Resiliency Engine
                </h2>
                <span className="text-[10px] font-code bg-[#00FF41]/20 text-[#00FF41] px-2 py-0.5 rounded-md font-semibold">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA] mt-0.5 font-code">
                Catches API timeouts & SQS queue connection drops with exponential backoff retries & circuit breaking.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#A1A1AA] hover:text-white rounded-lg hover:bg-[#2A2A2A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow font-body text-xs">
          {/* Top Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* SQS Connection Health */}
            <div className={`p-4 rounded-xl border ${getStatusBg()} flex flex-col justify-between`}>
              <div className="flex items-center justify-between text-[11px] font-code uppercase">
                <span>SQS Queue Link</span>
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div className="mt-2 text-base font-bold font-display">
                {metrics.sqsConnectionStatus}
              </div>
              <div className="text-[10px] font-code opacity-80 mt-1">
                Auto-reconnect & Retry Active
              </div>
            </div>

            {/* Circuit Breaker State */}
            <div className="p-4 rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] text-white flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] font-code text-[#A1A1AA] uppercase">
                <span>Circuit Breaker</span>
                <Zap className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <div className="mt-2 text-base font-bold font-display flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    metrics.circuitBreakerState === 'CLOSED'
                      ? 'bg-[#00FF41]'
                      : metrics.circuitBreakerState === 'OPEN'
                      ? 'bg-red-500'
                      : 'bg-amber-400'
                  }`}
                />
                {metrics.circuitBreakerState}
              </div>
              <div className="text-[10px] font-code text-[#A1A1AA] mt-1">
                {metrics.circuitBreakerState === 'OPEN' ? 'Paused (15s Cooloff)' : 'Normal Flow Protected'}
              </div>
            </div>

            {/* Total Intercepts */}
            <div className="p-4 rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] text-white flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] font-code text-[#A1A1AA] uppercase">
                <span>Errors Caught</span>
                <Activity className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="mt-2 text-base font-bold font-display text-cyan-400">
                {metrics.totalIntercepted}
              </div>
              <div className="text-[10px] font-code text-[#A1A1AA] mt-1">
                Timeouts & SQS drops
              </div>
            </div>

            {/* Recoveries */}
            <div className="p-4 rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] text-white flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] font-code text-[#A1A1AA] uppercase">
                <span>Recovered Jobs</span>
                <CheckCircle2 className="w-4 h-4 text-[#00FF41]" />
              </div>
              <div className="mt-2 text-base font-bold font-display text-[#00FF41]">
                {metrics.successfulRecoveries}
              </div>
              <div className="text-[10px] font-code text-[#A1A1AA] mt-1">
                Exponential Backoff Success
              </div>
            </div>
          </div>

          {/* Test Interceptor Controls */}
          <div className="p-4 bg-[#18181B] border border-[#2A2A2A] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-[#00FF41]" />
                Live Failure Simulation & Interceptor Tester
              </h3>
              {metrics.circuitBreakerState === 'OPEN' && (
                <button
                  onClick={handleResetCircuit}
                  disabled={loading}
                  className="px-3 py-1 bg-[#2A2A2A] hover:bg-[#333] text-white text-xs font-code rounded-lg flex items-center gap-1.5 border border-red-500/40 text-red-400"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Circuit Breaker
                </button>
              )}
            </div>
            <p className="text-[#A1A1AA] text-xs font-code">
              Simulate real-world deployment glitches (API timeouts, SQS queue connection resets) to verify the interceptor automatically recovers via exponential backoff.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <button
                onClick={() => handleSimulate('SQS_CONNECTION_ERROR', 'sqs.us-east-1.amazonaws.com')}
                disabled={simulating}
                className="px-3 py-2 bg-[#27272A] hover:bg-[#323238] border border-[#3F3F46] rounded-xl text-left text-xs font-code transition-all flex flex-col gap-1 text-white disabled:opacity-50"
              >
                <div className="font-bold flex items-center gap-1.5 text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  SQS Connection Reset
                </div>
                <span className="text-[10px] text-[#A1A1AA]">Simulates SQS ECONNRESET ➔ Retry backoff</span>
              </button>

              <button
                onClick={() => handleSimulate('TIMEOUT', 'api.electricitymaps.com')}
                disabled={simulating}
                className="px-3 py-2 bg-[#27272A] hover:bg-[#323238] border border-[#3F3F46] rounded-xl text-left text-xs font-code transition-all flex flex-col gap-1 text-white disabled:opacity-50"
              >
                <div className="font-bold flex items-center gap-1.5 text-cyan-400">
                  <Clock className="w-3.5 h-3.5" />
                  5000ms API Timeout
                </div>
                <span className="text-[10px] text-[#A1A1AA]">Simulates ETIMEDOUT ➔ 2x delay retry</span>
              </button>

              <button
                onClick={() => handleSimulate('504_GATEWAY', 'github-actions-runner')}
                disabled={simulating}
                className="px-3 py-2 bg-[#27272A] hover:bg-[#323238] border border-[#3F3F46] rounded-xl text-left text-xs font-code transition-all flex flex-col gap-1 text-white disabled:opacity-50"
              >
                <div className="font-bold flex items-center gap-1.5 text-purple-400">
                  <Layers className="w-3.5 h-3.5" />
                  504 Gateway Timeout
                </div>
                <span className="text-[10px] text-[#A1A1AA]">Pipeline node timeout ➔ Intercept</span>
              </button>
            </div>

            {simResult && (
              <div className="p-3 bg-[#111113] border border-[#2A2A2A] rounded-xl font-code text-xs text-[#E0E0E0]">
                {simResult}
              </div>
            )}
          </div>

          {/* Interceptor Logs Console */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                Live Interceptor Event Stream & Backoff Log
              </h3>
              <span className="text-[10px] text-[#A1A1AA] font-code">
                Showing last {logs.length} entries
              </span>
            </div>

            <div className="bg-[#0A0A0C] border border-[#2A2A2A] rounded-xl p-4 font-code text-xs space-y-2 max-h-[260px] overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-[#52525B] italic py-6 text-center">
                  No interceptor errors recorded yet. Deployments operating smoothly.
                </div>
              ) : (
                logs.map((log) => {
                  const isSuccess = log.type === 'SUCCESS_RECOVERY';
                  const isExceeded = log.type === 'MAX_RETRIES_EXCEEDED';
                  const isSqs = log.type === 'SQS_CONNECTION_ERROR';

                  return (
                    <div
                      key={log.id}
                      className={`p-2.5 rounded-lg border text-[11px] leading-relaxed flex flex-col gap-1 ${
                        isSuccess
                          ? 'bg-[#00FF41]/5 border-[#00FF41]/20 text-[#00FF41]'
                          : isExceeded
                          ? 'bg-red-500/10 border-red-500/30 text-red-300'
                          : isSqs
                          ? 'bg-amber-500/5 border-amber-500/20 text-amber-300'
                          : 'bg-[#18181C] border-[#2A2A2A] text-cyan-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-[#A1A1AA]">
                        <span className="font-bold">{log.targetService}</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="font-semibold">{log.message}</div>
                      {log.delayMs > 0 && (
                        <div className="text-[10px] opacity-80 flex items-center gap-1.5">
                          <span>⏳ Next retry delay: {log.delayMs}ms</span>
                          <span>•</span>
                          <span>Attempt {log.attempt}/{log.maxAttempts}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#2A2A2A] bg-[#1A1A1A] flex items-center justify-between">
          <div className="text-xs font-code text-[#A1A1AA] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00FF41]" />
            Exponential Backoff Algorithm: <code className="text-white bg-[#2A2A2A] px-1.5 py-0.5 rounded">Delay = Base (400ms) × 2^(Attempt) + Jitter</code>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2A2A2A] hover:bg-[#333] text-white font-code text-xs rounded-xl transition-all"
          >
            Close Monitor
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  X,
  Rocket,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  Clock,
  ArrowRight,
  ShieldCheck,
  Server,
  GitBranch,
  Globe,
  FileText
} from 'lucide-react';
import { DeploymentCompletedData } from '../types';
import { fetchWithInterceptor } from '../services/resilientApiClient';

interface NewDeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultThreshold: number;
  initialRegion?: string;
  onEnqueue: (item: {
    repo: string;
    branch: string;
    commitSha: string;
    awsRegion: string;
    carbonIntensity: number;
    commitAuthor: string;
  }) => void;
  onDeploymentComplete: (data: DeploymentCompletedData) => void;
}

export const NewDeploymentModal: React.FC<NewDeploymentModalProps> = ({
  isOpen,
  onClose,
  defaultThreshold,
  initialRegion,
  onEnqueue,
  onDeploymentComplete
}) => {
  // Step state: 'FORM' | 'CHECKING' | 'RESULT'
  const [step, setStep] = useState<'FORM' | 'CHECKING' | 'RESULT'>('FORM');

  // Form Fields
  const [repo, setRepo] = useState('payment-api-gateway');
  const [branch, setBranch] = useState('main');
  const [commitSha, setCommitSha] = useState('f2a9c1e');
  const [environment, setEnvironment] = useState('Production');
  const [awsRegion, setAwsRegion] = useState(initialRegion || 'us-east-1');
  const [deployType, setDeployType] = useState('AWS Lambda');
  const [thresholdOverride, setThresholdOverride] = useState<number>(defaultThreshold);

  React.useEffect(() => {
    if (isOpen && initialRegion) {
      setAwsRegion(initialRegion);
    }
  }, [isOpen, initialRegion]);

  // Carbon Check Results
  const [carbonCheckResult, setCarbonCheckResult] = useState<{
    intensity: number;
    renewablePct: number;
    gridScore: number;
    timestamp: string;
    isGreen: boolean;
    estCleanerWindow: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleStartCheck = async () => {
    setStep('CHECKING');

    try {
      // Query backend for real carbon intensity of selected AWS region
      const res = await fetch(`/api/carbon-intensity?zone=${awsRegion.toUpperCase()}`);
      let intensity = 214;
      if (res.ok) {
        const data = await res.json();
        intensity = data.carbonIntensity || 214;
      } else {
        // Fallback realistic region values
        const regMap: Record<string, number> = {
          'us-east-1': 210,
          'us-west-2': 120,
          'eu-west-1': 220,
          'eu-central-1': 410,
          'ap-southeast-1': 650,
          'ap-south-1': 690
        };
        intensity = regMap[awsRegion] || 250;
      }

      // Renewable estimate
      const renewablePct = Math.max(10, Math.min(95, Math.round((1 - intensity / 700) * 100)));
      const gridScore = Math.max(5, Math.min(100, Math.round((1 - intensity / 700) * 100)));
      const isGreen = intensity <= thresholdOverride;

      setTimeout(() => {
        setCarbonCheckResult({
          intensity,
          renewablePct,
          gridScore,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isGreen,
          estCleanerWindow: isGreen ? 'Now' : '~ 14 mins (Solar/Wind Peak)'
        });
        setStep('RESULT');
      }, 1200);
    } catch (e) {
      setTimeout(() => {
        setCarbonCheckResult({
          intensity: 220,
          renewablePct: 75,
          gridScore: 82,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isGreen: 220 <= thresholdOverride,
          estCleanerWindow: 'Now'
        });
        setStep('RESULT');
      }, 1000);
    }
  };

  const handleDeployNow = async () => {
    if (!carbonCheckResult) return;

    try {
      await fetchWithInterceptor('/api/queue/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `direct-${Date.now()}`,
          repo,
          branch,
          commitSha,
          awsRegion,
          carbonIntensity: carbonCheckResult.intensity
        }),
        maxRetries: 2,
        baseDelayMs: 300
      });
    } catch (e) {
      console.warn(e);
    }

    const completedData: DeploymentCompletedData = {
      repo,
      branch,
      commitSha,
      awsRegion,
      carbonIntensity: carbonCheckResult.intensity,
      renewablePct: carbonCheckResult.renewablePct,
      savedCarbonKg: Number((((thresholdOverride - carbonCheckResult.intensity) * 0.05) || 3.8).toFixed(1)),
      durationSeconds: 14,
      cloudWatchLogGroup: `/aws/lambda/carbon-deploy-${repo}`,
      s3ReportUrl: `s3://carbon-aware-sustainability-reports/deploy-${Date.now()}.json`,
      timestamp: new Date().toISOString()
    };

    onDeploymentComplete(completedData);
    onClose();
    resetModal();
  };

  const handleQueueNow = () => {
    if (!carbonCheckResult) return;

    onEnqueue({
      repo,
      branch,
      commitSha,
      awsRegion,
      carbonIntensity: carbonCheckResult.intensity,
      commitAuthor: 'Sarah Chen'
    });

    onClose();
    resetModal();
  };

  const resetModal = () => {
    setStep('FORM');
    setCarbonCheckResult(null);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] max-w-2xl w-full p-6 shadow-2xl text-[#E0E0E0] relative overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-[#2A2A2A]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00FF41]/10 text-[#00FF41] rounded-xl border border-[#00FF41]/30">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg text-white">
                Start Carbon-Aware Deployment
              </h3>
              <p className="font-body text-xs text-[#A1A1AA]">
                Step 3 & 4: Configure pipeline parameters and verify grid emission score.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              resetModal();
            }}
            className="text-[#71717A] hover:text-white p-1 rounded-full hover:bg-[#1A1A1A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: FORM */}
        {step === 'FORM' && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Repository */}
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                  GitHub Repository
                </label>
                <select
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white text-xs rounded-xl p-2.5 focus:border-[#00FF41] outline-none"
                >
                  <option value="payment-api-gateway">payment-api-gateway</option>
                  <option value="user-auth-service">user-auth-service</option>
                  <option value="data-pipeline-ingest">data-pipeline-ingest</option>
                  <option value="frontend-dashboard-kit">frontend-dashboard-kit</option>
                  <option value="order-processing-engine">order-processing-engine</option>
                </select>
              </div>

              {/* Branch */}
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                  Branch
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white text-xs rounded-xl p-2.5 focus:border-[#00FF41] outline-none font-code"
                />
              </div>

              {/* Commit SHA */}
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                  Commit SHA
                </label>
                <input
                  type="text"
                  value={commitSha}
                  onChange={(e) => setCommitSha(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white text-xs rounded-xl p-2.5 focus:border-[#00FF41] outline-none font-code"
                />
              </div>

              {/* Deployment Environment */}
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                  Deployment Environment
                </label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white text-xs rounded-xl p-2.5 focus:border-[#00FF41] outline-none"
                >
                  <option value="Production">Production</option>
                  <option value="Staging">Staging</option>
                  <option value="QA / Testing">QA / Testing</option>
                  <option value="Sandbox">Sandbox</option>
                </select>
              </div>

              {/* AWS Region */}
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                  Target AWS Region
                </label>
                <select
                  value={awsRegion}
                  onChange={(e) => setAwsRegion(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white text-xs rounded-xl p-2.5 focus:border-[#00FF41] outline-none font-code"
                >
                  <option value="us-east-1">us-east-1 (N. Virginia)</option>
                  <option value="us-west-2">us-west-2 (Oregon)</option>
                  <option value="eu-west-1">eu-west-1 (Ireland)</option>
                  <option value="eu-central-1">eu-central-1 (Frankfurt)</option>
                  <option value="ap-southeast-1">ap-southeast-1 (Singapore)</option>
                  <option value="ap-south-1">ap-south-1 (Mumbai)</option>
                  <option value="sa-east-1">sa-east-1 (São Paulo)</option>
                  <option value="ca-central-1">ca-central-1 (Canada Central)</option>
                </select>
              </div>

              {/* Deployment Type */}
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                  AWS Deployment Type
                </label>
                <select
                  value={deployType}
                  onChange={(e) => setDeployType(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white text-xs rounded-xl p-2.5 focus:border-[#00FF41] outline-none"
                >
                  <option value="AWS Lambda">AWS Lambda Serverless</option>
                  <option value="ECS Task">AWS ECS Fargate Task</option>
                  <option value="EKS Cluster">AWS EKS Microservice</option>
                  <option value="S3 Static Website">Amazon S3 + CloudFront</option>
                </select>
              </div>
            </div>

            {/* Threshold Override */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                Carbon Threshold Override (gCO2eq/kWh)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={thresholdOverride}
                  onChange={(e) => setThresholdOverride(Number(e.target.value))}
                  className="w-32 bg-[#1A1A1A] border border-[#2A2A2A] text-white text-xs rounded-xl p-2.5 focus:border-[#00FF41] outline-none font-code"
                />
                <span className="text-xs text-[#71717A]">
                  Default global setting: {defaultThreshold} gCO2eq/kWh
                </span>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-[#2A2A2A] mt-6">
              <button
                onClick={() => {
                  onClose();
                  resetModal();
                }}
                className="px-4 py-2.5 border border-[#2A2A2A] text-[#A1A1AA] hover:text-white rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleStartCheck}
                className="px-6 py-2.5 bg-[#00FF41] text-black font-bold text-xs rounded-xl hover:bg-[#00e038] flex items-center gap-2 shadow-xs"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Check Carbon Before Deploy</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CHECKING LOADING SCREEN */}
        {step === 'CHECKING' && (
          <div className="py-12 text-center space-y-4">
            <RefreshCw className="w-10 h-10 text-[#00FF41] animate-spin mx-auto" />
            <h4 className="font-headline text-lg font-bold text-white">
              Querying Electricity Maps API...
            </h4>
            <p className="font-code text-xs text-[#00FF41]">
              Fetching live grid emission score for <b className="text-white">{awsRegion}</b>
            </p>
            <div className="w-64 bg-[#2A2A2A] h-2 rounded-full mx-auto overflow-hidden mt-4">
              <div className="bg-[#00FF41] h-full animate-pulse w-3/4"></div>
            </div>
          </div>
        )}

        {/* STEP 3: RESULT SCREEN (Green / High Carbon) */}
        {step === 'RESULT' && carbonCheckResult && (
          <div className="mt-6 space-y-6 animate-fade-in">
            {carbonCheckResult.isGreen ? (
              // DECISION 1: GREEN DEPLOYMENT AVAILABLE
              <div className="bg-[#00FF41]/10 border border-[#00FF41]/40 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-[#00FF41]">
                  <CheckCircle2 className="w-6 h-6" />
                  <h4 className="font-headline text-lg font-bold">
                    ✅ Green Deployment Available
                  </h4>
                </div>
                <p className="text-xs text-[#E0E0E0] leading-relaxed">
                  Grid intensity in <b className="text-white">{awsRegion}</b> is currently{' '}
                  <b className="text-[#00FF41]">{carbonCheckResult.intensity} gCO2eq/kWh</b>, which is below your target threshold of{' '}
                  <b className="text-white">{thresholdOverride} gCO2eq/kWh</b>.
                </p>
              </div>
            ) : (
              // DECISION 2: HIGH CARBON DETECTED
              <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/40 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-[#F59E0B]">
                  <AlertTriangle className="w-6 h-6" />
                  <h4 className="font-headline text-lg font-bold">
                    ⚠ High Carbon Detected
                  </h4>
                </div>
                <p className="text-xs text-[#E0E0E0] leading-relaxed">
                  Current intensity in <b className="text-white">{awsRegion}</b> is{' '}
                  <b className="text-[#F59E0B]">{carbonCheckResult.intensity} gCO2eq/kWh</b>, exceeding your threshold of{' '}
                  <b className="text-white">{thresholdOverride} gCO2eq/kWh</b>. We recommend queuing this deployment to wait for cleaner wind/solar power.
                </p>
              </div>
            )}

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
                <span className="font-code text-[10px] text-[#A1A1AA] uppercase block">
                  Carbon Score
                </span>
                <span
                  className={`font-headline text-lg font-bold ${
                    carbonCheckResult.isGreen ? 'text-[#00FF41]' : 'text-[#F59E0B]'
                  }`}
                >
                  {carbonCheckResult.intensity} gCO2
                </span>
              </div>

              <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
                <span className="font-code text-[10px] text-[#A1A1AA] uppercase block">
                  Renewable %
                </span>
                <span className="font-headline text-lg font-bold text-[#00FF41]">
                  {carbonCheckResult.renewablePct}% Clean
                </span>
              </div>

              <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
                <span className="font-code text-[10px] text-[#A1A1AA] uppercase block">
                  AWS Region
                </span>
                <span className="font-code text-sm font-bold text-white">
                  {awsRegion}
                </span>
              </div>

              <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
                <span className="font-code text-[10px] text-[#A1A1AA] uppercase block">
                  Cleaner Window
                </span>
                <span className="font-code text-xs font-bold text-[#3B82F6]">
                  {carbonCheckResult.estCleanerWindow}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex justify-between items-center border-t border-[#2A2A2A]">
              <button
                onClick={() => setStep('FORM')}
                className="text-xs text-[#A1A1AA] hover:text-white underline font-code"
              >
                ← Back to Edit Parameters
              </button>

              <div className="flex gap-3">
                {!carbonCheckResult.isGreen ? (
                  <>
                    <button
                      onClick={handleDeployNow}
                      className="px-4 py-2.5 border border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B]/10 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Force Deploy Now
                    </button>
                    <button
                      onClick={handleQueueNow}
                      className="px-6 py-2.5 bg-[#00FF41] text-black font-bold text-xs rounded-xl hover:bg-[#00e038] flex items-center gap-2 shadow-xs"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Queue in Amazon SQS</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleDeployNow}
                    className="px-6 py-2.5 bg-[#00FF41] text-black font-bold text-xs rounded-xl hover:bg-[#00e038] flex items-center gap-2 shadow-xs"
                  >
                    <Rocket className="w-4 h-4" />
                    <span>Deploy Now via GitHub Actions</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

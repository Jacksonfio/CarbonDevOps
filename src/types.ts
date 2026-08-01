export interface AWSZoneData {
  zoneKey: string;
  regionName: string;
  awsRegion: string;
  carbonIntensity: number; // gCO2eq/kWh
  renewablePct: number;
  status: 'OPTIMAL' | 'MODERATE' | 'HIGH';
  trend: 'up' | 'down' | 'flat';
  forecast24h: number[];
  lat: number;
  lng: number;
  gridScore: number;
  costPerThousandInvocations?: number; // USD
}

export interface QueuedPipeline {
  id: string;
  repo: string;
  branch: string;
  commitSha: string;
  awsRegion: string;
  carbonIntensity: number;
  threshold: number;
  queueTime: string;
  estWait: string;
  status: 'QUEUED' | 'RUNNING' | 'DEPLOYED' | 'HELD' | 'CANCELLED';
  decision: 'PROCEED' | 'QUEUE' | 'OVERRIDE' | 'SPECULATIVE_PREPAID' | 'SLA_AUTO_ESCALATED';
  commitAuthor: string;
  workflowId: string;
  savedCarbonKg?: number;
  createdAt: string;
  criticalityTier?: 'P1_HOTFIX' | 'P2_FEATURE' | 'P3_BATCH';
  maxDeferralMinutes?: number;
  elapsedQueueMinutes?: number;
  speculativePrebuilt?: boolean;
}

export interface DeploymentActivity {
  id: string;
  repo: string;
  branch: string;
  commitSha: string;
  gridScore: number;
  decision: 'PROCEED' | 'QUEUE' | 'OVERRIDE' | 'SPECULATIVE_PREPAID' | 'SLA_AUTO_ESCALATED';
  carbonImpact: string;
  status: 'Running' | 'Scheduled' | 'Completed' | 'Failed';
  timestamp: string;
  awsRegion: string;
  carbonValue: number;
  savedKg: number;
  pipelineStepBreakdown?: PipelineStepCarbon[];
}

export interface SustainabilityReport {
  id: string;
  repository: string;
  region: string;
  carbonIntensity: number;
  threshold: number;
  decision: string;
  savedCarbon: string;
  timestamp: string;
  treesEquivalent: number;
  workflowId: string;
  commitSha: string;
}

export interface SystemSettings {
  threshold: number; // gCO2eq/kWh
  electricityApiKey: string;
  awsRegion: string;
  autoDeployEnabled: boolean;
  checkIntervalMinutes: number;
  sqsQueueUrl: string;
  s3BucketName: string;
  useLiveElectricityMapsApi?: boolean;
  apiDataStatus?: 'LIVE_CONNECTED' | 'SYNTHETIC_FALLBACK' | 'RATE_LIMITED';
  speculativeBuildsEnabled?: boolean;
  paretoCostMaxUsd?: number;
  paretoCarbonMaxGco2?: number;
}

// Pillar 1: Speculative Pre-Build & Hold
export interface SpeculativeCacheItem {
  id: string;
  repo: string;
  branch: string;
  commitSha: string;
  predictedDeployProbability: number; // % (e.g., 94%)
  cleanWindowPrebuiltAt: string;
  prepaidRegion: string;
  prepaidGridScore: number;
  prepaidCarbonValue: number; // gCO2eq/kWh paid during green window
  artifactImageDigest: string; // sha256:...
  cacheStatus: 'PREBUILT_READY' | 'DISPATCHED_INSTANT' | 'EXPIRED';
  latencySavedSeconds: number; // e.g. 180s down to 0.2s
}

// Pillar 2: Pareto Multi-objective Optimization
export interface ParetoRegionPoint {
  region: string;
  name: string;
  carbonIntensity: number; // gCO2/kWh
  costPerThousandInvocations: number; // $
  renewablePct: number;
  latencyMs: number;
  isParetoOptimal: boolean;
  recommendationScore: number;
}

// Pillar 3: Per-step Pipeline Carbon Profiling
export interface PipelineStepCarbon {
  stepName: string;
  durationSeconds: number;
  cpuCoresUsed: number;
  runnerRegion: string;
  runnerGridIntensity: number; // gCO2/kWh
  calculatedCarbonGrams: number;
  pctOfTotalPipeline: number;
  category: 'CHECKOUT' | 'TEST_SUITE' | 'DOCKER_BUILD' | 'DEPLOYMENT' | 'SECURITY_SCAN';
}

// Pillar 4: SLA-Tiered Auto-escalation Policy
export interface SlaPolicyRule {
  tier: 'P1_HOTFIX' | 'P2_FEATURE' | 'P3_BATCH';
  label: string;
  description: string;
  maxDeferralMinutes: number;
  escalationAction: 'FORCE_DISPATCH_LOG' | 'ALERT_DEV_REROUTE' | 'HOLD_FOR_NEXT_WINDOW';
  allowedGridDeviationPct: number;
}

// Pillar 6: ESG & CSRD Compliance Audit Engine
export interface ComplianceAuditBlock {
  blockIndex: number;
  timestamp: string;
  deploymentId: string;
  repo: string;
  decision: string;
  carbonIntensity: number;
  carbonSavedKg: number;
  costUsd: number;
  csrdScope3Category: string; // e.g., 'Scope 3 Category 11: Use of Sold Products / Cloud Services'
  previousHash: string;
  currentHash: string;
  auditorSignature: string;
}

export interface CodeDeliverables {
  githubWorkflow: string;
  lambdaChecker: string;
  lambdaSqsProcessor: string;
  electricityMapsService: string;
  awsSqsService: string;
  awsS3Service: string;
  configSettings: string;
  readmeDoc: string;
  sampleReportJson: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'DEPLOYED' | 'QUEUED' | 'OPTIMAL' | 'FAILURE' | 'RESUMED' | 'SLA_ESCALATED' | 'SPECULATIVE_HIT';
  timestamp: string;
  read: boolean;
  channel: 'Dashboard' | 'Email' | 'Slack' | 'MS Teams';
}

export interface DeploymentCompletedData {
  repo: string;
  branch: string;
  commitSha: string;
  awsRegion: string;
  carbonIntensity: number;
  renewablePct: number;
  savedCarbonKg: number;
  durationSeconds: number;
  cloudWatchLogGroup: string;
  s3ReportUrl: string;
  timestamp: string;
  speculativePrebuiltUsed?: boolean;
}


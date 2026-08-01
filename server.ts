import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { CODE_DELIVERABLES } from './src/data/deliverables';
import { globalDeploymentInterceptor } from './src/services/deploymentInterceptor';

dotenv.config();

const getFilename = () => {
  if (typeof __filename !== 'undefined') return __filename;
  if (typeof import.meta !== 'undefined' && import.meta.url) return fileURLToPath(import.meta.url);
  return '';
};
const currentFilename = getFilename();
const currentDirname = currentFilename ? path.dirname(currentFilename) : process.cwd();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory state for SQS queue & deployment logs
let sqsQueue = [
  {
    id: 'sqs-msg-101',
    repo: 'payment-api-gateway',
    branch: 'main',
    commitSha: 'f2a9c1e',
    awsRegion: 'us-east-1',
    carbonIntensity: 214,
    threshold: 250,
    queueTime: '12:04 PM',
    estWait: '~ 2m 40s',
    status: 'QUEUED',
    decision: 'PROCEED',
    commitAuthor: 'Sarah Chen',
    workflowId: 'wf-98124',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sqs-msg-102',
    repo: 'user-auth-service',
    branch: 'release-v1.2',
    commitSha: '8db34a2',
    awsRegion: 'eu-central-1',
    carbonIntensity: 420,
    threshold: 250,
    queueTime: '11:58 AM',
    estWait: '~ 14m 10s',
    status: 'HELD',
    decision: 'QUEUE',
    commitAuthor: 'Alex Rivera',
    workflowId: 'wf-98125',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sqs-msg-103',
    repo: 'data-pipeline-ingest',
    branch: 'hotfix/batch-fix',
    commitSha: 'a0e3341',
    awsRegion: 'ap-southeast-1',
    carbonIntensity: 612,
    threshold: 250,
    queueTime: '11:45 AM',
    estWait: 'Hold (Low Carbon Pending)',
    status: 'HELD',
    decision: 'QUEUE',
    commitAuthor: 'David Kim',
    workflowId: 'wf-98126',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sqs-msg-104',
    repo: 'frontend-dashboard-kit',
    branch: 'feat/new-bento',
    commitSha: 'c39482b',
    awsRegion: 'us-west-2',
    carbonIntensity: 198,
    threshold: 250,
    queueTime: '12:12 PM',
    estWait: '~ 1m 20s',
    status: 'QUEUED',
    decision: 'PROCEED',
    commitAuthor: 'Elena Rostova',
    workflowId: 'wf-98127',
    createdAt: new Date().toISOString()
  }
];

let deploymentHistory = [
  {
    id: 'act-1',
    repo: 'core-api-service',
    branch: 'main',
    commitSha: 'sha-82f1b',
    gridScore: 88,
    decision: 'PROCEED',
    carbonImpact: '-4.2kg CO2',
    status: 'Running',
    timestamp: '2 mins ago',
    awsRegion: 'us-east-1',
    carbonValue: 182,
    savedKg: 4.2
  },
  {
    id: 'act-2',
    repo: 'analytics-worker',
    branch: 'feature/batch-v2',
    commitSha: 'sha-19c2e',
    gridScore: 12,
    decision: 'QUEUE',
    carbonImpact: '+18.5kg (if proc)',
    status: 'Scheduled',
    timestamp: '12 mins ago',
    awsRegion: 'ap-southeast-1',
    carbonValue: 612,
    savedKg: 18.5
  },
  {
    id: 'act-3',
    repo: 'user-frontend-app',
    branch: 'hotfix/auth',
    commitSha: 'sha-22b56',
    gridScore: 45,
    decision: 'OVERRIDE',
    carbonImpact: '+2.1kg CO2',
    status: 'Completed',
    timestamp: '28 mins ago',
    awsRegion: 'eu-central-1',
    carbonValue: 310,
    savedKg: 0
  }
];

let systemThreshold = 250; // gCO2eq/kWh

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get Live Carbon Intensity for Region or Zone
app.get('/api/carbon-intensity', async (req, res) => {
  const zone = (req.query.zone as string) || 'US-CAL-CISO';
  const apiKey = process.env.ELECTRICITY_API_KEY;

  if (apiKey && apiKey !== 'MY_ELECTRICITY_MAPS_API_KEY') {
    try {
      const response = await fetch(`https://api.electricitymaps.com/v3/carbon-intensity/latest?zone=${zone}`, {
        headers: { 'auth-token': apiKey }
      });
      if (response.ok) {
        const data = await response.json();
        return res.json({ zone, carbonIntensity: data.carbonIntensity, isRealApi: true });
      }
    } catch (err) {
      console.warn('Electricity Maps API call failed, using fallback realistic data', err);
    }
  }

  // Fallback realistic grid intensity mapping
  const mockIntensities: Record<string, number> = {
    'US-CAL-CISO': 214,
    'US-NW-PACW': 140,
    'US-EAST-1': 245,
    'DE': 412,
    'IE': 230,
    'SG': 680,
    'IN-WE': 710
  };

  const base = mockIntensities[zone.toUpperCase()] || 250;
  // Add small random noise to simulate live updates
  const fluctuation = Math.floor(Math.random() * 10) - 5;
  const carbonIntensity = Math.max(50, base + fluctuation);

  res.json({
    zone,
    carbonIntensity,
    isRealApi: false,
    timestamp: new Date().toISOString()
  });
});

// Fetch Real-time Carbon Intensity for ALL AWS Cloud Regions
app.get('/api/carbon/all-regions', async (req, res) => {
  const apiKey = process.env.ELECTRICITY_API_KEY || process.env.ELECTRICITY_MAPS_API_KEY;

  const allAwsRegions = [
    { awsRegion: 'us-east-1', regionName: 'US East (N. Virginia)', zoneKey: 'US-VA-PJM', baseIntensity: 214, baseRenewable: 82, lat: 38.9, lng: -77.0 },
    { awsRegion: 'us-east-2', regionName: 'US East (Ohio)', zoneKey: 'US-OH-PJM', baseIntensity: 310, baseRenewable: 62, lat: 40.0, lng: -83.0 },
    { awsRegion: 'us-west-1', regionName: 'US West (N. California)', zoneKey: 'US-CA-CISO', baseIntensity: 185, baseRenewable: 88, lat: 37.7, lng: -122.4 },
    { awsRegion: 'us-west-2', regionName: 'US West (Oregon)', zoneKey: 'US-OR-BPA', baseIntensity: 110, baseRenewable: 94, lat: 45.5, lng: -122.6 },
    { awsRegion: 'ca-central-1', regionName: 'Canada (Central)', zoneKey: 'CA-QC', baseIntensity: 45, baseRenewable: 98, lat: 45.5, lng: -73.5 },
    { awsRegion: 'eu-west-1', regionName: 'Europe (Ireland)', zoneKey: 'IE', baseIntensity: 240, baseRenewable: 78, lat: 53.3, lng: -6.2 },
    { awsRegion: 'eu-west-2', regionName: 'Europe (London)', zoneKey: 'GB', baseIntensity: 195, baseRenewable: 84, lat: 51.5, lng: -0.1 },
    { awsRegion: 'eu-central-1', regionName: 'Europe (Frankfurt)', zoneKey: 'DE', baseIntensity: 412, baseRenewable: 45, lat: 50.1, lng: 8.6 },
    { awsRegion: 'eu-north-1', regionName: 'Europe (Stockholm)', zoneKey: 'SE-SE3', baseIntensity: 25, baseRenewable: 99, lat: 59.3, lng: 18.0 },
    { awsRegion: 'ap-southeast-1', regionName: 'Asia Pacific (Singapore)', zoneKey: 'SG', baseIntensity: 680, baseRenewable: 12, lat: 1.3, lng: 103.8 },
    { awsRegion: 'ap-southeast-2', regionName: 'Asia Pacific (Sydney)', zoneKey: 'AU-NSW', baseIntensity: 520, baseRenewable: 35, lat: -33.8, lng: 151.2 },
    { awsRegion: 'ap-northeast-1', regionName: 'Asia Pacific (Tokyo)', zoneKey: 'JP-TK', baseIntensity: 480, baseRenewable: 28, lat: 35.6, lng: 139.6 },
    { awsRegion: 'ap-northeast-2', regionName: 'Asia Pacific (Seoul)', zoneKey: 'KR', baseIntensity: 510, baseRenewable: 22, lat: 37.5, lng: 126.9 },
    { awsRegion: 'ap-south-1', regionName: 'Asia Pacific (Mumbai)', zoneKey: 'IN-WE', baseIntensity: 710, baseRenewable: 18, lat: 19.0, lng: 72.8 },
    { awsRegion: 'sa-east-1', regionName: 'South America (São Paulo)', zoneKey: 'BR-SE', baseIntensity: 130, baseRenewable: 91, lat: -23.5, lng: -46.6 },
    { awsRegion: 'me-south-1', regionName: 'Middle East (Bahrain)', zoneKey: 'BH', baseIntensity: 640, baseRenewable: 10, lat: 26.0, lng: 50.5 },
    { awsRegion: 'af-south-1', regionName: 'Africa (Cape Town)', zoneKey: 'ZA', baseIntensity: 790, baseRenewable: 8, lat: -33.9, lng: 18.4 }
  ];

  let isRealApi = false;
  let fetchedResults: Record<string, number> = {};

  if (apiKey && apiKey !== 'YOUR_ELECTRICITY_MAPS_API_KEY' && apiKey !== 'MY_ELECTRICITY_MAPS_API_KEY') {
    try {
      const promises = allAwsRegions.map(reg =>
        fetch(`https://api.electricitymaps.com/v3/carbon-intensity/latest?zone=${reg.zoneKey}`, {
          headers: { 'auth-token': apiKey }
        })
          .then(res => (res.ok ? res.json() : null))
          .then(data => (data && data.carbonIntensity ? { zone: reg.zoneKey, intensity: data.carbonIntensity } : null))
          .catch(() => null)
      );

      const results = await Promise.all(promises);
      results.forEach(item => {
        if (item) {
          fetchedResults[item.zone] = item.intensity;
          isRealApi = true;
        }
      });
    } catch (err) {
      console.warn('Electricity Maps API batch query error:', err);
    }
  }

  const regionsData = allAwsRegions.map(reg => {
    let currentIntensity: number;
    let trend: 'up' | 'down' | 'flat' = 'flat';

    if (isRealApi && fetchedResults[reg.zoneKey] !== undefined) {
      currentIntensity = fetchedResults[reg.zoneKey];
    } else {
      const fluctuation = Math.floor(Math.random() * 12) - 6;
      currentIntensity = Math.max(15, reg.baseIntensity + fluctuation);
      trend = fluctuation < 0 ? 'down' : fluctuation > 0 ? 'up' : 'flat';
    }

    const status = currentIntensity <= 250 ? 'OPTIMAL' : currentIntensity <= 500 ? 'MODERATE' : 'HIGH';
    const gridScore = Math.max(5, Math.min(100, Math.round((1 - currentIntensity / 800) * 100)));

    return {
      zoneKey: reg.zoneKey,
      regionName: reg.regionName,
      awsRegion: reg.awsRegion,
      carbonIntensity: currentIntensity,
      renewablePct: reg.baseRenewable,
      status,
      trend,
      forecast24h: [
        Math.max(10, currentIntensity - 18),
        Math.max(10, currentIntensity - 8),
        currentIntensity,
        currentIntensity + 12,
        Math.max(10, currentIntensity - 22)
      ],
      lat: reg.lat,
      lng: reg.lng,
      gridScore
    };
  });

  res.json({
    timestamp: new Date().toISOString(),
    isRealApi,
    count: regionsData.length,
    regions: regionsData
  });
});


// Deployment Interceptor API Endpoints
app.get('/api/deployment/interceptor-status', (req, res) => {
  res.json({
    metrics: globalDeploymentInterceptor.getMetrics(),
    logs: globalDeploymentInterceptor.getLogs()
  });
});

app.post('/api/deployment/reset-circuit', (req, res) => {
  globalDeploymentInterceptor.resetCircuitBreaker();
  res.json({
    success: true,
    metrics: globalDeploymentInterceptor.getMetrics(),
    logs: globalDeploymentInterceptor.getLogs()
  });
});

// Trigger simulated error & test automatic exponential backoff recovery
app.post('/api/deployment/simulate-failure', async (req, res) => {
  const { failureType, serviceName } = req.body;
  const targetType = failureType || 'SQS_CONNECTION_ERROR';
  const targetService = serviceName || 'us-east-1-sqs-queue';

  const interceptResult = await globalDeploymentInterceptor.executeWithInterceptor(
    async () => {
      // Operation that succeeds on retry
      return { status: 'DISPATCH_ACK_RECEIVED', sqsMessageId: `msg-sim-${Date.now()}` };
    },
    'SQS_QUEUE',
    targetService,
    targetType
  );

  res.json({
    success: !!interceptResult.result,
    interceptResult,
    metrics: globalDeploymentInterceptor.getMetrics(),
    logs: globalDeploymentInterceptor.getLogs()
  });
});

// Queue Endpoints
app.get('/api/queue', (req, res) => {
  res.json({
    queue: sqsQueue,
    threshold: systemThreshold,
    totalQueued: sqsQueue.length,
    interceptorMetrics: globalDeploymentInterceptor.getMetrics()
  });
});

app.post('/api/queue/enqueue', async (req, res) => {
  const { repo, branch, commitSha, awsRegion, carbonIntensity, commitAuthor, forceSimulatedError } = req.body;
  const intensity = Number(carbonIntensity) || 320;
  const threshold = systemThreshold;
  const isBelow = intensity <= threshold;

  const newItem = {
    id: `sqs-msg-${Date.now()}`,
    repo: repo || 'new-microservice',
    branch: branch || 'main',
    commitSha: commitSha || Math.random().toString(36).substring(2, 9),
    awsRegion: awsRegion || 'us-east-1',
    carbonIntensity: intensity,
    threshold,
    queueTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    estWait: isBelow ? '~ 1m 00s' : 'Hold (Low Carbon Pending)',
    status: isBelow ? 'QUEUED' : 'HELD',
    decision: isBelow ? 'PROCEED' : 'QUEUE',
    commitAuthor: commitAuthor || 'Developer',
    workflowId: `wf-${Math.floor(Math.random() * 90000) + 10000}`,
    createdAt: new Date().toISOString()
  };

  // Run SQS Enqueue through Error Interceptor with Exponential Backoff
  const interceptResult = await globalDeploymentInterceptor.executeWithInterceptor(
    async () => {
      sqsQueue.unshift(newItem as any);

      // Add to activity log
      deploymentHistory.unshift({
        id: `act-${Date.now()}`,
        repo: newItem.repo,
        branch: newItem.branch,
        commitSha: `sha-${newItem.commitSha.substring(0, 5)}`,
        gridScore: Math.max(0, Math.min(100, Math.round((1 - intensity / 700) * 100))),
        decision: isBelow ? 'PROCEED' : 'QUEUE',
        carbonImpact: isBelow ? '-3.5kg CO2' : `+${((intensity - threshold) * 0.05).toFixed(1)}kg (held)`,
        status: isBelow ? 'Running' : 'Scheduled',
        timestamp: 'Just now',
        awsRegion: newItem.awsRegion,
        carbonValue: intensity,
        savedKg: isBelow ? 3.5 : 0
      });

      return newItem;
    },
    'SQS_QUEUE',
    `SQS [${newItem.awsRegion}] Queue Dispatcher`,
    forceSimulatedError ? forceSimulatedError : undefined
  );

  if (!interceptResult.result) {
    return res.status(503).json({
      error: interceptResult.error || 'SQS Dispatch failed after exponential retries.',
      interceptResult,
      interceptorLogs: globalDeploymentInterceptor.getLogs()
    });
  }

  res.json({
    success: true,
    item: newItem,
    interceptResult,
    interceptorLogs: globalDeploymentInterceptor.getLogs()
  });
});

app.post('/api/queue/deploy', async (req, res) => {
  const { id, repo, branch, commitSha, awsRegion, carbonIntensity, commitAuthor, forceSimulatedError } = req.body;
  const idx = sqsQueue.findIndex((item) => item.id === id);

  const deployedItem = idx !== -1 ? sqsQueue[idx] : {
    id: id || `sqs-msg-${Date.now()}`,
    repo: repo || 'payment-api-gateway',
    branch: branch || 'main',
    commitSha: commitSha || 'f2a9c1e',
    awsRegion: awsRegion || 'us-east-1',
    carbonIntensity: Number(carbonIntensity) || 210,
    threshold: systemThreshold,
    queueTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    estWait: 'Now',
    status: 'DEPLOYED',
    decision: 'OVERRIDE',
    commitAuthor: commitAuthor || 'Sarah Chen',
    workflowId: `wf-${Math.floor(Math.random() * 90000) + 10000}`,
    createdAt: new Date().toISOString()
  };

  if (idx !== -1) {
    sqsQueue.splice(idx, 1);
  }

  const interceptResult = await globalDeploymentInterceptor.executeWithInterceptor(
    async () => {
      deploymentHistory.unshift({
        id: `act-${Date.now()}`,
        repo: deployedItem.repo,
        branch: deployedItem.branch,
        commitSha: `sha-${deployedItem.commitSha.substring(0, 5)}`,
        gridScore: Math.max(0, Math.min(100, Math.round((1 - deployedItem.carbonIntensity / 700) * 100))),
        decision: 'OVERRIDE',
        carbonImpact: '+1.8kg CO2',
        status: 'Completed',
        timestamp: 'Just now',
        awsRegion: deployedItem.awsRegion,
        carbonValue: deployedItem.carbonIntensity,
        savedKg: 0
      });

      return deployedItem;
    },
    'GITHUB_ACTIONS_WEBHOOK',
    `Deployment Dispatcher (${deployedItem.repo})`,
    forceSimulatedError ? forceSimulatedError : undefined
  );

  if (!interceptResult.result) {
    return res.status(503).json({
      error: interceptResult.error || 'Deployment dispatch failed after retries.',
      interceptResult,
      interceptorLogs: globalDeploymentInterceptor.getLogs()
    });
  }

  return res.json({
    success: true,
    deployedItem,
    interceptResult,
    interceptorLogs: globalDeploymentInterceptor.getLogs()
  });
});

app.delete('/api/queue/:id', (req, res) => {
  const { id } = req.params;
  sqsQueue = sqsQueue.filter((item) => item.id !== id);
  res.json({ success: true });
});

app.post('/api/settings/threshold', (req, res) => {
  const { threshold } = req.body;
  if (typeof threshold === 'number' && threshold >= 50 && threshold <= 700) {
    systemThreshold = threshold;
    // Re-evaluate queue status
    sqsQueue.forEach((item) => {
      item.threshold = systemThreshold;
      if (item.carbonIntensity <= systemThreshold) {
        item.status = 'QUEUED';
        item.decision = 'PROCEED';
        item.estWait = '~ 1m 30s';
      } else {
        item.status = 'HELD';
        item.decision = 'QUEUE';
        item.estWait = 'Hold (Low Carbon Pending)';
      }
    });
    return res.json({ success: true, threshold: systemThreshold });
  }
  res.status(400).json({ error: 'Invalid threshold value (must be 50 - 700 gCO2eq/kWh)' });
});

// Trigger EventBridge simulation
app.post('/api/eventbridge/trigger', (req, res) => {
  // Check queue items and auto-deploy any that drop below threshold
  const released: any[] = [];
  sqsQueue = sqsQueue.filter((item) => {
    if (item.carbonIntensity <= systemThreshold) {
      item.status = 'DEPLOYED';
      released.push(item);
      deploymentHistory.unshift({
        id: `act-${Date.now()}`,
        repo: item.repo,
        branch: item.branch,
        commitSha: `sha-${item.commitSha.substring(0, 5)}`,
        gridScore: Math.max(0, Math.min(100, Math.round((1 - item.carbonIntensity / 700) * 100))),
        decision: 'PROCEED',
        carbonImpact: '-4.8kg CO2',
        status: 'Completed',
        timestamp: 'Just now',
        awsRegion: item.awsRegion,
        carbonValue: item.carbonIntensity,
        savedKg: 4.8
      });
      return false; // remove from queue
    }
    return true;
  });

  res.json({
    triggeredAt: new Date().toISOString(),
    releasedCount: released.length,
    remainingQueued: sqsQueue.length,
    releasedItems: released
  });
});

// AI Optimization Advisory with Gemini
app.post('/api/ai-optimize', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.json({
      recommendation: "Shift high-intensity batch deployments from 'ap-southeast-1' (680 gCO2/kWh) to 'us-east-1' (214 gCO2/kWh) or defer until 03:00 UTC when solar/wind generation peaks.",
      potentialSavingsKg: 18.5,
      optimalRegion: 'us-east-1',
      actionableSteps: [
        'Migrate 3 pending jobs in SQS queue to us-east-1 region',
        'Enable EventBridge 5-minute polling window for automatic emission dip triggers',
        'Set repository threshold to 220 gCO2eq/kWh for non-critical pipelines'
      ]
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a Sustainability Engineer & Cloud DevOps Architect.
Analyze the current CI/CD queue and regional grid carbon intensity data:
Current System Threshold: ${systemThreshold} gCO2eq/kWh
Queued Workloads: ${JSON.stringify(sqsQueue)}

Provide a concise, JSON-formatted sustainability advisory with:
1. "recommendation": high-impact advice on region shifting or time deferral
2. "potentialSavingsKg": estimated CO2 kg savings (number)
3. "optimalRegion": recommended target AWS region
4. "actionableSteps": list of 3 short, concrete bullet points for DevOps engineers.

Return ONLY valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    const text = response.text || '';
    const cleanJsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJsonStr);
    res.json(parsed);
  } catch (err: any) {
    console.error('Gemini API optimization error:', err);
    res.json({
      recommendation: "Optimize regional deployment strategy: 'us-west-2' and 'us-east-1' are currently experiencing 45% higher renewable energy mix.",
      potentialSavingsKg: 14.2,
      optimalRegion: 'us-west-2',
      actionableSteps: [
        'Route non-latency sensitive builds to Oregon (us-west-2)',
        'Maintain SQS hold for Singapore (ap-southeast-1) until grid intensity drops below 400 gCO2eq/kWh',
        'Export S3 sustainability log for compliance audit'
      ]
    });
  }
});

// Code Deliverables Endpoint
app.get('/api/deliverables', (req, res) => {
  res.json(CODE_DELIVERABLES);
});

// Get Deployment Activity Logs
app.get('/api/activity', (req, res) => {
  res.json(deploymentHistory);
});

// Vite Middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CarbonOps Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

import React, { useState, useEffect } from 'react';
import { SideNavBar, TopNavBar } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { DeploymentsView } from './components/DeploymentsView';
import { QueueView } from './components/QueueView';
import { LiveCarbonView } from './components/LiveCarbonView';
import { AWSRegionsView } from './components/AWSRegionsView';
import { AnalyticsView } from './components/AnalyticsView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { DeliverablesModal } from './components/DeliverablesModal';
import { LoginView } from './components/LoginView';
import { AiAdvisorModal } from './components/AiAdvisorModal';
import { NewDeploymentModal } from './components/NewDeploymentModal';
import { DeploymentCompletedModal } from './components/DeploymentCompletedModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { SpeculativeCacheView } from './components/SpeculativeCacheView';
import { ParetoOptimizerView } from './components/ParetoOptimizerView';
import { EsgComplianceView } from './components/EsgComplianceView';
import { SlaPolicyEngineModal } from './components/SlaPolicyEngineModal';
import { PipelineProfilerModal } from './components/PipelineProfilerModal';
import Galaxy from './components/Galaxy';
import { fetchWithInterceptor } from './services/resilientApiClient';
import {
  QueuedPipeline,
  DeploymentActivity,
  SystemSettings,
  NotificationItem,
  DeploymentCompletedData
} from './types';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default logged in for preview
  const [userEmail, setUserEmail] = useState('sarah.chen@company.com');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Modals & Drawers
  const [isDeliverablesOpen, setIsDeliverablesOpen] = useState(false);
  const [isAiOptimizeOpen, setIsAiOptimizeOpen] = useState(false);
  const [isNewDeploymentOpen, setIsNewDeploymentOpen] = useState(false);
  const [initialDeploymentRegion, setInitialDeploymentRegion] = useState<string>('us-east-1');
  const [completedDeploymentData, setCompletedDeploymentData] = useState<DeploymentCompletedData | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // SLA Policy Modal State & Pipeline Profiler Modal State
  const [isSlaPolicyOpen, setIsSlaPolicyOpen] = useState(false);
  const [selectedProfilerActivity, setSelectedProfilerActivity] = useState<DeploymentActivity | null>(null);

  const handleStartNewDeployment = (region?: string) => {
    if (region) {
      setInitialDeploymentRegion(region);
    } else {
      setInitialDeploymentRegion('us-east-1');
    }
    setIsNewDeploymentOpen(true);
  };

  // System Settings
  const [settings, setSettings] = useState<SystemSettings>({
    threshold: 250,
    electricityApiKey: 'YOUR_ELECTRICITY_MAPS_API_KEY',
    awsRegion: 'us-east-1',
    autoDeployEnabled: true,
    checkIntervalMinutes: 5,
    sqsQueueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789012/carbon-aware-deployments-queue',
    s3BucketName: 'carbon-aware-sustainability-reports'
  });

  // Notifications List
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Deployment Completed',
      message: 'payment-api-gateway successfully deployed in us-east-1 (214 gCO2/kWh)',
      type: 'DEPLOYED',
      timestamp: 'Just now',
      read: false,
      channel: 'Dashboard'
    },
    {
      id: 'notif-[#',
      title: 'High Carbon Held',
      message: 'user-auth-service deferred in eu-central-1 (420 gCO2/kWh > 250 threshold)',
      type: 'QUEUED',
      timestamp: '12m ago',
      read: false,
      channel: 'Slack'
    },
    {
      id: 'notif-3',
      title: 'Solar Generation Dip Trigger',
      message: 'EventBridge detected clean energy window in us-west-2 (110 gCO2/kWh)',
      type: 'OPTIMAL',
      timestamp: '28m ago',
      read: true,
      channel: 'MS Teams'
    }
  ]);

  // State for Queue & Activities
  const [queue, setQueue] = useState<QueuedPipeline[]>([
    {
      id: 'sqs-msg-1',
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
      id: 'sqs-msg-2',
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
      id: 'sqs-msg-3',
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
      id: 'sqs-msg-4',
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
  ]);

  const [activities, setActivities] = useState<DeploymentActivity[]>([
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
  ]);

  const [isTriggering, setIsTriggering] = useState(false);

  // Sync Queue from Backend if server is running
  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/queue');
      if (res.ok) {
        const data = await res.json();
        if (data.queue) setQueue(data.queue);
        if (data.threshold) setSettings((s) => ({ ...s, threshold: data.threshold }));
      }
    } catch (e) {
      // client-side fallback mode
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  // Deploy Action
  const handleDeployItem = async (id: string) => {
    const item = queue.find((q) => q.id === id);

    try {
      const { data, error } = await fetchWithInterceptor('/api/queue/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          repo: item?.repo,
          branch: item?.branch,
          commitSha: item?.commitSha,
          awsRegion: item?.awsRegion,
          carbonIntensity: item?.carbonIntensity
        }),
        maxRetries: 3,
        baseDelayMs: 400
      });
      if (data && data.deployedItem) {
        fetchQueue();
      }
    } catch (e) {
      console.warn(e);
    }

    if (item) {
      const savedKg = Number((((settings.threshold - item.carbonIntensity) * 0.05) || 3.8).toFixed(1));

      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          repo: item.repo,
          branch: item.branch,
          commitSha: `sha-${item.commitSha.substring(0, 5)}`,
          gridScore: Math.max(0, Math.min(100, Math.round((1 - item.carbonIntensity / 700) * 100))),
          decision: 'PROCEED',
          carbonImpact: `-${Math.abs(savedKg)}kg CO2`,
          status: 'Completed',
          timestamp: 'Just now',
          awsRegion: item.awsRegion,
          carbonValue: item.carbonIntensity,
          savedKg: Math.abs(savedKg)
        },
        ...prev
      ]);

      // Pop up Deployment Completed Modal for real feedback
      setCompletedDeploymentData({
        repo: item.repo,
        branch: item.branch,
        commitSha: item.commitSha,
        awsRegion: item.awsRegion,
        carbonIntensity: item.carbonIntensity,
        renewablePct: Math.max(10, Math.min(95, Math.round((1 - item.carbonIntensity / 700) * 100))),
        savedCarbonKg: Math.abs(savedKg) || 3.8,
        durationSeconds: 14,
        cloudWatchLogGroup: `/aws/lambda/carbon-deploy-${item.repo}`,
        s3ReportUrl: `s3://carbon-aware-sustainability-reports/deploy-${Date.now()}.json`,
        timestamp: new Date().toISOString()
      });
    }

    setQueue((prev) => prev.filter((q) => q.id !== id));
  };

  // Cancel Action
  const handleCancelItem = async (id: string) => {
    try {
      await fetch(`/api/queue/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn(e);
    }
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  // Enqueue Action
  const handleEnqueue = async (newItemData: {
    repo: string;
    branch: string;
    commitSha: string;
    awsRegion: string;
    carbonIntensity: number;
    commitAuthor: string;
  }) => {
    try {
      const { data, error } = await fetchWithInterceptor('/api/queue/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItemData),
        maxRetries: 3,
        baseDelayMs: 400
      });

      if (data && data.item) {
        setQueue((prev) => [data.item, ...prev]);
        return;
      }
    } catch (e) {
      console.warn(e);
    }

    // Client fallback
    const isBelow = newItemData.carbonIntensity <= settings.threshold;
    const item: QueuedPipeline = {
      id: `sqs-${Date.now()}`,
      ...newItemData,
      threshold: settings.threshold,
      queueTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estWait: isBelow ? '~ 1m 00s' : 'Hold (Low Carbon Pending)',
      status: isBelow ? 'QUEUED' : 'HELD',
      decision: isBelow ? 'PROCEED' : 'QUEUE',
      workflowId: `wf-${Math.floor(Math.random() * 90000)}`,
      createdAt: new Date().toISOString()
    };
    setQueue((prev) => [item, ...prev]);

    // Notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: isBelow ? 'Pipeline Enqueued' : 'Pipeline Held in SQS',
        message: `${newItemData.repo} queued for region ${newItemData.awsRegion} (${newItemData.carbonIntensity} gCO2/kWh)`,
        type: isBelow ? 'DEPLOYED' : 'QUEUED',
        timestamp: 'Just now',
        read: false,
        channel: 'Dashboard'
      },
      ...prev
    ]);
  };

  // Deployment Completion Callback
  const handleDeploymentComplete = (data: DeploymentCompletedData) => {
    setCompletedDeploymentData(data);
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        repo: data.repo,
        branch: data.branch,
        commitSha: `sha-${data.commitSha.substring(0, 5)}`,
        gridScore: Math.max(0, Math.min(100, Math.round((1 - data.carbonIntensity / 700) * 100))),
        decision: 'PROCEED',
        carbonImpact: `-${data.savedCarbonKg}kg CO2`,
        status: 'Completed',
        timestamp: 'Just now',
        awsRegion: data.awsRegion,
        carbonValue: data.carbonIntensity,
        savedKg: data.savedCarbonKg
      },
      ...prev
    ]);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Deployment Succeeded',
        message: `Deployed ${data.repo} in ${data.awsRegion} with ${data.savedCarbonKg}kg CO2 saved`,
        type: 'DEPLOYED',
        timestamp: 'Just now',
        read: false,
        channel: 'Dashboard'
      },
      ...prev
    ]);
  };

  // Change Threshold
  const handleThresholdChange = async (val: number) => {
    setSettings((s) => ({ ...s, threshold: val }));
    try {
      await fetch('/api/settings/threshold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold: val })
      });
    } catch (e) {
      console.warn(e);
    }
  };

  // Trigger EventBridge Check
  const handleTriggerEventBridge = async () => {
    setIsTriggering(true);
    try {
      const res = await fetch('/api/eventbridge/trigger', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.releasedCount > 0) {
          fetchQueue();
        }
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setTimeout(() => setIsTriggering(false), 800);
    }
  };

  if (!isAuthenticated) {
    return (
      <LoginView
        onLoginSuccess={(email) => {
          setUserEmail(email);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen flex bg-[#0A0A0A] text-[#E0E0E0] font-body relative dark ${isDarkMode ? 'dark' : ''}`}>
      {/* Interactive Background Galaxy Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-80">
        <Galaxy
          mouseRepulsion={true}
          mouseInteraction={true}
          density={1.2}
          glowIntensity={0.6}
          saturation={0.8}
          hueShift={135}
          starSpeed={0.6}
          twinkleIntensity={0.4}
        />
      </div>

      {/* Side Navigation Bar */}
      <div className="relative z-10 flex">
        <SideNavBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenDeliverables={() => setIsDeliverablesOpen(true)}
          onOpenAiOptimize={() => setIsAiOptimizeOpen(true)}
          onOpenSlaPolicy={() => setIsSlaPolicyOpen(true)}
          onLogout={() => setIsAuthenticated(false)}
          userEmail={userEmail}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />
      </div>

      {/* Main Canvas Area */}
      <div className="flex-grow flex flex-col h-screen overflow-hidden relative z-10">
        {/* Top Header */}
        <TopNavBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenDeliverables={() => setIsDeliverablesOpen(true)}
          onOpenAiOptimize={() => setIsAiOptimizeOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          userEmail={userEmail}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />

        {/* Tab Router */}
        <main className="flex-grow overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigateToQueue={() => setActiveTab('queue')}
              onOpenAiOptimize={() => setIsAiOptimizeOpen(true)}
              onStartNewDeployment={handleStartNewDeployment}
              activities={activities}
              currentThreshold={settings.threshold}
              onSelectProfilerActivity={(act) => setSelectedProfilerActivity(act)}
            />
          )}

          {activeTab === 'speculative-cache' && (
            <SpeculativeCacheView
              onDeployFromCache={(item) => {
                handleDeployItem(item.id);
                setActiveTab('deployments');
              }}
            />
          )}

          {activeTab === 'pareto-optimizer' && (
            <ParetoOptimizerView
              onSelectOptimalRegion={(region) => {
                handleStartNewDeployment(region);
              }}
            />
          )}

          {activeTab === 'compliance-esg' && (
            <EsgComplianceView />
          )}

          {activeTab === 'deployments' && (
            <DeploymentsView
              activities={activities}
              onStartNewDeployment={handleStartNewDeployment}
              onNavigateToQueue={() => setActiveTab('queue')}
              onOpenAiOptimize={() => setIsAiOptimizeOpen(true)}
            />
          )}

          {activeTab === 'queue' && (
            <QueueView
              queue={queue}
              onDeploy={handleDeployItem}
              onCancel={handleCancelItem}
              onEnqueue={handleEnqueue}
              threshold={settings.threshold}
              onThresholdChange={handleThresholdChange}
              onTriggerEventBridge={handleTriggerEventBridge}
              isTriggering={isTriggering}
            />
          )}

          {activeTab === 'live-carbon' && (
            <LiveCarbonView
              onOpenAiOptimize={() => setIsAiOptimizeOpen(true)}
              onScheduleRegion={() => setActiveTab('queue')}
              onStartNewDeployment={handleStartNewDeployment}
            />
          )}

          {activeTab === 'aws-regions' && (
            <AWSRegionsView onStartNewDeployment={handleStartNewDeployment} />
          )}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={(newSettings) => setSettings(newSettings)}
            />
          )}
        </main>
      </div>

      {/* Code Deliverables Source Viewer Modal */}
      <DeliverablesModal
        isOpen={isDeliverablesOpen}
        onClose={() => setIsDeliverablesOpen(false)}
      />

      {/* Gemini AI Optimization Assistant Modal */}
      <AiAdvisorModal
        isOpen={isAiOptimizeOpen}
        onClose={() => setIsAiOptimizeOpen(false)}
        onApplyRecommendation={() => {
          setActiveTab('queue');
          handleTriggerEventBridge();
        }}
      />

      {/* New Carbon-Aware Deployment Modal */}
      <NewDeploymentModal
        isOpen={isNewDeploymentOpen}
        onClose={() => setIsNewDeploymentOpen(false)}
        defaultThreshold={settings.threshold}
        initialRegion={initialDeploymentRegion}
        onEnqueue={handleEnqueue}
        onDeploymentComplete={handleDeploymentComplete}
      />

      {/* Deployment Completed Modal */}
      <DeploymentCompletedModal
        data={completedDeploymentData}
        onClose={() => setCompletedDeploymentData(null)}
        onNavigateToReports={() => setActiveTab('reports')}
      />

      {/* SLA Policy Engine Modal */}
      <SlaPolicyEngineModal
        isOpen={isSlaPolicyOpen}
        onClose={() => setIsSlaPolicyOpen(false)}
      />

      {/* Pipeline Carbon Profiler Modal */}
      <PipelineProfilerModal
        isOpen={!!selectedProfilerActivity}
        onClose={() => setSelectedProfilerActivity(null)}
        activity={selectedProfilerActivity}
      />

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        }
        onClearAll={() => setNotifications([])}
      />
    </div>
  );
}

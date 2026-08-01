import React from 'react';
import {
  LayoutDashboard,
  Rocket,
  Layers,
  Leaf,
  Globe,
  BarChart3,
  FileText,
  Settings,
  Zap,
  Search,
  Moon,
  Sun,
  Bell,
  Code2,
  Sparkles,
  UserCheck,
  Cpu,
  Sliders,
  ShieldCheck,
  Radio
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenDeliverables: () => void;
  onOpenAiOptimize: () => void;
  onOpenNotifications?: () => void;
  onLogout?: () => void;
  userEmail?: string;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onOpenSlaPolicy?: () => void;
}

export const SideNavBar: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  onOpenDeliverables,
  onOpenAiOptimize,
  onLogout,
  onOpenSlaPolicy
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'deployments', label: 'Deployments', icon: Rocket },
    { id: 'speculative-cache', label: 'Speculative Cache', icon: Cpu },
    { id: 'pareto-optimizer', label: 'Pareto Cost/Carbon', icon: Sliders },
    { id: 'queue', label: 'Queue & SLA', icon: Layers },
    { id: 'live-carbon', label: 'Live Carbon Grid', icon: Leaf },
    { id: 'aws-regions', label: 'AWS Regions', icon: Globe },
    { id: 'compliance-esg', label: 'ESG & CSRD Audit', icon: ShieldCheck },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="bg-[#0D0D0D] border-r border-[#2A2A2A] h-screen w-72 flex-shrink-0 flex flex-col p-4 gap-2 hidden md:flex sticky top-0 z-30 text-[#E0E0E0]">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 mb-4 mt-2">
        <div className="w-10 h-10 bg-[#00FF41]/10 border border-[#00FF41]/40 rounded-xl flex items-center justify-center text-[#00FF41] shadow-xs">
          <Leaf className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-headline text-xl font-bold text-[#00FF41] tracking-tight leading-none">CarbonDevOps</h1>
          <p className="font-code text-xs text-[#A1A1AA] mt-1">Sustainable CI/CD Platform</p>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-grow space-y-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all text-left text-xs ${
                isActive
                  ? 'bg-[#00FF41] text-black font-bold shadow-xs'
                  : 'text-[#A1A1AA] hover:bg-[#1A1A1A] hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-[#71717A]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Quick Action & Deliverables */}
      <div className="mt-auto pt-3 border-t border-[#2A2A2A] space-y-2">
        {onOpenSlaPolicy && (
          <button
            onClick={onOpenSlaPolicy}
            className="w-full bg-[#141414] border border-[#2A2A2A] text-white font-code text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-[#1A1A1A] transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#00FF41]" />
            <span>SLA Policy Rules</span>
          </button>
        )}

        <button
          onClick={onOpenAiOptimize}
          className="w-full bg-[#00FF41] text-black font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#00e038] transition-all active:scale-95 text-xs shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>AI Smart Optimizer</span>
        </button>

        <button
          onClick={onOpenDeliverables}
          className="w-full bg-[#141414] border border-[#2A2A2A] text-[#00FF41] font-semibold py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-[#1A1A1A] transition-all text-xs"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>AWS Architecture Spec</span>
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full text-xs text-[#71717A] hover:text-[#EF4444] py-1 transition-colors text-center block"
          >
            Sign out
          </button>
        )}
      </div>
    </aside>
  );
};

export const TopNavBar: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  onOpenDeliverables,
  onOpenNotifications,
  userEmail = 'sarah.chen@company.com',
  isDarkMode,
  setIsDarkMode
}) => {
  return (
    <header className="flex justify-between items-center h-16 px-6 w-full sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#2A2A2A] shadow-xs text-[#E0E0E0]">
      <div className="flex items-center gap-4">
        <span className="font-headline text-lg font-bold text-white hidden sm:block">
          CarbonOps Platform
        </span>

        {/* Live Grid API Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#141414] border border-[#2A2A2A] rounded-xl text-[11px] font-code">
          <Radio className="w-3 h-3 text-[#00FF41] animate-pulse" />
          <span className="text-white font-bold">Electricity Maps API:</span>
          <span className="text-[#00FF41]">Connected (Free Tier + Demo Fallback Active)</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('speculative-cache')}
          className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 rounded-lg text-xs font-semibold hover:bg-[#00FF41]/20 transition-all"
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Speculative Cache</span>
        </button>

        <button
          onClick={() => setActiveTab('pareto-optimizer')}
          className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30 rounded-lg text-xs font-semibold hover:bg-[#3B82F6]/20 transition-all"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Pareto Optimizer</span>
        </button>

        <button
          onClick={onOpenDeliverables}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#141414] hover:bg-[#1A1A1A] text-[#00FF41] rounded-lg text-xs font-semibold transition-colors border border-[#2A2A2A]"
          title="Inspect Code Deliverables"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Code & Specs</span>
        </button>

        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#1A1A1A] text-[#A1A1AA] hover:text-white transition-colors"
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={onOpenNotifications}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#1A1A1A] text-[#A1A1AA] hover:text-[#00FF41] relative transition-colors"
          title="Notifications & Alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#EF4444] rounded-full animate-ping"></span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#EF4444] rounded-full"></span>
        </button>

        <div className="h-6 w-[1px] bg-[#2A2A2A] mx-1"></div>

        {/* User Info */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-full bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/40 flex items-center justify-center font-bold text-xs">
            SC
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-white leading-none">Sarah Chen</p>
            <p className="text-[10px] text-[#A1A1AA] mt-0.5">SRE Lead</p>
          </div>
        </div>
      </div>
    </header>
  );
};


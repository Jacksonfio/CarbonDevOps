import React, { useState, useEffect } from 'react';
import {
  Globe,
  Search,
  RefreshCw,
  Download,
  Zap,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Building
} from 'lucide-react';
import { AWSZoneData } from '../types';

interface AWSRegionsViewProps {
  onStartNewDeployment?: (region?: string) => void;
}

export const AWSRegionsView: React.FC<AWSRegionsViewProps> = ({ onStartNewDeployment }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [loadingRegion, setLoadingRegion] = useState<string | null>(null);

  const [regions, setRegions] = useState<AWSZoneData[]>([
    {
      zoneKey: 'US-VA-PJM',
      regionName: 'US East (N. Virginia)',
      awsRegion: 'us-east-1',
      carbonIntensity: 214,
      renewablePct: 82,
      status: 'OPTIMAL',
      trend: 'down',
      forecast24h: [230, 214, 190],
      lat: 38.9,
      lng: -77.0,
      gridScore: 88
    },
    {
      zoneKey: 'US-OH-PJM',
      regionName: 'US East (Ohio)',
      awsRegion: 'us-east-2',
      carbonIntensity: 310,
      renewablePct: 62,
      status: 'MODERATE',
      trend: 'flat',
      forecast24h: [320, 310, 290],
      lat: 40.0,
      lng: -83.0,
      gridScore: 68
    },
    {
      zoneKey: 'US-CA-CISO',
      regionName: 'US West (N. California)',
      awsRegion: 'us-west-1',
      carbonIntensity: 185,
      renewablePct: 88,
      status: 'OPTIMAL',
      trend: 'down',
      forecast24h: [200, 185, 170],
      lat: 37.7,
      lng: -122.4,
      gridScore: 90
    },
    {
      zoneKey: 'US-OR-BPA',
      regionName: 'US West (Oregon)',
      awsRegion: 'us-west-2',
      carbonIntensity: 110,
      renewablePct: 94,
      status: 'OPTIMAL',
      trend: 'down',
      forecast24h: [120, 110, 95],
      lat: 45.5,
      lng: -122.6,
      gridScore: 96
    },
    {
      zoneKey: 'CA-QC',
      regionName: 'Canada (Central)',
      awsRegion: 'ca-central-1',
      carbonIntensity: 45,
      renewablePct: 98,
      status: 'OPTIMAL',
      trend: 'flat',
      forecast24h: [50, 45, 42],
      lat: 45.5,
      lng: -73.5,
      gridScore: 99
    },
    {
      zoneKey: 'IE',
      regionName: 'Europe (Ireland)',
      awsRegion: 'eu-west-1',
      carbonIntensity: 240,
      renewablePct: 78,
      status: 'OPTIMAL',
      trend: 'down',
      forecast24h: [250, 240, 220],
      lat: 53.3,
      lng: -6.2,
      gridScore: 82
    },
    {
      zoneKey: 'GB',
      regionName: 'Europe (London)',
      awsRegion: 'eu-west-2',
      carbonIntensity: 195,
      renewablePct: 84,
      status: 'OPTIMAL',
      trend: 'down',
      forecast24h: [210, 195, 180],
      lat: 51.5,
      lng: -0.1,
      gridScore: 88
    },
    {
      zoneKey: 'DE',
      regionName: 'Europe (Frankfurt)',
      awsRegion: 'eu-central-1',
      carbonIntensity: 412,
      renewablePct: 45,
      status: 'MODERATE',
      trend: 'up',
      forecast24h: [390, 412, 430],
      lat: 50.1,
      lng: 8.6,
      gridScore: 52
    },
    {
      zoneKey: 'SE-SE3',
      regionName: 'Europe (Stockholm)',
      awsRegion: 'eu-north-1',
      carbonIntensity: 25,
      renewablePct: 99,
      status: 'OPTIMAL',
      trend: 'flat',
      forecast24h: [28, 25, 22],
      lat: 59.3,
      lng: 18.0,
      gridScore: 100
    },
    {
      zoneKey: 'SG',
      regionName: 'Asia Pacific (Singapore)',
      awsRegion: 'ap-southeast-1',
      carbonIntensity: 680,
      renewablePct: 12,
      status: 'HIGH',
      trend: 'up',
      forecast24h: [660, 680, 700],
      lat: 1.3,
      lng: 103.8,
      gridScore: 18
    },
    {
      zoneKey: 'AU-NSW',
      regionName: 'Asia Pacific (Sydney)',
      awsRegion: 'ap-southeast-2',
      carbonIntensity: 520,
      renewablePct: 35,
      status: 'HIGH',
      trend: 'flat',
      forecast24h: [530, 520, 510],
      lat: -33.8,
      lng: 151.2,
      gridScore: 32
    },
    {
      zoneKey: 'JP-TK',
      regionName: 'Asia Pacific (Tokyo)',
      awsRegion: 'ap-northeast-1',
      carbonIntensity: 480,
      renewablePct: 28,
      status: 'MODERATE',
      trend: 'down',
      forecast24h: [500, 480, 460],
      lat: 35.6,
      lng: 139.6,
      gridScore: 42
    },
    {
      zoneKey: 'IN-WE',
      regionName: 'Asia Pacific (Mumbai)',
      awsRegion: 'ap-south-1',
      carbonIntensity: 710,
      renewablePct: 18,
      status: 'HIGH',
      trend: 'flat',
      forecast24h: [720, 710, 700],
      lat: 19.0,
      lng: 72.8,
      gridScore: 14
    },
    {
      zoneKey: 'BR-SE',
      regionName: 'South America (São Paulo)',
      awsRegion: 'sa-east-1',
      carbonIntensity: 130,
      renewablePct: 91,
      status: 'OPTIMAL',
      trend: 'flat',
      forecast24h: [140, 130, 125],
      lat: -23.5,
      lng: -46.6,
      gridScore: 92
    }
  ]);

  // Fetch All Regions Grid Data
  const handleFetchAllRegions = async () => {
    setIsLoadingAll(true);
    try {
      const res = await fetch('/api/carbon/all-regions');
      if (res.ok) {
        const data = await res.json();
        if (data.regions && data.regions.length > 0) {
          setRegions(data.regions);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsLoadingAll(false), 800);
    }
  };

  const handleRefreshSingle = async (regionCode: string) => {
    setLoadingRegion(regionCode);
    try {
      const res = await fetch(`/api/carbon-intensity?zone=${regionCode.toUpperCase()}`);
      if (res.ok) {
        const data = await res.json();
        setRegions((prev) =>
          prev.map((r) =>
            r.awsRegion === regionCode
              ? {
                  ...r,
                  carbonIntensity: data.carbonIntensity,
                  status:
                    data.carbonIntensity <= 250
                      ? 'OPTIMAL'
                      : data.carbonIntensity <= 500
                      ? 'MODERATE'
                      : 'HIGH',
                  gridScore: Math.max(5, Math.min(100, Math.round((1 - data.carbonIntensity / 800) * 100)))
                }
              : r
          )
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setLoadingRegion(null), 500);
    }
  };

  // Download Region Grid Data CSV
  const handleDownloadCsv = () => {
    const headers = ['AWS Region', 'Region Name', 'Zone Key', 'Carbon Intensity (gCO2eq/kWh)', 'Renewable %', 'Status', 'Grid Score'];
    const rows = regions.map((r) => [
      r.awsRegion,
      `"${r.regionName}"`,
      r.zoneKey,
      r.carbonIntensity,
      `${r.renewablePct}%`,
      r.status,
      `${r.gridScore}/100`
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AWS_Regions_RealTime_Carbon_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = regions.filter((r) => {
    const matchesSearch =
      r.regionName.toLowerCase().includes(search.toLowerCase()) ||
      r.awsRegion.toLowerCase().includes(search.toLowerCase()) ||
      r.zoneKey.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto text-[#E0E0E0]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#00FF41]/10 text-[#00FF41] font-code text-xs font-bold border border-[#00FF41]/30">
              REAL-TIME GRID MONITORS
            </span>
            <span className="text-xs text-[#A1A1AA] font-code">
              {regions.length} AWS Cloud Regions Loaded
            </span>
          </div>
          <h2 className="font-headline text-2xl md:text-3xl font-bold text-white tracking-tight">
            AWS Regions Real-Time Carbon Intensity
          </h2>
          <p className="font-body text-sm text-[#A1A1AA] mt-1">
            Electricity Maps live grid carbon emissions profile for intelligent CI/CD routing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleFetchAllRegions}
            disabled={isLoadingAll}
            className="bg-[#00FF41] text-black font-headline text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-[#00e038] transition-all shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingAll ? 'animate-spin' : ''}`} />
            <span>{isLoadingAll ? 'Fetching All Grid Data...' : 'Fetch All AWS Regions'}</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            className="bg-[#141414] border border-[#2A2A2A] text-white font-headline text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-[#1A1A1A] transition-all"
          >
            <Download className="w-4 h-4 text-[#00FF41]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#141414] p-4 rounded-2xl border border-[#2A2A2A]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
          <input
            type="text"
            placeholder="Search region code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white placeholder-[#71717A] rounded-xl py-2 pl-9 pr-4 text-xs focus:border-[#00FF41] focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'OPTIMAL', 'MODERATE', 'HIGH'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-code text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-[#00FF41] text-black shadow-xs'
                  : 'bg-[#1A1A1A] text-[#A1A1AA] hover:text-white border border-[#2A2A2A]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((reg) => (
          <div
            key={reg.awsRegion}
            className="bg-[#141414] rounded-2xl border border-[#2A2A2A] p-5 shadow-xs flex flex-col justify-between hover:border-[#00FF41]/50 transition-all group"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-headline font-bold text-sm text-white group-hover:text-[#00FF41] transition-colors">
                    {reg.regionName}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-code text-xs text-[#00FF41] font-semibold">{reg.awsRegion}</span>
                    <span className="text-[10px] text-[#71717A] font-code">({reg.zoneKey})</span>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md font-code text-[10px] font-bold uppercase border ${
                    reg.status === 'OPTIMAL'
                      ? 'bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30'
                      : reg.status === 'MODERATE'
                      ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
                      : 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30'
                  }`}
                >
                  {reg.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 my-4">
                <div className="p-2.5 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
                  <span className="font-code text-[9px] font-bold text-[#A1A1AA] uppercase block">
                    CARBON INTENSITY
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-lg font-headline font-bold text-white">
                      {reg.carbonIntensity}
                    </span>
                    <span className="text-[10px] text-[#A1A1AA]">gCO2</span>
                  </div>
                </div>

                <div className="p-2.5 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
                  <span className="font-code text-[9px] font-bold text-[#A1A1AA] uppercase block">
                    CLEAN ENERGY
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-lg font-headline font-bold text-[#00FF41]">
                      {reg.renewablePct}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-between items-center border-t border-[#2A2A2A]">
              <span className="text-xs text-[#A1A1AA] font-code">
                Grid Score: <b className="text-white">{reg.gridScore}/100</b>
              </span>
              <div className="flex items-center gap-1.5">
                {onStartNewDeployment && (
                  <button
                    onClick={() => onStartNewDeployment(reg.awsRegion)}
                    className="px-2.5 py-1 text-[11px] font-bold text-black bg-[#00FF41] hover:bg-[#00e038] rounded-lg transition-all shadow-xs flex items-center gap-1"
                    title={`Start Deployment in ${reg.awsRegion}`}
                  >
                    <Zap className="w-3 h-3 fill-current" />
                    <span>Deploy</span>
                  </button>
                )}
                <button
                  onClick={() => handleRefreshSingle(reg.awsRegion)}
                  disabled={loadingRegion === reg.awsRegion}
                  className="p-1.5 hover:bg-[#1A1A1A] rounded-lg text-[#00FF41] transition-colors"
                  title="Fetch latest Electricity Maps data"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loadingRegion === reg.awsRegion ? 'animate-spin' : ''}`}
                  />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

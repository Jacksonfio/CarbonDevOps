import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  Globe,
  TrendingDown,
  Leaf,
  X,
  Sparkles,
  Zap,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Server,
  Layers,
  Search,
  Compass,
  ListFilter,
  MapPin,
  Play
} from 'lucide-react';
import { AWSZoneData } from '../types';

interface LiveCarbonViewProps {
  onScheduleRegion?: (regionName: string) => void;
  onOpenAiOptimize: () => void;
  onStartNewDeployment?: (regionCode?: string) => void;
}

export const LiveCarbonView: React.FC<LiveCarbonViewProps> = ({
  onScheduleRegion,
  onOpenAiOptimize,
  onStartNewDeployment
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const polyRef = useRef<L.Polyline | null>(null);

  const [activeViewMode, setActiveViewMode] = useState<'MAP' | 'SPLIT' | 'TABLE'>('SPLIT');
  const [mapStyle, setMapStyle] = useState<'VOYAGER' | 'STREET' | 'SATELLITE' | 'TOPOGRAPHIC'>('SATELLITE');
  const [continentFilter, setContinentFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<AWSZoneData | null>(null);
  const [cleanestRegionCode, setCleanestRegionCode] = useState<string>('eu-north-1');
  const [animatingPath, setAnimatingPath] = useState(false);
  const [simStep, setSimStep] = useState<number>(0);

  // Expanded Complete AWS Regions List with precise coordinates
  const [regions, setRegions] = useState<AWSZoneData[]>([
    {
      zoneKey: 'EU-NORTH-1',
      regionName: 'Stockholm, Sweden',
      awsRegion: 'eu-north-1',
      carbonIntensity: 25,
      renewablePct: 99,
      status: 'OPTIMAL',
      trend: 'flat',
      forecast24h: [28, 25, 22, 24, 25, 26, 25, 23, 24, 25, 27, 25],
      lat: 59.3293,
      lng: 18.0686,
      gridScore: 100
    },
    {
      zoneKey: 'CA-CENTRAL-1',
      regionName: 'Canada (Central)',
      awsRegion: 'ca-central-1',
      carbonIntensity: 45,
      renewablePct: 98,
      status: 'OPTIMAL',
      trend: 'down',
      forecast24h: [52, 48, 45, 42, 44, 45, 46, 44, 43, 45, 47, 45],
      lat: 45.5017,
      lng: -73.5673,
      gridScore: 98
    },
    {
      zoneKey: 'US-WEST-2',
      regionName: 'Oregon, USA',
      awsRegion: 'us-west-2',
      carbonIntensity: 110,
      renewablePct: 94,
      status: 'OPTIMAL',
      trend: 'down',
      forecast24h: [140, 125, 110, 105, 110, 115, 110, 108, 112, 110, 118, 110],
      lat: 45.5152,
      lng: -122.6784,
      gridScore: 96
    },
    {
      zoneKey: 'SA-EAST-1',
      regionName: 'São Paulo, Brazil',
      awsRegion: 'sa-east-1',
      carbonIntensity: 130,
      renewablePct: 91,
      status: 'OPTIMAL',
      trend: 'flat',
      forecast24h: [145, 138, 130, 125, 128, 130, 132, 130, 129, 130, 135, 130],
      lat: -23.5505,
      lng: -46.6333,
      gridScore: 92
    },
    {
      zoneKey: 'US-WEST-1',
      regionName: 'N. California, USA',
      awsRegion: 'us-west-1',
      carbonIntensity: 185,
      renewablePct: 88,
      status: 'OPTIMAL',
      trend: 'down',
      forecast24h: [210, 195, 185, 175, 180, 185, 190, 182, 185, 188, 192, 185],
      lat: 37.7749,
      lng: -122.4194,
      gridScore: 90
    },
    {
      zoneKey: 'EU-WEST-2',
      regionName: 'London, UK',
      awsRegion: 'eu-west-2',
      carbonIntensity: 195,
      renewablePct: 84,
      status: 'OPTIMAL',
      trend: 'down',
      forecast24h: [220, 205, 195, 185, 190, 195, 200, 192, 195, 198, 202, 195],
      lat: 51.5074,
      lng: -0.1278,
      gridScore: 88
    },
    {
      zoneKey: 'US-EAST-1',
      regionName: 'N. Virginia, USA',
      awsRegion: 'us-east-1',
      carbonIntensity: 214,
      renewablePct: 82,
      status: 'OPTIMAL',
      trend: 'down',
      forecast24h: [260, 235, 214, 198, 205, 214, 220, 210, 214, 218, 225, 214],
      lat: 38.9072,
      lng: -77.0369,
      gridScore: 86
    },
    {
      zoneKey: 'EU-WEST-1',
      regionName: 'Ireland',
      awsRegion: 'eu-west-1',
      carbonIntensity: 240,
      renewablePct: 78,
      status: 'OPTIMAL',
      trend: 'down',
      forecast24h: [270, 252, 240, 228, 235, 240, 245, 238, 240, 242, 248, 240],
      lat: 53.3498,
      lng: -6.2603,
      gridScore: 82
    },
    {
      zoneKey: 'US-EAST-2',
      regionName: 'Ohio, USA',
      awsRegion: 'us-east-2',
      carbonIntensity: 310,
      renewablePct: 62,
      status: 'MODERATE',
      trend: 'flat',
      forecast24h: [330, 320, 310, 300, 305, 310, 315, 308, 310, 312, 318, 310],
      lat: 40.3674,
      lng: -82.9962,
      gridScore: 68
    },
    {
      zoneKey: 'EU-CENTRAL-1',
      regionName: 'Frankfurt, Germany',
      awsRegion: 'eu-central-1',
      carbonIntensity: 412,
      renewablePct: 45,
      status: 'MODERATE',
      trend: 'up',
      forecast24h: [380, 398, 412, 425, 418, 412, 405, 410, 412, 415, 420, 412],
      lat: 50.1109,
      lng: 8.6821,
      gridScore: 52
    },
    {
      zoneKey: 'AP-NORTHEAST-1',
      regionName: 'Tokyo, Japan',
      awsRegion: 'ap-northeast-1',
      carbonIntensity: 480,
      renewablePct: 28,
      status: 'MODERATE',
      trend: 'down',
      forecast24h: [510, 495, 480, 468, 475, 480, 485, 478, 480, 482, 488, 480],
      lat: 35.6762,
      lng: 139.6503,
      gridScore: 42
    },
    {
      zoneKey: 'AP-SOUTHEAST-2',
      regionName: 'Sydney, Australia',
      awsRegion: 'ap-southeast-2',
      carbonIntensity: 520,
      renewablePct: 35,
      status: 'HIGH',
      trend: 'flat',
      forecast24h: [540, 530, 520, 510, 515, 520, 525, 518, 520, 522, 528, 520],
      lat: -33.8688,
      lng: 151.2093,
      gridScore: 32
    },
    {
      zoneKey: 'ME-SOUTH-1',
      regionName: 'Bahrain',
      awsRegion: 'me-south-1',
      carbonIntensity: 640,
      renewablePct: 10,
      status: 'HIGH',
      trend: 'up',
      forecast24h: [610, 628, 640, 655, 648, 640, 635, 638, 640, 642, 648, 640],
      lat: 26.0667,
      lng: 50.5577,
      gridScore: 22
    },
    {
      zoneKey: 'AP-SOUTHEAST-1',
      regionName: 'Singapore',
      awsRegion: 'ap-southeast-1',
      carbonIntensity: 680,
      renewablePct: 12,
      status: 'HIGH',
      trend: 'up',
      forecast24h: [650, 668, 680, 695, 688, 680, 675, 678, 680, 682, 688, 680],
      lat: 1.3521,
      lng: 103.8198,
      gridScore: 18
    },
    {
      zoneKey: 'AP-SOUTH-1',
      regionName: 'Mumbai, India',
      awsRegion: 'ap-south-1',
      carbonIntensity: 710,
      renewablePct: 18,
      status: 'HIGH',
      trend: 'flat',
      forecast24h: [725, 718, 710, 702, 705, 710, 712, 708, 710, 712, 715, 710],
      lat: 19.0760,
      lng: 72.8777,
      gridScore: 14
    },
    {
      zoneKey: 'AF-SOUTH-1',
      regionName: 'Cape Town, South Africa',
      awsRegion: 'af-south-1',
      carbonIntensity: 790,
      renewablePct: 8,
      status: 'HIGH',
      trend: 'flat',
      forecast24h: [805, 798, 790, 782, 785, 790, 792, 788, 790, 792, 795, 790],
      lat: -33.9249,
      lng: 18.4241,
      gridScore: 8
    }
  ]);

  // Set default selected region to Oregon on mount
  useEffect(() => {
    const oregon = regions.find((r) => r.awsRegion === 'us-west-2') || regions[0];
    setSelectedRegion(oregon);

    // Find absolute cleanest
    const sorted = [...regions].sort((a, b) => a.carbonIntensity - b.carbonIntensity);
    if (sorted.length > 0) {
      setCleanestRegionCode(sorted[0].awsRegion);
    }
  }, []);

  // Fetch API updates if server is live
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const res = await fetch('/api/carbon/all-regions');
        if (res.ok) {
          const data = await res.json();
          if (data.regions && data.regions.length > 0) {
            setRegions(data.regions);
            const sorted = [...data.regions].sort((a: AWSZoneData, b: AWSZoneData) => a.carbonIntensity - b.carbonIntensity);
            setCleanestRegionCode(sorted[0].awsRegion);
          }
        }
      } catch (e) {
        // Fallback to initial client dataset
      }
    };
    fetchRealData();
  }, []);

  // Manage Leaflet Tile Layers for Real World Maps
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    let tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    let tileAttr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';
    let subdomains = 'abcd';
    let maxZoom = 19;

    if (mapStyle === 'STREET') {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      tileAttr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
      subdomains = 'abc';
      maxZoom = 19;
    } else if (mapStyle === 'SATELLITE') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      tileAttr = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and GIS User Community';
      subdomains = 'a';
      maxZoom = 18;
    } else if (mapStyle === 'TOPOGRAPHIC') {
      tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      tileAttr = 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>';
      subdomains = 'abc';
      maxZoom = 17;
    }

    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution: tileAttr,
      subdomains,
      maxZoom
    }).addTo(map);
  }, [mapStyle]);

  // Initialize and Update Leaflet Map Markers
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map if not existing
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [20, 10],
        zoom: 2,
        minZoom: 2,
        maxZoom: 18,
        zoomControl: false
      });

      // Default Real World Map (Esri World Imagery Satellite)
      tileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and GIS User Community',
        subdomains: 'a',
        maxZoom: 18
      }).addTo(map);

      // Add Zoom Control to top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Remove existing markers
    Object.keys(markersRef.current).forEach((key) => {
      markersRef.current[key]?.remove();
    });
    markersRef.current = {};

    // Filter regions based on continent & search
    const filtered = regions.filter((reg) => {
      const matchSearch =
        reg.regionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.awsRegion.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (continentFilter === 'AMERICAS') {
        return ['us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'ca-central-1', 'sa-east-1'].includes(reg.awsRegion);
      }
      if (continentFilter === 'EUROPE') {
        return ['eu-west-1', 'eu-west-2', 'eu-central-1', 'eu-north-1'].includes(reg.awsRegion);
      }
      if (continentFilter === 'APAC') {
        return ['ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-south-1'].includes(reg.awsRegion);
      }
      if (continentFilter === 'MEA') {
        return ['me-south-1', 'af-south-1'].includes(reg.awsRegion);
      }
      return true;
    });

    // Create custom pins for each region
    filtered.forEach((reg) => {
      const isCleanest = reg.awsRegion === cleanestRegionCode;
      const isSelected = selectedRegion?.awsRegion === reg.awsRegion;

      const isGreen = reg.carbonIntensity <= 250;
      const isModerate = reg.carbonIntensity > 250 && reg.carbonIntensity <= 500;

      const pinBg = isGreen ? '#00FF41' : isModerate ? '#F59E0B' : '#EF4444';
      const borderCol = isSelected ? '#FFFFFF' : '#000000';
      const glowEffect = isCleanest ? 'box-shadow: 0 0 15px #00FF41, 0 0 30px #00FF41;' : '';
      const radarClass = isGreen ? 'radar-ring-green' : isModerate ? 'radar-ring-yellow' : '';

      const customHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          ${radarClass ? `<div class="${radarClass}" style="top: ${isSelected ? '-2px' : '0px'};"></div>` : ''}
          ${
            isCleanest
              ? `<div class="cleanest-pulse-glow" style="position: absolute; top: -22px; background: #00FF41; color: #000; font-family: monospace; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; border: 1px solid #000; white-space: nowrap; z-index: 10;">👑 CLEANEST</div>`
              : ''
          }
          <div style="
            width: ${isSelected ? '22px' : '16px'};
            height: ${isSelected ? '22px' : '16px'};
            background-color: ${pinBg};
            border: 2px solid ${borderCol};
            border-radius: 50%;
            transition: all 0.2s ease;
            position: relative;
            z-index: 5;
            ${glowEffect}
          "></div>
          <div style="
            background: rgba(20, 20, 20, 0.95);
            border: 1px solid #2A2A2A;
            border-radius: 6px;
            padding: 2px 6px;
            color: #FFFFFF;
            font-family: monospace;
            font-size: 10px;
            font-weight: 700;
            margin-top: 3px;
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(0,0,0,0.5);
            z-index: 5;
          ">
            ${reg.awsRegion} (${reg.carbonIntensity}g)
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: customHtml,
        iconSize: [80, 40],
        iconAnchor: [40, 20]
      });

      const marker = L.marker([reg.lat, reg.lng], { icon: customIcon }).addTo(map);

      // Popup Content
      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; color: #E0E0E0; background: #141414; padding: 12px; border-radius: 12px; min-width: 200px;">
          <div style="font-size: 10px; font-family: monospace; color: #00FF41; font-weight: 700; text-transform: uppercase;">AWS CLOUD REGION</div>
          <div style="font-size: 14px; font-weight: 800; color: #FFFFFF; margin-bottom: 2px;">${reg.regionName}</div>
          <div style="font-size: 11px; font-family: monospace; color: #A1A1AA; margin-bottom: 8px;">Code: ${reg.awsRegion}</div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 10px;">
            <div style="background: #1A1A1A; padding: 6px; border-radius: 8px; border: 1px solid #2A2A2A;">
              <span style="font-size: 9px; font-family: monospace; color: #A1A1AA; display: block;">INTENSITY</span>
              <span style="font-size: 13px; font-weight: 700; color: ${isGreen ? '#00FF41' : isModerate ? '#F59E0B' : '#EF4444'}">${reg.carbonIntensity} gCO₂</span>
            </div>
            <div style="background: #1A1A1A; padding: 6px; border-radius: 8px; border: 1px solid #2A2A2A;">
              <span style="font-size: 9px; font-family: monospace; color: #A1A1AA; display: block;">RENEWABLE</span>
              <span style="font-size: 13px; font-weight: 700; color: #00FF41;">${reg.renewablePct}% Clean</span>
            </div>
          </div>

          <div style="font-size: 10px; font-family: monospace; color: #A1A1AA; margin-bottom: 8px;">
            Status: <b style="color: ${isGreen ? '#00FF41' : isModerate ? '#F59E0B' : '#EF4444'}">${isGreen ? '🟢 DEPLOY RECOMMENDED' : isModerate ? '🟡 MODERATE INTENSITY' : '🔴 QUEUE IN SQS'}</b>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'dark-leaflet-popup'
      });

      marker.on('click', () => {
        setSelectedRegion(reg);
      });

      markersRef.current[reg.awsRegion] = marker;
    });

    return () => {
      // Clean up markers if component remounts
    };
  }, [regions, continentFilter, searchQuery, selectedRegion, cleanestRegionCode]);

  // Center Map on Selected Region
  const handleSelectAndFlyTo = (reg: AWSZoneData) => {
    setSelectedRegion(reg);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([reg.lat, reg.lng], 4, { duration: 1.2 });
    }
  };

  // Fly to Cleanest Region
  const handleFlyToCleanest = () => {
    const cleanest = regions.find((r) => r.awsRegion === cleanestRegionCode);
    if (cleanest) {
      handleSelectAndFlyTo(cleanest);
    }
  };

  // Trigger Deployment Animation Path
  const handleSimulateDeployPath = () => {
    if (!selectedRegion || !mapInstanceRef.current) return;

    setAnimatingPath(true);
    setSimStep(1);

    const map = mapInstanceRef.current;

    if (polyRef.current) {
      polyRef.current.remove();
      polyRef.current = null;
    }

    const originLat = 37.7749;
    const originLng = -122.4194;
    const destLat = selectedRegion.lat;
    const destLng = selectedRegion.lng;

    const strokeColor =
      selectedRegion.carbonIntensity <= 250
        ? '#00FF41'
        : selectedRegion.carbonIntensity <= 500
        ? '#F59E0B'
        : '#EF4444';

    const poly = L.polyline(
      [
        [originLat, originLng],
        [destLat, destLng]
      ],
      {
        color: strokeColor,
        weight: 3,
        opacity: 0.9,
        className: 'animated-flow-line'
      }
    ).addTo(map);

    polyRef.current = poly;

    map.fitBounds(poly.getBounds(), { padding: [60, 60], maxZoom: 4 });

    setTimeout(() => setSimStep(2), 600);
    setTimeout(() => setSimStep(3), 1400);
    setTimeout(() => {
      setSimStep(4);
      setTimeout(() => {
        setAnimatingPath(false);
        setSimStep(0);
        if (polyRef.current) {
          polyRef.current.remove();
          polyRef.current = null;
        }
        if (onStartNewDeployment && selectedRegion) {
          onStartNewDeployment(selectedRegion.awsRegion);
        }
      }, 1200);
    }, 2200);
  };

  const cleanestRegionObj = regions.find((r) => r.awsRegion === cleanestRegionCode) || regions[0];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#0A0A0A] text-[#E0E0E0] overflow-hidden">
      {/* Top Header & Interactive Filter Bar */}
      <div className="bg-[#141414] border-b border-[#2A2A2A] p-4 flex flex-col md:flex-row justify-between items-center gap-4 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#00FF41]/10 text-[#00FF41] rounded-xl border border-[#00FF41]/30">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline font-bold text-base text-white">
                Interactive Global Carbon Map
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#00FF41]/10 text-[#00FF41] font-code text-[10px] font-bold border border-[#00FF41]/30">
                Electricity Maps Real-Time
              </span>
            </div>
            <p className="font-body text-xs text-[#A1A1AA]">
              Visual grid emission scores across AWS Cloud data center locations.
            </p>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
            <input
              type="text"
              placeholder="Search AWS region..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#1A1A1A] border border-[#2A2A2A] text-white placeholder-[#71717A] rounded-xl py-1.5 pl-8 pr-3 text-xs focus:border-[#00FF41] outline-none w-36 sm:w-48 font-code"
            />
          </div>

          {/* Continent Filter */}
          <div className="flex items-center gap-1 bg-[#1A1A1A] p-1 rounded-xl border border-[#2A2A2A] font-code text-[11px]">
            {['ALL', 'AMERICAS', 'EUROPE', 'APAC', 'MEA'].map((cont) => (
              <button
                key={cont}
                onClick={() => setContinentFilter(cont)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  continentFilter === cont
                    ? 'bg-[#00FF41] text-black font-bold shadow-xs'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                {cont}
              </button>
            ))}
          </div>

          {/* Cleanest Region Button */}
          <button
            onClick={handleFlyToCleanest}
            className="bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/40 font-code text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-[#00FF41]/20 flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cleanest Region: {cleanestRegionObj.awsRegion} ({cleanestRegionObj.carbonIntensity}g)</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#1A1A1A] p-1 rounded-xl border border-[#2A2A2A] font-code text-xs">
            <button
              onClick={() => setActiveViewMode('SPLIT')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeViewMode === 'SPLIT' ? 'bg-[#00FF41] text-black' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              Split
            </button>
            <button
              onClick={() => setActiveViewMode('MAP')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeViewMode === 'MAP' ? 'bg-[#00FF41] text-black' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              Map Only
            </button>
            <button
              onClick={() => setActiveViewMode('TABLE')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeViewMode === 'TABLE' ? 'bg-[#00FF41] text-black' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              Compare Table
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Workspace */}
      <div className="flex-grow flex relative overflow-hidden">
        {/* MAP CANVAS (Visible in MAP or SPLIT) */}
        {(activeViewMode === 'MAP' || activeViewMode === 'SPLIT') && (
          <div className="flex-grow relative h-full">
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Floating Map Style Selector */}
            <div className="absolute top-4 left-4 bg-[#141414]/95 backdrop-blur-md p-1.5 rounded-2xl border border-[#2A2A2A] shadow-2xl z-20 flex flex-wrap items-center gap-1 font-code text-xs">
              <div className="px-2.5 py-1 text-[10px] text-[#A1A1AA] uppercase font-bold flex items-center gap-1.5 border-r border-[#2A2A2A]">
                <Layers className="w-3.5 h-3.5 text-[#00FF41]" />
                <span>Map Layer:</span>
              </div>
              <button
                onClick={() => setMapStyle('VOYAGER')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  mapStyle === 'VOYAGER'
                    ? 'bg-[#00FF41] text-black shadow-xs'
                    : 'text-[#E0E0E0] hover:text-white hover:bg-[#2A2A2A]'
                }`}
              >
                <span>🗺️</span>
                <span>Real World</span>
              </button>
              <button
                onClick={() => setMapStyle('SATELLITE')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  mapStyle === 'SATELLITE'
                    ? 'bg-[#00FF41] text-black shadow-xs'
                    : 'text-[#E0E0E0] hover:text-white hover:bg-[#2A2A2A]'
                }`}
              >
                <span>🛰️</span>
                <span>Satellite</span>
              </button>
              <button
                onClick={() => setMapStyle('STREET')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  mapStyle === 'STREET'
                    ? 'bg-[#00FF41] text-black shadow-xs'
                    : 'text-[#E0E0E0] hover:text-white hover:bg-[#2A2A2A]'
                }`}
              >
                <span>🏙️</span>
                <span>OpenStreetMap</span>
              </button>
              <button
                onClick={() => setMapStyle('TOPOGRAPHIC')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  mapStyle === 'TOPOGRAPHIC'
                    ? 'bg-[#00FF41] text-black shadow-xs'
                    : 'text-[#E0E0E0] hover:text-white hover:bg-[#2A2A2A]'
                }`}
              >
                <span>🏔️</span>
                <span>Terrain</span>
              </button>
            </div>

            {/* Floating Legend Overlay */}
            <div className="absolute bottom-6 left-6 bg-[#141414]/90 backdrop-blur-md p-4 rounded-2xl border border-[#2A2A2A] shadow-xl z-20 min-w-[220px]">
              <h3 className="font-code text-xs font-bold mb-2 text-white">
                Grid Carbon Intensity
              </h3>
              <div className="space-y-1.5 font-body text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#00FF41] border border-black shadow-xs"></span>
                  <span className="text-[#E0E0E0] font-code">🟢 ≤ 250 gCO₂ (Optimal - Deploy)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#F59E0B] border border-black shadow-xs"></span>
                  <span className="text-[#E0E0E0] font-code">🟡 251 - 500 gCO₂ (Moderate)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#EF4444] border border-black shadow-xs"></span>
                  <span className="text-[#E0E0E0] font-code">🔴 &gt; 500 gCO₂ (Queue in SQS)</span>
                </div>
              </div>
            </div>

            {/* Deployment Flow Simulation Animation Overlay HUD */}
            {animatingPath && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-[#141414]/95 border border-[#00FF41] text-white px-6 py-4 rounded-2xl shadow-2xl z-30 flex flex-col gap-2 font-code text-xs min-w-[320px] max-w-[500px] backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-ping" />
                    <span className="text-[#00FF41] font-bold uppercase tracking-wider text-[11px]">
                      Energy-Aware Trajectory Active
                    </span>
                  </div>
                  <span className="text-[10px] text-[#A1A1AA]">Step {simStep}/4</span>
                </div>

                <div className="space-y-1.5 mt-1 text-[11px]">
                  <div className={`flex items-center gap-2 ${simStep >= 1 ? 'text-[#00FF41]' : 'text-[#52525B]'}`}>
                    <span>{simStep > 1 ? '✓' : '⚡'}</span>
                    <span>1. GitHub Commit Event & Webhook Triggered</span>
                  </div>
                  <div className={`flex items-center gap-2 ${simStep >= 2 ? 'text-[#00FF41]' : 'text-[#52525B]'}`}>
                    <span>{simStep > 2 ? '✓' : '⚡'}</span>
                    <span>2. Electricity Maps API Querying Grid Intensity ({selectedRegion?.carbonIntensity} gCO₂/kWh)</span>
                  </div>
                  <div className={`flex items-center gap-2 ${simStep >= 3 ? 'text-[#00FF41]' : 'text-[#52525B]'}`}>
                    <span>{simStep > 3 ? '✓' : '⚡'}</span>
                    <span>3. Energy Flight Path Directed ➔ {selectedRegion?.awsRegion} ({selectedRegion?.regionName})</span>
                  </div>
                  <div className={`flex items-center gap-2 ${simStep >= 4 ? 'text-[#00FF41] font-bold' : 'text-[#52525B]'}`}>
                    <span>{simStep === 4 ? '🎉' : '⏳'}</span>
                    <span>4. Deployment Dispatched Safely!</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SIDE PANEL (Region Details & Actions) */}
        {selectedRegion && (
          <aside className="w-full md:w-96 bg-[#141414] border-l border-[#2A2A2A] p-6 flex flex-col justify-between overflow-y-auto z-20 shadow-2xl">
            <div className="space-y-6">
              {/* Region Header */}
              <div className="flex justify-between items-start border-b border-[#2A2A2A] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-code text-[11px] font-bold text-[#00FF41] uppercase">
                      SELECTED REGION
                    </span>
                    {selectedRegion.awsRegion === cleanestRegionCode && (
                      <span className="px-2 py-0.5 rounded bg-[#00FF41]/20 text-[#00FF41] font-code text-[9px] font-extrabold border border-[#00FF41]/40">
                        👑 GLOBAL CLEANEST
                      </span>
                    )}
                  </div>
                  <h3 className="font-headline font-bold text-xl text-white">
                    {selectedRegion.regionName}
                  </h3>
                  <span className="font-code text-xs text-[#A1A1AA]">
                    AWS Code: <b className="text-white">{selectedRegion.awsRegion}</b> ({selectedRegion.zoneKey})
                  </span>
                </div>
              </div>

              {/* Status Badge Banner */}
              <div
                className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                  selectedRegion.carbonIntensity <= 250
                    ? 'bg-[#00FF41]/10 border-[#00FF41]/40 text-[#00FF41]'
                    : selectedRegion.carbonIntensity <= 500
                    ? 'bg-[#F59E0B]/10 border-[#F59E0B]/40 text-[#F59E0B]'
                    : 'bg-[#EF4444]/10 border-[#EF4444]/40 text-[#EF4444]'
                }`}
              >
                {selectedRegion.carbonIntensity <= 250 ? (
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                ) : selectedRegion.carbonIntensity <= 500 ? (
                  <Clock className="w-6 h-6 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                )}
                <div>
                  <h4 className="font-headline font-bold text-sm">
                    {selectedRegion.carbonIntensity <= 250
                      ? 'Deployment Recommended'
                      : selectedRegion.carbonIntensity <= 500
                      ? 'Moderate Grid Intensity'
                      : 'Queue Required in SQS'}
                  </h4>
                  <p className="font-body text-xs opacity-80 mt-0.5">
                    {selectedRegion.carbonIntensity <= 250
                      ? 'Low emissions grid. Perfect window for CI/CD runs.'
                      : selectedRegion.carbonIntensity <= 500
                      ? 'Acceptable for critical builds, or consider waiting ~14 mins.'
                      : 'Exceeds target 250 gCO2/kWh threshold. Hold in Amazon SQS.'}
                  </p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1A1A1A] p-3.5 rounded-xl border border-[#2A2A2A]">
                  <span className="font-code text-[10px] text-[#A1A1AA] uppercase block mb-1">
                    Carbon Intensity
                  </span>
                  <span className="font-headline text-xl font-bold text-white block">
                    {selectedRegion.carbonIntensity} <span className="text-xs font-normal text-[#A1A1AA]">gCO₂/kWh</span>
                  </span>
                  <span className="font-code text-[10px] text-[#00FF41] mt-1 block">
                    Target ≤ 250 gCO2
                  </span>
                </div>

                <div className="bg-[#1A1A1A] p-3.5 rounded-xl border border-[#2A2A2A]">
                  <span className="font-code text-[10px] text-[#A1A1AA] uppercase block mb-1">
                    Renewable Energy
                  </span>
                  <span className="font-headline text-xl font-bold text-[#00FF41] block">
                    {selectedRegion.renewablePct}% Clean
                  </span>
                  <span className="font-code text-[10px] text-[#A1A1AA] mt-1 block">
                    Grid Score: {selectedRegion.gridScore}/100
                  </span>
                </div>
              </div>

              {/* 24-Hour Forecast Curve */}
              <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#2A2A2A] space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-code font-bold text-white">24H Carbon Forecast Curve</span>
                  <span className="font-code text-[10px] text-[#00FF41]">Live Electricity Maps</span>
                </div>

                <div className="h-24 flex items-end gap-1 pt-2 px-1">
                  {selectedRegion.forecast24h.map((val, idx) => (
                    <div
                      key={idx}
                      className="flex-1 bg-[#00FF41]/60 hover:bg-[#00FF41] rounded-t-xs transition-all relative group"
                      style={{ height: `${Math.min(100, Math.max(15, (val / 800) * 100))}%` }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-[#00FF41] font-code text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        {val}g
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between text-[10px] font-code text-[#A1A1AA]">
                  <span>-12h</span>
                  <span>Now</span>
                  <span>+12h</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={handleSimulateDeployPath}
                  disabled={animatingPath}
                  className="w-full py-3 bg-[#00FF41] text-black rounded-xl font-headline font-bold text-xs hover:bg-[#00e038] transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>{animatingPath ? 'Simulating Pipeline...' : `Deploy Here to ${selectedRegion.awsRegion}`}</span>
                </button>

                <button
                  onClick={() => onOpenAiOptimize()}
                  className="w-full py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-xl font-headline font-semibold text-xs hover:bg-[#222222] transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#00FF41]" />
                  <span>Ask Gemini AI for Routing Optimization</span>
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* COMPARISON TABLE VIEW (Visible in TABLE or SPLIT bottom) */}
        {activeViewMode === 'TABLE' && (
          <div className="w-full h-full bg-[#0A0A0A] p-6 overflow-y-auto">
            <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-headline font-bold text-lg text-white">
                    AWS Regions Carbon Comparison Table
                  </h3>
                  <p className="font-body text-xs text-[#A1A1AA]">
                    Sorted by lowest carbon intensity (cleanest regions top).
                  </p>
                </div>
                <span className="font-code text-xs text-[#00FF41] font-bold">
                  {regions.length} AWS Regions Listed
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#1A1A1A] text-[#A1A1AA] font-code text-xs uppercase border-b border-[#2A2A2A]">
                      <th className="p-3 font-bold">AWS Region</th>
                      <th className="p-3 font-bold">Location</th>
                      <th className="p-3 font-bold">Carbon Intensity</th>
                      <th className="p-3 font-bold">Renewable %</th>
                      <th className="p-3 font-bold">Grid Score</th>
                      <th className="p-3 font-bold">Status</th>
                      <th className="p-3 font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A2A2A] font-body text-xs">
                    {[...regions]
                      .sort((a, b) => a.carbonIntensity - b.carbonIntensity)
                      .map((r) => {
                        const isCleanest = r.awsRegion === cleanestRegionCode;
                        const isGreen = r.carbonIntensity <= 250;
                        const isModerate = r.carbonIntensity > 250 && r.carbonIntensity <= 500;

                        return (
                          <tr key={r.awsRegion} className="hover:bg-[#1A1A1A]/60 transition-colors">
                            <td className="p-3 font-code font-bold text-white flex items-center gap-2">
                              <span>{r.awsRegion}</span>
                              {isCleanest && (
                                <span className="px-1.5 py-0.5 rounded bg-[#00FF41]/20 text-[#00FF41] text-[9px] font-extrabold border border-[#00FF41]/40">
                                  👑 BEST CHOICE
                                </span>
                              )}
                            </td>
                            <td className="p-3 font-semibold text-[#E0E0E0]">{r.regionName}</td>
                            <td className="p-3 font-code font-bold text-white">
                              {r.carbonIntensity} <span className="text-[10px] text-[#A1A1AA]">gCO₂/kWh</span>
                            </td>
                            <td className="p-3 font-code font-bold text-[#00FF41]">
                              {r.renewablePct}%
                            </td>
                            <td className="p-3 font-code text-white">{r.gridScore}/100</td>
                            <td className="p-3">
                              <span
                                className={`px-2.5 py-1 rounded-full font-code text-[10px] font-bold border ${
                                  isGreen
                                    ? 'bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30'
                                    : isModerate
                                    ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
                                    : 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30'
                                }`}
                              >
                                {isGreen ? '🟢 Deploy' : isModerate ? '🟡 Consider Waiting' : '🔴 Queue in SQS'}
                              </span>
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => handleSelectAndFlyTo(r)}
                                className="px-3 py-1 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white rounded-lg font-code text-xs font-bold transition-all border border-[#2A2A2A]"
                              >
                                Select & View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

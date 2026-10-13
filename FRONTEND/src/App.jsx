import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Globe, 
  CloudRain, 
  Bell, 
  Map, 
  FileText, 
  Layers, 
  Settings, 
  ShieldAlert, 
  PhoneCall, 
  Download, 
  AlertTriangle,
  Database,
  CheckCircle2,
  Phone
} from 'lucide-react';
import { WeatherProvider, useWeather } from './context/WeatherContext';
import TopNavbar, { INDIAN_LOCATIONS } from './components/TopNavbar';
import SimulationDrillBar from './components/SimulationDrillBar';
import ShelterNavigator from './components/ShelterNavigator';
import SitrepModal from './components/SitrepModal';
import AlertBannerRow from './components/AlertBannerRow';
import IndiaDisasterMap from './components/IndiaDisasterMap';
import ActiveAlertsList from './components/ActiveAlertsList';
import EmergencyModeCard from './components/EmergencyModeCard';
import QuickActionsCard from './components/QuickActionsCard';
import CurrentWeatherCard from './components/CurrentWeatherCard';
import ForecastCard from './components/ForecastCard';
import RiskLevelCard from './components/RiskLevelCard';
import RecentAlertsTimeline from './components/RecentAlertsTimeline';
import SafetyInstructionsModal from './components/SafetyInstructionsModal';
import IncidentReportModal from './components/IncidentReportModal';
import AuthModal from './components/AuthModal';
import AuthPage from './components/AuthPage';
import MobileBottomNav from './components/MobileBottomNav';
import MultilingualAlertAI from './components/MultilingualAlertAI';
import WallpaperSelector, { WALLPAPER_PRESETS } from './components/WallpaperSelector';
import { 
  fetchRandomPexelsWallpaper, 
  isPexelsAutoRefreshEnabled, 
  setPexelsAutoRefreshEnabled,
  getCachedFallbackWallpaper 
} from './services/pexelsService';
import { sound } from './utils/audioSynth';
import ContactActionModal from './components/ContactActionModal';
import { notificationService } from './utils/notificationService';
import { openDeviceSms, openWhatsAppChat } from './utils/directDispatch';
import { MessageSquare, X as CloseIcon, Smartphone, BellRing } from 'lucide-react';

export default function App() {
  const [currentLocation, setCurrentLocation] = useState(INDIAN_LOCATIONS[0]); // Bhubaneswar, Odisha
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'multilingual' | 'map' | 'alerts' | 'forecast' | 'reports' | 'resources' | 'settings'
  const [activeHazardFilter, setActiveHazardFilter] = useState(null); // 'cyclone' | 'flood' | etc.

  const [contactModalState, setContactModalState] = useState({
    isOpen: false,
    contact: null,
    defaultMessage: ''
  });
  const [activeBroadcastToast, setActiveBroadcastToast] = useState(null);

  useEffect(() => {
    const handleOpenContact = (e) => {
      if (e.detail?.contact) {
        setContactModalState({
          isOpen: true,
          contact: e.detail.contact,
          defaultMessage: e.detail.defaultMessage || ''
        });
      }
    };

    const handleBroadcastEvent = (e) => {
      if (e.detail) {
        setActiveBroadcastToast(e.detail);
      }
    };

    window.addEventListener('resona-open-contact-modal', handleOpenContact);
    window.addEventListener('resona-emergency-broadcast', handleBroadcastEvent);
    return () => {
      window.removeEventListener('resona-open-contact-modal', handleOpenContact);
      window.removeEventListener('resona-emergency-broadcast', handleBroadcastEvent);
    };
  }, []);
  
  // Dynamic Pexels Auto-Refresh State
  const [isAutoRefresh, setIsAutoRefresh] = useState(isPexelsAutoRefreshEnabled);

  // Atmospheric Wallpaper State - Always ensure a valid photographic wallpaper is active
  const [currentBg, setCurrentBg] = useState(() => {
    try {
      const saved = localStorage.getItem('resona_dashboard_bg');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.url && parsed.url.trim().length > 0) {
          return parsed;
        }
      }
      return getCachedFallbackWallpaper();
    } catch {
      return getCachedFallbackWallpaper();
    }
  });

  const [bgOpacity, setBgOpacity] = useState(() => {
    try {
      const saved = localStorage.getItem('resona_bg_opacity');
      const parsed = saved ? parseFloat(saved) : 0.35;
      return parsed > 0.6 ? 0.35 : parsed;
    } catch {
      return 0.35;
    }
  });

  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);

  // AUTOMATIC DYNAMIC PEXELS ROTATION:
  // Every time the user opens the website or refreshes (F5), automatically fetch a fresh Pexels storm photo
  useEffect(() => {
    let isMounted = true;
    fetchRandomPexelsWallpaper().then((newBg) => {
      if (isMounted && newBg && newBg.url) {
        setCurrentBg(newBg);
        try {
          localStorage.setItem('resona_dashboard_bg', JSON.stringify(newBg));
        } catch {}
      }
    });
    return () => { isMounted = false; };
  }, []);

  const handleSelectBg = (bg) => {
    setCurrentBg(bg);
    try {
      localStorage.setItem('resona_dashboard_bg', JSON.stringify(bg));
    } catch {}
  };

  const handleShuffleWallpaper = async () => {
    try {
      const newBg = await fetchRandomPexelsWallpaper();
      if (newBg && newBg.url) {
        setCurrentBg(newBg);
        try {
          localStorage.setItem('resona_dashboard_bg', JSON.stringify(newBg));
        } catch {}
        return newBg;
      }
    } catch (err) {
      console.warn('Error shuffling wallpaper:', err);
    }
  };

  const handleToggleAutoRefresh = (enabled) => {
    setIsAutoRefresh(enabled);
    setPexelsAutoRefreshEnabled(enabled);
  };

  const handleChangeOpacity = (val) => {
    setBgOpacity(val);
    try {
      localStorage.setItem('resona_bg_opacity', val.toString());
    } catch {}
  };

  // Modals state
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSitrepModalOpen, setIsSitrepModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [emergencyModeActive, setEmergencyModeActive] = useState(true);

  // Quick actions handlers
  const handleOpenAuth = (mode = 'login') => {
    sound.playBlip();
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleOpenSafety = () => {
    sound.playBlip();
    setIsSafetyModalOpen(true);
  };

  const handleOpenReport = () => {
    sound.playBlip();
    setIsReportModalOpen(true);
  };

  const handleDownloadAlerts = () => {
    sound.playSuccessChime();
    setIsSitrepModalOpen(true);
  };

  const handleShareLocation = () => {
    sound.playBlip();
    if (navigator.share) {
      navigator.share({
        title: `Disaster Alert: ${currentLocation.city}, ${currentLocation.state}`,
        text: `Severe weather alert active for ${currentLocation.city}. Risk Level: ${currentLocation.risk}.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `Disaster Alert for ${currentLocation.city}, ${currentLocation.state}: Emergency situation active. Check https://weatheralert.gov.in`
      );
      alert('Location Emergency Alert link copied to clipboard!');
    }
  };

  return (
    <WeatherProvider city={currentLocation.city} onCityChange={setCurrentLocation}>
      <div className="min-h-screen text-stone-100 flex flex-col font-sans selection:bg-[#4ade80]/30 selection:text-[#4ade80] relative overflow-x-hidden bg-[#141916]">
        
        {/* Dynamic High-Resolution Wallpaper Background Layer */}
        {currentBg?.url && (
          <div 
            key={currentBg.url}
            className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 pointer-events-none z-0 scale-100 animate-in fade-in opacity-40"
            style={{ backgroundImage: `url("${currentBg.url}")` }}
          />
        )}

        {/* Dynamic Atmospheric Tint Overlay */}
        {currentBg?.url && (
          <div 
            className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-500"
            style={{ 
              background: 'linear-gradient(180deg, rgba(20, 25, 22, 0.45) 0%, rgba(20, 25, 22, 0.82) 100%)',
              backdropFilter: 'blur(1px)'
            }}
          />
        )}

        {/* Ambient Botanical Gradient Mesh Motion Behind All Panels */}
        <div className="aurora-mesh-bg">
          <div className="aurora-orb-cyan" />
          <div className="aurora-orb-indigo" />
          <div className="aurora-orb-rose" />
        </div>

        {/* Interactive App Content Layer (z-10 on top of wallpaper) */}
        <div className="relative z-10 flex flex-col min-h-screen">

        {/* 1. Top Modern Disaster Command Navbar */}
        <TopNavbar
          activeTab={activeTab}
          onSelectTab={(tabId) => {
            sound.playBlip();
            setActiveTab(tabId);
          }}
          currentLocation={currentLocation}
          onSelectLocation={(loc) => {
            sound.playBlip();
            setCurrentLocation(loc);
          }}
          onOpenSafetyModal={handleOpenSafety}
          onOpenAuthModal={handleOpenAuth}
          onNavigateToAuth={() => {
            sound.playBlip();
            setActiveTab('auth');
          }}
          onOpenWallpaperModal={() => {
            sound.playBlip();
            setIsWallpaperModalOpen(true);
          }}
          onShuffleWallpaper={handleShuffleWallpaper}
          emergencyModeActive={emergencyModeActive}
          onToggleEmergencyMode={() => setEmergencyModeActive(!emergencyModeActive)}
        />

        {/* 1.1 Interactive Disaster Drill Simulation Bar */}
        <SimulationDrillBarContainer />

        {/* 2. Main Dashboard Content Canvas (Full Width) */}
        <div className="flex-1 w-full max-w-[1720px] mx-auto">
          {/* Main Dashboard Workspace (Driven by Tab Navigation) */}
          <main className="w-full p-3.5 sm:p-5 lg:p-6 space-y-4 lg:space-y-5 overflow-x-hidden pb-20 md:pb-6">
            
            {/* VIEW 1: MAIN DASHBOARD (Only Map & Live Feed Cockpit, Clean & Uncluttered) */}
            {activeTab === 'dashboard' && (
              <div className="space-y-4 animate-page-enter">
                
                {/* Top Hazard Alert Banner (Hero Card for Active Emergency + Slim Status Strip for Inactive) */}
                <section>
                  <AlertBannerRow
                    currentLocation={currentLocation}
                    activeFilter={activeHazardFilter}
                    onSelectFilter={(cat) => {
                      sound.playBlip();
                      setActiveHazardFilter(cat);
                    }}
                  />
                </section>

                {/* Central Map & Live Feed Cockpit (8 cols Map + 4 cols Feed & Actions) */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  
                  {/* Dominant Mapbox Web-GIS Centerpiece */}
                  <div className="lg:col-span-12 xl:col-span-8">
                    <IndiaDisasterMap
                      currentLocation={currentLocation}
                      onSelectAlertZone={(zone) => sound.playBlip()}
                      onSelectLocation={(loc) => {
                        sound.playBlip();
                        setCurrentLocation(loc);
                      }}
                    />
                  </div>

                  {/* Docked Live Operations Column */}
                  <div className="lg:col-span-12 xl:col-span-4 flex flex-col">
                    {/* Live Hazard Feed */}
                    <ActiveAlertsList
                      currentLocation={currentLocation}
                      activeFilter={activeHazardFilter}
                      onSelectAlert={(alert) => handleOpenSafety()}
                      onOpenSafety={handleOpenSafety}
                      onExplainInLanguage={() => setActiveTab('multilingual')}
                    />
                  </div>

                </section>

              </div>
            )}

            {/* VIEW 2: VERNACULAR AI ALERT ENGINE */}
            {activeTab === 'multilingual' && (
              <div className="space-y-4 animate-page-enter">
                <MultilingualAlertAI
                  currentLocation={currentLocation}
                  activeHazard={activeHazardFilter || 'cyclone'}
                  severity={currentLocation.risk === 'Very High' ? 'Extreme' : currentLocation.risk === 'High' ? 'Severe' : 'Moderate'}
                  onOpenAuthModal={handleOpenAuth}
                  onOpenReportModal={handleOpenReport}
                  onReturnToDashboard={() => {
                    sound.playBlip();
                    setActiveTab('dashboard');
                  }}
                />
              </div>
            )}

            {/* VIEW 3: LIVE MAP (FULL-WIDTH IMMERSIVE) */}
            {activeTab === 'map' && (
              <div className="space-y-5 animate-page-enter">
                <div className="p-5 sm:p-6 rounded-3xl bg-[#141915]/85 border border-white/[0.08] backdrop-blur-xl flex items-center justify-between flex-wrap gap-4 shadow-xl">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#4ade80] block mb-1 font-sans">
                      Geospatial Surveillance
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-normal flex items-center gap-2.5 font-sans">
                      <Map className="w-5 h-5 text-[#4ade80] stroke-[1.8]" />
                      <span>Live Interactive Geospatial Map</span>
                    </h2>
                    <p className="text-xs text-stone-300 mt-1 font-sans">
                      Live weather observations, rain zones, and monitored oceanic storm tracks across India and the Indian Ocean.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-xs font-semibold text-stone-200 transition-all flex items-center gap-2 border border-white/10 cursor-pointer shadow-sm hover:scale-105"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-stone-300" /> Return to Dashboard
                  </button>
                </div>

                <div className="w-full h-[740px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                  <IndiaDisasterMap
                    currentLocation={currentLocation}
                    onSelectAlertZone={(zone) => sound.playBlip()}
                    onSelectLocation={(loc) => {
                      sound.playBlip();
                      setCurrentLocation(loc);
                    }}
                  />
                </div>
              </div>
            )}

            {/* VIEW 4: ALERTS & THREAT ASSESSMENT CENTER */}
            {activeTab === 'alerts' && (
              <div className="space-y-5 animate-page-enter">
                <div className="p-5 sm:p-6 rounded-3xl bg-[#141915]/85 border border-white/[0.08] backdrop-blur-xl flex items-center justify-between flex-wrap gap-4 shadow-xl">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1 font-sans">
                      Early Warning Command
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-normal flex items-center gap-2.5 font-sans">
                      <Bell className="w-5 h-5 text-amber-400 stroke-[1.8]" />
                      <span>Alerts & Regional Threat Assessment</span>
                    </h2>
                    <p className="text-xs text-stone-300 mt-1 font-sans">
                      Verified meteorological warnings, oceanic storm tracking, and plain-language community guidance.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-xs font-semibold text-stone-200 transition-all flex items-center gap-2 border border-white/10 cursor-pointer shadow-sm hover:scale-105"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-stone-300" /> Return to Dashboard
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  <div className="lg:col-span-7">
                    <ActiveAlertsList
                      currentLocation={currentLocation}
                      activeFilter={activeHazardFilter}
                      onSelectAlert={(alert) => handleOpenSafety()}
                      onOpenSafety={handleOpenSafety}
                      onExplainInLanguage={() => setActiveTab('multilingual')}
                    />
                  </div>
                  <div className="lg:col-span-5 flex flex-col gap-5">
                    <RiskLevelCard />
                    <RecentAlertsTimeline onSelectAlert={(a) => handleOpenSafety()} />
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 5: FORECAST & METEOROLOGICAL INTELLIGENCE */}
            {activeTab === 'forecast' && (
              <div className="space-y-5 animate-page-enter">
                <div className="p-5 sm:p-6 rounded-3xl bg-[#141915]/85 border border-white/[0.08] backdrop-blur-xl flex items-center justify-between flex-wrap gap-4 shadow-xl">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#4ade80] block mb-1 font-sans">
                      Telemetry & Radar
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-normal flex items-center gap-2.5 font-sans">
                      <CloudRain className="w-5 h-5 text-[#4ade80] stroke-[1.8]" />
                      <span>Meteorological Intelligence & 5-Day Outlook</span>
                    </h2>
                    <p className="text-xs text-stone-300 mt-1 font-sans">
                      Atmospheric observations, barometric trends, and multi-day telemetry for {currentLocation.city}, {currentLocation.state}.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-xs font-semibold text-stone-200 transition-all flex items-center gap-2 border border-white/10 cursor-pointer shadow-sm hover:scale-105"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-stone-300" /> Return to Dashboard
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <CurrentWeatherCard location={currentLocation} />
                  <ForecastCard />
                </div>
              </div>
            )}

            {/* VIEW 6: DISASTER REPORTS */}
            {activeTab === 'reports' && (
              <div className="space-y-5 animate-page-enter">
                <div className="p-5 sm:p-6 rounded-3xl bg-[#141915]/85 border border-white/[0.08] backdrop-blur-xl flex items-center justify-between flex-wrap gap-4 shadow-xl">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#4ade80] block mb-1 font-sans">
                      Last-Mile Coordination
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-normal flex items-center gap-2.5 font-sans">
                      <FileText className="w-5 h-5 text-[#4ade80] stroke-[1.8]" />
                      <span>Citizen Reports & Rapid Response Dispatch</span>
                    </h2>
                    <p className="text-xs text-stone-300 mt-1 font-sans">
                      Report ground obstacles, request medical or elder assistance, or generate certified situation reports.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-xs font-semibold text-stone-200 transition-all flex items-center gap-2 border border-white/10 cursor-pointer shadow-sm hover:scale-105"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-stone-300" /> Return to Dashboard
                  </button>
                </div>

                {/* Signature Bento Grid Matching Reference GIF Style */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  
                  {/* Signature Light Stone Card (Directly from Reference GIF) */}
                  <div className="bento-stone-card p-6 flex flex-col justify-between min-h-[260px] relative overflow-hidden group">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block mb-1 font-sans">
                        About • Ground Hazard
                      </span>
                      <h3 className="text-lg font-bold text-stone-900 leading-snug font-sans">
                        Report Issue or Ask Urgent Help
                      </h3>
                      <p className="text-xs text-stone-700 mt-2.5 leading-relaxed font-sans">
                        Share geo-located ground observations such as waterlogged roads, fallen electricity poles, or elder distress directly with verified field responders.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-5 mt-auto border-t border-stone-300/60">
                      <button
                        onClick={handleOpenReport}
                        className="px-4 py-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-transform hover:scale-105 cursor-pointer shadow-md"
                      >
                        Submit Citizen Report
                      </button>
                      <button
                        onClick={handleOpenReport}
                        className="w-9 h-9 rounded-full bg-white text-stone-950 flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer"
                        title="Submit Incident"
                      >
                        <AlertTriangle className="w-4 h-4 text-amber-600 stroke-[2.2]" />
                      </button>
                    </div>
                  </div>

                  {/* Frosted Bento Glass Card 2: SITREP Generator */}
                  <div className="bento-glass-card p-6 flex flex-col justify-between min-h-[260px] relative overflow-hidden group">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#4ade80] block mb-1 font-sans">
                        Official Export
                      </span>
                      <h3 className="text-lg font-bold text-white leading-snug font-sans">
                        Official Situation Report (SITREP)
                      </h3>
                      <p className="text-xs text-stone-300 mt-2.5 leading-relaxed font-sans">
                        Generate and export an official NDMA-standard disaster briefing with live meteorological telemetry, shelter status, and dispatch logs.
                      </p>
                    </div>

                    <div className="pt-5 mt-auto border-t border-white/[0.08]">
                      <button
                        onClick={handleDownloadAlerts}
                        className="w-full py-2.5 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        <Download className="w-4 h-4 text-[#4ade80] stroke-[1.8]" /> Export Verified SITREP Briefing
                      </button>
                    </div>
                  </div>

                  {/* Frosted Bento Glass Card 3: Emergency Protocol */}
                  <div className="bento-glass-card p-6 flex flex-col justify-between min-h-[260px] relative overflow-hidden group">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1 font-sans">
                        Verified Guidelines
                      </span>
                      <h3 className="text-lg font-bold text-white leading-snug font-sans">
                        Emergency Safety Guide & Evacuation
                      </h3>
                      <p className="text-xs text-stone-300 mt-2.5 leading-relaxed font-sans">
                        Review NDMA and Odisha Disaster Management safety guidelines, evacuation steps, cyclone safe points, and family kits.
                      </p>
                    </div>

                    <div className="pt-5 mt-auto border-t border-white/[0.08]">
                      <button
                        onClick={handleOpenSafety}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#4ade80]/15 hover:bg-[#4ade80]/25 border border-[#4ade80]/30 text-[#4ade80] font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        <ShieldAlert className="w-4 h-4 stroke-[1.8]" /> View Verified Instructions
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* VIEW 7: RESOURCES & SHELTERS */}
            {activeTab === 'resources' && (
              <div className="space-y-5 animate-page-enter">
                <div className="p-5 sm:p-6 rounded-3xl bg-[#141915]/85 border border-white/[0.08] backdrop-blur-xl flex items-center justify-between flex-wrap gap-4 shadow-xl">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#4ade80] block mb-1 font-sans">
                      Safe Evacuation Logistics
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-normal flex items-center gap-2.5 font-sans">
                      <Layers className="w-5 h-5 text-[#4ade80] stroke-[1.8]" />
                      <span>Shelters & Safe Evacuation Corridors</span>
                    </h2>
                    <p className="text-xs text-stone-300 mt-1 font-sans">
                      Certified high-elevation cyclone complexes, real-time occupancy gauges, emergency supplies, and turn-by-turn safe routes.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-xs font-semibold text-stone-200 transition-all flex items-center gap-2 border border-white/10 cursor-pointer shadow-sm hover:scale-105"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-stone-300" /> Return to Dashboard
                  </button>
                </div>

                {/* Dynamic Shelter Navigator Component */}
                <ShelterNavigator 
                  currentCity={currentLocation.city} 
                  currentState={currentLocation.state}
                  coordinates={{ lat: currentLocation.lat, lon: currentLocation.lon }}
                />

                {/* National Emergency Helplines (24x7) Styled as Calming Obsidian & Sage Grid */}
                <div className="p-6 rounded-[28px] bg-gradient-to-r from-[#111622]/95 via-[#10141e]/95 to-[#131926]/95 border border-white/[0.08] space-y-4 shadow-xl backdrop-blur-xl relative overflow-hidden font-sans">
                  {/* Soft Background Reassurance Glow */}
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

                  <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.07] relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm shrink-0">
                        <PhoneCall className="w-4 h-4 stroke-[1.8]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white font-sans tracking-tight">
                          National Emergency Disaster Helplines (24x7 Toll-Free)
                        </h3>
                        <p className="text-[11px] text-stone-300 font-sans">
                          Direct phone connection to verified national, state, and rescue operators
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-sans flex items-center gap-1.5 shadow-sm shrink-0">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                      </span>
                      <span>Active 24x7</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-sans relative z-10">
                    {[
                      { label: 'Immediate Help (Police, Fire, Ambulance)', num: '112', desc: 'All-in-One National Emergency Desk' },
                      { label: 'NDMA Central Control Room', num: '1070', desc: 'National Disaster Management Toll-Free' },
                      { label: 'NDRF Disaster Response Force', num: '1078', desc: 'Emergency Search & Rescue Dispatch' },
                      { label: 'Medical Emergency & Trauma', num: '108', desc: 'Government Ambulance Dispatch' },
                      { label: 'State EOC Control Helpline', num: '1077', desc: 'State Emergency Operations Room' },
                      { label: 'Indian Coast Guard SAR', num: '1554', desc: 'Maritime & Coastal Water Rescue' }
                    ].map((h) => (
                      <div 
                        key={h.num} 
                        className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-emerald-500/30 transition-all duration-200 flex items-center justify-between group shadow-sm hover:-translate-y-0.5"
                      >
                        <div className="pr-2">
                          <span className="font-semibold text-white block text-xs leading-snug">{h.label}</span>
                          <span className="text-[11px] text-stone-400 mt-0.5 block">{h.desc}</span>
                        </div>
                        <a 
                          href={`tel:${h.num}`} 
                          onClick={() => sound?.playBlip?.()}
                          className="text-emerald-300 hover:text-emerald-200 font-bold text-sm bg-emerald-500/15 hover:bg-emerald-500/25 px-3 py-1.5 rounded-xl border border-emerald-500/30 font-mono transition-all shrink-0 shadow-sm flex items-center gap-1.5 hover:scale-105 active:scale-95 cursor-pointer"
                          title={`Tap to call ${h.label} (${h.num})`}
                        >
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>{h.num}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 8: SETTINGS & SYSTEM PREFERENCES */}
            {activeTab === 'settings' && (
              <div className="space-y-5 animate-page-enter">
                <div className="p-5 sm:p-6 rounded-3xl bg-[#141915]/85 border border-white/[0.08] backdrop-blur-xl flex items-center justify-between flex-wrap gap-4 shadow-xl">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1 font-sans">
                      Platform Preferences
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-normal flex items-center gap-2.5 font-sans">
                      <Settings className="w-5 h-5 text-stone-400 stroke-[1.8]" />
                      <span>Settings & Atmospheric Preferences</span>
                    </h2>
                    <p className="text-xs text-stone-300 mt-1 font-sans">
                      Photographic wallpaper rotation, acoustic telemetry alerts, and encrypted personnel registry.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-xs font-semibold text-stone-200 transition-all flex items-center gap-2 border border-white/10 cursor-pointer shadow-sm hover:scale-105"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-stone-300" /> Return to Dashboard
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Signature Bento Stone Card: Atmosphere & Wallpaper Controller */}
                  <div className="bento-stone-card p-6 flex flex-col justify-between min-h-[220px] relative overflow-hidden">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block mb-1 font-sans">
                        Atmospheric Visuals
                      </span>
                      <h3 className="text-lg font-bold text-stone-900 font-sans">
                        Photographic Backdrop Control
                      </h3>
                      <p className="text-xs text-stone-700 mt-2 leading-relaxed font-sans">
                        Curated 4K Pexels storm and nature photography. Automatic dynamic rotation on every visit with adjustable atmospheric overlay opacity.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-5 mt-auto border-t border-stone-300/60">
                      <button
                        onClick={() => setIsWallpaperModalOpen(true)}
                        className="px-4 py-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-transform hover:scale-105 cursor-pointer shadow-md"
                      >
                        Adjust Atmosphere
                      </button>
                      <button
                        onClick={handleShuffleWallpaper}
                        className="px-3.5 py-2 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-900 font-semibold text-xs transition-colors cursor-pointer"
                        title="Shuffle Pexels Wallpaper"
                      >
                        Shuffle Now
                      </button>
                    </div>
                  </div>

                  {/* Bento Glass Card: Acoustic Synthesizer Test */}
                  <div className="bento-glass-card p-6 flex flex-col justify-between min-h-[220px] relative overflow-hidden">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#4ade80] block mb-1 font-sans">
                        Acoustic Warnings
                      </span>
                      <h3 className="text-lg font-bold text-white font-sans">
                        Sound Alert Synthesizer
                      </h3>
                      <p className="text-xs text-stone-300 mt-2 leading-relaxed font-sans">
                        Web Audio API synthesized multi-frequency alert tones engineered for high audibility in noisy outdoor environments without pre-recorded audio lag.
                      </p>
                    </div>

                    <div className="pt-5 mt-auto border-t border-white/[0.08] flex items-center justify-between">
                      <button
                        onClick={() => sound.playWarningTones()}
                        className="px-4 py-2 rounded-xl bg-[#4ade80]/15 hover:bg-[#4ade80]/25 border border-[#4ade80]/30 text-[#4ade80] font-semibold text-xs transition-all cursor-pointer"
                      >
                        Test Siren Tone
                      </button>
                      <button
                        onClick={() => sound.playChime()}
                        className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-stone-300 font-semibold text-xs transition-all cursor-pointer"
                      >
                        Test Chime
                      </button>
                    </div>
                  </div>

                  {/* Bento Glass Card: Encrypted Responder Registry */}
                  <div className="bento-glass-card p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white font-sans">Emergency Personnel Directory</span>
                      <span className="text-[11px] font-sans text-[#4ade80] bg-[#4ade80]/15 px-2.5 py-0.5 rounded-full border border-[#4ade80]/30 font-semibold">
                        Operational
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 font-sans leading-relaxed">
                      Encrypted registry of certified field responders, nodal coordinators, and relief volunteers.
                    </p>
                    <button
                      onClick={() => handleOpenAuth('database')}
                      className="text-xs text-[#4ade80] hover:underline font-semibold font-sans cursor-pointer flex items-center gap-1 pt-1"
                    >
                      View responder directory →
                    </button>
                  </div>

                  {/* Bento Glass Card: Telemetry API Feeds */}
                  <div className="bento-glass-card p-6 space-y-3">
                    <span className="text-xs font-bold text-white block font-sans">Telemetry API Feed Ingestion</span>
                    <ul className="text-xs text-stone-300 space-y-2 font-sans">
                      <li className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                        <span>NASA Earth Observatory (EONET v3):</span>
                        <span className="text-[#4ade80] font-semibold font-mono text-[11px]">Active live stream</span>
                      </li>
                      <li className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                        <span>OpenWeatherMap sensor network:</span>
                        <span className="text-[#4ade80] font-semibold font-mono text-[11px]">Real-time ingestion</span>
                      </li>
                    </ul>
                  </div>

                </div>
              </div>
            )}

            {/* VIEW 9: IDENTITY & ROLE PORTAL (CITIZEN VS VOLUNTEER) */}
            {activeTab === 'auth' && (
              <div className="animate-page-enter">
                <AuthPage
                  onNavigateToTab={(tab) => {
                    sound.playBlip();
                    setActiveTab(tab);
                  }}
                  onOpenSafety={handleOpenSafety}
                />
              </div>
            )}

          </main>

        </div>

        {/* 3. Mobile Navigation Bottom Bar */}
        <MobileBottomNav
          activeTab={activeTab}
          onSelectTab={(tabId) => {
            sound.playBlip();
            setActiveTab(tabId);
          }}
          onOpenSafetyModal={handleOpenSafety}
          onOpenAuthModal={() => handleOpenAuth('login')}
        />

        {/* Modals & Popups */}
        <SafetyInstructionsModal
          isOpen={isSafetyModalOpen}
          onClose={() => setIsSafetyModalOpen(false)}
        />

        <IncidentReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          initialMode={authModalMode}
          onClose={() => setIsAuthModalOpen(false)}
        />

        <WallpaperSelector
          isOpen={isWallpaperModalOpen}
          onClose={() => setIsWallpaperModalOpen(false)}
          currentBg={currentBg}
          onSelectBg={handleSelectBg}
          bgOpacity={bgOpacity}
          onChangeOpacity={handleChangeOpacity}
          onShufflePexels={handleShuffleWallpaper}
          isAutoRefresh={isAutoRefresh}
          onToggleAutoRefresh={handleToggleAutoRefresh}
        />

        {/* Global Floating Emergency Broadcast Notification Toast */}
        {activeBroadcastToast && (
          <div className="fixed top-4 right-4 z-50 max-w-md w-full p-4 rounded-2xl bg-[#0b1022]/95 border-2 border-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.4)] backdrop-blur-xl animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                  <BellRing className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono">
                      EMERGENCY BROADCAST
                    </span>
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  </div>
                  <h4 className="text-sm font-bold text-white leading-tight">
                    {activeBroadcastToast.title}
                  </h4>
                </div>
              </div>

              <button
                onClick={() => setActiveBroadcastToast(null)}
                className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <CloseIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-200 mt-2 leading-relaxed bg-black/40 p-2.5 rounded-xl border border-white/5">
              {activeBroadcastToast.body}
            </p>

            <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-white/10">
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Dispatched to cellular phones
              </span>

              <button
                onClick={() => {
                  sound.playBlip();
                  setActiveTab('multilingual');
                  setActiveBroadcastToast(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                View Broadcast Hub
              </button>
            </div>
          </div>
        )}

        {/* Global Interactive Contact Dispatch Modal */}
        <ContactActionModal
          isOpen={contactModalState.isOpen}
          contact={contactModalState.contact}
          defaultMessage={contactModalState.defaultMessage}
          onClose={() => setContactModalState({ isOpen: false, contact: null, defaultMessage: '' })}
        />

        {/* Official Situation Report (SITREP) Modal */}
        <SitrepModalContainer
          isOpen={isSitrepModalOpen}
          onClose={() => setIsSitrepModalOpen(false)}
          location={currentLocation}
        />

        </div>
      </div>
    </WeatherProvider>
  );
}

// Sub-components to cleanly access WeatherContext inside WeatherProvider
function SimulationDrillBarContainer() {
  const { 
    isSimulating, 
    currentScenario, 
    simulationStepIndex, 
    startSimulation, 
    stopSimulation, 
    selectScenario, 
    selectStep 
  } = useWeather();

  return (
    <SimulationDrillBar
      isSimulating={isSimulating}
      currentScenario={currentScenario}
      stepIndex={simulationStepIndex}
      onStartSimulation={startSimulation}
      onStopSimulation={stopSimulation}
      onSelectScenario={selectScenario}
      onSelectStep={selectStep}
    />
  );
}

function SitrepModalContainer({ isOpen, onClose, location }) {
  const weather = useWeather();
  return (
    <SitrepModal
      isOpen={isOpen}
      onClose={onClose}
      weatherData={weather}
      location={location}
    />
  );
}

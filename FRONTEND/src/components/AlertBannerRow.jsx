import React, { useState, useRef } from 'react';
import { 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Globe2, 
  Bell, 
  Heart,
  Sparkles,
  Play,
  Volume2,
  VolumeX,
  ArrowUpRight,
  Wind,
  Droplets,
  Gauge,
  Grid
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { sound } from '../utils/audioSynth';
import CountUp from './CountUp';

// Haversine distance in km
function getDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function getTimeAwareGreeting(cityName) {
  const hour = new Date().getHours();
  let timeStr = 'Good morning';
  if (hour >= 12 && hour < 17) timeStr = 'Good afternoon';
  else if (hour >= 17 && hour < 22) timeStr = 'Good evening';
  else if (hour >= 22 || hour < 5) timeStr = 'Good night';
  return `${timeStr}, ${cityName || 'friend'}`;
}

export default function AlertBannerRow({ activeFilter, onSelectFilter, currentLocation }) {
  const { liveAlerts, allCities, eonetEvents, current } = useWeather();
  const [showObservationDetails, setShowObservationDetails] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const containerRef = useRef(null);

  const city = currentLocation?.city || 'Bhubaneswar';
  const userLat = currentLocation?.lat ?? 20.2961;
  const userLon = currentLocation?.lon ?? 85.8245;

  // Process Live NASA EONET Storms with distance to user
  const nasaStorms = (eonetEvents || [])
    .filter(e => 
      e.categoryId === 'severeStorms' || 
      (e.category || '').toLowerCase().includes('storm') || 
      (e.title || '').toLowerCase().includes('cyclone') ||
      (e.title || '').toLowerCase().includes('typhoon') ||
      (e.title || '').toLowerCase().includes('hurricane')
    )
    .map(e => {
      const lat = e.coordinates?.latitude;
      const lon = e.coordinates?.longitude;
      const dist = (lat != null && lon != null) ? getDistanceKm(userLat, userLon, lat, lon) : null;
      return { ...e, distanceKm: dist };
    });

  const localStorms = nasaStorms.filter(s => s.distanceKm != null && s.distanceKm < 750);
  const distantStorms = nasaStorms.filter(s => s.distanceKm == null || s.distanceKm >= 750);

  const localAlerts = (liveAlerts || []).filter(a => 
    (a.city || '').toLowerCase() === city.toLowerCase() ||
    (a.title || '').toLowerCase().includes(city.toLowerCase())
  );

  const hasLocalEmergency = localStorms.length > 0 || localAlerts.length > 0;

  // Plain human language status sentence
  const greeting = getTimeAwareGreeting(city);
  let statusHeadline = '';
  let statusSentence = '';

  if (hasLocalEmergency) {
    statusHeadline = `Advisory active in ${city}`;
    statusSentence = `Severe weather advisory is active. Public services mobilized. Please review recommended safety steps.`;
  } else if (distantStorms.length > 0) {
    statusHeadline = `Nature's pulse is calm.`;
    const nearestDistant = distantStorms[0];
    const distText = nearestDistant.distanceKm ? `${nearestDistant.distanceKm.toLocaleString()} km away` : 'far away';
    statusSentence = `7 storms monitored across the Pacific basin (${distText}). Zero active hazards impacting ${city}.`;
  } else {
    statusHeadline = `Nature's beauty is boundless.`;
    statusSentence = `Oceanic baselines and atmospheric conditions across Odisha and central India remain calm and balanced.`;
  }

  const handleTriggerAcousticTest = () => {
    setIsPlayingAudio(true);
    try {
      sound.playAlertChime();
    } catch {}
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 2400);
  };

  const handleOpenVernacular = () => {
    sound.playBlip();
    window.dispatchEvent(new CustomEvent('resona-switch-tab', { detail: 'multilingual' }));
  };

  return (
    <div ref={containerRef} className="relative rounded-[36px] overflow-hidden border border-white/[0.08] bg-[#141915] shadow-2xl transition-all duration-300">
      
      {/* ─── Architectural Vertical Column Divider Lines ─── */}
      <div className="absolute inset-0 pointer-events-none z-0 hidden lg:block">
        <div className="arch-grid-line left-[24%]" />
        <div className="arch-grid-line left-[48%]" />
        <div className="arch-grid-line left-[72%]" />
      </div>

      {/* ─── Hero Organic Moss Wood Terrain Midground Layer ─── */}
      <div 
        className="absolute inset-0 bg-cover bg-bottom bg-no-repeat pointer-events-none z-0 opacity-45 mix-blend-screen transition-opacity duration-700"
        style={{ 
          backgroundImage: 'url("/moss_hero_bg.jpg")',
          maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)'
        }}
      />

      {/* Subtle organic vignette lighting */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-t from-[#141915] via-transparent to-[#141915]/60" />

      {/* ─── Main Hero Content Grid (Matching Reference GIF Frame 0 Layout) ─── */}
      <div className="relative z-10 p-6 sm:p-8 lg:p-10 min-h-[460px] flex flex-col justify-between">
        
        {/* Top Micro-Badges Row */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
            <span className="text-[11px] font-semibold text-stone-300 tracking-wider uppercase font-sans">
              Live Atmosphere • {city}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="floating-metric-badge">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Phytotherapy 45%</span>
            </div>
            <div className="floating-metric-badge hidden sm:inline-flex">
              <Sparkles className="w-3 h-3 text-[#a3e635]" />
              <span>Titanium Forest 282 G</span>
            </div>
          </div>
        </div>

        {/* Central Editorial Split: Left Typography & Column 2 Narrative & Floating Bento Capsules */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center py-4 my-auto">
          
          {/* Column 1: Large Bold Editorial Typography (Reference GIF "Find your inner green") */}
          <div className="lg:col-span-4 space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.08] font-sans">
                Find your <br />
                <span className="text-[#a3e635]">inner green</span>
              </h1>
              <p className="text-xs text-stone-400 mt-2 font-medium">
                {city} • {current?.temp ?? 28}°C {current?.condition ?? 'Balanced'}
              </p>
            </div>

            {/* Circular Pulse / Play Button from Reference GIF */}
            <div className="flex items-center gap-4 pt-1">
              <button
                onClick={handleTriggerAcousticTest}
                className="circle-pulse-action group"
                title="Play emergency acoustic telemetry broadcast test"
              >
                {isPlayingAudio ? (
                  <Volume2 className="w-5 h-5 text-stone-900 animate-pulse fill-current" />
                ) : (
                  <Play className="w-5 h-5 text-stone-900 fill-current ml-0.5" />
                )}
              </button>
              <div className="text-xs text-stone-300">
                <span className="font-semibold text-white block">Acoustic check</span>
                <span className="text-[11px] text-stone-400 font-sans">Sound alert synthesizer</span>
              </div>
            </div>
          </div>

          {/* Column 2: Editorial Subtitle Paragraph & Pill Button */}
          <div className="lg:col-span-3 space-y-5">
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans font-normal">
              Nurturing green spaces, cultivating sustainable solutions, and inspiring a greener tomorrow for all.
            </p>

            <div>
              <button
                onClick={() => setShowObservationDetails(!showObservationDetails)}
                className="pill-button-glass px-5 py-2.5 flex items-center gap-2.5 text-xs font-semibold cursor-pointer group shadow-sm"
              >
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-stone-200 group-hover:scale-110 transition-transform">
                  <Grid className="w-3 h-3" />
                </div>
                <span>Our Products & Telemetry</span>
                <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${showObservationDetails ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Column 3 & 4: Floating Organic Bento Capsules Floating on Moss Landscape */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Signature Light Stone Card (Directly from Reference GIF Frame 0 & 40) */}
            <div className="bento-stone-card p-5 sm:p-6 flex flex-col justify-between min-h-[190px] relative overflow-hidden group">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block mb-1 font-sans">
                  About
                </span>
                <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-snug font-sans">
                  {statusHeadline}
                </h3>
                <p className="text-xs text-stone-700 mt-2 line-clamp-3 leading-relaxed font-sans">
                  {statusSentence}
                </p>
              </div>

              {/* Bottom Right Circular Action Icon Button (Grid/Arrow from GIF) */}
              <div className="flex items-center justify-between pt-4 mt-auto border-t border-stone-300/60">
                <span className="text-[11px] font-semibold text-stone-800">
                  {hasLocalEmergency ? 'Review Alert' : 'Learn more'}
                </span>
                <button
                  onClick={handleOpenVernacular}
                  className="w-9 h-9 rounded-full bg-white text-stone-950 flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer"
                  title="Open Multilingual Alert Guide in 27 Indian languages"
                >
                  <ArrowUpRight className="w-4 h-4 stroke-[2.2]" />
                </button>
              </div>
            </div>

            {/* Dark Frosted Glass Bento Capsule: Heat for Life / Live Atmospheric Gauge */}
            <div className="bento-glass-card p-5 sm:p-6 flex flex-col justify-between min-h-[190px]">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#a3e635] font-sans">
                    EcoStove
                  </span>
                  <span className="text-xs text-stone-400 font-mono">24x7</span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-white font-sans">
                  Heat for Life
                </h4>
                <div className="mt-3 space-y-1.5 text-xs text-stone-300 font-sans">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-emerald-400" /> Humidity
                    </span>
                    <span className="font-semibold text-white font-mono">{current?.humidity ?? 68}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 flex items-center gap-1.5">
                      <Wind className="w-3.5 h-3.5 text-[#4ade80]" /> Wind Speed
                    </span>
                    <span className="font-semibold text-white font-mono">{current?.wind_speed ?? 14} km/h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-amber-400" /> Barometer
                    </span>
                    <span className="font-semibold text-white font-mono">{current?.pressure ?? 1012} hPa</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-stone-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> All systems calm
                </span>
                <Heart className="w-3.5 h-3.5 text-rose-400/80 fill-rose-500/30" />
              </div>
            </div>

          </div>

        </div>

        {/* ─── Expandable Details Drawer ─── */}
        {showObservationDetails && (
          <div className="mt-4 pt-4 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-stone-300 animate-fade-slide-up relative z-10">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
              <span className="text-[10px] text-stone-400 uppercase font-semibold block">Air Quality Index</span>
              <span className="text-base font-bold text-[#4ade80] font-mono mt-0.5 block">38 AQI</span>
              <span className="text-[11px] text-stone-400">Pure botanical quality</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
              <span className="text-[10px] text-stone-400 uppercase font-semibold block">Solar Radiation</span>
              <span className="text-base font-bold text-amber-300 font-mono mt-0.5 block">3.2 UV</span>
              <span className="text-[11px] text-stone-400">Moderate seasonal index</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
              <span className="text-[10px] text-stone-400 uppercase font-semibold block">Pacific Storms</span>
              <span className="text-base font-bold text-sky-300 font-mono mt-0.5 block">{distantStorms.length} Tracked</span>
              <span className="text-[11px] text-stone-400">Distant • No regional threat</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
              <span className="text-[10px] text-stone-400 uppercase font-semibold block">Disaster Hotline</span>
              <span className="text-base font-bold text-[#a3e635] font-mono mt-0.5 block">112 / 1070</span>
              <span className="text-[11px] text-stone-400">24x7 NDMA National dispatch</span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

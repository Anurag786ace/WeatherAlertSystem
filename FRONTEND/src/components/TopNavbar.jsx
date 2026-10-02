import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  CloudLightning, 
  Search, 
  MapPin, 
  Bell, 
  User, 
  AlertTriangle, 
  Check, 
  LogOut, 
  Database,
  X,
  Radio,
  ExternalLink,
  Globe,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  BellRing,
  Navigation,
  Compass,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWeather } from '../context/WeatherContext';
import AnimatedCounter from './AnimatedCounter';
import { notificationService } from '../utils/notificationService';
import { ALL_INDIA_CITIES, POPULAR_INDIAN_HUBS } from '../data/indiaCities';

// Export complete Indian locations derived from extensive database
export const INDIAN_LOCATIONS = ALL_INDIA_CITIES.map(c => ({
  city: c.city,
  state: c.state,
  risk: c.risk,
  temp: c.defaultTemp || 25,
  condition: c.defaultCond || 'Clouds',
  wind: '12 km/h',
  lat: c.lat,
  lon: c.lon,
  region: c.region
}));

export function getVernacularBadgeText(loc) {
  if (!loc) return 'Odia (ଓଡ଼ିଆ)';
  const s = ((loc.state || '') + ' ' + (loc.city || '')).toLowerCase();
  if (s.includes('odisha') || s.includes('puri') || s.includes('bhubaneswar') || s.includes('cuttack') || s.includes('rourkela')) return 'Odia (ଓଡ଼ିଆ)';
  if (s.includes('bengal') || s.includes('kolkata') || s.includes('siliguri') || s.includes('howrah')) return 'Bengali (বাংলা)';
  if (s.includes('tamil') || s.includes('chennai') || s.includes('coimbatore') || s.includes('madurai')) return 'Tamil (தமிழ்)';
  if (s.includes('andhra') || s.includes('telangana') || s.includes('hyderabad') || s.includes('visakhapatnam') || s.includes('vijayawada')) return 'Telugu (తెలుగు)';
  if (s.includes('maharashtra') || s.includes('mumbai') || s.includes('pune') || s.includes('nagpur') || s.includes('nashik')) return 'Marathi (मराठी)';
  if (s.includes('gujarat') || s.includes('ahmedabad') || s.includes('surat') || s.includes('vadodara') || s.includes('rajkot')) return 'Gujarati (ગુજરાતી)';
  if (s.includes('karnataka') || s.includes('bengaluru') || s.includes('mysuru') || s.includes('mangalore')) return 'Kannada (ಕನ್ನಡ)';
  if (s.includes('kerala') || s.includes('kochi') || s.includes('thiruvananthapuram') || s.includes('kozhikode')) return 'Malayalam (മലയാളം)';
  if (s.includes('assam') || s.includes('guwahati') || s.includes('silchar') || s.includes('dibrugarh')) return 'Assamese (অসমীয়া)';
  if (s.includes('punjab') || s.includes('chandigarh') || s.includes('amritsar') || s.includes('ludhiana')) return 'Punjabi (ਪੰਜਾਬੀ)';
  if (s.includes('kashmir') || s.includes('srinagar')) return 'Kashmiri (کٲشُر)';
  return 'Hindi (हिन्दी)';
}

export default function TopNavbar({ 
  currentLocation, 
  onSelectLocation, 
  onOpenSafetyModal,
  onOpenAuthModal,
  onNavigateToAuth,
  onOpenWallpaperModal,
  onShuffleWallpaper,
  emergencyModeActive,
  onToggleEmergencyMode
}) {
  const { currentUser, isAuthenticated, logout, mongoUri } = useAuth();
  const { current, allCities, liveAlerts, lastUpdated, refresh, loading: weatherLoading } = useWeather();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [onlineResults, setOnlineResults] = useState([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);

  // Dropdown location selector state
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');

  // Other menus
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const searchRef = useRef(null);
  const locRef = useRef(null);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
      if (locRef.current && !locRef.current.contains(e.target)) setLocationMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotificationsOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Merge live telemetry with all Indian locations
  const locationsWithLiveData = useMemo(() => {
    return INDIAN_LOCATIONS.map(loc => {
      const liveMatch = (allCities || []).find(c => 
        c.city.toLowerCase() === loc.city.toLowerCase() ||
        c.city.toLowerCase().includes(loc.city.toLowerCase()) ||
        loc.city.toLowerCase().includes(c.city.toLowerCase())
      );
      if (liveMatch) {
        return {
          ...loc,
          temp: liveMatch.temp,
          condition: liveMatch.condition,
          description: liveMatch.description,
          risk: liveMatch.riskLevel || loc.risk,
          wind: `${liveMatch.wind_speed} km/h`,
          isRealTime: true,
        };
      }
      return loc;
    });
  }, [allCities]);

  // Filter locations for search bar
  const filteredSearchLocations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return locationsWithLiveData.slice(0, 15);
    return locationsWithLiveData.filter(loc =>
      loc.city.toLowerCase().includes(q) ||
      loc.state.toLowerCase().includes(q) ||
      (loc.region && loc.region.toLowerCase().includes(q))
    );
  }, [searchQuery, locationsWithLiveData]);

  // Debounced online geocode search for ANY location globally
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q || q.length < 2) {
      setOnlineResults([]);
      setIsSearchingOnline(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingOnline(true);
        const res = await fetch(`http://localhost:5000/api/weather/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.locations)) {
            // Filter out exact matches already shown in filteredSearchLocations
            const existing = new Set(filteredSearchLocations.map(l => l.city.toLowerCase()));
            const novel = data.locations.filter(loc => !existing.has(loc.city.toLowerCase()));
            setOnlineResults(novel);
          }
        }
      } catch (err) {
        console.warn('Online geocoding search note:', err);
      } finally {
        setIsSearchingOnline(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, filteredSearchLocations]);

  // Filter locations for the Location Picker Dropdown Menu
  const dropdownFilteredLocations = useMemo(() => {
    let list = locationsWithLiveData;

    // Region filter
    if (selectedRegion === 'Popular') {
      const popSet = new Set(POPULAR_INDIAN_HUBS.map(h => h.toLowerCase()));
      list = list.filter(l => popSet.has(l.city.toLowerCase()));
    } else if (selectedRegion !== 'All') {
      list = list.filter(l => (l.region || '').toLowerCase() === selectedRegion.toLowerCase());
    }

    // Dropdown search input filter
    const dq = dropdownSearch.trim().toLowerCase();
    if (dq) {
      list = list.filter(l => 
        l.city.toLowerCase().includes(dq) || 
        l.state.toLowerCase().includes(dq)
      );
    }

    return list;
  }, [locationsWithLiveData, selectedRegion, dropdownSearch]);

  // GPS Geolocation Handler
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingGPS(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        try {
          const res = await fetch(`http://localhost:5000/api/weather/reverse?lat=${lat}&lon=${lon}`);
          if (res.ok) {
            const data = await res.json();
            onSelectLocation({
              city: data.city || 'Detected Location',
              state: data.state || 'India',
              country: data.country || 'IN',
              lat,
              lon,
              risk: 'Low',
              temp: 25,
              condition: 'Live Telemetry'
            });
          } else {
            // Find closest city in list
            onSelectLocation({
              city: 'My GPS Location',
              state: 'GPS Detected',
              lat,
              lon,
              risk: 'Low',
              temp: 25,
              condition: 'Clear'
            });
          }
        } catch {
          onSelectLocation({
            city: 'My Location',
            state: 'Detected Coordinates',
            lat,
            lon,
            risk: 'Low',
            temp: 25,
            condition: 'Clear'
          });
        } finally {
          setIsDetectingGPS(false);
          setLocationMenuOpen(false);
          setSearchOpen(false);
          setSearchQuery('');
        }
      },
      (err) => {
        console.warn('GPS location request error:', err.message);
        setIsDetectingGPS(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const [broadcastNotifs, setBroadcastNotifs] = useState([]);
  const [notifPermission, setNotifPermission] = useState(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported';
  });

  useEffect(() => {
    const handleBroadcastEvent = (e) => {
      if (e.detail) {
        setBroadcastNotifs(prev => [
          {
            id: 'BCAST-' + Date.now(),
            title: e.detail.title || '🚨 Emergency Broadcast Alert',
            time: 'Just now',
            severity: 'red',
            text: e.detail.body || 'Disaster warning issued.',
            isBroadcast: true
          },
          ...prev
        ]);
      }
    };
    window.addEventListener('resona-emergency-broadcast', handleBroadcastEvent);
    return () => window.removeEventListener('resona-emergency-broadcast', handleBroadcastEvent);
  }, []);

  const handleEnableNotifs = async () => {
    const perm = await notificationService.requestPermission();
    setNotifPermission(perm);
  };

  const notifications = liveAlerts?.length > 0 
    ? liveAlerts.slice(0, 5).map(a => ({
        id: a.id,
        title: a.title,
        time: 'Just now',
        severity: a.category === 'cyclone' ? 'red' : 'amber',
        text: a.description
      }))
    : [
        { id: 1, title: 'OpenWeather Sensor Feed Active', time: 'Live', severity: 'green', text: 'Telemetry synced with IMD / OpenWeather network.' }
      ];

  const allNotifications = [...broadcastNotifs, ...notifications];

  const REGION_TABS = ['All', 'Popular', 'East', 'North', 'South', 'West', 'Central', 'Northeast'];

  return (
    <header className="sticky top-0 z-50 h-16 bg-slate-950/80 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-6 flex items-center justify-between gap-4 transition-all duration-300">
      
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-600/20 border border-sky-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.15)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-sky-400/0 via-white/10 to-sky-400/0 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
          <CloudLightning className="w-5 h-5 text-sky-400 relative z-10 drop-shadow-[0_0_5px_rgba(56,189,248,0.5)]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-white">
              Resona<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Alert</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" title="IMD & OpenWeather Telemetry Online" />
          </div>
          <div className="text-[11px] text-slate-400 font-sans font-medium">All India & Global Telemetry</div>
        </div>
      </div>

      {/* Center: Search Location Bar (Supports EVERY location) */}
      <div className="flex-1 max-w-xl relative hidden md:block" ref={searchRef}>
        <div className="relative group">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-hover:text-teal-400 stroke-[1.8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => {
              setLocationMenuOpen(false);
              setNotificationsOpen(false);
              setUserMenuOpen(false);
              setSearchOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setSearchOpen(false);
                e.target.blur();
              }
            }}
            placeholder="Search any city, district, or town in India or worldwide..."
            className="w-full pl-10 pr-24 py-2 bg-slate-900/90 border border-white/10 hover:border-white/20 focus:border-teal-500/60 focus:bg-slate-900 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none transition-all duration-300 shadow-inner"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {isSearchingOnline && (
              <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin" />
            )}
            {searchQuery && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery('');
                  setSearchOpen(false);
                }}
                className="text-slate-400 hover:text-white p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <kbd className="text-[10px] font-sans font-medium text-slate-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
              ESC
            </kbd>
          </div>
        </div>

        {/* Search Dropdown Results with Solid Opaque Background */}
        {searchOpen && (
          <div 
            style={{ backgroundColor: '#0B1120' }}
            className="absolute top-full left-0 right-0 mt-2 border border-slate-700/80 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[460px] flex flex-col"
          >
            {/* Dropdown Header with GPS button & live count */}
            <div 
              style={{ backgroundColor: '#0F172A' }}
              className="px-3.5 py-2.5 border-b border-slate-800 text-xs font-medium text-slate-300 font-sans flex justify-between items-center shrink-0"
            >
              <span className="flex items-center gap-2">
                <span className="font-semibold text-white">Select Location</span>
                <span className="text-[10px] text-teal-300 bg-teal-400/10 px-2 py-0.5 rounded-full border border-teal-400/20">
                  {locationsWithLiveData.length}+ Indian cities & Global
                </span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDetectGPS}
                  disabled={isDetectingGPS}
                  className="flex items-center gap-1 text-[11px] text-sky-300 hover:text-sky-200 bg-sky-500/15 hover:bg-sky-500/25 px-2 py-1 rounded-lg border border-sky-500/25 transition-all cursor-pointer font-medium"
                >
                  {isDetectingGPS ? (
                    <Loader2 className="w-3 h-3 animate-spin text-sky-400" />
                  ) : (
                    <Navigation className="w-3 h-3 text-sky-400" />
                  )}
                  <span>{isDetectingGPS ? 'Locating...' : 'Use My GPS'}</span>
                </button>
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Close search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div 
              style={{ backgroundColor: '#0B1120' }}
              className="overflow-y-auto no-scrollbar flex-1 divide-y divide-slate-800/80"
            >
              {/* Matched Indian Cities */}
              {filteredSearchLocations.map((loc) => (
                <button
                  key={`${loc.city}-${loc.state}`}
                  onClick={() => {
                    onSelectLocation(loc);
                    setSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm flex items-center justify-between bg-[#0B1120] hover:bg-slate-800/90 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-teal-500/20 group-hover:text-teal-400 transition-colors shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-400 stroke-[1.8]" />
                    </div>
                    <div>
                      <span className="font-medium text-slate-200 group-hover:text-white transition-colors">{loc.city}</span>
                      <span className="text-slate-400 text-xs font-normal ml-1.5">({loc.state})</span>
                      {loc.region && (
                        <span className="ml-2 text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                          {loc.region}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {loc.risk && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        loc.risk === 'Very High' || loc.risk === 'High' 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                          : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      }`}>
                        {loc.risk}
                      </span>
                    )}
                    <span className="text-slate-300 font-sans text-xs bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                      {loc.temp != null ? `${loc.temp}°C` : '--'}
                    </span>
                  </div>
                </button>
              ))}

              {/* Online / Worldwide Geocoding Results */}
              {onlineResults.length > 0 && (
                <div style={{ backgroundColor: '#080D1A' }}>
                  <div 
                    style={{ backgroundColor: '#0F172A' }}
                    className="px-4 py-1.5 text-[10px] font-semibold text-sky-400 tracking-wider uppercase flex items-center gap-1.5 border-t border-slate-800"
                  >
                    <Globe className="w-3 h-3" />
                    <span>Global Geocoded Locations</span>
                  </div>
                  {onlineResults.map((loc, idx) => (
                    <button
                      key={`online-${loc.city}-${loc.lat}-${idx}`}
                      onClick={() => {
                        onSelectLocation({
                          city: loc.city,
                          state: loc.state || loc.country || '',
                          country: loc.country || 'IN',
                          lat: loc.lat,
                          lon: loc.lon,
                          risk: 'Low',
                          temp: 25,
                          condition: 'Live Telemetry'
                        });
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm flex items-center justify-between bg-[#080D1A] hover:bg-sky-500/15 transition-colors group cursor-pointer border-t border-slate-800/60"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-sky-500/15 flex items-center justify-center text-sky-400 group-hover:bg-sky-500/25 transition-colors shrink-0">
                          <Globe className="w-3.5 h-3.5 stroke-[1.8]" />
                        </div>
                        <div>
                          <span className="font-medium text-slate-200 group-hover:text-white transition-colors">{loc.city}</span>
                          <span className="text-slate-400 text-xs font-normal ml-1.5">
                            {loc.state ? `${loc.state}, ` : ''}{loc.country}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded-lg border border-sky-500/20">
                        Select Location
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {filteredSearchLocations.length === 0 && onlineResults.length === 0 && !isSearchingOnline && (
                <div className="px-6 py-8 text-center text-slate-400 text-xs">
                  <p>No exact location found for "{searchQuery}".</p>
                  <p className="mt-1 text-slate-500">Try typing a city name, district, or use your GPS location above.</p>
                </div>
              )}

            </div>
          </div>
        )}
      </div>

      {/* Right Section: Location Pill, Atmosphere, Notifications, Profile */}
      <div className="flex items-center gap-2.5 shrink-0">
        
        {/* Active Location Pill & Comprehensive Location Picker */}
        <div className="relative" ref={locRef}>
          <button
            onClick={() => {
              setSearchOpen(false);
              setNotificationsOpen(false);
              setUserMenuOpen(false);
              setLocationMenuOpen(!locationMenuOpen);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-sm text-slate-200 transition-all duration-300 shadow-sm cursor-pointer"
            title="Click to choose from all 180+ Indian cities or search any location"
          >
            <MapPin className="w-4 h-4 text-teal-400 stroke-[1.8]" />
            <span className="font-semibold text-white max-w-[110px] sm:max-w-[140px] truncate">{currentLocation?.city || 'Bhubaneswar'}</span>
            <span className="text-teal-300 text-xs font-semibold bg-teal-500/10 px-2 py-0.5 rounded-lg border border-teal-500/20">
              {current?.temp ?? currentLocation?.temp ?? 25}°C
            </span>
          </button>

          {/* Full Location Picker Modal / Dropdown with Solid Background */}
          {locationMenuOpen && (
            <div 
              style={{ backgroundColor: '#0B1120' }}
              className="absolute right-0 mt-2 w-80 sm:w-96 border border-slate-700/80 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col max-h-[520px]"
            >
              {/* Header */}
              <div 
                style={{ backgroundColor: '#0F172A' }}
                className="p-3.5 border-b border-slate-800 space-y-2.5 shrink-0"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">All Locations Network</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleDetectGPS}
                      disabled={isDetectingGPS}
                      className="flex items-center gap-1.5 text-xs text-teal-300 hover:text-teal-200 bg-teal-500/15 hover:bg-teal-500/25 px-2.5 py-1 rounded-lg border border-teal-500/30 transition-all cursor-pointer font-medium"
                      title="Detect your exact GPS location"
                    >
                      {isDetectingGPS ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                      <span>{isDetectingGPS ? 'Detecting...' : 'Use My GPS'}</span>
                    </button>
                    <button
                      onClick={() => setLocationMenuOpen(false)}
                      className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Filter Input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={dropdownSearch}
                    onChange={(e) => setDropdownSearch(e.target.value)}
                    placeholder="Filter cities or state..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
                  />
                  {dropdownSearch && (
                    <button 
                      onClick={() => setDropdownSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Region Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
                  {REGION_TABS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedRegion(r)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium shrink-0 transition-all cursor-pointer ${
                        selectedRegion === r
                          ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Locations List */}
              <div 
                style={{ backgroundColor: '#0B1120' }}
                className="overflow-y-auto no-scrollbar flex-1 divide-y divide-slate-800/80 py-1"
              >
                {dropdownFilteredLocations.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    <p>No locations match "{dropdownSearch}".</p>
                    <p className="mt-1 text-slate-500">Try searching via the main search bar for global cities.</p>
                  </div>
                ) : (
                  dropdownFilteredLocations.map((loc) => {
                    const isSelected = (currentLocation?.city || '').toLowerCase() === loc.city.toLowerCase();
                    return (
                      <button
                        key={`${loc.city}-${loc.state}`}
                        onClick={() => {
                          onSelectLocation(loc);
                          setLocationMenuOpen(false);
                          setDropdownSearch('');
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected 
                            ? 'bg-teal-500/20 text-teal-300 font-semibold' 
                            : 'bg-[#0B1120] text-slate-300 hover:bg-slate-800/90 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-teal-400' : 'text-slate-400'}`} />
                          <div className="truncate">
                            <span className={isSelected ? 'text-teal-200' : 'text-slate-200'}>{loc.city}</span>
                            <span className="text-slate-400 text-[11px] ml-1.5">({loc.state})</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {loc.risk && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                              loc.risk === 'Very High' || loc.risk === 'High'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-emerald-500/10 text-emerald-300'
                            }`}>
                              {loc.risk}
                            </span>
                          )}
                          <span className={`font-mono text-xs px-2 py-0.5 rounded-md ${
                            isSelected ? 'bg-teal-500/25 text-teal-200' : 'bg-slate-900 text-slate-400 border border-slate-800'
                          }`}>
                            {loc.temp != null ? `${loc.temp}°C` : '--'}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Footer info */}
              <div 
                style={{ backgroundColor: '#0F172A' }}
                className="p-2.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between shrink-0"
              >
                <span>Showing {dropdownFilteredLocations.length} locations</span>
                <span className="text-teal-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                  Live Telemetry
                </span>
              </div>

            </div>
          )}
        </div>

        {/* Atmosphere Wallpaper Switcher & Quick Pexels Shuffle */}
        <div className="flex items-center bg-slate-900/80 rounded-xl border border-white/10 p-1 shadow-sm h-[38px]">
          <button
            onClick={onOpenWallpaperModal}
            className="flex items-center gap-2 px-2.5 h-full text-xs font-semibold text-slate-300 hover:text-white transition-all rounded-lg hover:bg-white/10 cursor-pointer"
            title="Atmospheric Wallpaper Settings (Pexels 4K)"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="hidden lg:inline">Atmosphere</span>
          </button>
          {onShuffleWallpaper && (
            <button
              onClick={() => {
                onShuffleWallpaper();
              }}
              className="px-2 h-full text-slate-400 hover:text-indigo-300 hover:bg-white/10 rounded-lg transition-all border-l border-white/10 flex items-center justify-center cursor-pointer"
              title="Shuffle to a new Pexels background now"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setSearchOpen(false);
              setLocationMenuOpen(false);
              setUserMenuOpen(false);
              setNotificationsOpen(!notificationsOpen);
            }}
            className="w-[38px] h-[38px] flex items-center justify-center rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-all relative shadow-sm cursor-pointer"
            title="Alert Notifications"
          >
            {broadcastNotifs.length > 0 ? (
              <BellRing className="w-4 h-4 text-rose-400 animate-bounce" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
            {broadcastNotifs.length > 0 ? (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-bold ring-2 ring-slate-900 shadow-[0_0_8px_rgba(244,63,94,0.9)] animate-pulse">
                {broadcastNotifs.length}
              </span>
            ) : (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
            )}
          </button>

          {notificationsOpen && (
            <div 
              style={{ backgroundColor: '#0B1120' }}
              className="absolute right-0 mt-2 w-84 border border-slate-700/80 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div 
                style={{ backgroundColor: '#0F172A' }}
                className="px-4 py-3 border-b border-slate-800 flex items-center justify-between"
              >
                <span className="font-semibold text-sm text-white">Emergency broadcasts</span>
                <span className="text-[10px] text-rose-300 font-sans font-bold bg-rose-500/15 px-2.5 py-0.5 rounded-full border border-rose-500/30">
                  {allNotifications.length} ALERTS
                </span>
              </div>

              {/* Notification Permission Toggle */}
              {notifPermission !== 'granted' && (
                <div className="p-3 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-xs">
                  <span className="text-amber-200 text-[11px]">System popup notifications disabled</span>
                  <button
                    onClick={handleEnableNotifs}
                    className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] transition-colors cursor-pointer"
                  >
                    Enable
                  </button>
                </div>
              )}

              <div 
                style={{ backgroundColor: '#0B1120' }}
                className="divide-y divide-slate-800/80 max-h-72 overflow-y-auto no-scrollbar"
              >
                {allNotifications.map((n) => (
                  <div key={n.id} className={`p-3.5 hover:bg-slate-800/80 transition-colors group cursor-default ${n.isBroadcast ? 'bg-rose-950/40 border-l-2 border-rose-500' : ''}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-semibold text-rose-200 group-hover:text-rose-100 transition-colors flex items-center gap-1.5">
                        {n.isBroadcast && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />}
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-medium shrink-0 ml-2">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Role Status Badge & Profile Avatar */}
        {isAuthenticated && currentUser ? (
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <button
              onClick={() => onNavigateToAuth ? onNavigateToAuth() : onOpenAuthModal('login')}
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 shadow-sm cursor-pointer ${
                currentUser?.role === 'Volunteer' || currentUser?.role === 'Emergency Responder' || currentUser?.role === 'Citizen / Volunteer'
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-200 hover:bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.08)]'
                  : currentUser?.role === 'Disaster Management Officer'
                  ? 'bg-amber-500/10 border-amber-500/25 text-amber-200 hover:bg-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.08)]'
                  : 'bg-sky-500/10 border-sky-500/25 text-sky-200 hover:bg-sky-500/20 shadow-[0_0_10px_rgba(56,189,248,0.08)]'
              }`}
              title="Click to view Identity & Roles portal"
            >
              {currentUser?.role === 'Volunteer' || currentUser?.role === 'Emergency Responder' || currentUser?.role === 'Citizen / Volunteer' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 stroke-[1.8]" />
                  <span>Volunteer</span>
                  <span className="text-[10px] text-emerald-400/80 font-normal">Relief Corps</span>
                </>
              ) : currentUser?.role === 'Disaster Management Officer' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 stroke-[1.8]" />
                  <span>Commander</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-sky-400 stroke-[1.8]" />
                  <span>Citizen</span>
                  <span className="text-[10px] text-sky-400/80 font-normal">Resident</span>
                </>
              )}
            </button>

            <div className="relative" ref={userRef}>
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setLocationMenuOpen(false);
                  setNotificationsOpen(false);
                  setUserMenuOpen(!userMenuOpen);
                }}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 border border-white/15 text-white flex items-center justify-center text-xs font-semibold transition-all shadow-md cursor-pointer"
                title={currentUser?.name}
              >
                {currentUser?.name?.[0]?.toUpperCase() || 'U'}
              </button>

              {userMenuOpen && (
                <div 
                  style={{ backgroundColor: '#0B1120' }}
                  className="absolute right-0 mt-2 w-64 border border-slate-700/80 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div 
                    style={{ backgroundColor: '#0F172A' }}
                    className="p-4 border-b border-slate-800"
                  >
                    <div className="font-semibold text-sm text-white truncate">{currentUser?.name}</div>
                    <a href={`mailto:${currentUser?.email}`} className="block text-[11px] text-slate-400 truncate mt-0.5 hover:text-cyan-400 hover:underline">{currentUser?.email}</a>
                    <div className="mt-2 inline-block">
                      <span className="text-[10px] font-sans font-medium px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20">
                        {currentUser?.role || 'Citizen'}
                      </span>
                    </div>
                  </div>

                  <div 
                    style={{ backgroundColor: '#0B1120' }}
                    className="p-2 space-y-1"
                  >
                    {onNavigateToAuth && (
                      <button
                        onClick={() => {
                          onNavigateToAuth();
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors flex items-center gap-3 cursor-pointer"
                      >
                        <User className="w-4 h-4 text-sky-400" /> Identity & Roles
                      </button>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm font-bold text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 rounded-lg transition-colors flex items-center gap-3 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => onNavigateToAuth ? onNavigateToAuth() : onOpenAuthModal('login')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition-all shadow-[0_0_15px_rgba(56,189,248,0.3)] hover:shadow-[0_0_20px_rgba(56,189,248,0.5)] cursor-pointer"
            title="Sign in as Citizen or Relief Volunteer"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Sign In</span>
          </button>
        )}

      </div>

    </header>
  );
}

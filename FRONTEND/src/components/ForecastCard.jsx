import React from 'react';
import { 
  CloudRain, 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudLightning, 
  CloudSnow, 
  CloudDrizzle, 
  CloudFog, 
  Wind, 
  CloudOff, 
  RefreshCw, 
  Droplets,
  Calendar
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import AnimatedCounter from './AnimatedCounter';

// Map OpenWeatherMap condition -> icon
function getForecastIcon(condition) {
  const map = {
    'Thunderstorm': CloudLightning,
    'Drizzle': CloudDrizzle,
    'Rain': CloudRain,
    'Snow': CloudSnow,
    'Mist': CloudFog,
    'Haze': CloudFog,
    'Fog': CloudFog,
    'Dust': Wind,
    'Clear': Sun,
    'Clouds': Cloud,
  };
  return map[condition] || CloudSun;
}

function getForecastColor(condition) {
  const map = {
    'Thunderstorm': 'text-amber-400',
    'Drizzle': 'text-teal-300',
    'Rain': 'text-teal-400',
    'Snow': 'text-slate-100',
    'Clear': 'text-amber-400',
    'Clouds': 'text-slate-300',
    'Mist': 'text-slate-400',
    'Haze': 'text-amber-300',
  };
  return map[condition] || 'text-amber-400';
}

export default function ForecastCard() {
  const { forecast, loading, error, refresh } = useWeather();

  // Skeleton Loading state (replaces spinner)
  if (loading && !forecast) {
    return (
      <div className="weather-card p-5 flex flex-col justify-between min-h-[260px] animate-pulse">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="h-4 w-36 bg-white/10 rounded-lg"></div>
          <div className="h-6 w-6 bg-white/10 rounded-lg"></div>
        </div>
        <div className="space-y-2 py-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-10 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && !forecast) {
    return (
      <div className="weather-card p-6 flex flex-col items-center justify-center min-h-[260px] text-center space-y-2">
        <CloudOff className="w-8 h-8 text-amber-400 mb-1" />
        <p className="text-sm font-medium text-slate-200">5-day forecast temporarily unavailable</p>
        <button
          onClick={refresh}
          className="mt-3 px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
          <span>Check again</span>
        </button>
      </div>
    );
  }

  const days = forecast?.days || [];

  return (
    <div className="bento-glass-card p-6 flex flex-col justify-between relative overflow-hidden group">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] mb-3.5 relative z-10">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-0.5 font-sans">
            Multi-Day Telemetry
          </span>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-white tracking-normal font-sans">
              5-Day Atmospheric Outlook
            </h3>
            {forecast?.city && (
              <span className="text-[11px] text-[#4ade80] font-semibold bg-[#4ade80]/15 px-2.5 py-0.5 rounded-full border border-[#4ade80]/30 font-sans">
                {forecast.city}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={refresh}
          className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 flex items-center justify-center text-stone-300 hover:text-white transition-all shadow-sm cursor-pointer"
          title="Refresh forecast"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#4ade80]' : ''}`} />
        </button>
      </div>

      {/* 5-Day List */}
      <div className="space-y-2.5 relative z-10 flex-1 overflow-y-auto no-scrollbar">
        {days.length === 0 ? (
          <div className="h-full flex items-center justify-center py-6">
            <p className="text-xs text-stone-400 font-sans">Upcoming forecast will appear here soon.</p>
          </div>
        ) : (
          days.map((d) => {
            const Icon = getForecastIcon(d.condition);
            const color = getForecastColor(d.condition);
            return (
              <div 
                key={d.day + d.date}
                className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/20 transition-all duration-200 text-xs cursor-default group/item"
              >
                <div className="w-24 flex flex-col">
                  <span className="font-semibold text-white font-sans">{d.day}</span>
                  <span className="text-[11px] text-stone-400 mt-0.5 font-sans">{d.date}</span>
                </div>

                <div className="flex items-center gap-3 flex-1 justify-center">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center transition-transform group-hover/item:scale-110">
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <span className="text-stone-300 capitalize font-medium font-sans truncate max-w-[130px] text-left">
                    {d.description || d.condition}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 text-right font-sans">
                  <span className="text-[#a3e635] font-bold text-sm">
                    <AnimatedCounter value={d.temp_max ?? d.temp} />°
                  </span>
                  <span className="text-stone-400 text-xs font-medium">
                    {d.temp_min ?? d.temp - 3}°
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

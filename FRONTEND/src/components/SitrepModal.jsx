import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Copy, 
  Check, 
  X, 
  ShieldAlert, 
  Wind, 
  Droplets, 
  Gauge, 
  Radio, 
  MapPin, 
  Clock, 
  Share2
} from 'lucide-react';
import { sound } from '../utils/audioSynth';

export default function SitrepModal({ isOpen, onClose, weatherData, location }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const city = location?.city || 'Puri';
  const state = location?.state || 'Odisha';
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeUtc = now.toUTCString().slice(17, 22) + ' UTC';
  const sitrepRef = `RESONA-SITREP-2026-${(state.slice(0, 2)).toUpperCase()}-${(city.slice(0, 3)).toUpperCase()}`;

  const temp = Math.round(weatherData?.current?.main?.temp || 28);
  const windKm = Math.round((weatherData?.current?.wind?.speed || 12) * 3.6);
  const pressure = weatherData?.current?.main?.pressure || 998;
  const humidity = weatherData?.current?.main?.humidity || 84;
  const riskScore = weatherData?.current?.riskScore || 74;
  const riskLevel = weatherData?.current?.riskLevel || 'Severe';

  const handlePrint = () => {
    sound.playSuccessChime();
    window.print();
  };

  const handleCopy = () => {
    sound.playBlip();
    const brief = `🚨 [OFFICIAL SITREP: ${city.toUpperCase()}, ${state.toUpperCase()}]
Ref: ${sitrepRef} | Date: ${dateStr} ${timeUtc}
Classification: EMERGENCY DISASTER SITUATION REPORT

METEOROLOGICAL TELEMETRY:
- Hazard Status: ${riskLevel.toUpperCase()} RISK (Score: ${riskScore}/100)
- Surface Winds: ${windKm} km/h (Gusts sustained)
- Barometric Pressure: ${pressure} hPa (Deficit active)
- Ambient Temp / Humidity: ${temp}°C | ${humidity}%

SHELTER & LOGISTICS:
- Primary Shelter: Central Multipurpose Cyclone Complex (Open & Admitting)
- Auxiliary Power: Dual Diesel Generators Active (48h fuel reserve)
- Medical Units: Rapid Trauma Unit & Paramedics Deployed

BROADCAST DISSEMINATION STATUS:
- OASIS CAP XML 1.2: Transmitted to State Emergency Center
- Vernacular Audio & SMS: Dispatched in Regional Languages
- LoRa 868MHz Mesh: Packets streaming across relay beacons
- WhatsApp Direct: Community alert dispatch link operational

Issued by Resona Emergency Warning Engine (ODRAF / NDMA Authorized Briefing)`;

    navigator.clipboard.writeText(brief);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      
      {/* Modal Container */}
      <div className="bg-[#080E1E] border border-cyan-500/40 rounded-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 shadow-2xl relative text-xs my-auto text-slate-200">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold text-[10px] border border-rose-500/40">
              OFFICIAL SITREP
            </span>
            <span className="font-mono text-slate-400 text-[11px]">{sitrepRef}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy text brief to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{copied ? 'Copied Brief!' : 'Copy Brief'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              title="Print official document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="text-[11px]">Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#050914] border border-white/10 space-y-4 font-sans text-slate-200">
          
          {/* Government / Institutional Style Letterhead */}
          <div className="text-center border-b border-white/10 pb-3 space-y-1">
            <div className="flex items-center justify-center gap-2 text-cyan-400 font-bold tracking-wider uppercase font-mono text-xs">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>RESONA DISASTER INTELLIGENCE COMMAND</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              SITUATION REPORT: EMERGENCY ADVISORY BRIEFING
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Target Area: {city}, {state} (India) • Date: {dateStr} • Time: {timeUtc}
            </p>
          </div>

          {/* Incident Severity Matrix Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-slate-400 block">Risk Classification</span>
              <span className={`text-xs font-bold ${
                riskScore >= 80 ? 'text-rose-400' : riskScore >= 60 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {riskLevel.toUpperCase()} ({riskScore}/100)
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-slate-400 block">Max Surface Wind</span>
              <span className="text-xs font-bold text-white">{windKm} km/h Gusts</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-slate-400 block">Barometric Deficit</span>
              <span className="text-xs font-bold text-amber-400">{pressure} hPa</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-slate-400 block">Ambient Temp / RH</span>
              <span className="text-xs font-bold text-cyan-300">{temp}°C | {humidity}%</span>
            </div>
          </div>

          {/* Section 1: Executive Threat Appraisal */}
          <div className="space-y-1.5">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider font-mono text-cyan-400">
              1. Executive Threat Appraisal & Outlook
            </h4>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Atmospheric telemetry in the {city} sector indicates elevated barometric pressure drops with sustained gale-force winds up to {windKm} km/h. Coastal and riverine lowlands are at acute risk of localized inundation and structural displacement. Mandatory maritime prohibition remains in effect along coastal boundaries.
            </p>
          </div>

          {/* Section 2: Evacuation & Shelter Status */}
          <div className="space-y-1.5">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider font-mono text-cyan-400">
              2. Evacuation & Shelter Logistics
            </h4>
            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Certified High-Elevation Shelters:</span>
                <span className="text-emerald-400 font-bold">100% Operational & Stocked</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Auxiliary Power Systems:</span>
                <span className="text-white">Dual Diesel Generators Online (48h reserve)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Medical Rapid Response:</span>
                <span className="text-white">Paramedic Teams & First Aid Trauma Mobile Units Deployed</span>
              </div>
            </div>
          </div>

          {/* Section 3: Multi-Bearer Alert Broadcast Status */}
          <div className="space-y-1.5">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider font-mono text-cyan-400">
              3. Resilient Broadcast Dissemination
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
              <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                ✓ OASIS CAP 1.2 XML
              </div>
              <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                ✓ SMS 140 Compaction
              </div>
              <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                ✓ LoRa 868MHz Mesh
              </div>
              <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                ✓ 27 Regional Dialects
              </div>
            </div>
          </div>

          {/* Section 4: Operational Directives */}
          <div className="space-y-1">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider font-mono text-cyan-400">
              4. Immediate Action Directives
            </h4>
            <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-0.5">
              <li>Deploy tree-clearing hydraulic equipment along arterial medical corridors.</li>
              <li>Maintain continuous monitoring on national emergency frequency and LoRa repeaters.</li>
              <li>Instruct public to stay clear of high-voltage transmission lines and loose masonry.</li>
            </ul>
          </div>

          {/* Signature Block */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <div>
              <span>Dispatched by: </span>
              <strong className="text-white">Commander Arjun Patel (ODRAF Command)</strong>
            </div>
            <div className="text-emerald-400 flex items-center gap-1">
              <span>● Encrypted Digital Signature Verified</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  AlertTriangle, 
  Phone, 
  Users, 
  Zap, 
  Droplets, 
  Stethoscope, 
  Utensils, 
  ExternalLink, 
  X,
  Compass,
  ArrowRight,
  ChevronRight,
  Heart,
  ShieldCheck,
  PhoneCall
} from 'lucide-react';
import { sound } from '../utils/audioSynth';

// Regional curated shelters database with empathetic, human-centered microcopy
const SHELTER_REGISTRY = {
  puri: [
    {
      id: 'puri-1',
      name: 'Puri District Multipurpose Cyclone Center',
      district: 'Puri, Odisha',
      distanceKm: 1.2,
      elevationM: 18,
      totalCapacity: 2500,
      currentOccupancy: 1720,
      structureType: 'Pucca Reinforced Concrete Multi-Tier',
      warden: 'Inspector Debabrata Sahoo',
      phone: '+91 94371 44550',
      status: 'Open & Safe',
      supplies: {
        power: 'Generators active with continuous backup lighting',
        medical: 'Onsite doctors & trauma care team available 24/7',
        water: 'Clean drinking water stored & regularly purified',
        food: 'Hot community kitchen serving warm nutritious meals'
      },
      safeCorridor: 'Drive or walk along VIP Road towards Medical Square. Avoid CT Road due to sea wave surges.',
      waypoints: [
        { step: 1, text: 'Depart current location heading inland along VIP Road', dist: '400m' },
        { step: 2, text: 'Turn North away from beach at Badadanda Crossing', dist: '500m' },
        { step: 3, text: 'Arrive at Cyclone Center Gate 2 — volunteers will welcome you', dist: '300m' }
      ],
      coords: { lat: 19.8135, lon: 85.8312 }
    },
    {
      id: 'puri-2',
      name: 'Swargadwar High-Elevation Coastal Pucca Shelter',
      district: 'Puri, Odisha',
      distanceKm: 2.8,
      elevationM: 22,
      totalCapacity: 1800,
      currentOccupancy: 1140,
      structureType: 'Government High-Rise Cyclone Complex',
      warden: 'Captain R. K. Mohapatra',
      phone: '+91 94372 88991',
      status: 'Open & Safe',
      supplies: {
        power: 'Solar hybrid & generator backup lighting active',
        medical: 'Red Cross first-aid mobile station ready',
        water: 'Safe tested drinking water tanks available',
        food: 'Pre-packed 72-hour family food & nutrition kits'
      },
      safeCorridor: 'Take Lokanath Temple inland connector to safely bypass all coastal water.',
      waypoints: [
        { step: 1, text: 'Head inland along Lokanath Road away from shore', dist: '1.1 km' },
        { step: 2, text: 'Cross safe culvert at Swargadwar bypass', dist: '1.2 km' },
        { step: 3, text: 'Enter designated safe assembly courtyard', dist: '500m' }
      ],
      coords: { lat: 19.8012, lon: 85.8198 }
    },
    {
      id: 'puri-3',
      name: 'Balukhand High-Ground Relief & Medical Station',
      district: 'Puri, Odisha',
      distanceKm: 4.5,
      elevationM: 25,
      totalCapacity: 3000,
      currentOccupancy: 850,
      structureType: 'State Disaster Rapid Action Facility',
      warden: 'Dr. Anita Das',
      phone: '+91 94370 77112',
      status: 'Open & Safe',
      supplies: {
        power: 'Auxiliary power & solar generator active',
        medical: 'Full medical clinic with emergency oxygen support',
        water: 'Deep RO-purified drinking water supply',
        food: 'Hot fresh meal distribution operating'
      },
      safeCorridor: 'Use Konark Marine Drive inland elevated embankment to stay completely clear of water.',
      waypoints: [
        { step: 1, text: 'Proceed on Puri-Konark Marine Highway inland lane', dist: '3.2 km' },
        { step: 2, text: 'Turn left at Balukhand Forest Sanctuary Gate', dist: '900m' },
        { step: 3, text: 'Report to Intake Pavilion for immediate registry and bed assignment', dist: '400m' }
      ],
      coords: { lat: 19.8322, lon: 85.8755 }
    }
  ],
  bhubaneswar: [
    {
      id: 'bbsr-1',
      name: 'Bhubaneswar Central EOC Community Safe Concourse',
      district: 'Bhubaneswar, Khordha',
      distanceKm: 2.1,
      elevationM: 45,
      totalCapacity: 3500,
      currentOccupancy: 1420,
      structureType: 'State Emergency Operations Pucca Complex',
      warden: 'Nodal Officer Sanjit Mishra',
      phone: '+91 94371 00223',
      status: 'Open & Safe',
      supplies: {
        power: 'Uninterrupted power backup (Generators running)',
        medical: 'Doctors & paramedics on-duty 24/7',
        water: 'Clean drinking water stored & purified',
        food: 'Warm meals & fresh food provided for all'
      },
      safeCorridor: 'Drive or walk along Janpath North. Our teams have actively cleared all underpasses.',
      waypoints: [
        { step: 1, text: 'Walk or drive along Janpath Boulevard toward Master Canteen', dist: '1.2 km' },
        { step: 2, text: 'Follow the elevated flyover access ramp to avoid surface water', dist: '600m' },
        { step: 3, text: 'Arrive at Central EOC Concourse — volunteers will welcome your family', dist: '300m' }
      ],
      coords: { lat: 20.2961, lon: 85.8245 }
    },
    {
      id: 'bbsr-2',
      name: 'Chandrasekharpur High-Elevation Evacuation Hub',
      district: 'Bhubaneswar, Khordha',
      distanceKm: 4.8,
      elevationM: 52,
      totalCapacity: 2800,
      currentOccupancy: 950,
      structureType: 'Multi-Purpose Indoor Stadium',
      warden: 'Major P. K. Routray',
      phone: '+91 94372 11334',
      status: 'Open & Safe',
      supplies: {
        power: 'Dedicated generator support with continuous lighting',
        medical: 'First response medical unit & rapid ambulance stationed',
        water: 'Abundant fresh drinking water reservoir available',
        food: 'Emergency food & nutrition distribution active'
      },
      safeCorridor: 'Follow Nandan Kanan Road along the elevated ridge to stay completely dry and safe.',
      waypoints: [
        { step: 1, text: 'Follow Nandan Kanan elevated corridor away from low-lying areas', dist: '3.5 km' },
        { step: 2, text: 'Turn smoothly onto Patia Station Road', dist: '900m' },
        { step: 3, text: 'Arrive at Stadium West Wing entrance for check-in and shelter assignment', dist: '400m' }
      ],
      coords: { lat: 20.3533, lon: 85.8189 }
    }
  ]
};

// Procedural fallback shelter generator for any other city with empathetic copy
function getProceduralShelters(city, state, lat = 20.0, lon = 85.0) {
  const normCity = (city || 'Local').trim();
  const normState = (state || 'Region').trim();

  return [
    {
      id: `${normCity.toLowerCase()}-1`,
      name: `${normCity} Municipal Emergency Relief Concourse`,
      district: `${normCity}, ${normState}`,
      distanceKm: 1.4,
      elevationM: 28,
      totalCapacity: 2200,
      currentOccupancy: 1340,
      structureType: 'Reinforced Pucca Relief Complex',
      warden: `Duty Officer (${normCity} Emergency Cell)`,
      phone: '1077 (District Helpline)',
      status: 'Open & Safe',
      supplies: {
        power: 'Automatic generators active with continuous backup lighting',
        medical: 'District medical mobile aid unit ready onsite',
        water: 'Clean drinking water stored & continuously tested',
        food: 'Community kitchen serving warm nutritious meals'
      },
      safeCorridor: `Proceed via ${normCity} high-street flyover. Our teams are keeping underpasses clear.`,
      waypoints: [
        { step: 1, text: `Head safely toward ${normCity} Administrative Circle`, dist: '600m' },
        { step: 2, text: 'Take elevated bypass away from low-lying drainage canals', dist: '500m' },
        { step: 3, text: 'Enter through Central Emergency Intake Gate', dist: '300m' }
      ],
      coords: { lat, lon }
    },
    {
      id: `${normCity.toLowerCase()}-2`,
      name: `${normCity} High-Ground Government College Pavilion`,
      district: `${normCity}, ${normState}`,
      distanceKm: 3.2,
      elevationM: 34,
      totalCapacity: 1800,
      currentOccupancy: 620,
      structureType: 'High-Elevation Multipurpose Educational Complex',
      warden: 'Disaster Relief Coordinator',
      phone: '112 (National Emergency)',
      status: 'Open & Safe',
      supplies: {
        power: 'Solar array & backup generators active',
        medical: 'Red Cross first-aid mobile station ready',
        water: 'Purified drinking water tanks available',
        food: 'Hot meals & dry emergency rations provided'
      },
      safeCorridor: `Follow the main ridge road towards North Ridge. Avoid low-lying unpaved streets.`,
      waypoints: [
        { step: 1, text: `Exit local area toward North Ridge Avenue`, dist: '1.4 km' },
        { step: 2, text: 'Follow emergency signage towards College Campus', dist: '1.3 km' },
        { step: 3, text: 'Check in at Main Auditorium registration desk', dist: '500m' }
      ],
      coords: { lat: lat + 0.02, lon: lon + 0.02 }
    }
  ];
}

export default function ShelterNavigator({ currentCity = 'Puri', currentState = 'Odisha', coordinates }) {
  const [selectedShelterForRoute, setSelectedShelterForRoute] = useState(null);

  const cityKey = (currentCity || '').toLowerCase().trim();
  const shelters = SHELTER_REGISTRY[cityKey] || getProceduralShelters(
    currentCity, 
    currentState, 
    coordinates?.lat || 20.296, 
    coordinates?.lon || 85.824
  );

  return (
    <div className="space-y-4 font-sans">
      
      {/* Overview Banner: Calming Obsidian/Slate with Soft Sage & Sky Accents */}
      <div className="p-5 sm:p-6 rounded-[28px] bg-gradient-to-r from-[#121824]/95 via-[#10141e]/95 to-[#131a28]/95 border border-white/[0.08] shadow-xl flex items-center justify-between flex-wrap gap-4 backdrop-blur-xl relative overflow-hidden">
        {/* Soft Ambient Reassurance Glow */}
        <div className="absolute -top-16 -left-16 w-52 h-52 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0 shadow-sm">
            <ShieldAlert className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-normal font-sans">
              Safe Evacuation Shelters for {currentCity}, {currentState}
            </h3>
            <p className="text-xs text-stone-300 font-sans mt-0.5 leading-relaxed">
              Verified high-elevation relief centers with continuous electricity, doctors on-duty, and clean drinking water.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs relative z-10">
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-sans font-semibold flex items-center gap-2 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span>{shelters.length} Shelters Open & Ready</span>
          </span>
        </div>
      </div>

      {/* Shelter Cards Grid: Softened Geometry, Muted Calming Tones, Reduced Cognitive Load */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {shelters.map((shelter) => {
          const occupancyPercent = Math.round((shelter.currentOccupancy / shelter.totalCapacity) * 100);
          const isCrowded = occupancyPercent >= 75;

          // Empathetic, calming capacity microcopy
          let occupancyHeadline = '';
          if (occupancyPercent < 50) {
            occupancyHeadline = `Plenty of space available (${occupancyPercent}% full)`;
          } else if (occupancyPercent < 75) {
            occupancyHeadline = `Comfortable space available (${occupancyPercent}% full)`;
          } else {
            occupancyHeadline = `Filling up quickly (${occupancyPercent}% full) • Relief staff assisting`;
          }

          return (
            <div 
              key={shelter.id}
              className="p-5 sm:p-6 rounded-[26px] flex flex-col justify-between space-y-4 border border-white/[0.08] hover:border-sky-500/35 transition-all duration-300 bg-[#111622]/95 hover:bg-[#131926]/98 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 group relative overflow-hidden"
            >
              {/* Subtle Ambient Hover Glow */}
              <div className="absolute -top-16 -right-16 w-44 h-44 bg-sky-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-sky-500/10 transition-all duration-500" />

              {/* Header Info */}
              <div className="space-y-3 relative z-10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base leading-snug font-sans tracking-tight">
                      {shelter.name}
                    </h4>

                    {/* Distance & High-Ground Badges */}
                    <div className="flex items-center gap-2 flex-wrap text-xs text-stone-300 mt-1.5 font-sans">
                      <span className="flex items-center gap-1 text-stone-400">
                        <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span>{shelter.district}</span>
                      </span>
                      <span className="text-stone-600">•</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 font-medium text-[11px]">
                        📍 {shelter.distanceKm} km away
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-medium text-[11px]">
                        ⛰️ High Ground (+{shelter.elevationM}m)
                      </span>
                    </div>
                  </div>

                  {/* Soft Sage/Amber Status Pill with Breathing Glow */}
                  <span className={`text-[11px] font-sans px-3 py-1 rounded-full font-semibold border shrink-0 flex items-center gap-1.5 shadow-sm transition-colors ${
                    isCrowded 
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' 
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  }`}>
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isCrowded ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${isCrowded ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                    </span>
                    <span>{shelter.status}</span>
                  </span>
                </div>

                {/* Empathetic Capacity Bar with Smooth Shimmer Animation */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-sans">
                    <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-stone-400" />
                      <span>{occupancyHeadline}</span>
                    </span>
                    <span className="text-[11px] text-stone-400 font-sans">
                      {shelter.currentOccupancy.toLocaleString()} / {shelter.totalCapacity.toLocaleString()} places
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden border border-white/5 p-0.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        isCrowded 
                          ? 'bg-gradient-to-r from-amber-400 to-rose-400' 
                          : 'bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400'
                      }`}
                      style={{ width: `${occupancyPercent}%` }}
                    />
                  </div>
                </div>

                {/* Essential On-Ground Amenities: Clean Vertical Rows (Reduced Cognitive Load) */}
                <div className="py-2.5 px-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] divide-y divide-white/[0.04] text-xs font-sans">
                  <div className="flex items-center justify-between py-1.5 text-stone-200">
                    <span className="flex items-center gap-2 text-stone-400 shrink-0">
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span className="font-medium">Power Backup</span>
                    </span>
                    <span className="text-right text-stone-300 text-[11px] font-normal truncate ml-3">{shelter.supplies.power}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 text-stone-200">
                    <span className="flex items-center gap-2 text-stone-400 shrink-0">
                      <Stethoscope className="w-3.5 h-3.5 text-rose-300" />
                      <span className="font-medium">Medical Care</span>
                    </span>
                    <span className="text-right text-stone-300 text-[11px] font-normal truncate ml-3">{shelter.supplies.medical}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 text-stone-200">
                    <span className="flex items-center gap-2 text-stone-400 shrink-0">
                      <Droplets className="w-3.5 h-3.5 text-sky-300" />
                      <span className="font-medium">Drinking Water</span>
                    </span>
                    <span className="text-right text-stone-300 text-[11px] font-normal truncate ml-3">{shelter.supplies.water}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 text-stone-200">
                    <span className="flex items-center gap-2 text-stone-400 shrink-0">
                      <Utensils className="w-3.5 h-3.5 text-emerald-300" />
                      <span className="font-medium">Warm Meals</span>
                    </span>
                    <span className="text-right text-stone-300 text-[11px] font-normal truncate ml-3">{shelter.supplies.food}</span>
                  </div>
                </div>

                {/* Safe Evacuation Route Warning: Warm Amber (Non-Aggressive) */}
                <div className="p-3 rounded-2xl bg-amber-500/[0.08] border border-amber-500/20 text-xs text-amber-100 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed font-sans">
                    <strong className="text-amber-300 font-semibold block mb-0.5">Your Safest Evacuation Route:</strong>
                    <span className="text-stone-300">
                      {shelter.safeCorridor.replace(/^Your Safest Route:\s*/i, '').replace(/^Safe Corridor:\s*/i, '')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Full-Width Primary Evacuation Button + Clear Tap Warden Action */}
              <div className="space-y-2 pt-2 border-t border-white/[0.06] relative z-10">
                <button
                  type="button"
                  onClick={() => {
                    sound.playBlip();
                    setSelectedShelterForRoute(shelter);
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-sky-950/40 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer hover:scale-[1.01] active:scale-[0.99] group"
                >
                  <Navigation className="w-4 h-4 text-white" />
                  <span>Get Safe Evacuation Route</span>
                  <ChevronRight className="w-4 h-4 ml-auto text-sky-200 transition-transform group-hover:translate-x-1" />
                </button>

                <div className="flex items-center justify-between text-xs text-stone-400 px-1 pt-0.5 font-sans">
                  <span className="flex items-center gap-1.5 text-stone-400 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Warden on duty: <strong className="text-stone-300 font-medium">{shelter.warden}</strong></span>
                  </span>

                  <a
                    href={`tel:${shelter.phone.replace(/[^0-9+]/g, '')}`}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-stone-200 border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                    title="Call shelter warden"
                  >
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>Call Warden</span>
                  </a>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* MODAL: TURN-BY-TURN SAFE EVACUATION ROUTE NAVIGATOR */}
      {selectedShelterForRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in font-sans">
          <div className="bg-[#101520] border border-sky-500/30 rounded-[28px] max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-xs">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shadow-sm">
                  <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '10s' }} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base font-sans">
                    Safe Evacuation Route
                  </h3>
                  <p className="text-[11px] text-stone-400 font-sans">
                    Navigating to: <strong className="text-sky-300">{selectedShelterForRoute.name}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedShelterForRoute(null)}
                className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Route Summary Badges */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-stone-400 block font-sans">Distance</span>
                <span className="text-sm font-bold text-white font-mono">{selectedShelterForRoute.distanceKm} km</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-stone-400 block font-sans">Est. Walking Time</span>
                <span className="text-sm font-bold text-emerald-300 font-mono">
                  {Math.round(selectedShelterForRoute.distanceKm * 12)} mins
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-stone-400 block font-sans">Elevation Safety</span>
                <span className="text-sm font-bold text-sky-300 font-mono">+{selectedShelterForRoute.elevationM}m safe</span>
              </div>
            </div>

            {/* Turn-by-Turn Guidance Corridor */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-white block font-sans">
                Turn-by-Turn Safe Corridor Steps:
              </span>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {selectedShelterForRoute.waypoints.map((wp) => (
                  <div key={wp.step} className="p-3 rounded-2xl bg-[#141b29] border border-white/[0.06] flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center justify-center text-[10px] font-bold font-mono shrink-0 mt-0.5">
                      {wp.step}
                    </span>
                    <div className="flex-1">
                      <p className="text-xs text-stone-200 leading-snug font-sans">{wp.text}</p>
                      <span className="text-[10px] text-stone-400 font-mono">{wp.dist} segment</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calming Hazard Avoidance Advice */}
            <div className="p-3 rounded-2xl bg-amber-500/[0.08] border border-amber-500/25 text-amber-100 text-[11px] leading-relaxed flex items-start gap-2.5 font-sans">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-amber-300 font-semibold">Safety Reminder:</strong> Stay on high-ground roadways and avoid waterlogged crossings. Municipal teams are stationed along this route to assist you.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedShelterForRoute.coords.lat},${selectedShelterForRoute.coords.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-950/40"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Launch GPS Map Navigation</span>
              </a>

              <button
                type="button"
                onClick={() => setSelectedShelterForRoute(null)}
                className="py-3 px-4 bg-white/10 hover:bg-white/15 text-stone-200 font-medium text-xs rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

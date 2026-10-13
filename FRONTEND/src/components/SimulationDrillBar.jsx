import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  AlertTriangle, 
  Wind, 
  CloudRain, 
  Gauge, 
  Clock, 
  ShieldAlert,
  ChevronRight,
  Flame
} from 'lucide-react';
import { sound } from '../utils/audioSynth';

export const DRILL_SCENARIOS = [
  {
    id: 'fani_2019',
    name: 'Cyclone Fani (Cat-4 Super Cyclone)',
    region: 'Puri, Odisha',
    defaultCity: 'Puri',
    hazardType: 'Extremely Severe Cyclonic Storm',
    summary: 'Direct coastal landfall simulation based on May 2019 benchmark with 205 km/h gusts and severe storm surge.',
    steps: [
      {
        phase: 'T-24h: Deep Depression',
        timeOffset: '24 Hours Before Landfall',
        windKm: 75,
        rainMm: 22,
        pressureHpa: 988,
        tempC: 31,
        riskScore: 52,
        riskLevel: 'Moderate',
        alertHeadline: 'Yellow Alert: Deep Depression tracking towards coastal Odisha. Fishermen advised not to venture into Bay of Bengal.',
        vernacularOdia: 'ବଙ୍ଗୋପସାଗରରେ ଗଭୀର ଅବପାତ। ସମୁଦ୍ରକୁ ଯାଆନ୍ତୁ ନାହିଁ। ୭୫ କି.ମି./ଘଣ୍ଟା ବେଗରେ ପବନ ବହିବ।',
        vernacularHindi: 'बंगाल की खाड़ी में गहरा दबाव। मछुआरे समुद्र में न जाएं। सतर्क रहें।'
      },
      {
        phase: 'T-12h: Severe Cyclonic Storm',
        timeOffset: '12 Hours Before Landfall',
        windKm: 135,
        rainMm: 78,
        pressureHpa: 960,
        tempC: 28,
        riskScore: 78,
        riskLevel: 'Severe',
        alertHeadline: 'Orange Alert: Cyclone intensifies into Very Severe Storm. Mass evacuation ordered for low-lying coastal habitations.',
        vernacularOdia: 'ଅରେଞ୍ଜ ଆଲର୍ଟ: ଭୟଙ୍କର ବାତ୍ୟା ନିକଟତର। ତଳିଆ ଅଞ୍ଚଳ ତୁରନ୍ତ ଖାଲି କରନ୍ତୁ ଏବଂ ନିକଟସ୍ଥ ବାତ୍ୟା ଆଶ୍ରୟସ୍ଥଳୀକୁ ଯାଆନ୍ତୁ।',
        vernacularHindi: 'ऑरेंज अलर्ट: अत्यधिक गंभीर चक्रवात। तटीय क्षेत्रों को तुरंत खाली कर सुरक्षित आश्रयों में जाएं।'
      },
      {
        phase: 'Landfall Eye Strike',
        timeOffset: 'Landfall Impact (0 Hours)',
        windKm: 205,
        rainMm: 195,
        pressureHpa: 932,
        tempC: 25,
        riskScore: 98,
        riskLevel: 'Catastrophic',
        alertHeadline: 'RED WARNING: Super Cyclone Landfall in progress near Puri coast. Maximum destructive winds 205 km/h. Complete curfew.',
        vernacularOdia: 'ଲାଲ୍ ଚେତାବନୀ: ପୁରୀ ଉପକୂଳରେ ଭୟଙ୍କର ବାତ୍ୟା ଧକ୍କା। ଘରୁ ବାହାରନ୍ତୁ ନାହିଁ। ୨୦୫ କି.ମି. ପବନ!',
        vernacularHindi: 'रेड अलर्ट: सुपर साइक्लोन पुरी तट से टकरा रहा है। 205 किमी/घंटा तूफानी हवाएं। पूर्णतः घर में रहें!'
      },
      {
        phase: 'T+12h: Post-Landfall Recovery',
        timeOffset: '12 Hours After Landfall',
        windKm: 65,
        rainMm: 45,
        pressureHpa: 994,
        tempC: 27,
        riskScore: 48,
        riskLevel: 'Caution',
        alertHeadline: 'Post-Landfall Recovery: Storm weakened to deep depression. NDRF search and rescue teams mobilizing for road clearance.',
        vernacularOdia: 'ବାତ୍ୟା ଦୁର୍ବଳ ହୋଇଛି। ଭଙ୍ଗା ବିଦ୍ୟୁତ ତାରଠାରୁ ଦୂରରେ ରୁହନ୍ତୁ। ଉଦ୍ଧାର କାର୍ଯ୍ୟ ଜାରି ରହିଛି।',
        vernacularHindi: 'तूफान कमजोर हुआ। गिरे हुए बिजली के खंभों से दूर रहें। राहत दल सक्रिय हैं।'
      }
    ]
  },
  {
    id: 'biparjoy_2023',
    name: 'Cyclone Biparjoy (Arabian Sea Strike)',
    region: 'Kutch / Dwarka, Gujarat',
    defaultCity: 'Dwarka',
    hazardType: 'Extremely Severe Cyclonic Storm',
    summary: 'Saurashtra and Kutch coastal strike simulation with destructive 140 km/h squalls and maritime storm surge.',
    steps: [
      {
        phase: 'T-18h: Maritime Warning',
        timeOffset: '18 Hours to Landfall',
        windKm: 85,
        rainMm: 35,
        pressureHpa: 980,
        tempC: 32,
        riskScore: 58,
        riskLevel: 'Moderate',
        alertHeadline: 'Yellow Alert: Cyclone Biparjoy tracking north-northeast towards Saurashtra and Kutch coastline.',
        vernacularGujarati: 'ચેતવણી: બિપોરજોય વાવાઝોડું કચ્છ અને સૌરાષ્ટ્ર તરફ આગળ વધી રહ્યું છે. દરિયાકાંઠે ન જાવ.',
        vernacularHindi: 'येलो अलर्ट: चक्रवात बिपरजॉय सौराष्ट्र और कच्छ की ओर बढ़ रहा है। तट से दूर रहें।'
      },
      {
        phase: 'T-6h: Critical Coastal Evacuation',
        timeOffset: '6 Hours to Landfall',
        windKm: 125,
        rainMm: 95,
        pressureHpa: 958,
        tempC: 28,
        riskScore: 84,
        riskLevel: 'Severe',
        alertHeadline: 'Orange Alert: Red signal hoisted at Kandla and Mandvi ports. Over 75,000 residents moved to relief centers.',
        vernacularGujarati: 'ઓરેન્જ એલર્ટ: તમામ બંદરો પર ભયસૂચક સિગ્નલ. સુરક્ષિત આશ્રયસ્થાનોમાં પહોંચી જાઓ.',
        vernacularHindi: 'ऑरेंज अलर्ट: गुजरात तट पर भारी चेतावनी। तुरंत सुरक्षित राहत शिविरों में शरण लें।'
      },
      {
        phase: 'Landfall at Jakhau Port',
        timeOffset: 'Landfall Impact (0 Hours)',
        windKm: 145,
        rainMm: 160,
        pressureHpa: 940,
        tempC: 26,
        riskScore: 94,
        riskLevel: 'Catastrophic',
        alertHeadline: 'RED ALERT: Cyclone Biparjoy crossing near Jakhau Port. Torrential rainfall and storm surge active.',
        vernacularGujarati: 'રેડ એલર્ટ: બિપોરજોય જખૌ પોર્ટ નજીક ટકરાયું. ૧૪૫ કિ.મી./કલાક પવન. ઘરમાં જ રહો!',
        vernacularHindi: 'रेड अलर्ट: जखौ बंदरगाह पर भीषण लैंडफॉल। तेज आंधी और भारी वर्षा। घर से बाहर न निकलें!'
      },
      {
        phase: 'T+8h: Inland Inundation',
        timeOffset: '8 Hours Post Landfall',
        windKm: 60,
        rainMm: 80,
        pressureHpa: 990,
        tempC: 29,
        riskScore: 55,
        riskLevel: 'Moderate',
        alertHeadline: 'Flash Flood Watch: Heavy residual moisture causing localized waterlogging across Kutch and Banaskantha.',
        vernacularGujarati: 'પૂર ચેતવણી: ભારે વરસાદને કારણે નીચાણવાળા વિસ્તારોમાં પાણી ભરાયા. સહાય ટીમ કાર્યરત.',
        vernacularHindi: 'फ्लड अलर्ट: भारी बारिश से जलभराव। प्रशासन द्वारा राहत सामग्री वितरित की जा रही है।'
      }
    ]
  },
  {
    id: 'brahmaputra_flood',
    name: 'Brahmaputra Flash Flood Surge',
    region: 'Guwahati / Majuli, Assam',
    defaultCity: 'Guwahati',
    hazardType: 'Catastrophic Riverine Inundation',
    summary: 'Cloudburst-driven flash flood simulation with rising river danger levels and emergency island evacuations.',
    steps: [
      {
        phase: 'Day 1: Monsoonal Cloudburst',
        timeOffset: 'Heavy Influx (24h Accumulated)',
        windKm: 35,
        rainMm: 110,
        pressureHpa: 1002,
        tempC: 26,
        riskScore: 66,
        riskLevel: 'High',
        alertHeadline: 'Amber Flood Alert: Continuous torrential rain across upper catchment areas. Brahmaputra flowing above warning level.',
        vernacularAssamese: 'সতৰ্কবাণী: ব্ৰহ্মপুত্ৰৰ পানী বিপদসীমাৰ ওচৰ চাপিছে। সকলো ঘাটত নাও চলাচল নিষিদ্ধ।',
        vernacularHindi: 'बाढ़ चेतावनी: ब्रह्मपुत्र नदी का जलस्तर चेतावनी स्तर से ऊपर। संवेदनशील क्षेत्रों में अलर्ट।'
      },
      {
        phase: 'Day 2: Danger Level Breach',
        timeOffset: 'Critical River Crest (48h Influx)',
        windKm: 45,
        rainMm: 195,
        pressureHpa: 998,
        tempC: 24,
        riskScore: 89,
        riskLevel: 'Severe',
        alertHeadline: 'Orange Warning: Embankment breaches reported in 3 low-lying districts. NDRF boats mobilized for island evacuations.',
        vernacularAssamese: 'বিপদজনক সংকেত: বান্ধ ভাঙি পানী সোমোৱাৰ আশংকা। ওখ স্থানলৈ আশ্ৰয় লওক।',
        vernacularHindi: 'गंभीर चेतावनी: निचले इलाकों में तटबंध टूटने का खतरा। सुरक्षित ऊंचे स्थानों पर जाएं।'
      },
      {
        phase: 'Day 3: Peak Inundation Surge',
        timeOffset: 'Severe Inundation Peak',
        windKm: 55,
        rainMm: 240,
        pressureHpa: 995,
        tempC: 23,
        riskScore: 97,
        riskLevel: 'Catastrophic',
        alertHeadline: 'RED DISASTER ALERT: 85% of Kaziranga and surrounding villages inundated. Air force airdrop of dry rations initiated.',
        vernacularAssamese: 'চৰম জৰুৰীকালীন অৱস্থা: সৰ্বত্ৰে জলমগ্ন। সাহায্য শিবিৰত যোগাযোগ কৰক।',
        vernacularHindi: 'रेड डिजास्टर अलर्ट: भारी बाढ़ से व्यापक जलभराव। तुरंत वायुसेना/एनडीआरएफ सहायता केंद्रों से संपर्क करें।'
      },
      {
        phase: 'Day 4: Receding Waters & Relief',
        timeOffset: 'Post-Flood Stabilization',
        windKm: 25,
        rainMm: 30,
        pressureHpa: 1004,
        tempC: 28,
        riskScore: 50,
        riskLevel: 'Caution',
        alertHeadline: 'Relief & Rehabilitation: River receding below danger mark. Medical units treating waterborne infection hazards.',
        vernacularAssamese: 'পানী নামিবলৈ ধৰিছে। বিশুদ্ধ খোৱাপানী ব্যৱহাৰ কৰক আৰু মহাবাহী ৰোগৰ পৰা সাৱধানে থাকক।',
        vernacularHindi: 'पानी घटने लगा है। दूषित जल से बचें और स्वास्थ्य शिविरों से दवाएं प्राप्त करें।'
      }
    ]
  }
];

export default function SimulationDrillBar({
  isSimulating,
  currentScenario,
  stepIndex,
  onStartSimulation,
  onStopSimulation,
  onSelectScenario,
  onSelectStep
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef(null);

  const scenario = DRILL_SCENARIOS.find(s => s.id === currentScenario) || DRILL_SCENARIOS[0];
  const currentStep = scenario.steps[stepIndex] || scenario.steps[0];

  // Auto-play timeline loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        onSelectStep((prev) => {
          const next = (prev + 1) % scenario.steps.length;
          sound.playBlip();
          return next;
        });
      }, 5000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, scenario.steps.length, onSelectStep]);

  if (!isSimulating) {
    return (
      <div className="bg-[#17201a]/85 border-b border-white/[0.07] px-4 py-2 flex items-center justify-between text-xs backdrop-blur-xl">
        <div className="flex items-center gap-2.5 text-stone-300">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-semibold text-white font-sans">Emergency Simulation Drill Sandbox:</span>
          <span className="text-stone-400 hidden sm:inline font-sans">
            Test platform response to Category-4 cyclones and flash floods with historical IMD benchmarks.
          </span>
        </div>
        <button
          onClick={() => {
            try { sound.playAlertChime(); } catch {}
            onStartSimulation(DRILL_SCENARIOS[0].id);
          }}
          className="px-3.5 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-stone-200 hover:text-white font-medium border border-white/15 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
        >
          <Play className="w-3 h-3 text-emerald-400" />
          <span>Launch Disaster Drill</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#18211a]/95 border-b border-rose-500/30 backdrop-blur-2xl shadow-2xl p-3 sm:p-4 text-xs animate-in slide-in-from-top-4 z-40 relative">
      
      {/* Top row: Status tag, scenario picker, and exit */}
      <div className="flex items-center justify-between gap-3 flex-wrap pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-rose-400 tracking-wider font-mono uppercase text-[11px]">
              SIMULATION DRILL ACTIVE
            </span>
            <span className="hidden md:inline text-slate-400">•</span>
            <span className="font-medium text-white hidden md:inline">{scenario.name}</span>
          </div>
        </div>

        {/* Scenario dropdown selector */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-slate-400 font-medium hidden sm:inline">Scenario:</label>
          <select
            value={currentScenario}
            onChange={(e) => {
              sound.playBlip();
              onSelectScenario(e.target.value);
            }}
            className="bg-[#121B35] border border-white/20 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-rose-400 font-medium"
          >
            {DRILL_SCENARIOS.map(s => (
              <option key={s.id} value={s.id} className="bg-[#0B1226] text-white">
                {s.name} ({s.region})
              </option>
            ))}
          </select>

          {/* Exit Drill Button */}
          <button
            onClick={() => {
              sound.playBlip();
              setIsPlaying(false);
              onStopSimulation();
            }}
            className="px-2.5 py-1 rounded-lg bg-white/[0.08] hover:bg-rose-500/20 text-slate-300 hover:text-rose-200 border border-white/10 flex items-center gap-1 transition-colors cursor-pointer"
            title="Exit simulation and return to real-world live sensors"
          >
            <X className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-[11px] font-semibold">Exit Drill</span>
          </button>
        </div>
      </div>

      {/* Middle row: Timeline Phase Scrubber & Playback Controls */}
      <div className="mt-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Play / Pause / Reset Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              sound.playBlip();
              setIsPlaying(!isPlaying);
            }}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
              isPlaying 
                ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause Auto-Run' : 'Auto Playback'}</span>
          </button>

          <button
            onClick={() => {
              sound.playBlip();
              onSelectStep(0);
            }}
            className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 border border-white/10 cursor-pointer"
            title="Reset to Phase 1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Phase Timeline Stepper */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 overflow-x-auto py-1 scrollbar-none">
          {scenario.steps.map((st, idx) => {
            const isActive = idx === stepIndex;
            return (
              <button
                key={st.phase}
                onClick={() => {
                  sound.playBlip();
                  onSelectStep(idx);
                }}
                className={`flex-1 min-w-[130px] p-2 rounded-xl text-left transition-all border cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-950/80 to-rose-900/60 border-rose-500/60 text-white shadow-lg shadow-rose-950/40 ring-1 ring-rose-500/50'
                    : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/10 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className={isActive ? 'text-rose-300 font-bold' : 'text-slate-500'}>
                    Phase 0{idx + 1}
                  </span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold ${
                    st.riskScore >= 80 ? 'bg-rose-500/20 text-rose-300' : st.riskScore >= 60 ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'
                  }`}>
                    {st.riskLevel}
                  </span>
                </div>
                <div className={`text-xs font-semibold truncate mt-0.5 ${isActive ? 'text-white' : 'text-slate-300'}`}>
                  {st.phase}
                </div>
              </button>
            );
          })}
        </div>

      </div>

      {/* Bottom row: Live Telemetry Metrics generated by current simulation step */}
      <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-2 text-[11px]">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-cyan-300 font-mono">
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            <span>Wind: <strong>{currentStep.windKm} km/h</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-300 font-mono">
            <CloudRain className="w-3.5 h-3.5 text-blue-400" />
            <span>Rain: <strong>{currentStep.rainMm} mm/h</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-300 font-mono">
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            <span>Barometer: <strong>{currentStep.pressureHpa} hPa</strong></span>
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Risk Score: <strong className="text-rose-400">{currentStep.riskScore}/100</strong></span>
          </div>
        </div>

        <div className="text-slate-300 italic truncate max-w-md hidden lg:block">
          "{currentStep.alertHeadline}"
        </div>
      </div>

    </div>
  );
}

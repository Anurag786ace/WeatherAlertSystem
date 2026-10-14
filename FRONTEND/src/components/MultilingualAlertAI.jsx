import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Globe, 
  Volume2, 
  VolumeX, 
  Send, 
  Radio, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Smartphone, 
  MessageSquare, 
  PhoneCall, 
  TowerControl, 
  ChevronDown, 
  RefreshCw, 
  Copy, 
  Check, 
  Share2, 
  Clock, 
  ShieldAlert,
  Sliders,
  ExternalLink,
  Info,
  Play,
  Square,
  ShieldCheck,
  Zap,
  Activity,
  Waves,
  Wifi,
  Signal,
  Columns,
  Eye,
  Search,
  ArrowRight,
  ArrowLeft,
  Flame,
  CloudRain,
  Wind,
  PhoneForwarded,
  Cpu,
  Layers,
  ChevronRight,
  CheckCircle,
  Lock,
  User,
  Users,
  Bell,
  BellRing,
  Mail,
  Heart,
  Headphones,
  HelpCircle
} from 'lucide-react';
import { sound } from '../utils/audioSynth';
import { useWeather } from '../context/WeatherContext';
import { useAuth } from '../context/AuthContext';
import CountUp from './CountUp';
import { notificationService } from '../utils/notificationService';
import { cleanPhoneNumber, openDeviceSms, openWhatsAppChat } from '../utils/directDispatch';
import ContactActionModal from './ContactActionModal';

// Helper to render WhatsApp formatted text (*bold* -> <strong>, clean line breaks)
function renderFormattedWhatsApp(rawText) {
  if (!rawText) return null;
  const lines = rawText.split('\n');
  return lines.map((line, idx) => {
    if (!line.trim()) {
      return <div key={idx} className="h-2" />;
    }
    const parts = line.split(/(\*[^*]+\*)/g);
    return (
      <div key={idx} className="leading-relaxed">
        {parts.map((part, pIdx) => {
          if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
            return (
              <strong key={pIdx} className="font-semibold text-white">
                {part.slice(1, -1)}
              </strong>
            );
          }
          return <span key={pIdx} className="text-emerald-100/90">{part}</span>;
        })}
      </div>
    );
  });
}

// Regional cultural greeting helper (creates instant shared community identity)
export function getRegionalGreeting(city = 'Bhubaneswar', langCode = 'or') {
  const normCity = (city || '').trim().toLowerCase();

  // Odisha local hubs
  if (normCity.includes('bhubaneswar')) {
    return 'Stay safe, Bhubaneswar! (ଭୁବନେଶ୍ୱରବାସୀ, ସୁରକ୍ଷିତ ରୁହନ୍ତୁ)';
  }
  if (normCity.includes('puri')) {
    return 'Stay safe, Puri! (ପୁରୀବାସୀ, ସୁରକ୍ଷିତ ରୁହନ୍ତୁ)';
  }
  if (normCity.includes('cuttack')) {
    return 'Stay safe, Cuttack! (କଟକବାସୀ, ସୁରକ୍ଷିତ ରୁହନ୍ତୁ)';
  }
  if (normCity.includes('rourkela')) {
    return 'Stay safe, Rourkela! (ରାଉରକେଲାବାସୀ, ସୁରକ୍ଷିତ ରୁହନ୍ତୁ)';
  }
  if (normCity.includes('sambalpur')) {
    return 'Stay safe, Sambalpur! (ସମ୍ବଲପୁରବାସୀ, ସୁରକ୍ଷିତ ରୁହନ୍ତୁ)';
  }
  if (normCity.includes('balasore') || normCity.includes('baleswar')) {
    return 'Stay safe, Balasore! (ବାଲେଶ୍ୱରବାସୀ, ସୁରକ୍ଷିତ ରୁହନ୍ତୁ)';
  }
  if (normCity.includes('berhampur')) {
    return 'Stay safe, Berhampur! (ବ୍ରହ୍ମପୁରବାସୀ, ସୁରକ୍ଷିତ ରୁହନ୍ତୁ)';
  }

  // Major Indian hubs
  if (normCity.includes('kolkata')) {
    return 'Stay safe, Kolkata! (কলকাতা, সবাই নিরাপদে থাকুন)';
  }
  if (normCity.includes('mumbai')) {
    return 'Stay safe, Mumbai! (मुंबईकर, सुरक्षित राहा)';
  }
  if (normCity.includes('delhi')) {
    return 'Stay safe, Delhi! (दिल्लीवासी, सुरक्षित रहें)';
  }
  if (normCity.includes('chennai')) {
    return 'Stay safe, Chennai! (சென்னை, பாதுகாப்பாக இருங்கள்)';
  }
  if (normCity.includes('bengaluru') || normCity.includes('bangalore')) {
    return 'Stay safe, Bengaluru! (ಬೆಂಗಳೂರು, ಸುರಕ್ಷಿತವಾಗಿರಿ)';
  }
  if (normCity.includes('hyderabad')) {
    return 'Stay safe, Hyderabad! (హైదరాబాద్, సురକ୍ଷితంగా ఉండండి)';
  }
  if (normCity.includes('ahmedabad')) {
    return 'Stay safe, Ahmedabad! (અમદાવાદ, સાવચેત રહો)';
  }
  if (normCity.includes('patna')) {
    return 'Stay safe, Patna! (पटनावासी, सुरक्षित रहें)';
  }
  if (normCity.includes('guwahati')) {
    return 'Stay safe, Guwahati! (গুৱাহাটী, সুৰক্ষিত থাকক)';
  }

  const fallbacks = {
    or: `Stay safe, ${city}! (${city}ବାସୀ, ସୁରକ୍ଷିତ ରୁହନ୍ତୁ)`,
    hi: `Stay safe, ${city}! (${city}वासी, सुरक्षित रहें)`,
    bn: `Stay safe, ${city}! (${city}, সবাই নিরাপদে থাকুন)`,
    ta: `Stay safe, ${city}! (${city}, பாதுகாப்பாக இருங்கள்)`,
    te: `Stay safe, ${city}! (${city}, సురକ୍ଷିତంగా ఉండండి)`,
    mr: `Stay safe, ${city}! (${city}कर, सुरक्षित राहा)`,
    gu: `Stay safe, ${city}! (${city}વાસી, સાવચેત રહો)`,
    kn: `Stay safe, ${city}! (${city}, ಸುರಕ್ಷಿತವಾಗಿರಿ)`,
    ml: `Stay safe, ${city}! (${city}, സുരക്ഷിതമായിരിക്കുക)`,
    pa: `Stay safe, ${city}! (${city} ਵਾਸੀਓ, ਸੁਰੱਖਿਅਤ ਰਹੋ)`,
    as: `Stay safe, ${city}! (${city}, সুৰক্ষিত থাকক)`,
    ur: `Stay safe, ${city}! (${city}، محفوظ رہیں)`,
  };

  return fallbacks[langCode] || `Stay safe, ${city}! (${city} Community, Stay Safe)`;
}

// Conversational, human-first weather headline generator
export function getConversationalWeatherHeadline(city = 'Bhubaneswar', weatherObj) {
  const temp = Math.round(weatherObj?.temp ?? 26);
  const condition = (weatherObj?.description || weatherObj?.condition || 'overcast').toLowerCase();
  let skyText = condition;
  if (skyText.includes('overcast') || skyText.includes('cloud')) {
    skyText = 'overcast';
  } else if (skyText.includes('rain') || skyText.includes('drizzle')) {
    skyText = 'rainy';
  } else if (skyText.includes('clear')) {
    skyText = 'clear';
  } else if (skyText.includes('thunder')) {
    skyText = 'stormy';
  } else if (skyText.includes('mist') || skyText.includes('haze') || skyText.includes('fog')) {
    skyText = 'misty';
  }
  return `${city} Weather Check: It's currently ${temp}°C with ${skyText} skies.`;
}

// Comprehensive Pan-India & Vernacular Language Matrix (All 22 Eighth Schedule Languages + Regional Dialects)
export const ALL_VERNACULAR_LANGUAGES = [
  { 
    langCode: 'or', 
    langName: 'Odia', 
    nativeName: 'ଓଡ଼ିଆ', 
    state: 'Odisha', 
    script: 'Odia', 
    region: 'east', 
    regionLabel: 'East Coastal',
    flag: '🌊',
    sampleGreeting: 'ସତର୍କ ରୁହନ୍ତୁ' 
  },
  { 
    langCode: 'hi', 
    langName: 'Hindi', 
    nativeName: 'हिन्दी', 
    state: 'North / Central India', 
    script: 'Devanagari', 
    region: 'north', 
    regionLabel: 'North & Central',
    flag: '🏛️',
    sampleGreeting: 'सावधान रहें' 
  },
  { 
    langCode: 'bn', 
    langName: 'Bengali', 
    nativeName: 'বাংলা', 
    state: 'West Bengal & Tripura', 
    script: 'Bengali', 
    region: 'east', 
    regionLabel: 'East & Delta',
    flag: '🌿',
    sampleGreeting: 'সতর্ক থাকুন' 
  },
  { 
    langCode: 'ta', 
    langName: 'Tamil', 
    nativeName: 'தமிழ்', 
    state: 'Tamil Nadu & Puducherry', 
    script: 'Tamil', 
    region: 'south', 
    regionLabel: 'South Coastal',
    flag: '🛕',
    sampleGreeting: 'எச்சரிக்கையாக இருங்கள்' 
  },
  { 
    langCode: 'te', 
    langName: 'Telugu', 
    nativeName: 'తెలుగు', 
    state: 'Andhra Pradesh & Telangana', 
    script: 'Telugu', 
    region: 'south', 
    regionLabel: 'South Coastal',
    flag: '🌅',
    sampleGreeting: 'జాగ్రత్తగా ఉండండి' 
  },
  { 
    langCode: 'mr', 
    langName: 'Marathi', 
    nativeName: 'मराठी', 
    state: 'Maharashtra', 
    script: 'Devanagari', 
    region: 'west', 
    regionLabel: 'West Coast',
    flag: '🏰',
    sampleGreeting: 'सतर्क राहा' 
  },
  { 
    langCode: 'gu', 
    langName: 'Gujarati', 
    nativeName: 'ગુજરાતી', 
    state: 'Gujarat', 
    script: 'Gujarati', 
    region: 'west', 
    regionLabel: 'West Coast',
    flag: '🦁',
    sampleGreeting: 'સાવચેત રહો' 
  },
  { 
    langCode: 'kn', 
    langName: 'Kannada', 
    nativeName: 'ಕನ್ನಡ', 
    state: 'Karnataka', 
    script: 'Kannada', 
    region: 'south', 
    regionLabel: 'South Deccan',
    flag: '🐘',
    sampleGreeting: 'ಎಚ್ಚರಿಕೆಯಿಂದಿರಿ' 
  },
  { 
    langCode: 'ml', 
    langName: 'Malayalam', 
    nativeName: 'മലയാളം', 
    state: 'Kerala & Lakshadweep', 
    script: 'Malayalam', 
    region: 'south', 
    regionLabel: 'South Coast',
    flag: '🌴',
    sampleGreeting: 'ജാഗ്രത പാലിക്കുക' 
  },
  { 
    langCode: 'as', 
    langName: 'Assamese', 
    nativeName: 'অসমীয়া', 
    state: 'Assam & Northeast', 
    script: 'Bengali-Assamese', 
    region: 'northeast', 
    regionLabel: 'Northeast River Basin',
    flag: '🦏',
    sampleGreeting: 'সাৱধান হওক' 
  },
  { 
    langCode: 'pa', 
    langName: 'Punjabi', 
    nativeName: 'ਪੰਜਾਬੀ', 
    state: 'Punjab & Delhi', 
    script: 'Gurmukhi', 
    region: 'north', 
    regionLabel: 'North Plains',
    flag: '🌾',
    sampleGreeting: 'ਸੁਚੇਤ ਰਹੋ' 
  },
  { 
    langCode: 'ur', 
    langName: 'Urdu', 
    nativeName: 'اردو', 
    state: 'Pan-India & Telangana', 
    script: 'Nastaliq / Perso-Arabic', 
    region: 'all', 
    regionLabel: 'Pan-India Standard',
    flag: '🌙',
    sampleGreeting: 'محفوظ رہیں' 
  },
  { 
    langCode: 'ks', 
    langName: 'Kashmiri', 
    nativeName: 'کٲشُر', 
    state: 'Jammu & Kashmir', 
    script: 'Perso-Arabic', 
    region: 'north', 
    regionLabel: 'Kashmir Valley & Himalayas',
    flag: '❄️',
    sampleGreeting: 'خبردار روزِیو' 
  },
  { 
    langCode: 'ne', 
    langName: 'Nepali', 
    nativeName: 'नेपाली', 
    state: 'Sikkim & West Bengal', 
    script: 'Devanagari', 
    region: 'northeast', 
    regionLabel: 'Himalayan Foothills',
    flag: '🏔️',
    sampleGreeting: 'सचेत रहनुहोस्' 
  },
  { 
    langCode: 'kok', 
    langName: 'Konkani', 
    nativeName: 'कोंकणी', 
    state: 'Goa & West Coast', 
    script: 'Devanagari', 
    region: 'west', 
    regionLabel: 'Goa & Konkan Coast',
    flag: '🏖️',
    sampleGreeting: 'सावध रावात' 
  },
  { 
    langCode: 'mai', 
    langName: 'Maithili', 
    nativeName: 'मैथिली', 
    state: 'Bihar & Jharkhand', 
    script: 'Devanagari', 
    region: 'east', 
    regionLabel: 'Mithila & Eastern Plains',
    flag: '🌾',
    sampleGreeting: 'सचेत रहू' 
  },
  { 
    langCode: 'sat', 
    langName: 'Santali', 
    nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', 
    state: 'Jharkhand & Odisha', 
    script: 'Ol Chiki', 
    region: 'east', 
    regionLabel: 'Chota Nagpur Plateau',
    flag: '🏹',
    sampleGreeting: 'ᱥᱟᱛᱟᱨ ᱛᱟᱦᱮᱸᱱ ᱯᱮ' 
  },
  { 
    langCode: 'brx', 
    langName: 'Bodo', 
    nativeName: 'बड़ो', 
    state: 'Bodoland & Assam', 
    script: 'Devanagari', 
    region: 'northeast', 
    regionLabel: 'Brahmaputra Valley',
    flag: '🌳',
    sampleGreeting: 'सांग्रां जा' 
  },
  { 
    langCode: 'mni', 
    langName: 'Manipuri', 
    nativeName: 'মৈতৈলোন্', 
    state: 'Manipur & Northeast', 
    script: 'Bengali / Meetei', 
    region: 'northeast', 
    regionLabel: 'Manipur Valley & Hills',
    flag: '🌺',
    sampleGreeting: 'চেকশিনবীয়ু' 
  },
  { 
    langCode: 'doi', 
    langName: 'Dogri', 
    nativeName: 'डोगरी', 
    state: 'Jammu & Himachal', 
    script: 'Devanagari', 
    region: 'north', 
    regionLabel: 'Shivalik & Pir Panjal',
    flag: '⛰️',
    sampleGreeting: 'सुचेत रओ' 
  },
  { 
    langCode: 'sd', 
    langName: 'Sindhi', 
    nativeName: 'سنڌي', 
    state: 'Gujarat & Maharashtra', 
    script: 'Perso-Arabic', 
    region: 'west', 
    regionLabel: 'Western India Diaspora',
    flag: '🪔',
    sampleGreeting: 'حوشيار رهو' 
  },
  { 
    langCode: 'sa', 
    langName: 'Sanskrit', 
    nativeName: 'संस्कृतम्', 
    state: 'All-India Classical', 
    script: 'Devanagari', 
    region: 'all', 
    regionLabel: 'Classical National Heritage',
    flag: '🕉️',
    sampleGreeting: 'सावधानाः भवन्तु' 
  },
  { 
    langCode: 'bho', 
    langName: 'Bhojpuri', 
    nativeName: 'भोजपुरी', 
    state: 'Bihar & Eastern UP', 
    script: 'Devanagari', 
    region: 'east', 
    regionLabel: 'Purvanchal & Bhojpur',
    flag: '🌱',
    sampleGreeting: 'सावधान रहीं' 
  },
  { 
    langCode: 'mwr', 
    langName: 'Marwari', 
    nativeName: 'मारवाड़ी', 
    state: 'Rajasthan', 
    script: 'Devanagari', 
    region: 'west', 
    regionLabel: 'Thar Desert & Aravalli',
    flag: '🐪',
    sampleGreeting: 'साचेत रेवो' 
  },
  { 
    langCode: 'lus', 
    langName: 'Mizo', 
    nativeName: 'Mizo ṭawng', 
    state: 'Mizoram', 
    script: 'Latin', 
    region: 'northeast', 
    regionLabel: 'Lushai Hills',
    flag: '🎋',
    sampleGreeting: 'Fimkhur rawh u' 
  },
  { 
    langCode: 'kha', 
    langName: 'Khasi', 
    nativeName: 'Ka Ktien Khasi', 
    state: 'Meghalaya', 
    script: 'Latin', 
    region: 'northeast', 
    regionLabel: 'Khasi & Jaintia Hills',
    flag: '🌧️',
    sampleGreeting: 'Sumar bha' 
  },
  { 
    langCode: 'en', 
    langName: 'English (Plain)', 
    nativeName: 'English', 
    state: 'All-India Universal', 
    script: 'Latin', 
    region: 'all', 
    regionLabel: 'Universal Standard',
    flag: '🇮🇳',
    sampleGreeting: 'Stay Alert' 
  },
];

export default function MultilingualAlertAI({
  currentLocation,
  activeHazard = 'cyclone',
  severity = 'Extreme',
  onAlertBroadcasted,
  onOpenAuthModal,
  onOpenReportModal,
  onReturnToDashboard,
}) {
  const { current } = useWeather();
  const { currentUser, isAuthenticated, quickLogin, mongoUsers } = useAuth();

  // Desktop / Mobile system notification permission status
  const [notifPermission, setNotifPermission] = useState(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported';
  });

  const handleEnableNotifications = async () => {
    sound.playBlip();
    const perm = await notificationService.requestPermission();
    setNotifPermission(perm);
    if (perm === 'granted') {
      sound.playSuccessChime();
    }
  };

  // Role permissions: Volunteer has broadcast dispatch authorization; normal citizens do not
  const isVolunteer = currentUser?.role === 'Volunteer' || 
    currentUser?.role === 'Emergency Responder' || 
    currentUser?.role === 'Disaster Management Officer' || 
    currentUser?.role === 'Administrator' ||
    currentUser?.role === 'Citizen / Volunteer';
  const isCitizen = currentUser?.role === 'Citizen' || currentUser?.role === 'Normal User';
  const canBroadcast = isAuthenticated && isVolunteer;

  // Citizen broadcast restriction notice modal
  const [isCitizenRestrictedModalOpen, setIsCitizenRestrictedModalOpen] = useState(false);

  const [selectedLang, setSelectedLang] = useState('or');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [langSearch, setLangSearch] = useState('');
  const [alertData, setAlertData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [currentSpeakingStep, setCurrentSpeakingStep] = useState(null);
  const [dualView, setDualView] = useState(false);
  const [isSirenActive, setIsSirenActive] = useState(false);


  // Channels: 'WHATSAPP' | 'SMS' | 'CAP_CELL' | 'VOICE_IVR'
  const [activeChannel, setActiveChannel] = useState('WHATSAPP');
  const [completedSteps, setCompletedSteps] = useState({});
  const [copiedItem, setCopiedItem] = useState(null);

  // Broadcast Modal State
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState(0);
  const [broadcastReceipt, setBroadcastReceipt] = useState(null);
  const [broadcastLogs, setBroadcastLogs] = useState([]);
  const [showLogsDrawer, setShowLogsDrawer] = useState(false);

  // Resolved dynamic hazard from weather telemetry
  const liveHazard = (activeHazard && activeHazard !== 'cyclone') ? activeHazard : (
    current?.condition === 'Thunderstorm' ? 'thunderstorm' :
    (current?.condition === 'Rain' || current?.condition === 'Drizzle') ? (current?.rain_1h > 5 ? 'flood' : 'cyclone') :
    (current?.temp >= 38) ? 'heatwave' :
    (current?.wind_speed >= 30) ? 'wind' : 'cyclone'
  );
  const liveSeverity = current?.riskLevel || severity || 'Extreme';

  // Fetch or re-generate vernacular alert
  const fetchVernacularAlert = async (langOverride = null) => {
    if (!currentLocation) return;
    try {
      setLoading(true);
      const city = currentLocation.city || 'Bhubaneswar';
      const state = currentLocation.state || 'Odisha';
      const targetLang = langOverride || selectedLang;

      const res = await fetch(`/api/alerts/multilingual-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city,
          state,
          hazardType: liveHazard,
          severity: liveSeverity,
          overrideLangCode: targetLang,
          liveWeather: current,
          isSimulation: false,
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAlertData(data);
          if (data.language && data.language.langCode) {
            setSelectedLang(data.language.langCode);
          }
        }
      }
    } catch (err) {
      console.warn('Multilingual Alert AI fetch fallback:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch recent broadcast logs from MongoDB
  const fetchBroadcastLogs = async () => {
    try {
      const state = currentLocation?.state || '';
      const endpoint = `/api/alerts/broadcast-logs?limit=10&state=${encodeURIComponent(state)}`;
      const res = await fetch(endpoint);
      if (res && res.ok) {
        const data = await res.json();
        if (data.broadcasts) {
          setBroadcastLogs(data.broadcasts);
        }
      }
    } catch (err) {
      console.warn('Error fetching broadcast logs:', err.message);
    }
  };

  // Sync on location, hazard, or live weather updates
  useEffect(() => {
    fetchVernacularAlert(null);
    fetchBroadcastLogs();
    sound.stopSpeaking();
    setIsSpeaking(false);
    setCurrentSpeakingStep(null);
  }, [currentLocation?.city, currentLocation?.state, activeHazard, current?.temp, current?.condition]);

  // Language switch handler
  const handleSelectLanguage = (langCode) => {
    sound.playBlip();
    setSelectedLang(langCode);
    fetchVernacularAlert(langCode);
    sound.stopSpeaking();
    setIsSpeaking(false);
    setCurrentSpeakingStep(null);
  };

  // Toggle main speech synthesis
  const handleToggleSpeech = () => {
    if (isSpeaking) {
      sound.stopSpeaking();
      setIsSpeaking(false);
      setCurrentSpeakingStep(null);
    } else {
      sound.playBlip();
      const textToSpeak = alertData?.alertContent?.audioScript || alertData?.alertContent?.threat || 'Disaster warning alert';
      const utterance = sound.speakText(textToSpeak, selectedLang);
      if (utterance) {
        utterance.rate = speechRate;
        setIsSpeaking(true);
        setCurrentSpeakingStep(null);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
      }
    }
  };

  // Play a single actionable step's voice
  const handlePlayStepAudio = (stepText, idx) => {
    sound.playBlip();
    if (isSpeaking && currentSpeakingStep === idx) {
      sound.stopSpeaking();
      setIsSpeaking(false);
      setCurrentSpeakingStep(null);
      return;
    }

    sound.stopSpeaking();
    const utterance = sound.speakText(stepText, selectedLang);
    if (utterance) {
      utterance.rate = speechRate;
      setIsSpeaking(true);
      setCurrentSpeakingStep(idx);
      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentSpeakingStep(null);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setCurrentSpeakingStep(null);
      };
    }
  };

  // Toggle Emergency EAS Siren Test
  const handleTestSiren = () => {
    if (isSirenActive) {
      setIsSirenActive(false);
    } else {
      setIsSirenActive(true);
      sound.playEmergencySiren(2.8);
      setTimeout(() => setIsSirenActive(false), 2800);
    }
  };

  // Copy helper
  const handleCopy = (text, key) => {
    sound.playBlip();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedItem(key);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  // Toggle step completion with family safety celebration
  const handleToggleStepCheck = (idx) => {
    sound.playBlip();
    setCompletedSteps(prev => {
      const next = {
        ...prev,
        [idx]: !prev[idx]
      };
      const checkedCount = Object.values(next).filter(Boolean).length;
      if (checkedCount === 4 && !prev[idx]) {
        sound.playSuccessChime();
        try {
          confetti({ particleCount: 65, spread: 75, origin: { y: 0.65 } });
        } catch {}
      }
      return next;
    });
  };

  // Simulated Dispatch Broadcast Action
  const handleExecuteBroadcast = async () => {
    if (!alertData) return;

    // Security Gate: Normal citizens cannot send broadcasts
    if (isCitizen) {
      sound.playEmergencySiren(0.8);
      setIsCitizenRestrictedModalOpen(true);
      setIsBroadcastModalOpen(false);
      return;
    }

    try {
      setIsBroadcasting(true);
      setBroadcastProgress(10);
      sound.playEmergencySiren(1.2);

      const city = currentLocation?.city || 'Bhubaneswar';
      const state = currentLocation?.state || 'Odisha';
      const langMeta = ALL_VERNACULAR_LANGUAGES.find(l => l.langCode === selectedLang) || ALL_VERNACULAR_LANGUAGES[0];

      // Simulated recipient estimation based on city density
      const recipientPool = city.toLowerCase().includes('mumbai') ? 520000 
        : city.toLowerCase().includes('delhi') ? 610000 
        : city.toLowerCase().includes('kolkata') ? 430000 
        : city.toLowerCase().includes('chennai') ? 390000 
        : city.toLowerCase().includes('puri') ? 165000 
        : city.toLowerCase().includes('bhubaneswar') ? 245000 
        : 195000;

      const messageToSend = activeChannel === 'SMS' 
        ? alertData.alertContent.smsText 
        : activeChannel === 'WHATSAPP' 
        ? alertData.alertContent.whatsappText 
        : activeChannel === 'EMAIL'
        ? `🚨 [RESONA EMERGENCY WARNING: ${alertData.alertContent.title}]\n\nThreat Level: ${liveSeverity.toUpperCase()}\nRegion: ${city}, ${state}\n\nThreat Assessment:\n${alertData.alertContent.threat}\n\nMandatory Safety Protocol:\n${alertData.alertContent.actions?.map((a, i) => `${i + 1}. ${a}`).join('\n') || alertData.alertContent.audioScript}\n\nHelpline: Dial 1070 for State Disaster Command.`
        : alertData.alertContent.audioScript;

      const payload = {
        alertTitle: alertData.alertContent.title,
        city,
        state,
        hazardType: liveHazard,
        severity: liveSeverity,
        langCode: langMeta.langCode,
        langName: langMeta.langName,
        nativeName: langMeta.nativeName,
        channel: activeChannel,
        recipientsCount: recipientPool,
        messageText: messageToSend,
        senderName: currentUser?.name || `${state} Disaster Management Volunteer`,
        senderRole: currentUser?.role || 'Volunteer',
        senderBadge: currentUser?.badgeNumber || 'VOL-4022',
        targetPhone: testPhoneNumber || null,
        testPhoneNumber: testPhoneNumber || null,
        targetEmail: testEmail || null,
        testEmail: testEmail || null,
        broadcastToRegisteredUsers: true,
      };

      // Progress animation
      const pInterval = setInterval(() => {
        setBroadcastProgress(p => {
          if (p >= 90) {
            clearInterval(pInterval);
            return 90;
          }
          return p + 25;
        });
      }, 300);

      const res = await fetch('/api/alerts/broadcast-vernacular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      clearInterval(pInterval);
      setBroadcastProgress(100);

      if (res && res.ok) {
        const result = await res.json();
        sound.playSuccessChime();
        setBroadcastReceipt(result);
        fetchBroadcastLogs();
        if (onAlertBroadcasted) onAlertBroadcasted(result);

        // DISPATCH REAL NATIVE SYSTEM OS NOTIFICATION
        notificationService.showLocalNotification(`🚨 [${liveHazard.toUpperCase()} BROADCAST] ${city}`, {
          body: `Vernacular (${langMeta.nativeName}): ${messageToSend.slice(0, 150)}...`,
          data: result,
          playAudio: true
        });

        // If target phone was provided and on mobile device, trigger direct device SMS
        if (testPhoneNumber && testPhoneNumber.trim()) {
          if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
            openDeviceSms(testPhoneNumber, messageToSend);
          }
        }

        // Confetti celebration
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        const errData = await res?.json().catch(() => ({}));
        sound.playEmergencySiren(0.8);
        console.error('Broadcast failed:', errData);
        alert(`Broadcast Failed: ${errData?.message || errData?.error || 'Server error during broadcast transmission'}`);
      }
    } catch (err) {
      console.error('Broadcast dispatch error:', err);
      alert(`Broadcast dispatch error: ${err.message}`);
    } finally {
      setTimeout(() => {
        setIsBroadcasting(false);
      }, 500);
    }
  };

  const currentLangMeta = ALL_VERNACULAR_LANGUAGES.find(l => l.langCode === selectedLang) || ALL_VERNACULAR_LANGUAGES[0];

  // Filter languages by region and search
  const filteredLanguages = ALL_VERNACULAR_LANGUAGES.filter(lang => {
    const matchesRegion = selectedRegion === 'all' || lang.region === selectedRegion || lang.langCode === 'en';
    const matchesSearch = !langSearch.trim() || 
      lang.langName.toLowerCase().includes(langSearch.toLowerCase()) ||
      lang.nativeName.includes(langSearch) ||
      lang.state.toLowerCase().includes(langSearch.toLowerCase()) ||
      (lang.sampleGreeting && lang.sampleGreeting.toLowerCase().includes(langSearch.toLowerCase()));
    return matchesRegion && matchesSearch;
  });

  // Calculate danger accent styles
  const isExtreme = liveSeverity.toLowerCase().includes('extreme') || liveSeverity.toLowerCase().includes('high');
  const accentGlow = isExtreme ? 'from-rose-500/20 via-orange-500/10 to-amber-500/5' : 'from-[#4ade80]/20 via-[#a3e635]/10 to-transparent';

  return (
    <div className="space-y-4">

      {/* =================================================================== */}
      {/* 0. EDITORIAL LUXURY HERO — HUMANIZED BACKGROUND & STAT COUNTERS      */}
      {/* =================================================================== */}
      <div className="editorial-hero-section border border-white/[0.12] shadow-2xl relative">
        {/* Parallax Background Photo */}
        <div className="hero-bg-image" />
        
        {/* Deep Botanical Atmospheric Dark Overlay */}
        <div className="hero-overlay" />

        {/* Hero Interactive Content */}
        <div className="hero-content flex flex-col justify-between min-h-[380px] sm:min-h-[420px] gap-6">
          
          {/* Top Utility Strip: Badges & Dashboard Return */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="editorial-badge-pop delay-1 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-[#4ade80] border border-emerald-400/35 backdrop-blur-md flex items-center gap-2 shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-[#4ade80]" />
                <span>Vernacular Acoustic AI · 27 Mother Tongues</span>
              </span>
              <span className="editorial-badge-pop delay-2 hidden sm:inline-flex px-3 py-1.5 rounded-full text-xs font-medium bg-white/[0.08] text-stone-200 border border-white/15 backdrop-blur-md items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/40" />
                <span>Every Indian Citizen Protected</span>
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {current && (
                <span className="hidden md:inline-flex px-3.5 py-1.5 rounded-full text-xs font-medium bg-black/50 text-stone-200 border border-white/15 backdrop-blur-md items-center gap-2 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-[#4ade80] radiating-status-ring" />
                  <span className="text-white font-semibold">{current.city || currentLocation?.city}:</span>
                  <span className="text-[#a3e635] font-bold"><CountUp value={current.temp} duration={800} />°C</span>
                  <span className="text-stone-400">({current.description || current.condition || 'Clear'})</span>
                </span>
              )}

              {onReturnToDashboard && (
                <button
                  onClick={onReturnToDashboard}
                  className="px-4 py-2 rounded-full bg-white/[0.12] hover:bg-white/[0.22] text-xs font-semibold text-white transition-all flex items-center gap-2 border border-white/20 cursor-pointer shadow-lg hover:scale-105 active:scale-95 backdrop-blur-md"
                  title="Navigate back to main weather cockpit"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-stone-200" />
                  <span>Return to Dashboard</span>
                </button>
              )}
            </div>
          </div>

          {/* Hero Editorial Headline & Subtext */}
          <div className="max-w-3xl py-2">
            <h1 className="editorial-headline">
              सुरक्षा, <span className="accent-serif">आपकी अपनी भाषा में</span>
            </h1>
            <div className="editorial-accent-line my-3.5" />
            <p className="editorial-subtext">
              Live meteorological warnings and compassionate voice broadcasts synthesized in 27 Indian native languages — bridging the last mile for rural elders, farmers, and coastal families before extreme weather strikes.
            </p>

            {/* Quick Voice Play CTA inside Hero */}
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <button
                onClick={handleToggleSpeech}
                className={`px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all shadow-xl cursor-pointer ${
                  isSpeaking 
                    ? 'bg-rose-600 text-white animate-pulse border border-rose-300 scale-105' 
                    : 'bg-gradient-to-r from-[#a3e635] to-[#4ade80] hover:brightness-110 text-stone-950 border border-[#a3e635]/40 hover:scale-105 active:scale-95'
                }`}
                title={isSpeaking ? "Pause playback" : `Play urgent alert in ${currentLangMeta.nativeName}`}
              >
                {isSpeaking ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isSpeaking ? `Speaking in ${currentLangMeta.nativeName}...` : `Listen in ${currentLangMeta.nativeName} (${currentLangMeta.langName})`}</span>
              </button>

              <div className="flex items-center gap-2 text-xs text-stone-200 bg-black/50 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/15">
                <Radio className="w-3.5 h-3.5 text-[#4ade80] animate-pulse" />
                <span>Selected: <strong className="text-white font-semibold">{currentLangMeta.nativeName}</strong> ({currentLangMeta.state})</span>
              </div>
            </div>
          </div>

          {/* Bottom Stat Counters Row — Matching Reference Editorial Aesthetic */}
          <div>
            <div className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase text-stone-400 mb-2.5 px-1 flex items-center gap-2">
              <span>&#123; PAN-INDIA LINGUISTIC REACH &#125;</span>
              <div className="h-[1px] flex-1 bg-white/10" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5 pt-1">
              
              <div className="p-3.5 sm:p-4 rounded-2xl bg-black/45 backdrop-blur-md border border-white/10 flex flex-col justify-between hover:border-[#4ade80]/30 transition-colors">
                <div className="text-[10px] font-mono tracking-wider uppercase text-stone-400 font-medium">NATIVE COVERAGE</div>
                <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-serif mt-1">
                  <CountUp value={27} duration={900} />
                </div>
                <div className="text-[11px] text-stone-300 mt-1 leading-snug">Official & Regional Dialects across 28 States & UTs</div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-black/45 backdrop-blur-md border border-white/10 flex flex-col justify-between hover:border-[#4ade80]/30 transition-colors">
                <div className="text-[10px] font-mono tracking-wider uppercase text-stone-400 font-medium">CITIZENS SHIELDED</div>
                <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-serif mt-1">
                  <CountUp value={1.4} decimals={1} suffix="B+" duration={1100} />
                </div>
                <div className="text-[11px] text-stone-300 mt-1 leading-snug">Indians protected in authentic native tongue</div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-black/45 backdrop-blur-md border border-white/10 flex flex-col justify-between hover:border-[#4ade80]/30 transition-colors">
                <div className="text-[10px] font-mono tracking-wider uppercase text-stone-400 font-medium">ACOUSTIC SPEED</div>
                <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-serif mt-1">
                  <CountUp value={250} prefix="<" suffix="ms" duration={1000} />
                </div>
                <div className="text-[11px] text-stone-300 mt-1 leading-snug">Zero-latency speech generation for imminent threats</div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-black/45 backdrop-blur-md border border-white/10 flex flex-col justify-between hover:border-[#4ade80]/30 transition-colors">
                <div className="text-[10px] font-mono tracking-wider uppercase text-stone-400 font-medium">DIRECT DISPATCH</div>
                <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-serif mt-1">
                  <CountUp value={100} suffix="%" duration={1200} />
                </div>
                <div className="text-[11px] text-stone-300 mt-1 leading-snug">WhatsApp, SMS & Mesh Offline Broadcast Ready</div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* =================================================================== */}
      {/* 1. WARM HUMANIZED COMMUNITY SAFETY & VOICE COMPANION               */}
      {/* =================================================================== */}
      <div className="rounded-[32px] sm:rounded-[36px] p-6 sm:p-8 bg-gradient-to-b from-[#18221b]/95 via-[#131b15]/95 to-[#101612]/95 border border-white/[0.09] shadow-2xl relative overflow-hidden">
        {/* Soft Organic Atmospheric Glow */}
        <div className="absolute -top-24 left-1/3 w-96 h-48 bg-gradient-to-r from-emerald-500/15 via-[#a3e635]/10 to-transparent blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          
          {/* Friendly Community Branding & Geo-Context */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#22c55e] to-[#a3e635] p-[1.5px] shadow-lg shadow-emerald-950/40 shrink-0">
              <div className="w-full h-full rounded-[14px] bg-[#121914] flex items-center justify-center">
                <Headphones className="w-6 h-6 text-[#4ade80]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2 font-sans">
                  <span>Voice of Safety in Your Mother Tongue</span>
                </h3>
                <span className="px-3 py-1 rounded-full text-xs font-medium text-emerald-300 bg-emerald-500/15 border border-emerald-500/25 flex items-center gap-1.5 shadow-sm">
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/40" />
                  <span>Protecting Every Household</span>
                </span>
              </div>

              <p className="text-xs text-stone-300 font-sans leading-relaxed">
                Reassuring spoken advisories in 27 Indian languages — helping elders, farmers, and coastal families stay safe.
              </p>

              <div className="flex items-center gap-2 text-xs text-stone-300 pt-1 flex-wrap font-sans">
                <span className="flex items-center gap-1.5 text-stone-400">
                  <span>📍</span>
                  <span>Neighborhood:</span>
                </span>
                <span className="font-semibold text-white bg-white/[0.06] px-2.5 py-0.5 rounded-full border border-white/10">
                  {currentLocation?.city || 'Bhubaneswar'}, {currentLocation?.state || 'Odisha'}
                </span>
                <span className="text-stone-600">•</span>
                <span className="text-[#a3e635] font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
                  <span>Speaking in <strong className="text-white font-semibold">{currentLangMeta.nativeName} ({currentLangMeta.langName})</strong></span>
                </span>
              </div>
            </div>
          </div>

          {/* Human-Centered Quick Actions & Voice Player */}
          <div className="flex items-center gap-2.5 flex-wrap">

            {/* Primary Voice Listen Button */}
            <button
              onClick={handleToggleSpeech}
              className={`px-4.5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2.5 transition-all shadow-lg cursor-pointer ${
                isSpeaking 
                  ? 'bg-rose-600 text-white animate-pulse border border-rose-300 scale-105' 
                  : 'bg-gradient-to-r from-[#a3e635] to-[#4ade80] hover:brightness-110 text-stone-950 border border-[#a3e635]/40 hover:scale-105 active:scale-95'
              }`}
              title={isSpeaking ? "Pause spoken advisory" : `Listen to spoken alert in ${currentLangMeta.nativeName}`}
            >
              {isSpeaking ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isSpeaking ? `Speaking in ${currentLangMeta.nativeName}...` : `▶ Listen in ${currentLangMeta.nativeName} (${currentLangMeta.langName})`}</span>
            </button>

            {/* WhatsApp Family Quick Share */}
            <button
              onClick={() => {
                sound.playBlip();
                openWhatsAppChat('', alertData?.alertContent?.whatsappText || alertData?.alertContent?.threat);
              }}
              className="px-4 py-2.5 rounded-full bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/35 text-emerald-200 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-102"
              title="Share this alert directly with family on WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Share to Family</span>
            </button>

            {/* Side-by-side Dual Language Comparison Toggle */}
            <button
              onClick={() => {
                sound.playBlip();
                setDualView(!dualView);
              }}
              className={`px-3.5 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all border cursor-pointer ${
                dualView 
                  ? 'bg-white/20 text-white border-white/40 shadow-sm' 
                  : 'bg-white/[0.06] text-stone-300 border-white/10 hover:bg-white/[0.12] hover:text-white'
              }`}
              title="Compare English and Mother Tongue side-by-side"
            >
              <Columns className="w-3.5 h-3.5 stroke-[1.8]" />
              <span>{dualView ? 'Dual Language Active' : 'Side-by-side View'}</span>
            </button>

            {/* Discreet Acoustic Alert Tone Test */}
            <button
              onClick={handleTestSiren}
              className={`px-3 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all border cursor-pointer ${
                isSirenActive 
                  ? 'bg-rose-600 text-white border-rose-400 animate-pulse' 
                  : 'bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 border-white/10'
              }`}
              title="Test warning acoustic tone"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-300" />
              <span>{isSirenActive ? 'Testing tone...' : 'Test Sound'}</span>
            </button>

            {/* Refresh Warning */}
            <button
              onClick={() => {
                sound.playBlip();
                fetchVernacularAlert(selectedLang);
              }}
              disabled={loading}
              className="p-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-stone-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
              title="Refresh with live weather advisory"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#4ade80]' : ''}`} />
            </button>

            {/* Volunteer Dispatch Launcher (if authorized) */}
            {canBroadcast ? (
              <button
                onClick={() => {
                  sound.playBlip();
                  setIsBroadcastModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-full bg-emerald-500 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                title="Broadcast to local neighborhood as verified volunteer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Volunteer Broadcast</span>
              </button>
            ) : !isCitizen && (
              <button
                onClick={() => {
                  sound.playBlip();
                  if (onOpenAuthModal) onOpenAuthModal('login');
                  else setIsCitizenRestrictedModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-stone-300 font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Volunteer sign in to broadcast"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#4ade80]" />
                <span>Volunteer Login</span>
              </button>
            )}

          </div>
        </div>

        {/* Live Reassuring Atmosphere Ribbon */}
        {current && (
          <div className="mt-4 pt-3.5 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-sans font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Live local atmosphere
              </span>
              <span className="text-white font-medium flex items-center gap-1.5 font-sans">
                <span className="text-stone-300">{current.city}:</span>
                <span className="text-[#a3e635] font-bold"><CountUp end={current.temp} duration={700} />°C</span>
                <span className="text-stone-400 font-normal">({current.description || current.condition || 'Clear'})</span>
              </span>
            </div>

            <div className="flex items-center gap-3.5 text-xs text-stone-300 flex-wrap font-sans">
              <span className="flex items-center gap-1.5 text-stone-400">
                <Wind className="w-3.5 h-3.5 text-[#4ade80]" />
                <span>Breeze: <strong className="text-white font-medium"><CountUp end={current.wind_speed} duration={700} /> km/h</strong></span>
              </span>
              <span className="text-stone-600">•</span>
              <span className="flex items-center gap-1.5 text-stone-400">
                <Waves className="w-3.5 h-3.5 text-teal-300" />
                <span>Humidity: <strong className="text-white font-medium"><CountUp end={current.humidity} duration={800} />%</strong></span>
              </span>
              <span className="text-stone-600">•</span>
              <span className="text-emerald-300 font-medium flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/40" />
                <span>Family Tip: Keep phones charged and stay sheltered comfortably</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 2. WARM MOTHER TONGUE CULTURAL SELECTOR STRIP                      */}
      {/* =================================================================== */}
      <div className="rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 bg-[#161e19]/90 border border-white/[0.08] space-y-4 shadow-xl backdrop-blur-xl">
        
        {/* Matrix Header & Region Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#4ade80]/15 border border-[#4ade80]/30 flex items-center justify-center text-[#4ade80]">
              <Globe className="w-4 h-4 stroke-[1.8]" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-white tracking-tight font-sans block">
                Choose Mother Tongue / अपनी मातृभाषा चुनें
              </span>
              <span className="text-[11px] text-stone-400 font-sans">
                {ALL_VERNACULAR_LANGUAGES.length} Indian languages & regional dialects for last-mile safety
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Region Pill Filters */}
            <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-full border border-white/[0.08] text-xs font-sans">
              {[
                { id: 'all', label: 'All India' },
                { id: 'east', label: 'East' },
                { id: 'north', label: 'North' },
                { id: 'south', label: 'South' },
                { id: 'west', label: 'West' },
                { id: 'northeast', label: 'Northeast' },
              ].map(reg => (
                <button
                  key={reg.id}
                  onClick={() => {
                    sound.playBlip();
                    setSelectedRegion(reg.id);
                  }}
                  className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                    selectedRegion === reg.id 
                      ? 'bg-[#4ade80] text-stone-950 font-bold shadow-sm' 
                      : 'text-stone-300 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {reg.label}
                </button>
              ))}
            </div>

            {/* Quick Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none stroke-[1.8]" />
              <input
                type="text"
                placeholder="Search language (Hindi, Odia, বাংলা)..."
                value={langSearch}
                onChange={(e) => setLangSearch(e.target.value)}
                className="pl-8.5 pr-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-[#4ade80] focus:ring-1 focus:ring-[#4ade80]/40 w-48 sm:w-60 font-sans"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Language Chips Strip */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 pt-1">
          {filteredLanguages.map((lang, idx) => {
            const isSelected = selectedLang === lang.langCode;
            const staggerClass = `stagger-${(idx % 12) + 1}`;
            return (
              <button
                key={lang.langCode}
                onClick={() => handleSelectLanguage(lang.langCode)}
                className={`animate-stagger-in ${staggerClass} flex-shrink-0 group relative p-3.5 rounded-2xl border transition-all duration-300 text-left flex items-center gap-3 min-w-[175px] cursor-pointer hover:-translate-y-1 hover:shadow-lg ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#243527] to-[#18231c] border-[#4ade80] ring-2 ring-[#4ade80]/60 ring-offset-2 ring-offset-[#131914] shadow-[0_4px_24px_rgba(74,222,128,0.22)] scale-[1.02]'
                    : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.07] hover:border-white/20'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 border transition-transform duration-300 group-hover:scale-105 ${
                  isSelected ? 'bg-[#4ade80]/20 border-[#4ade80]/40 shadow-sm' : 'bg-black/30 border-white/10'
                }`}>
                  <span>{lang.flag}</span>
                </div>
                <div className="overflow-hidden flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-base font-bold tracking-tight truncate font-sans ${isSelected ? 'text-[#a3e635]' : 'text-white'}`}>
                      {lang.nativeName}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] text-emerald-300 font-semibold bg-emerald-500/20 px-1.5 py-0.5 rounded-full border border-emerald-400/30 shrink-0">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-stone-300 truncate flex items-center gap-1 font-sans mt-0.5">
                    <span className="font-medium text-stone-200">{lang.langName}</span>
                    <span>•</span>
                    <span className="text-stone-400">{lang.state.split('/')[0]}</span>
                  </div>
                  {lang.sampleGreeting && (
                    <div className="text-[11px] text-[#4ade80] italic font-serif truncate mt-0.5">
                      "{lang.sampleGreeting}"
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

      </div>

      {/* =================================================================== */}
      {/* 3. MAIN COMMAND TWO-COLUMN GRID                                    */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* ----------------------------------------------------------------- */}
        {/* LEFT / PRIMARY COLUMN: ADVISORY & ACOUSTIC STUDIO (7 COLS)        */}
        {/* ----------------------------------------------------------------- */}
        <div className="lg:col-span-7 space-y-4">

          {/* CRITICAL BULLETIN HERO CARD */}
          {(() => {
            const isOvercast = (current?.condition === 'Clouds' || (current?.description || '').toLowerCase().includes('cloud') || (current?.description || '').toLowerCase().includes('overcast'));
            const isRainy = (current?.condition === 'Rain' || (current?.description || '').toLowerCase().includes('rain') || current?.condition === 'Thunderstorm');
            
            const cardBgStyle = isOvercast
              ? 'bg-gradient-to-b from-[#1c2430]/95 via-[#141b24]/95 to-[#0f141d]/98 border-slate-700/40 shadow-2xl'
              : isRainy
              ? 'bg-gradient-to-b from-[#15202d]/95 via-[#111824]/95 to-[#0c121b]/98 border-sky-800/40 shadow-2xl'
              : 'bg-gradient-to-b from-[#18231c]/95 via-[#131b15]/95 to-[#0f1511]/98 border-white/[0.09] shadow-2xl';

            const friendlyStepAnchors = [
              {
                emoji: '🏠',
                title: 'Safe Shelter First',
                guidance: 'Keep an eye on the weather and stay safely indoors.',
                fallbackNative: 'ପ୍ରତ୍ୟକ୍ଷ ପାଣିପାଗ ବୁଲେଟିନ୍ ଉପରେ ନଜର ରଖନ୍ତୁ ଏବଂ ପକ୍କା ଘରେ ସୁରକ୍ଷିତ ରୁହନ୍ତୁ।',
              },
              {
                emoji: '🌊',
                title: 'Stay Clear of Water',
                guidance: 'If heavy rain or storms start, seek shelter in a concrete building.',
                fallbackNative: 'ଯଦି ହଠାତ୍ ପ୍ରବଳ ବର୍ଷା ବା ଝଡ଼ ପବନ ହୁଏ, ତେବେ ପକ୍କା କୋଠାରେ ଆଶ୍ରୟ ନିଅନ୍ତୁ।',
              },
              {
                emoji: '🔌',
                title: 'Power Safety',
                guidance: 'Switch off appliances to avoid lightning hazards.',
                fallbackNative: 'ବିଜୁଳି ଚମକିବା ସମୟରେ ବିଦ୍ୟୁତ୍ ଉପକରଣ ବନ୍ଦ କରନ୍ତୁ ଓ ବିପଦରୁ ଦୂରେଇ ରୁହନ୍ତୁ।',
              },
              {
                emoji: '🎒',
                title: 'Family Emergency Supplies',
                guidance: 'Keep clean drinking water, medicines & torchlight ready.',
                fallbackNative: '୩ ଦିନ ପାଇଁ ପିଇବା ପାଣି, ଶୁଖିଲା ଖାଦ୍ୟ, ଆବଶ୍ୟକୀୟ ଔଷଧ ଓ ଟର୍ଚ୍ଚ ଲାଇଟ୍ ପ୍ରସ୍ତୁତ ରଖନ୍ତୁ।',
              },
            ];

            return (
              <div className={`rounded-[28px] sm:rounded-[32px] p-6 sm:p-7 border overflow-hidden relative group backdrop-blur-xl ${cardBgStyle}`}>
                {/* Dynamic weather ambient glows */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

                {/* Dynamic Local Monument Illustration: Lingaraj Temple under overcast clouds (Bhubaneswar Heritage) */}
                <div className="absolute right-3 bottom-2 pointer-events-none opacity-20 hover:opacity-30 transition-opacity pr-2 hidden md:block z-0">
                  <svg width="230" height="145" viewBox="0 0 230 145" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Overcast clouds drifting above monument */}
                    <path d="M30 30 C30 18 48 14 62 20 C70 10 92 9 103 18 C114 12 134 16 134 27 C144 29 148 40 140 46 C140 48 30 48 30 30 Z" fill="#94a3b8" fillOpacity="0.45" />
                    <path d="M120 16 C120 8 133 4 143 8 C149 2 166 2 175 8 C184 4 202 7 202 16 C210 18 212 26 206 30 C206 32 120 32 120 16 Z" fill="#cbd5e1" fillOpacity="0.35" />
                    {/* Lingaraj Temple Spire (Rekha Deula / Vimana Tower) */}
                    <path d="M115 26 L117 6 L119 26 Z" fill="#e2e8f0" fillOpacity="0.8" />
                    <circle cx="117" cy="24" r="3" fill="#38bdf8" fillOpacity="0.85" />
                    <path d="M117 27 C110 44 102 72 96 108 L138 108 C132 72 124 44 117 27 Z" fill="#475569" fillOpacity="0.85" />
                    {/* Jagamohana (Pidha Deula Pyramidal Roof) */}
                    <path d="M66 108 L86 60 L106 108 Z" fill="#334155" fillOpacity="0.9" />
                    <circle cx="86" cy="58" r="2.5" fill="#94a3b8" />
                    {/* Nata Mandira & Bhoga Mandapa (Side Sanctuaries) */}
                    <path d="M36 108 L52 76 L68 108 Z" fill="#334155" fillOpacity="0.75" />
                    <rect x="30" y="108" width="170" height="26" rx="3" fill="#1e293b" fillOpacity="0.9" />
                    <rect x="18" y="134" width="194" height="8" rx="2" fill="#0f172a" fillOpacity="0.95" />
                  </svg>
                  <div className="text-[10px] text-stone-400 font-sans tracking-wide text-right pr-2">
                    🛕 Lingaraj Temple Heritage District • {currentLocation?.city || 'Bhubaneswar'}
                  </div>
                </div>

                {/* Header Badge Strip: Local Cultural Identity */}
                <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-white/[0.08] relative z-10 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Shared Community Greeting Badge */}
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-200 border border-emerald-500/30 flex items-center gap-2 shadow-sm">
                      <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/60" />
                      <span>{getRegionalGreeting(currentLocation?.city || 'Bhubaneswar', selectedLang)}</span>
                    </span>

                    <span className="text-xs font-sans text-stone-300 bg-white/[0.06] px-3 py-1 rounded-full border border-white/10 font-medium">
                      Spoken in: {currentLangMeta.nativeName} ({currentLangMeta.script} Script)
                    </span>
                  </div>

                  <div className="text-xs font-sans text-stone-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-stone-400 stroke-[1.8]" />
                    <span>Live weather telemetry • {currentLocation?.city || 'Bhubaneswar'}</span>
                  </div>
                </div>

                {/* Headline and Threat Text */}
                <div key={`${selectedLang}-${alertData?.alertContent?.title || 'bulletin'}`} className="pt-4 space-y-3.5 relative z-10 animate-page-enter">

                  {/* Dual-View Comparison vs Single Human-First View */}
                  {dualView ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-black/40 border border-white/10">
                      {/* Left: Conversational English Input */}
                      <div className="space-y-1.5 border-r md:border-white/10 md:pr-3.5">
                        <div className="flex items-center justify-between text-xs font-sans text-stone-400 font-medium">
                          <span>Conversational Weather Check</span>
                          <span className="text-emerald-400 text-[11px] font-semibold">Live Sensor Feed</span>
                        </div>
                        <h5 className="text-sm sm:text-base font-bold text-stone-100 font-sans">
                          {getConversationalWeatherHeadline(currentLocation?.city || 'Bhubaneswar', current)}
                        </h5>
                        <p className="text-xs text-stone-300 leading-relaxed font-sans font-normal">
                          Live observations show stable atmospheric parameters. Stay safe, keep doors shut during sudden gusts, and check in on family.
                        </p>
                      </div>

                      {/* Right: Neural Vernacular Spoken Translation */}
                      <div className="space-y-1.5 md:pl-2.5">
                        <div className="flex items-center justify-between text-xs font-sans text-[#a3e635] font-medium">
                          <span>In your mother tongue ({currentLangMeta.nativeName})</span>
                          <span className="text-[#4ade80] font-semibold text-[11px]">Clear vernacular voice</span>
                        </div>
                        <h5 className="text-base sm:text-lg font-bold text-white font-sans">
                          {alertData?.alertContent?.title || `${currentLocation?.city || 'Bhubaneswar'} ପାଣିପାଗ ଅପଡେଟ୍`}
                        </h5>
                        <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-sans font-normal">
                          {alertData?.alertContent?.threat || 'ଭୁବନେଶ୍ୱର ପାଣିପାଗ ବିଭାଗର ପ୍ରତ୍ୟକ୍ଷ ତଥ୍ୟ ଅନୁଯାୟୀ ବର୍ତ୍ତମାନ ସ୍ଥିତି ସାଧାରଣ ଏବଂ ନିୟନ୍ତ୍ରଣାଧୀନ ଅଛି।'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {/* Human-First Headline */}
                      <h4 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug font-sans">
                        {getConversationalWeatherHeadline(currentLocation?.city || 'Bhubaneswar', current)}
                      </h4>
                      {/* Vernacular / Local Language Spoken Text */}
                      <p className="text-sm sm:text-base text-stone-200 leading-relaxed font-sans font-normal">
                        {alertData?.alertContent?.threat || 
                          `ଭୁବନେଶ୍ୱର ପାଣିପାଗ ବିଭାଗର ପ୍ରତ୍ୟକ୍ଷ ତଥ୍ୟ ଅନୁଯାୟୀ, ${currentLocation?.city || 'Bhubaneswar'} ରେ ବର୍ତ୍ତମାନ ତାପମାତ୍ରା ${Math.round(current?.temp ?? 26)}°C ଏବଂ ${current?.description || 'overcast clouds'} ରହିଛି। ପବନର ବେଗ ସାଧାରଣ ଏବଂ ପରିସ୍ଥିତି ନିୟନ୍ତ୍ରଣାଧୀନ ଅଛି।`}
                      </p>
                    </div>
                  )}

                  {/* Looking Out For Each Other (Renamed from Family Care Notice) */}
                  <div className="p-4 rounded-2xl bg-[#142018]/90 border border-emerald-500/25 flex items-start gap-3.5 text-xs text-stone-200 mt-3 shadow-sm">
                    <Heart className="w-5 h-5 text-rose-400 fill-rose-400/40 shrink-0 mt-0.5" />
                    <div className="leading-relaxed font-sans">
                      <strong className="text-white font-semibold text-xs sm:text-sm">Looking Out For Each Other: </strong>
                      <span>Please share or read this message aloud to senior citizens, young children, and neighbors who may not read English or screen alerts.</span>
                    </div>
                  </div>

                </div>

                {/* ELEVATED VOICE PLAYER EXPERIENCE */}
                <div className="mt-4 pt-4 border-t border-white/[0.08] relative z-10">
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#121c16]/95 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                    
                    {/* Warm Local Person Avatar & Details */}
                    <div className="flex items-center gap-4">
                      {/* Avatar icon of a friendly local person / elder */}
                      <div className="relative shrink-0">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/25 via-emerald-500/20 to-teal-500/30 border border-emerald-400/40 flex items-center justify-center text-2xl shadow-lg ring-1 ring-emerald-500/30">
                          <span>👵</span>
                        </div>
                        <button
                          onClick={handleToggleSpeech}
                          className={`absolute -bottom-1 -right-1 w-6.5 h-6.5 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${
                            isSpeaking 
                              ? 'bg-rose-500 text-white animate-pulse' 
                              : 'bg-gradient-to-tr from-[#22c55e] to-[#a3e635] text-stone-950 hover:scale-110 active:scale-95 shadow-emerald-950/50'
                          }`}
                          title={isSpeaking ? "Pause spoken audio" : `Listen to update in ${currentLangMeta.nativeName}`}
                        >
                          {isSpeaking ? (
                            <Square className="w-2.5 h-2.5 fill-current" />
                          ) : (
                            <Play className="w-3 h-3 fill-current ml-0.5" />
                          )}
                        </button>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
                            <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Hear this update spoken aloud in {currentLangMeta.langName} ({currentLangMeta.nativeName})</span>
                          </span>
                          <span className="text-[10px] font-sans px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold shrink-0">
                            Friendly Local Voice
                          </span>
                        </div>
                        <p className="text-xs text-stone-300 mt-1 font-sans leading-relaxed">
                          {isSpeaking 
                            ? `Playing gentle, clear voice in ${currentLangMeta.langName}...` 
                            : `Tap to listen aloud in ${currentLangMeta.nativeName} — easy to understand for elders & family members who don't read screens`}
                        </p>
                      </div>
                    </div>

                    {/* Animated Speech Waveform Visualizer & Action */}
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <button
                        onClick={handleToggleSpeech}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSpeaking
                            ? 'bg-rose-500 text-white animate-pulse shadow-md'
                            : 'bg-gradient-to-r from-emerald-500 to-[#a3e635] text-stone-950 hover:brightness-105 shadow-md hover:scale-105 active:scale-95'
                        }`}
                      >
                        {isSpeaking ? (
                          <>
                            <Square className="w-3 h-3 fill-current" />
                            <span>Pause Voice</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-current ml-0.5" />
                            <span>Listen Now</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-1.5 h-8 bg-black/50 px-3 py-1 rounded-full border border-white/[0.08]">
                        <div className={`w-1 bg-[#4ade80] rounded-full transition-all ${isSpeaking ? 'eq-bar-1' : 'h-2'}`} />
                        <div className={`w-1 bg-[#a3e635] rounded-full transition-all ${isSpeaking ? 'eq-bar-2' : 'h-3'}`} />
                        <div className={`w-1 bg-[#22c55e] rounded-full transition-all ${isSpeaking ? 'eq-bar-3' : 'h-1.5'}`} />
                        <div className={`w-1 bg-[#4ade80] rounded-full transition-all ${isSpeaking ? 'eq-bar-4' : 'h-4'}`} />
                        <div className={`w-1 bg-[#a3e635] rounded-full transition-all ${isSpeaking ? 'eq-bar-5' : 'h-2'}`} />
                        <div className={`w-1 bg-[#22c55e] rounded-full transition-all ${isSpeaking ? 'eq-bar-6' : 'h-3'}`} />
                        <span className="text-[10px] font-sans font-bold text-[#a3e635] ml-1">
                          {isSpeaking ? 'SPEAKING' : 'READY'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 bg-white/[0.05] rounded-full border border-white/10 px-2 py-1 text-xs">
                        {[1.0, 1.25].map(rate => (
                          <button
                            key={rate}
                            onClick={() => {
                              sound.playBlip();
                              setSpeechRate(rate);
                            }}
                            className={`px-2 py-0.5 rounded-full font-medium transition-all cursor-pointer ${
                              speechRate === rate ? 'bg-emerald-400 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            );
          })()}

          {/* 4 ACTIONABLE LIFE-SAVING EMERGENCY PROTOCOLS WITH CONTEXTUAL EMOJIS */}
          {(() => {
            const friendlyStepAnchors = [
              {
                emoji: '🏠',
                title: 'Safe Shelter First',
                guidance: 'Keep an eye on the weather and stay safely indoors.',
                fallbackNative: 'ପ୍ରତ୍ୟକ୍ଷ ପାଣିପାଗ ବୁଲେଟିନ୍ ଉପରେ ନଜର ରଖନ୍ତୁ ଏବଂ ପକ୍କା ଘରେ ସୁରକ୍ଷିତ ରୁହନ୍ତୁ।',
              },
              {
                emoji: '🌊',
                title: 'Stay Clear of Water',
                guidance: 'If heavy rain or storms start, seek shelter in a concrete building.',
                fallbackNative: 'ଯଦି ହଠାତ୍ ପ୍ରବଳ ବର୍ଷା ବା ଝଡ଼ ପବନ ହୁଏ, ତେବେ ପକ୍କା କୋଠାରେ ଆଶ୍ରୟ ନିଅନ୍ତୁ।',
              },
              {
                emoji: '🔌',
                title: 'Power Safety',
                guidance: 'Switch off appliances to avoid lightning hazards.',
                fallbackNative: 'ବିଜୁଳି ଚମକିବା ସମୟରେ ବିଦ୍ୟୁତ୍ ଉପକରଣ ବନ୍ଦ କରନ୍ତୁ ଓ ବିପଦରୁ ଦୂରେଇ ରୁହନ୍ତୁ।',
              },
              {
                emoji: '🎒',
                title: 'Family Emergency Supplies',
                guidance: 'Keep clean drinking water, medicines & torchlight ready.',
                fallbackNative: '୩ ଦିନ ପାଇଁ ପିଇବା ପାଣି, ଶୁଖିଲା ଖାଦ୍ୟ, ଆବଶ୍ୟକୀୟ ଔଷଧ ଓ ଟର୍ଚ୍ଚ ଲାଇଟ୍ ପ୍ରସ୍ତୁତ ରଖନ୍ତୁ।',
              },
            ];

            return (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-1">
                  <h5 className="text-xs sm:text-sm font-semibold text-white tracking-normal font-sans flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#4ade80] stroke-[1.8]" />
                    <span>🏡 4 Immediate Steps to Protect Your Home & Family</span>
                  </h5>
                  <span className="text-xs font-sans text-[#4ade80] font-medium">
                    {Object.values(completedSteps).filter(Boolean).length}/4 completed
                  </span>
                </div>

                {/* Celebration banner when all 4 completed */}
                {Object.values(completedSteps).filter(Boolean).length === 4 && (
                  <div className="p-3.5 rounded-2xl bg-[#18281d] border border-[#4ade80]/40 flex items-center justify-between gap-2 text-xs text-stone-200 animate-in fade-in shadow-md">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-400 fill-rose-400/40 shrink-0" />
                      <span className="font-semibold text-white">Wonderful job! Your family is prepared and secured.</span>
                    </div>
                    <span className="text-[#4ade80] font-semibold px-2.5 py-0.5 rounded-full bg-[#4ade80]/20 border border-[#4ade80]/30">
                      All 4 Prepared ✓
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {friendlyStepAnchors.map((anchor, idx) => {
                    const isChecked = !!completedSteps[idx];
                    const isThisStepSpeaking = isSpeaking && currentSpeakingStep === idx;
                    const nativeStepText = (alertData?.alertContent?.actionableSteps && alertData.alertContent.actionableSteps[idx]) || anchor.fallbackNative;

                    return (
                      <div
                        key={idx}
                        className={`relative p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 group ${
                          isChecked
                            ? 'bg-[#19271e]/90 border-[#4ade80]/35 shadow-sm'
                            : 'bento-glass-card border-white/[0.08] hover:border-[#4ade80]/35 hover:bg-[#1a231d]/80'
                        }`}
                      >
                        <div>
                          {/* Step Header with Universal Emoji Anchor */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2.5">
                              <span className="w-8 h-8 rounded-xl bg-white/[0.08] border border-white/15 flex items-center justify-center text-lg shrink-0 shadow-sm">
                                {anchor.emoji}
                              </span>
                              <div>
                                <span className="text-xs sm:text-sm font-bold text-white font-sans block leading-tight">
                                  {anchor.title}
                                </span>
                                <span className="text-[10px] text-stone-400 font-sans">
                                  Step 0{idx + 1}
                                </span>
                              </div>
                            </div>

                            {/* Step Audio Voice Button */}
                            <button
                              onClick={() => handlePlayStepAudio(nativeStepText, idx)}
                              className={`p-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                                isThisStepSpeaking 
                                  ? 'bg-rose-600 text-white animate-pulse' 
                                  : 'text-stone-400 hover:text-[#4ade80] hover:bg-white/10'
                              }`}
                              title={`Listen to this step spoken aloud in ${currentLangMeta.nativeName}`}
                            >
                              <Volume2 className="w-3.5 h-3.5 stroke-[1.8]" />
                            </button>
                          </div>

                          {/* Friendly Human Guidance Anchor */}
                          <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05] mb-2">
                            <p className="text-xs font-medium text-emerald-200 font-sans leading-relaxed">
                              "{anchor.guidance}"
                            </p>
                          </div>

                          {/* Native Script Step Content */}
                          <p className={`text-xs leading-relaxed font-normal transition-colors ${
                            isChecked ? 'text-emerald-200 line-through opacity-80' : 'text-stone-200'
                          }`}>
                            {nativeStepText}
                          </p>
                        </div>

                        {/* Completion Checklist Action */}
                        <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs">
                          <button
                            onClick={() => handleToggleStepCheck(idx)}
                            className={`flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
                              isChecked ? 'text-[#4ade80] font-semibold' : 'text-stone-400 hover:text-stone-200'
                            }`}
                          >
                            <CheckCircle className={`w-3.5 h-3.5 stroke-[1.8] ${isChecked ? 'text-[#4ade80] fill-[#4ade80]/20' : 'text-stone-500'}`} />
                            <span>{isChecked ? '✓ Done for my family' : 'Mark as completed'}</span>
                          </button>

                          <button
                            onClick={() => handleCopy(nativeStepText, `step-${idx}`)}
                            className="text-stone-400 hover:text-stone-200 transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                            title="Copy instruction"
                          >
                            {copiedItem === `step-${idx}` ? (
                              <Check className="w-3.5 h-3.5 text-[#4ade80] stroke-[1.8]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 stroke-[1.8]" />
                            )}
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* EMERGENCY 24x7 HELPLINE PILL ROW */}
          <div className="bento-glass-card p-3.5 rounded-2xl border border-white/[0.08] bg-[#161f18]/90 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-semibold text-amber-300 flex items-center gap-1.5 font-sans">
                <PhoneCall className="w-3.5 h-3.5 text-amber-400 stroke-[1.8]" />
                Free 24x7 Emergency Helplines:
              </span>
              
              <a
                href="tel:112"
                onClick={(e) => {
                  handleCopy('112', '112');
                }}
                className="px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Tap to call National Emergency (Police, Fire, Medical)"
              >
                <span className="text-stone-300 text-xs">National:</span>
                <strong className="text-[#a3e635] font-mono">112</strong>
              </a>

              <a
                href="tel:1070"
                onClick={(e) => {
                  handleCopy('1070', '1070');
                }}
                className="px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Tap to call State Disaster Relief"
              >
                <span className="text-stone-300 text-xs">State SDMA:</span>
                <strong className="text-rose-300 font-mono">1070</strong>
              </a>

              <a
                href="tel:1077"
                onClick={(e) => {
                  handleCopy('1077', '1077');
                }}
                className="px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Tap to call District Relief Control"
              >
                <span className="text-stone-300 text-xs">District Relief:</span>
                <strong className="text-amber-300 font-mono">1077</strong>
              </a>
            </div>

            <div className="text-xs font-sans text-[#4ade80] flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#4ade80] stroke-[1.8]" />
              <span>Language sync: Active</span>
            </div>
          </div>

        </div>

        {/* ----------------------------------------------------------------- */}
        {/* RIGHT / SECONDARY COLUMN: MULTI-CHANNEL DISPATCH STUDIO (5 COLS)  */}
        {/* ----------------------------------------------------------------- */}
        <div className="lg:col-span-5 space-y-4">

          {/* MAIN CITIZEN DISPATCH CARD: NEIGHBORLY HELPER */}
          <div className="bento-glass-card rounded-[32px] p-5 sm:p-6 bg-gradient-to-b from-[#18231c]/95 via-[#131b15]/95 to-[#0f1511]/98 border border-white/[0.09] shadow-2xl relative overflow-hidden flex flex-col justify-between gap-5">
            
            {/* Soft Ambient Reassurance Glow */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              {/* Card Header: Neighborly Helper Title & Microcopy */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/[0.07]">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-[#4ade80]">
                      <Heart className="w-4 h-4 fill-emerald-500/20 text-[#4ade80]" />
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-white tracking-normal font-sans">
                      Family & Community Sharing
                    </h4>
                  </div>
                  <p className="text-xs text-stone-300 font-sans">
                    Check in on your circle. Send a quick update to the people you care about.
                  </p>
                </div>

                <span className="text-[11px] font-sans px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-stone-300 shrink-0 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
                  <span>Ready to Share</span>
                </span>
              </div>

              {/* CHANNEL SWITCHER (ACTIVE EMOTIONAL PROMPTS) */}
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-black/40 rounded-2xl border border-white/[0.06] my-4 text-xs">
                {[
                  { id: 'WHATSAPP', label: 'Forward to Family Group', sub: 'WhatsApp', icon: MessageSquare },
                  { id: 'SMS', label: 'Send SMS to Relatives', sub: 'SMS Text', icon: Smartphone },
                  { id: 'CAP_CELL', label: 'Village Loudspeaker Alert', sub: 'Area Siren', icon: TowerControl },
                  { id: 'VOICE_IVR', label: 'Text Grandpa', sub: 'Elder Call', icon: PhoneCall },
                ].map(ch => {
                  const Icon = ch.icon;
                  const isActive = activeChannel === ch.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => {
                        sound.playBlip();
                        setActiveChannel(ch.id);
                      }}
                      className={`group py-2.5 px-1 rounded-xl font-medium text-center flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-b from-[#4ade80]/25 to-[#22c55e]/20 text-white border border-[#4ade80]/40 shadow-sm'
                          : 'text-stone-400 hover:text-stone-200 hover:bg-white/[0.04] border border-transparent'
                      }`}
                    >
                      <Icon className={`w-4 h-4 transition-transform ${isActive ? 'text-[#4ade80]' : 'text-stone-400 group-hover:text-stone-200'}`} />
                      <div className="leading-tight">
                        <span className={`block text-[11px] font-sans ${isActive ? 'font-bold text-white' : 'font-normal'}`}>{ch.label}</span>
                        <span className="block text-[9px] text-stone-400 hidden sm:block">{ch.sub}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* LIVE MESSAGE CANVAS (CLEAN, AUTHENTIC, HUMAN) */}
              <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0b141a] shadow-inner">
                
                {/* 1. WHATSAPP CHAT EXPERIENCE */}
                {activeChannel === 'WHATSAPP' && (
                  <div className="animate-in fade-in">
                    {/* Authentic WhatsApp Dark Header */}
                    <div className="px-3.5 py-2.5 bg-[#202c33] border-b border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-base shrink-0">
                          🏡
                        </div>
                        <div className="leading-tight">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-stone-100 font-sans">Our Family & Village Safety Group</span>
                            <CheckCircle2 className="w-3 h-3 text-[#4ade80] fill-[#4ade80]/20" />
                          </div>
                          <span className="text-[10px] text-emerald-400/90 font-sans">
                            Check in on elders & circle • Spoken in {currentLangMeta.nativeName}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.08] text-stone-300 font-sans">
                        WhatsApp Verified
                      </span>
                    </div>

                    {/* WhatsApp Chat Canvas */}
                    <div className="p-3.5 sm:p-4 bg-[#0b141a] bg-opacity-95 space-y-3 min-h-[190px] flex flex-col justify-end">
                      {/* WhatsApp Outgoing Bubble */}
                      <div className="max-w-[94%] ml-auto p-3.5 rounded-2xl rounded-tr-xs bg-[#005c4b] border border-[#25d366]/20 text-stone-100 text-xs shadow-md space-y-1.5 font-sans relative">
                        <div className="space-y-1 text-stone-100 font-sans">
                          {renderFormattedWhatsApp(
                            alertData?.alertContent?.whatsappText ||
                            `🚨 *${currentLocation?.city || 'Bhubaneswar'} Weather Check*\n\nIt's currently ${Math.round(current?.temp ?? 26)}°C with overcast skies. Please check in on elders, stay indoors, and stay safe.\n\nHelpline: 112, 1070`
                          )}
                        </div>
                        <div className="flex items-center justify-end gap-1 pt-1 text-[10px] text-emerald-200/80 font-mono">
                          <span>Just now</span>
                          <span className="text-[#53bdeb] font-bold">✓✓</span>
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp Action Buttons */}
                    <div className="p-3 bg-[#111b21] border-t border-white/[0.06] space-y-2">
                      <button
                        onClick={() => {
                          sound.playBlip();
                          openWhatsAppChat('', alertData?.alertContent?.whatsappText || alertData?.alertContent?.threat);
                        }}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#25d366] hover:brightness-105 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4 fill-stone-950 text-stone-950" />
                        <span>Forward to Family Group on WhatsApp</span>
                      </button>

                      <div className="flex items-center justify-between text-xs text-stone-400 px-1 font-sans">
                        <span className="text-emerald-400/90 text-[11px]">Free • Instant delivery to family group</span>
                        <button
                          onClick={() => handleCopy(alertData?.alertContent?.whatsappText, 'whatsapp-text')}
                          className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-stone-300 text-xs flex items-center gap-1 transition-colors border border-white/10 cursor-pointer"
                        >
                          {copiedItem === 'whatsapp-text' ? <Check className="w-3 h-3 text-[#4ade80]" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedItem === 'whatsapp-text' ? 'Copied' : 'Copy Text'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. DIRECT SMS EXPERIENCE */}
                {activeChannel === 'SMS' && (
                  <div className="animate-in fade-in">
                    <div className="px-3.5 py-2.5 bg-[#18221b] border-b border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-[#a3e635]" />
                        <span className="text-xs font-semibold text-stone-200 font-sans">Send SMS to Relatives & Neighbors</span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-sans">Works Offline / No Internet</span>
                    </div>

                    <div className="p-4 bg-[#111713] min-h-[190px] flex flex-col justify-center space-y-2.5">
                      <div className="p-3.5 rounded-2xl bg-[#1b261e] border border-white/10 text-stone-100 text-xs leading-relaxed shadow-sm font-sans">
                        <div className="flex items-center justify-between text-[11px] text-[#a3e635] font-semibold mb-1">
                          <span>💬 Weather Care Note for Relatives</span>
                          <span className="text-[10px] text-stone-400 font-mono">Just now</span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed text-stone-100">
                          {alertData?.alertContent?.smsText ||
                            `🚨 [Weather Update] Current temp is ${Math.round(current?.temp ?? 26)}°C with overcast skies in ${currentLocation?.city || 'Bhubaneswar'}. Please stay indoors comfortably. Call 112 for help.`
                          }
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-[#141b16] border-t border-white/[0.06] flex items-center justify-between gap-2">
                      <span className="text-[11px] text-stone-400 font-sans">
                        {(alertData?.alertContent?.smsText || '').length} / 160 characters (1 SMS)
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openDeviceSms('', alertData?.alertContent?.smsText)}
                          className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-stone-100 text-xs font-medium flex items-center gap-1.5 transition-colors border border-white/10 cursor-pointer"
                        >
                          <Smartphone className="w-3.5 h-3.5 text-[#a3e635]" />
                          <span>Send SMS to Relatives</span>
                        </button>
                        <button
                          onClick={() => handleCopy(alertData?.alertContent?.smsText, 'sms-text')}
                          className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-stone-100 text-xs font-medium flex items-center gap-1 transition-colors border border-white/10 cursor-pointer"
                        >
                          {copiedItem === 'sms-text' ? <Check className="w-3.5 h-3.5 text-[#4ade80]" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedItem === 'sms-text' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. COMMUNITY SIREN & LOUDSPEAKER ALERT */}
                {activeChannel === 'CAP_CELL' && (
                  <div className="animate-in fade-in">
                    <div className="px-3.5 py-2.5 bg-rose-950/40 border-b border-rose-500/20 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs">
                        <TowerControl className="w-4 h-4 text-rose-400 animate-pulse" />
                        <span>Village Loudspeaker Alert & Public Relay</span>
                      </div>
                      <span className="text-[10px] text-rose-300/80 font-sans">Panchayat Sync</span>
                    </div>

                    <div className="p-4 bg-gradient-to-b from-rose-950/30 to-[#141815] min-h-[190px] flex flex-col justify-center space-y-2.5">
                      <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/30 text-rose-100 space-y-2 shadow-lg">
                        <h6 className="text-xs font-bold text-white font-sans flex items-center gap-1.5">
                          <span>📢</span>
                          <span>{alertData?.alertContent?.title || `${currentLocation?.city || 'Bhubaneswar'} Community Voice Alert`}</span>
                        </h6>
                        <p className="text-xs text-stone-200 leading-relaxed font-sans">
                          {alertData?.alertContent?.threat || 'Weather bulletin broadcast: overcast skies with mild breeze. All residents advised to stay sheltered and secure loose outdoor belongings.'}
                        </p>
                        <div className="pt-1 flex items-center justify-between text-[11px] text-rose-300/80 font-sans">
                          <span>Relayed through village loudspeakers</span>
                          <span className="font-semibold text-emerald-400">Panchayat Sync Active</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-[#141815] border-t border-white/[0.06] flex items-center justify-between text-xs text-stone-400 font-sans">
                      <span>Broadcast covers all nearby neighborhood wards</span>
                      <button
                        onClick={handleTestSiren}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{isSirenActive ? 'Siren playing...' : 'Sound Village Loudspeaker Alert'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. ELDER VOICE CALL (IVR): TEXT GRANDPA / CALL ELDERS */}
                {activeChannel === 'VOICE_IVR' && (
                  <div className="animate-in fade-in">
                    <div className="px-3.5 py-2.5 bg-[#17221a] border-b border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PhoneForwarded className="w-4 h-4 text-[#4ade80]" />
                        <span className="text-xs font-semibold text-stone-200 font-sans">Text Grandpa & Automated Voice Call</span>
                      </div>
                      <span className="text-[10px] text-[#4ade80] font-sans">No Reading Required</span>
                    </div>

                    <div className="p-4 bg-[#111713] min-h-[190px] flex flex-col justify-center items-center text-center space-y-3">
                      <div className="w-13 h-13 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-sm">
                        <span>👴</span>
                      </div>
                      <div>
                        <h6 className="text-xs font-bold text-white font-sans">Calling Grandpa with Spoken Weather Note</h6>
                        <p className="text-[11px] font-mono text-emerald-300">+91 (112) DISASTER-RELIEF • {currentLangMeta.nativeName}</p>
                      </div>
                      <p className="text-xs text-stone-300 italic max-w-sm font-sans px-2">
                        "{alertData?.alertContent?.audioScript || alertData?.alertContent?.threat || 'Please stay comfortably indoors and keep warm.'}"
                      </p>
                    </div>

                    <div className="p-3 bg-[#141b16] border-t border-white/[0.06] flex items-center justify-between gap-2">
                      <span className="text-[11px] text-stone-400 font-sans">Spoken aloud for elders who don't read screens</span>
                      <button
                        onClick={handleToggleSpeech}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#22c55e] text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5 stroke-[2]" />
                        <span>{isSpeaking ? 'Playing Voice Call...' : 'Call Grandpa & Listen'}</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* CARD FOOTER: REASSURING COMMUNITY ACTIONS */}
            <div className="pt-2 border-t border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-300 font-sans">
                <div className="flex items-center gap-1.5 text-stone-400">
                  <span>💡</span>
                  <span>Elders understand advice 4x faster in their native tongue</span>
                </div>
                <button
                  onClick={() => setShowLogsDrawer(!showLogsDrawer)}
                  className="text-xs font-sans text-[#4ade80] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Clock className="w-3 h-3" />
                  <span>History ({broadcastLogs.length})</span>
                </button>
              </div>

              {/* Action buttons with Active Emotional Prompts */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sound.playBlip();
                    if (activeChannel === 'WHATSAPP') {
                      openWhatsAppChat('', alertData?.alertContent?.whatsappText || alertData?.alertContent?.threat);
                    } else if (activeChannel === 'SMS') {
                      openDeviceSms('', alertData?.alertContent?.smsText);
                    } else if (activeChannel === 'CAP_CELL') {
                      handleTestSiren();
                    } else {
                      handleToggleSpeech();
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-[#22c55e] hover:brightness-110 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  {activeChannel === 'WHATSAPP' ? (
                    <>
                      <MessageSquare className="w-4 h-4 text-stone-950 fill-stone-950" />
                      <span>Forward to Family Group</span>
                    </>
                  ) : activeChannel === 'SMS' ? (
                    <>
                      <Smartphone className="w-4 h-4 text-stone-950" />
                      <span>Send SMS to Relatives</span>
                    </>
                  ) : activeChannel === 'CAP_CELL' ? (
                    <>
                      <TowerControl className="w-4 h-4 text-stone-950" />
                      <span>Village Loudspeaker Alert</span>
                    </>
                  ) : (
                    <>
                      <PhoneCall className="w-4 h-4 text-stone-950" />
                      <span>Text Grandpa / Call Elders</span>
                    </>
                  )}
                </button>

                {canBroadcast ? (
                  <button
                    onClick={() => setIsBroadcastModalOpen(true)}
                    className="py-2.5 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 text-rose-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                    title="Open Volunteer Mass Broadcast Console"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Mass Dispatch</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleCopy(alertData?.alertContent?.whatsappText || alertData?.alertContent?.threat, 'native-advisory')}
                    className="py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-stone-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                    title={`Copy advisory in ${currentLangMeta.nativeName}`}
                  >
                    {copiedItem === 'native-advisory' ? <Check className="w-3.5 h-3.5 text-[#4ade80]" /> : <Copy className="w-3.5 h-3.5 text-stone-400" />}
                    <span>{copiedItem === 'native-advisory' ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* RECENT MONGODB TRANSMISSION LOGS STREAM (COLLAPSIBLE / DRAWER) */}
          {showLogsDrawer && (
            <div className="bento-glass-card rounded-2xl p-4 bg-[#141a15] border border-[#4ade80]/30 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Clock className="w-3.5 h-3.5 text-[#4ade80]" />
                  <span>Broadcast Transmission Log ({currentLocation?.state})</span>
                </div>
                <button
                  onClick={fetchBroadcastLogs}
                  className="text-[10px] text-[#4ade80] hover:text-[#a3e635]"
                >
                  Refresh
                </button>
              </div>

              {broadcastLogs.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-3">No recent transmissions recorded.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {broadcastLogs.map((log, idx) => (
                    <div
                      key={log.broadcastId || idx}
                      className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-[#4ade80]/40 transition-colors text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="font-bold text-[#a3e635]">{log.broadcastId}</span>
                        <span className="text-[#4ade80] font-bold">{log.deliveryRate || '99.4%'} delivered</span>
                      </div>
                      <div className="flex items-center justify-between text-stone-300">
                        <span className="font-bold text-white">{log.city}, {log.state}</span>
                        <span className="text-[10px] font-mono text-[#a3e635]">{log.nativeName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* =================================================================== */}
      {/* 4. MODAL: VERNACULAR ALERT DISPATCH CONFIRMATION                   */}
      {/* =================================================================== */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl rounded-[28px] bg-[#141915] border border-white/[0.12] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] bento-glass-card">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-white/[0.08] bg-[#18231c]/90 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#4ade80]/15 border border-[#4ade80]/30 flex items-center justify-center text-[#4ade80] shadow-md">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-stone-100 tracking-wide">
                    Dispatch Vernacular Emergency Alert
                  </h4>
                  <p className="text-[11px] text-stone-400">
                    Transmitting in <strong className="text-[#4ade80]">{currentLangMeta.nativeName} ({currentLangMeta.langName})</strong> to {currentLocation?.city}, {currentLocation?.state}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#4ade80]/15 text-[#4ade80] border border-[#4ade80]/30 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#4ade80]" />
                      Authorized Volunteer: {currentUser?.name || 'Ramesh Das'} ({currentUser?.badgeNumber || 'VOL-4022'})
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playBlip();
                  setIsBroadcastModalOpen(false);
                  setBroadcastReceipt(null);
                }}
                className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">

              {/* Browser & OS Notification Permission Status */}
              <div className="p-3.5 rounded-2xl bg-[#161f18]/80 border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  {notifPermission === 'granted' ? (
                    <BellRing className="w-4 h-4 text-[#4ade80] shrink-0" />
                  ) : (
                    <Bell className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <div>
                    <span className="text-stone-200 font-medium">Desktop & Mobile Notifications: </span>
                    <span className={notifPermission === 'granted' ? 'text-[#4ade80] font-semibold' : 'text-amber-300 font-semibold'}>
                      {notifPermission === 'granted' ? 'Active (Popups Enabled)' : 'Click to Enable'}
                    </span>
                  </div>
                </div>

                {notifPermission !== 'granted' && (
                  <button
                    type="button"
                    onClick={handleEnableNotifications}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-medium transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    Enable Notifications
                  </button>
                )}
              </div>

              {/* Delivery Receipt Notification */}
              {broadcastReceipt && (
                <div className="p-4 rounded-2xl bg-[#132216]/95 border border-[#4ade80]/40 space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 text-[#4ade80] font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-[#4ade80] shrink-0" />
                    <span>Vernacular Alert Successfully Dispatched & Confirmed!</span>
                  </div>
                  
                  <div className="text-[11px] font-mono text-stone-300 space-y-1 bg-[#0f1511]/90 p-3 rounded-xl border border-[#4ade80]/20">
                    <div>Receipt ID: <span className="text-[#4ade80] font-semibold">{broadcastReceipt.networkReceipt?.broadcastId}</span></div>
                    <div>Gateway: <span className="text-stone-300">{broadcastReceipt.networkReceipt?.gateway}</span></div>
                    <div>Delivery Ratio: <span className="text-[#4ade80] font-bold">{broadcastReceipt.networkReceipt?.deliveryRate}</span> ({broadcastReceipt.networkReceipt?.deliveredCount?.toLocaleString()} active subscribers)</div>
                    <div>Target Region: <span className="text-stone-100">{currentLocation?.city}, {currentLocation?.state}</span></div>
                    <div>Archive: <span className="text-emerald-400">Archived to secure emergency dispatch ledger</span></div>
                  </div>

                  {/* Telecom Gateway Notice if not configured */}
                  {broadcastReceipt.networkReceipt?.isLiveCarrier === false && activeChannel === 'SMS' && (
                    <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs space-y-1.5">
                      <div className="font-bold flex items-center gap-1.5 text-amber-300">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Why physical SMS didn't arrive on the SIM card:</span>
                      </div>
                      <p className="text-stone-300 text-[11px] leading-relaxed">
                        A laptop or web server cannot transmit over-the-air cellular signals without an SMS telecom gateway. To deliver automated telecom SMS to the SIM card, add <strong>FAST2SMS_API_KEY</strong> or <strong>TWILIO</strong> credentials in <code>Backend/.env</code>.
                      </p>
                      <p className="text-[#4ade80] text-[11px] font-semibold flex items-center gap-1">
                        <span>👉 Click the green <strong>WhatsApp</strong> button below to deliver directly to their phone right now for FREE!</span>
                      </p>
                    </div>
                  )}

                  {/* Direct Phone Deliveries Actionable List */}
                  {broadcastReceipt.networkReceipt?.phoneDeliveries?.length > 0 && (
                    <div className="p-3 rounded-xl bg-[#0f1511]/90 border border-[#4ade80]/25 space-y-2">
                      <span className="text-xs font-semibold text-[#4ade80] flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-[#4ade80]" />
                        Direct Mobile Transmissions ({broadcastReceipt.networkReceipt.phoneDeliveries.length} endpoints):
                      </span>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {broadcastReceipt.networkReceipt.phoneDeliveries.map((pd, pidx) => (
                          <div key={pidx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg bg-white/[0.04] text-xs">
                            <div>
                              <span className="font-semibold text-stone-200">{pd.name || 'Recipient'}: </span>
                              <span className="font-mono text-[#4ade80]">{pd.recipient}</span>
                              <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                pd.isLiveCarrier 
                                  ? 'bg-[#4ade80]/20 text-[#4ade80]' 
                                  : 'bg-emerald-500/20 text-emerald-300'
                              }`}>
                                {pd.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openWhatsAppChat(pd.recipient, activeChannel === 'SMS' ? alertData?.alertContent?.smsText : alertData?.alertContent?.whatsappText)}
                                className="px-2.5 py-1 rounded bg-[#22c55e] hover:bg-[#16a34a] text-stone-950 font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all cursor-pointer border border-[#4ade80]/40"
                                title="Send directly to recipient's phone via WhatsApp for free"
                              >
                                <MessageSquare className="w-3 h-3 text-stone-950" />
                                <span>WhatsApp (Direct to Phone)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => openDeviceSms(pd.recipient, activeChannel === 'SMS' ? alertData?.alertContent?.smsText : alertData?.alertContent?.whatsappText)}
                                className="px-2.5 py-1 rounded bg-white/[0.08] hover:bg-white/[0.14] text-stone-200 font-medium text-[11px] flex items-center gap-1 shadow-sm transition-all cursor-pointer border border-white/10"
                                title="Open in default SMS / Phone Link app"
                              >
                                <Smartphone className="w-3 h-3 text-stone-300" />
                                <span>OS SMS</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Direct Email Deliveries Actionable List */}
                  {broadcastReceipt.networkReceipt?.emailDeliveries?.length > 0 && (
                    <div className="p-3 rounded-xl bg-[#0f1511]/90 border border-[#4ade80]/25 space-y-2">
                      <span className="text-xs font-semibold text-[#4ade80] flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#4ade80]" />
                        Direct Email Transmissions ({broadcastReceipt.networkReceipt.emailDeliveries.length} recipients):
                      </span>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {broadcastReceipt.networkReceipt.emailDeliveries.map((ed, eidx) => (
                          <div key={eidx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg bg-white/[0.04] text-xs">
                            <div>
                              <span className="font-semibold text-stone-200">{ed.name || 'Recipient'}: </span>
                              <span className="font-mono text-[#4ade80]">{ed.recipient}</span>
                              <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                ed.isLiveCarrier || ed.status === 'DELIVERED'
                                  ? 'bg-[#4ade80]/20 text-[#4ade80]' 
                                  : 'bg-emerald-500/20 text-emerald-300'
                              }`}>
                                {ed.status || 'DELIVERED'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {ed.gmailIntent && (
                                <a
                                  href={ed.gmailIntent}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium text-[11px] flex items-center gap-1 shadow-sm transition-all cursor-pointer border border-rose-400/40"
                                  title="Send directly in Gmail Web"
                                >
                                  <Mail className="w-3 h-3 text-rose-200" />
                                  <span>Open in Gmail</span>
                                </a>
                              )}
                              <a
                                href={ed.mailtoIntent || `mailto:${ed.recipient}?subject=${encodeURIComponent(alertData?.alertContent?.title || 'Emergency Warning')}&body=${encodeURIComponent(alertData?.alertContent?.threat || '')}`}
                                className="px-2.5 py-1 rounded bg-white/[0.08] hover:bg-white/[0.14] text-stone-200 font-medium text-[11px] flex items-center gap-1 shadow-sm transition-all cursor-pointer border border-white/10"
                                title="Open default OS email client"
                              >
                                <ExternalLink className="w-3 h-3 text-stone-300" />
                                <span>Mail Client</span>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Channel Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300">Select Broadcast Channel:</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'EMAIL', label: 'Email Broadcast', icon: Mail, desc: 'SMTP & Webmail' },
                    { id: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare, desc: 'Verified direct' },
                    { id: 'SMS', label: 'SMS Blast', icon: Smartphone, desc: 'Telecom DND-bypass' },
                    { id: 'CAP_CELL', label: 'Cell Broadcast', icon: TowerControl, desc: 'Tower override' },
                    { id: 'VOICE_IVR', label: 'Voice IVR', icon: PhoneCall, desc: 'Native audio call' },
                  ].map((ch) => {
                    const Icon = ch.icon;
                    const isSelected = activeChannel === ch.id;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => {
                          sound.playBlip();
                          setActiveChannel(ch.id);
                        }}
                        className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-[#4ade80]/15 border-[#4ade80] text-[#4ade80] shadow-md shadow-emerald-950/40' 
                            : 'bg-[#18231c]/60 border-white/[0.08] text-stone-400 hover:text-stone-200 hover:border-white/20'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-[#4ade80]' : 'text-stone-400'}`} />
                        <span className="text-xs font-bold">{ch.label}</span>
                        <span className="text-[10px] text-stone-400 mt-0.5">{ch.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Reach Information */}
              <div className="p-3.5 rounded-2xl bg-[#161f18]/80 border border-white/[0.08] flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-stone-400">Target Area:</span>{' '}
                  <strong className="text-stone-100">{currentLocation?.city}, {currentLocation?.state}</strong>
                </div>
                <div>
                  <span className="text-stone-400">Est. Reach:</span>{' '}
                  <strong className="text-[#4ade80]">
                    {activeChannel === 'EMAIL' ? `~${mongoUsers?.length || 8} registered inboxes` : '~220,000 active SIMs'}
                  </strong>
                </div>
              </div>

              {/* Vernacular Message Preview in Native Script */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
                  <span>Message in Vernacular ({currentLangMeta.nativeName}):</span>
                  <span className="text-[11px] font-mono text-[#4ade80]">Ready for dispatch</span>
                </label>
                <div className="p-3.5 rounded-2xl bg-[#0f1511]/90 border border-white/[0.08] text-stone-200 text-xs leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap font-sans">
                  {activeChannel === 'SMS' 
                    ? alertData?.alertContent?.smsText 
                    : activeChannel === 'WHATSAPP' 
                    ? alertData?.alertContent?.whatsappText 
                    : activeChannel === 'EMAIL'
                    ? `🚨 [RESONA EMERGENCY WARNING: ${alertData?.alertContent?.title}]\n\nThreat Level: ${liveSeverity.toUpperCase()}\nRegion: ${currentLocation?.city}, ${currentLocation?.state}\n\nThreat Assessment:\n${alertData?.alertContent?.threat}\n\nMandatory Safety Protocol:\n${alertData?.alertContent?.actions?.map((a, i) => `${i + 1}. ${a}`).join('\n') || alertData?.alertContent?.audioScript}\n\nHelpline: Dial 1070 for State Disaster Command.`
                    : alertData?.alertContent?.audioScript}
                </div>
              </div>

              {/* Dynamic Target Input: Email vs Phone */}
              {activeChannel === 'EMAIL' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#4ade80]" />
                      <span>Target Email Address (Direct Inbox Delivery):</span>
                    </label>
                    <span className="text-[10px] text-stone-400">Sends directly to this email</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Enter recipient email (e.g. anuragdevops956@gmail.com)"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-2xl bg-[#0f1511]/80 border border-white/[0.1] text-stone-100 text-xs placeholder-stone-500 focus:outline-none focus:border-[#4ade80] font-mono"
                    />
                    {testEmail && (
                      <button
                        type="button"
                        onClick={() => setTestEmail('')}
                        className="px-2.5 py-1.5 rounded-xl bg-white/10 text-stone-400 hover:text-white text-xs cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Quick Email Selector Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] text-stone-400 self-center mr-1">Quick Select:</span>
                    {currentUser?.email && (
                      <button
                        type="button"
                        onClick={() => {
                          sound.playBlip();
                          setTestEmail(currentUser.email);
                        }}
                        className="px-2 py-1 rounded-lg bg-[#4ade80]/10 hover:bg-[#4ade80]/20 border border-[#4ade80]/25 text-[#4ade80] text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        My Email ({currentUser.email})
                      </button>
                    )}
                    {mongoUsers?.slice(0, 4).map((u, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          sound.playBlip();
                          setTestEmail(u.email);
                        }}
                        className="px-2 py-1 rounded-lg bg-[#4ade80]/10 hover:bg-[#4ade80]/20 border border-[#4ade80]/25 text-[#4ade80] text-[11px] font-medium transition-colors truncate max-w-[200px] cursor-pointer"
                        title={u.email}
                      >
                        {u.name} ({u.email})
                      </button>
                    ))}
                  </div>

                  <div className="p-2.5 rounded-2xl bg-[#161f18]/90 border border-[#4ade80]/20 text-[11px] text-stone-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#4ade80]" />
                      <span>Also broadcasting to all {mongoUsers?.length || 8} registered emergency responders</span>
                    </span>
                    <span className="text-[#4ade80] font-bold text-[10px] uppercase font-mono">Auto-Sync</span>
                  </div>
                </div>
              ) : (
                /* Target Mobile Phone Number Input with Quick Selectors */
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-[#4ade80]" />
                      <span>Target Phone Number (Direct Mobile Delivery):</span>
                    </label>
                    <span className="text-[10px] text-stone-400">Sends directly to this phone</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="tel"
                      placeholder="Enter phone number (e.g. +91 94370 12345)"
                      value={testPhoneNumber}
                      onChange={(e) => setTestPhoneNumber(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-2xl bg-[#0f1511]/80 border border-white/[0.1] text-stone-100 text-xs placeholder-stone-500 focus:outline-none focus:border-[#4ade80] font-mono"
                    />
                    {testPhoneNumber && (
                      <button
                        type="button"
                        onClick={() => setTestPhoneNumber('')}
                        className="px-2.5 py-1.5 rounded-xl bg-white/10 text-stone-400 hover:text-white text-xs cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Quick Recipient Selector Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] text-stone-400 self-center mr-1">Quick Select:</span>
                    {currentUser?.phone && (
                      <button
                        type="button"
                        onClick={() => {
                          sound.playBlip();
                          setTestPhoneNumber(currentUser.phone);
                        }}
                        className="px-2 py-1 rounded-lg bg-[#4ade80]/10 hover:bg-[#4ade80]/20 border border-[#4ade80]/25 text-[#4ade80] text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        My Phone ({currentUser.phone})
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        sound.playBlip();
                        setTestPhoneNumber('+91 94370 22334');
                      }}
                      className="px-2 py-1 rounded-lg bg-[#4ade80]/10 hover:bg-[#4ade80]/20 border border-[#4ade80]/25 text-[#4ade80] text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      Sunita Nayak (+91 94370 22334)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playBlip();
                        setTestPhoneNumber('+91 70081 99887');
                      }}
                      className="px-2 py-1 rounded-lg bg-[#4ade80]/10 hover:bg-[#4ade80]/20 border border-[#4ade80]/25 text-[#4ade80] text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      Ramesh Das (+91 70081 99887)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playBlip();
                        setTestPhoneNumber('+91 98765 43210');
                      }}
                      className="px-2 py-1 rounded-lg bg-[#4ade80]/10 hover:bg-[#4ade80]/20 border border-[#4ade80]/25 text-[#4ade80] text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      Cmdr Patel (+91 98765 43210)
                    </button>
                  </div>
                </div>
              )}

              {/* Broadcasting Progress Bar */}
              {isBroadcasting && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs font-mono text-[#4ade80]">
                    <span>Transmitting to cellular gateways...</span>
                    <span>{broadcastProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 via-[#4ade80] to-[#a3e635] transition-all duration-300"
                      style={{ width: `${broadcastProgress}%` }}
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-[#18231c]/90 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  sound.playBlip();
                  setIsBroadcastModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-stone-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleExecuteBroadcast}
                disabled={isBroadcasting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-[#4ade80] to-[#a3e635] text-stone-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/60 hover:brightness-105 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Send className={`w-3.5 h-3.5 ${isBroadcasting ? 'animate-bounce' : ''}`} />
                <span>
                  {isBroadcasting 
                    ? `Transmitting (${broadcastProgress}%)...` 
                    : `Confirm & Broadcast in ${currentLangMeta.nativeName}`
                  }
                </span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. MODAL: CITIZEN BROADCAST & COMMUNITY GUIDE                      */}
      {/* =================================================================== */}
      {isCitizenRestrictedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-[28px] bg-[#141915] border border-[#4ade80]/30 shadow-2xl overflow-hidden flex flex-col bento-glass-card">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-white/[0.08] bg-[#18231c]/90 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#4ade80]/15 border border-[#4ade80]/30 flex items-center justify-center text-[#4ade80] shadow-md">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-stone-100 tracking-wide flex items-center gap-2">
                    <span>Protecting Community Communications</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#4ade80]/15 text-[#4ade80] border border-[#4ade80]/30 font-semibold">
                      Public Safety
                    </span>
                  </h4>
                  <p className="text-xs text-stone-400">
                    How you can help your family and neighbors right now
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playBlip();
                  setIsCitizenRestrictedModalOpen(false);
                }}
                className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#0f1511]/80 border border-white/[0.08] space-y-2 text-xs leading-relaxed text-stone-300">
                <p className="font-semibold text-stone-100">
                  Why are mass cell-tower broadcasts reserved for relief teams?
                </p>
                <p>
                  To protect our communities from unverified alarms, duplicate alert spam, and communication gridlock, mass emergency messaging (cell tower overrides & automated blasts) is coordinated by <strong className="text-[#4ade80]">authorized Disaster Relief Volunteers and Government Command</strong>.
                </p>
              </div>

              {/* Citizen Capabilities Checklist */}
              <div className="space-y-2 text-xs">
                <span className="text-stone-300 font-semibold text-[11px] uppercase tracking-wider block flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/30" />
                  <span>Immediate actions you can take right now:</span>
                </span>
                <div className="p-3 rounded-2xl bg-[#161f18]/80 border border-white/[0.08] space-y-2 text-stone-300">
                  <div className="flex items-center gap-2 text-[#4ade80]">
                    <CheckCircle2 className="w-4 h-4 text-[#4ade80] shrink-0" />
                    <span>Share this verified advisory directly to family WhatsApp & SMS groups</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#4ade80]">
                    <CheckCircle2 className="w-4 h-4 text-[#4ade80] shrink-0" />
                    <span>Play the spoken mother tongue voice message for elders at home</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#4ade80]">
                    <CheckCircle2 className="w-4 h-4 text-[#4ade80] shrink-0" />
                    <span>Complete the 4 immediate home safety steps (shelter, water, kit, power)</span>
                  </div>
                </div>
              </div>

              {/* Actions: One-Tap WhatsApp Share or Switch to Volunteer */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playBlip();
                    setIsCitizenRestrictedModalOpen(false);
                    openWhatsAppChat('', alertData?.alertContent?.whatsappText || alertData?.alertContent?.threat);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-[#4ade80] to-[#a3e635] text-stone-950 font-bold text-xs shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 hover:brightness-105 active:scale-98 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-stone-950" />
                  <span>Share with Family on WhatsApp Now</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    sound.playBlip();
                    setIsCitizenRestrictedModalOpen(false);
                    await quickLogin('volunteer@resona.org', 'Password123!');
                    sound.playSuccessChime();
                    try {
                      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
                    } catch {}
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#18231c] hover:bg-[#202e24] border border-white/15 text-stone-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#4ade80]" />
                  <span>Switch to Volunteer Account (Ramesh Das • VOL-4022)</span>
                </button>

                {onOpenReportModal && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playBlip();
                      setIsCitizenRestrictedModalOpen(false);
                      onOpenReportModal();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Report Citizen SOS / Ground Incident</span>
                  </button>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/[0.08] bg-[#18231c]/90 flex items-center justify-between">
              <span className="text-[10px] text-stone-400 font-mono">Resona Public Safety Policy</span>
              <button
                type="button"
                onClick={() => {
                  sound.playBlip();
                  setIsCitizenRestrictedModalOpen(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Understood
              </button>
            </div>

          </div>
        </div>
      )}



    </div>
  );
}

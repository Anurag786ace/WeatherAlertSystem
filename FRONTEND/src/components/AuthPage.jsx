import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  Users, 
  Send, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Building2, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  LogOut, 
  BadgeCheck, 
  ShieldAlert, 
  Radio, 
  Zap, 
  Smartphone, 
  MessageSquare, 
  TowerControl, 
  PhoneCall, 
  AlertTriangle,
  Layers,
  ArrowLeft,
  ChevronRight,
  Database,
  Check,
  RefreshCw,
  Search,
  Heart,
  Shield
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/audioSynth';
import ContactActionModal from './ContactActionModal';
import { openDeviceSms, openWhatsAppChat, openEmailClient } from '../utils/directDispatch';

export default function AuthPage({ onNavigateToTab, onOpenSafety }) {
  const { currentUser, isAuthenticated, login, register, quickLogin, logout, mongoUsers, usersCount, fetchMongoUsers, mongoUri } = useAuth();

  // Active persona selection: 'volunteer' | 'citizen' | 'commander'
  const [selectedPersona, setSelectedPersona] = useState('citizen');
  // Mode: 'signin' | 'register'
  const [authMode, setAuthMode] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedContactForAction, setSelectedContactForAction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [quickLoginClicked, setQuickLoginClicked] = useState(null);

  // MongoDB Inspector state
  const [isDbViewerOpen, setIsDbViewerOpen] = useState(true);
  const [dbSearch, setDbSearch] = useState('');
  const [refreshingDb, setRefreshingDb] = useState(false);

  const handleManualDbRefresh = async () => {
    sound.playBlip();
    setRefreshingDb(true);
    await fetchMongoUsers();
    setTimeout(() => setRefreshingDb(false), 400);
  };

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organization: '',
    phone: '',
    location: '',
  });

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38BDF8', '#34D399', '#86EFAC', '#FBBF24']
      });
    } catch {}
  };

  const handleQuickLogin = async (userOrIdentifier, password = 'Password123!') => {
    setErrorMsg('');
    setSuccessMsg('');
    let key;
    let payload;
    if (typeof userOrIdentifier === 'object' && userOrIdentifier !== null) {
      key = userOrIdentifier._id || userOrIdentifier.id || userOrIdentifier.email || userOrIdentifier.phone;
      payload = {
        userId: userOrIdentifier._id || userOrIdentifier.id,
        email: userOrIdentifier.email,
        phone: userOrIdentifier.phone
      };
    } else {
      key = userOrIdentifier;
      payload = userOrIdentifier;
    }

    setQuickLoginClicked(key);
    setLoading(true);
    sound.playBlip();

    // brief visual ripple before auth transition
    await new Promise(r => setTimeout(r, 200));

    const res = await quickLogin(payload, password);
    setLoading(false);
    setQuickLoginClicked(null);

    if (res.success) {
      sound.playSuccessChime();
      triggerConfetti();
      setSuccessMsg(`Authenticated successfully as ${res.user.name || res.user.role} (${res.user.role})`);
    } else {
      setErrorMsg(res.error || 'Login failed. Please check credentials.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    sound.playBlip();

    if (authMode === 'signin') {
      const res = await login(formData.email, formData.password);
      setLoading(false);
      if (res.success) {
        sound.playSuccessChime();
        triggerConfetti();
        setSuccessMsg(`Welcome back, ${res.user.name}`);
      } else {
        setErrorMsg(res.error || 'Invalid email or password.');
      }
    } else {
      // Registration
      if (!formData.name.trim()) {
        setLoading(false);
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (!formData.email.trim()) {
        setLoading(false);
        setErrorMsg('Please enter a valid email address.');
        return;
      }
      if (formData.password.length < 6) {
        setLoading(false);
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }

      const role = selectedPersona === 'volunteer' 
        ? 'Volunteer' 
        : selectedPersona === 'commander' 
        ? 'Disaster Management Officer' 
        : 'Citizen';

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
        organization: formData.organization || (role === 'Volunteer' ? 'Disaster Relief Volunteer Corps' : 'Citizen Resident'),
        phone: formData.phone || '+91 94370 00000',
        location: formData.location || 'Odisha, India',
      };

      const res = await register(payload);
      setLoading(false);
      if (res.success) {
        sound.playSuccessChime();
        triggerConfetti();
        setSuccessMsg(`✓ Successfully registered responder profile! ID: ${res.user._id || res.user.id}`);
        setFormData({
          name: '',
          email: '',
          password: '',
          organization: '',
          phone: '',
          location: '',
        });
        await fetchMongoUsers();
      } else {
        setErrorMsg(res.error || 'Registration failed.');
      }
    }
  };

  const isCurrentVolunteer = currentUser?.role === 'Volunteer' || 
    currentUser?.role === 'Emergency Responder' || 
    currentUser?.role === 'Disaster Management Officer' || 
    currentUser?.role === 'Administrator' ||
    currentUser?.role === 'Citizen / Volunteer';

  const isCurrentCitizen = currentUser?.role === 'Citizen' || currentUser?.role === 'Normal User';

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2 px-1 sm:px-2 animate-in fade-in duration-300 font-sans">
      
      {/* 1. Header Navigation & Title: Calming Obsidian Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-sans font-medium bg-sky-500/10 text-sky-300 border border-sky-500/20 flex items-center gap-1.5 shadow-sm">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              <span>Community Identity & Access</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-stone-400 font-sans">Role permissions</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1.5 flex items-center gap-2.5 font-sans">
            <span>Identity & Dispatch Portal</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 mt-1 leading-relaxed font-sans max-w-3xl">
            Sign in as a <strong className="text-sky-300 font-semibold">Resident citizen</strong> for personalized mother-tongue warnings and family SOS assistance, or as a <strong className="text-emerald-300 font-semibold">Relief volunteer</strong> with community alert dispatch permissions.
          </p>
        </div>

        {onNavigateToTab && (
          <button
            onClick={() => onNavigateToTab('dashboard')}
            className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-stone-200 transition-all flex items-center gap-1.5 border border-white/10 cursor-pointer shadow-sm hover:scale-102"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-stone-400" /> Back to dashboard
          </button>
        )}
      </div>

      {/* 2. Active Session Card (If Logged In): Warm Obsidian & Soft Sage */}
      {isAuthenticated && currentUser && (
        <div className="p-5 sm:p-6 rounded-[28px] bg-gradient-to-r from-[#121824]/95 via-[#10141e]/95 to-[#131926]/95 border border-white/[0.09] backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-page-enter relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-4 relative z-10">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0 ${
              isCurrentVolunteer 
                ? 'bg-gradient-to-br from-emerald-500 to-teal-700 shadow-emerald-500/20' 
                : 'bg-gradient-to-br from-sky-500 to-blue-700 shadow-sky-500/20'
            }`}>
              {isCurrentVolunteer ? <ShieldCheck className="w-6 h-6 text-white stroke-[1.8]" /> : <User className="w-6 h-6 text-white stroke-[1.8]" />}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-base font-bold text-white font-sans">{currentUser.name}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-sans font-semibold ${
                  isCurrentVolunteer 
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25' 
                    : 'bg-sky-500/15 text-sky-300 border border-sky-500/25'
                }`}>
                  {isCurrentVolunteer ? 'Relief volunteer' : 'Resident citizen'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-sans font-medium bg-white/[0.06] text-stone-300 border border-white/10">
                  {isCurrentVolunteer ? 'Verified Volunteer ID' : 'Verified Resident ID'}
                </span>
              </div>

              <div className="text-xs text-stone-400 mt-1 flex items-center gap-2 flex-wrap font-sans">
                <button
                  type="button"
                  onClick={() => setSelectedContactForAction({ name: currentUser.name, email: currentUser.email, phone: currentUser.phone, role: currentUser.role })}
                  className="hover:text-sky-300 hover:underline flex items-center gap-1 cursor-pointer text-stone-300"
                  title="Click to send emergency email or message"
                >
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <span>{currentUser.email}</span>
                </button>
                {currentUser.phone && (
                  <>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedContactForAction({ name: currentUser.name, email: currentUser.email, phone: currentUser.phone, role: currentUser.role })}
                      className="hover:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer font-mono text-emerald-300"
                      title="Click to send SMS or message"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{currentUser.phone}</span>
                    </button>
                  </>
                )}
                <span>•</span>
                <span>{currentUser.organization || 'Odisha Disaster Response'}</span>
                <span>•</span>
                <span className="text-stone-300">{currentUser.location || 'Bhubaneswar'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap relative z-10">
            {/* Status Indicator Chip with Pulse Beacon */}
            <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 ${
              isCurrentVolunteer 
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
            }`}>
              {isCurrentVolunteer ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Broadcast access: <strong className="font-bold text-emerald-200">Authorized</strong></span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400 stroke-[1.8]" />
                  <span>Broadcast access: <strong className="font-bold text-amber-200">Restricted</strong></span>
                </>
              )}
            </div>

            {onNavigateToTab && isCurrentVolunteer && (
              <button
                onClick={() => onNavigateToTab('multilingual')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 text-white font-medium text-xs shadow-md shadow-sky-950/40 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 stroke-[1.8]" /> Open alert engine
              </button>
            )}

            <button
              onClick={() => {
                sound.playBlip();
                logout();
                setSuccessMsg('You have been signed out.');
              }}
              className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-rose-500/15 hover:text-rose-300 text-stone-300 border border-white/10 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-stone-400 stroke-[1.8]" /> Sign out
            </button>
          </div>
        </div>
      )}

      {/* 3. Role Selector Showcase Grid: Softened Geometry & Calming Palette */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        
        {/* CARD 1: RESIDENT CITIZEN PERSONA (Warm Obsidian & Soft Sky Blue) */}
        <div 
          onClick={() => {
            sound.playBlip();
            setSelectedPersona('citizen');
          }}
          className={`relative p-6 sm:p-7 rounded-[28px] border transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden group shadow-xl backdrop-blur-xl ${
            selectedPersona === 'citizen'
              ? 'bg-gradient-to-b from-[#121a2c]/95 to-[#0e1422]/98 border-sky-400/40 shadow-2xl ring-2 ring-sky-400/25'
              : 'bg-[#111622]/90 border-white/[0.08] hover:border-sky-400/35 hover:shadow-2xl hover:-translate-y-1'
          }`}
        >
          {/* Soft Sky Blue Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-sky-500/15 transition-all duration-500" />

          <div className="relative z-10">
            {/* Header: Icon & Friendly Community Tag */}
            <div className="flex items-center justify-between mb-3.5">
              <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform shadow-sm">
                <Users className="w-5 h-5 stroke-[1.8]" />
              </div>
              <span className={`text-xs font-sans px-3.5 py-1 rounded-full font-medium transition-all ${
                selectedPersona === 'citizen'
                  ? 'bg-sky-500/20 text-sky-200 border border-sky-500/35 shadow-sm'
                  : 'bg-white/[0.05] text-stone-400 border border-white/10'
              }`}>
                General Community
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight font-sans flex items-center gap-2">
              <span>Resident Citizen & Families</span>
              {selectedPersona === 'citizen' && (
                <CheckCircle2 className="w-4.5 h-4.5 text-sky-400 stroke-[2] animate-bounce" />
              )}
            </h3>
            <p className="text-xs text-stone-300 mt-1.5 leading-relaxed font-sans font-normal">
              Designed for residents, coastal families, and elders seeking real-time vernacular storm alerts, safe evacuation routes, and family SOS assistance.
            </p>

            {/* Permission Matrix for Citizen: Clean Vertical Rows (Reduced Cognitive Load) */}
            <div className="mt-4 py-2.5 px-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] divide-y divide-white/[0.04] text-xs font-sans">
              
              <div className="flex items-center justify-between py-2 text-stone-200">
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Mother-tongue weather guidance (27+ Indic)</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-semibold border border-emerald-500/25 shrink-0 ml-2">
                  Available for all
                </span>
              </div>

              <div className="flex items-center justify-between py-2 text-stone-200">
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Cyclone shelter directory & 24/7 helplines</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-semibold border border-emerald-500/25 shrink-0 ml-2">
                  Always Open
                </span>
              </div>

              <div className="flex items-center justify-between py-2 text-stone-200">
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Family emergency SOS & incident reporting</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-semibold border border-emerald-500/25 shrink-0 ml-2">
                  Enabled
                </span>
              </div>

              <div className="flex items-center justify-between py-2 text-stone-400">
                <span className="flex items-center gap-2 text-stone-300">
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Mass neighborhood alert broadcasting</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-medium border border-amber-500/25 shrink-0 ml-2">
                  Volunteer-only
                </span>
              </div>

            </div>
          </div>

          {/* Friendly Account Badge & Quick Login for Citizen */}
          <div className="mt-5 pt-4 border-t border-white/[0.08] relative z-10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleQuickLogin('citizen@resona.org', 'Password123!');
              }}
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-500/15 to-blue-600/10 hover:from-sky-500/25 hover:to-blue-600/20 border border-sky-400/30 hover:border-sky-400/50 text-white text-xs font-medium flex items-center justify-between transition-all duration-300 shadow-sm hover:shadow-lg active:scale-98 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 border border-sky-300/40 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
                  SN
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold block text-xs">Sunita Nayak</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium text-sky-200 bg-sky-950/70 border border-sky-500/30">
                      Family Member
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400 font-sans">Puri Coastal Resident Community</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-sky-300 font-semibold group-hover:text-white">
                {quickLoginClicked === 'citizen@resona.org' ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-bold animate-pulse">
                    <Check className="w-3.5 h-3.5" /> Authenticating...
                  </span>
                ) : (
                  <>
                    <span>1-Click sign in</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>

            {/* Direct Contact Links for Sunita Nayak */}
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-stone-400 px-1 pt-2 border-t border-white/[0.04] font-sans">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedContactForAction({ name: 'Sunita Nayak', email: 'citizen@resona.org', phone: '+91 94370 22334', role: 'Citizen' });
                }}
                className="hover:text-sky-300 hover:underline flex items-center gap-1 cursor-pointer font-mono text-sky-300/90"
                title="Click to message or call Sunita Nayak"
              >
                <Phone className="w-3 h-3 text-emerald-400" />
                <span>+91 94370 22334</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedContactForAction({ name: 'Sunita Nayak', email: 'citizen@resona.org', phone: '+91 94370 22334', role: 'Citizen' });
                }}
                className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/25 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                title="Send emergency message to this number"
              >
                <Send className="w-2.5 h-2.5" />
                <span>Message</span>
              </button>
            </div>
          </div>
        </div>

        {/* CARD 2: DISASTER RELIEF VOLUNTEER PERSONA (Warm Obsidian & Soft Sage Green) */}
        <div 
          onClick={() => {
            sound.playBlip();
            setSelectedPersona('volunteer');
          }}
          className={`relative p-6 sm:p-7 rounded-[28px] border transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden group shadow-xl backdrop-blur-xl ${
            selectedPersona === 'volunteer'
              ? 'bg-gradient-to-b from-[#12221b]/95 to-[#0e1713]/98 border-emerald-400/40 shadow-2xl ring-2 ring-emerald-400/25'
              : 'bg-[#111622]/90 border-white/[0.08] hover:border-emerald-400/35 hover:shadow-2xl hover:-translate-y-1'
          }`}
        >
          {/* Soft Sage Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/15 transition-all duration-500" />

          <div className="relative z-10">
            {/* Header: Icon & Authorized Dispatcher Tag */}
            <div className="flex items-center justify-between mb-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shadow-sm">
                <ShieldCheck className="w-5 h-5 stroke-[1.8]" />
              </div>
              <span className={`text-xs font-sans px-3.5 py-1 rounded-full font-medium transition-all ${
                selectedPersona === 'volunteer'
                  ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/35 shadow-sm'
                  : 'bg-white/[0.05] text-stone-400 border border-white/10'
              }`}>
                Authorized Dispatcher
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight font-sans flex items-center gap-2">
              <span>Disaster Relief Volunteer</span>
              {selectedPersona === 'volunteer' && (
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 stroke-[2] animate-bounce" />
              )}
            </h3>
            <p className="text-xs text-stone-300 mt-1.5 leading-relaxed font-sans font-normal">
              Designated for field operatives, NGO coordinators, and first responders authorized to transmit urgent warning broadcasts directly to citizens.
            </p>

            {/* Permission Matrix for Volunteer: Clean Vertical Rows (Reduced Cognitive Load) */}
            <div className="mt-4 py-2.5 px-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] divide-y divide-white/[0.04] text-xs font-sans">
              
              <div className="flex items-center justify-between py-2 text-stone-200">
                <span className="flex items-center gap-2 font-medium text-emerald-300">
                  <Send className="w-3.5 h-3.5 text-emerald-400 stroke-[1.8]" />
                  <span>Mass emergency alert broadcasting</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-semibold border border-emerald-500/25 shrink-0 ml-2">
                  Authorized
                </span>
              </div>

              <div className="flex items-center justify-between py-2 text-stone-200">
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Multi-channel delivery (SMS, WhatsApp, Cell, IVR)</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-semibold border border-emerald-500/25 shrink-0 ml-2">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between py-2 text-stone-200">
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Live citizen delivery confirmation & logs</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-semibold border border-emerald-500/25 shrink-0 ml-2">
                  Real-time sync
                </span>
              </div>

              <div className="flex items-center justify-between py-2 text-stone-200">
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Volunteer identity & sector verification</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-300 text-[11px] font-semibold border border-sky-500/25 shrink-0 ml-2">
                  Verified volunteer
                </span>
              </div>

            </div>
          </div>

          {/* Friendly Account Badge & Quick Login for Volunteer */}
          <div className="mt-5 pt-4 border-t border-white/[0.08] relative z-10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleQuickLogin('volunteer@resona.org', 'Password123!');
              }}
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-teal-600/10 hover:from-emerald-500/25 hover:to-teal-600/20 border border-emerald-400/30 hover:border-emerald-400/50 text-white text-xs font-medium flex items-center justify-between transition-all duration-300 shadow-sm hover:shadow-lg active:scale-98 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 border border-emerald-300/40 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
                  RD
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold block text-xs">Ramesh Das</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium text-emerald-200 bg-emerald-950/70 border border-emerald-500/30">
                      Relief Volunteer
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400 font-sans">Odisha Coastal Relief Corps • Sector 4</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-semibold group-hover:text-white">
                {quickLoginClicked === 'volunteer@resona.org' ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-bold animate-pulse">
                    <Check className="w-3.5 h-3.5" /> Authenticating...
                  </span>
                ) : (
                  <>
                    <span>1-Click sign in</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>

            {/* Direct Contact Links for Ramesh Das */}
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-stone-400 px-1 pt-2 border-t border-white/[0.04] font-sans">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedContactForAction({ name: 'Ramesh Das', email: 'volunteer@resona.org', phone: '+91 70081 99887', role: 'Volunteer' });
                }}
                className="hover:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer font-mono text-emerald-300/90"
                title="Click to message or call Ramesh Das"
              >
                <Phone className="w-3 h-3 text-emerald-400" />
                <span>+91 70081 99887</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedContactForAction({ name: 'Ramesh Das', email: 'volunteer@resona.org', phone: '+91 70081 99887', role: 'Volunteer' });
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/25 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                title="Send emergency message to this number"
              >
                <Send className="w-2.5 h-2.5" />
                <span>Message</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Interactive Credentials Form: Calming Obsidian Card */}
      <div className="rounded-[28px] p-6 sm:p-7 bg-[#111622]/95 border border-white/[0.08] backdrop-blur-xl shadow-xl animate-slide-in">
        
        {/* Switcher & Form Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${
              selectedPersona === 'volunteer' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-sky-500/15 text-sky-400 border border-sky-500/25'
            }`}>
              {selectedPersona === 'volunteer' ? <ShieldCheck className="w-5 h-5 stroke-[1.8]" /> : <User className="w-5 h-5 stroke-[1.8]" />}
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white tracking-normal font-sans">
                {authMode === 'signin' ? 'Sign in with credentials' : `Register as new ${selectedPersona === 'volunteer' ? 'relief volunteer' : 'citizen'}`}
              </h4>
              <p className="text-xs text-stone-400 font-sans mt-0.5">
                {selectedPersona === 'volunteer' 
                  ? 'Volunteer credentials include mass broadcast dispatch authorization' 
                  : 'Citizen account provides personalized vernacular alerts and ground SOS reports'}
              </p>
            </div>
          </div>

          {/* Mode Switcher: Sign In vs Register */}
          <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/[0.08] text-xs font-sans">
            <button
              type="button"
              onClick={() => {
                sound.playBlip();
                setAuthMode('signin');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`px-4 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                authMode === 'signin' ? 'bg-white/10 text-white font-bold shadow-sm' : 'text-stone-400 hover:text-white'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playBlip();
                setAuthMode('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`px-4 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                authMode === 'register' ? 'bg-white/10 text-white font-bold shadow-sm' : 'text-stone-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2.5 animate-in fade-in font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 stroke-[1.8]" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2.5 animate-in fade-in font-sans">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 stroke-[1.8]" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 font-sans">
          
          {authMode === 'register' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5 font-sans">
                  Full name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3 stroke-[1.8]" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={selectedPersona === 'volunteer' ? 'Ramesh Das' : 'Sunita Nayak'}
                    className="w-full pl-9 pr-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5 font-sans">
                  Contact mobile number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3 stroke-[1.8]" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 94370 12345"
                    className="w-full pl-9 pr-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5 font-sans">
                  {selectedPersona === 'volunteer' ? 'Volunteer organization / NGO *' : 'Locality / Resident community'}
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-stone-400 absolute left-3 top-3 stroke-[1.8]" />
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder={selectedPersona === 'volunteer' ? 'Odisha Coastal Volunteer Corps' : 'Puri Coastal Resident'}
                    className="w-full pl-9 pr-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5 font-sans">
                  District / Sector location *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3 stroke-[1.8]" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Puri District, Odisha"
                    className="w-full pl-9 pr-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-500/30"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5 font-sans">
                Email address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3 stroke-[1.8]" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={selectedPersona === 'volunteer' ? 'volunteer@resona.org' : 'citizen@resona.org'}
                  className="w-full pl-9 pr-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-500/30"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 font-sans">
                <label className="block text-xs font-medium text-stone-300">
                  Password *
                </label>
                <span className="text-[10px] text-stone-400">min 6 chars</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3 stroke-[1.8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-500/30 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 stroke-[1.8]" /> : <Eye className="w-4 h-4 stroke-[1.8]" />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-stone-400 flex items-center gap-1.5 font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>
                {selectedPersona === 'volunteer'
                  ? 'Volunteer badge assigned automatically upon registration'
                  : 'Citizen ID created with personalized vernacular profile'
                }
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                selectedPersona === 'volunteer'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/40'
                  : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-sky-950/40'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>
                    {authMode === 'signin' ? `Sign in as ${selectedPersona === 'volunteer' ? 'volunteer' : 'citizen'}` : `Create ${selectedPersona === 'volunteer' ? 'volunteer' : 'citizen'} account`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[1.8]" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>

      {/* 5. Additional Commander / Admin Option & Personnel Sync */}
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans animate-page-enter">
        <div className="flex items-center gap-2.5 text-stone-300">
          <Database className="w-4 h-4 text-sky-400 stroke-[1.8]" />
          <span>Need official state command access?</span>
          <button
            type="button"
            onClick={() => handleQuickLogin({ email: 'commander@resona.gov.in' }, 'Password123!')}
            disabled={loading}
            className="text-sky-300 hover:text-sky-200 font-medium hover:underline flex items-center gap-1.5 cursor-pointer ml-1"
          >
            <span>{quickLoginClicked === 'commander@resona.gov.in' ? 'Authenticating...' : 'Sign in as Commander Arjun Patel'}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-medium bg-sky-500/15 text-sky-300 border border-sky-500/30">Command Officer</span>
            <span>→</span>
          </button>
        </div>

        <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 radiating-status-ring" />
          <span>Registry online: {usersCount} registered personnel</span>
        </div>
      </div>

      {/* 6. LIVE MONGODB DATABASE RECORDS INSPECTOR (resona_db.users) */}
      <div className="rounded-[28px] p-6 sm:p-7 bg-[#111622]/95 border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-4">
        
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm sm:text-base font-bold text-white font-sans">
                  Emergency Personnel Directory
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                  Verified Registry
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  {usersCount} Registered Responders
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5 font-sans">
                Verified roster of disaster relief personnel, emergency coordinators, and field responders.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleManualDbRefresh}
              disabled={refreshingDb}
              className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-stone-300 text-xs font-medium border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Refresh database records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshingDb ? 'animate-spin text-sky-400' : ''}`} />
              <span>{refreshingDb ? 'Syncing...' : 'Sync Directory'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsDbViewerOpen(!isDbViewerOpen)}
              className="px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-medium border border-sky-500/25 transition-all cursor-pointer"
            >
              {isDbViewerOpen ? 'Collapse' : 'View Records'}
            </button>
          </div>
        </div>

        {/* Real-time Session & Alert Banner inside Directory */}
        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-2 animate-in fade-in">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <strong>{successMsg}</strong>
            </span>
            {onNavigateToTab && (
              <button
                type="button"
                onClick={() => onNavigateToTab('dashboard')}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-medium text-[11px] border border-emerald-500/30 cursor-pointer"
              >
                Go to Dashboard →
              </button>
            )}
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Database Search & Filter */}
        {isDbViewerOpen && (
          <div className="space-y-3 font-sans">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search registered accounts by name, email, phone, or responder ID..."
                value={dbSearch}
                onChange={(e) => setDbSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-sky-400"
              />
            </div>

            {/* Records Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {(mongoUsers || [])
                .filter(u => {
                  if (!dbSearch.trim()) return true;
                  const q = dbSearch.toLowerCase();
                  return (
                    (u.name || '').toLowerCase().includes(q) ||
                    (u.email || '').toLowerCase().includes(q) ||
                    (u.phone || '').toLowerCase().includes(q) ||
                    (u._id || u.id || '').toLowerCase().includes(q) ||
                    (u.role || '').toLowerCase().includes(q)
                  );
                })
                .map((u, idx) => (
                  <div
                    key={u._id || u.id || idx}
                    className="p-4 rounded-2xl bg-[#0e131d]/90 border border-white/[0.07] hover:border-sky-500/30 transition-all flex flex-col justify-between space-y-2.5 group shadow-sm hover:-translate-y-0.5"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[11px] font-bold text-slate-300 shrink-0">
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <span className="font-semibold text-white text-xs">{u.name}</span>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          u.role === 'Volunteer' || u.role === 'Emergency Responder'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : u.role === 'Disaster Management Officer'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                        }`}>
                          {u.role || 'Citizen'}
                        </span>
                      </div>

                      <div className="mt-2 space-y-1 text-[11px]">
                        <div className="flex items-center justify-between text-stone-400">
                          <button
                            type="button"
                            onClick={() => setSelectedContactForAction({ name: u.name, email: u.email, phone: u.phone, role: u.role })}
                            className="hover:text-sky-300 hover:underline flex items-center gap-1.5 cursor-pointer text-stone-300 truncate"
                            title="Send email to this user"
                          >
                            <Mail className="w-3 h-3 text-sky-400 shrink-0" />
                            <span className="truncate">{u.email}</span>
                          </button>
                        </div>

                        {u.phone && (
                          <div className="flex items-center justify-between text-stone-400">
                            <button
                              type="button"
                              onClick={() => setSelectedContactForAction({ name: u.name, email: u.email, phone: u.phone, role: u.role })}
                              className="hover:text-emerald-300 hover:underline flex items-center gap-1.5 cursor-pointer font-mono text-emerald-300/90"
                              title="Send SMS / message"
                            >
                              <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span>{u.phone}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-stone-400 font-mono">
                      <span className="text-stone-500 truncate" title={`Responder ID: ${u._id || u.id}`}>
                        ID: {(u._id || u.id || '').slice(0, 10)}...
                      </span>

                      <div className="flex items-center gap-1.5">
                        {u.phone && (
                          <button
                            type="button"
                            onClick={() => openDeviceSms(u.phone, `🚨 [RESONA EMERGENCY ADVISORY] Cyclone warning active in coastal Odisha. Seek immediate high shelter.`)}
                            className="px-2 py-0.5 rounded bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 text-[10px] font-sans border border-emerald-500/30 cursor-pointer"
                            title="Send SMS"
                          >
                            SMS
                          </button>
                        )}
                        {currentUser && (currentUser.email === u.email || currentUser._id === (u._id || u.id)) ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-medium font-sans flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleQuickLogin(u)}
                            disabled={loading}
                            className="px-2.5 py-1 rounded bg-white/[0.08] hover:bg-sky-500/25 hover:text-sky-200 text-white text-[10px] font-sans font-medium border border-white/10 hover:border-sky-400/40 transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                            title="Quick Login as this user"
                          >
                            {quickLoginClicked === (u._id || u.id || u.email || u.phone) ? (
                              <>
                                <span className="w-2.5 h-2.5 border-2 border-sky-300 border-t-transparent rounded-full animate-spin" />
                                <span>Signing in...</span>
                              </>
                            ) : (
                              <span>Sign in</span>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

      </div>

      {/* Interactive Contact Dispatch Modal */}
      <ContactActionModal
        isOpen={!!selectedContactForAction}
        contact={selectedContactForAction}
        onClose={() => setSelectedContactForAction(null)}
      />

    </div>
  );
}

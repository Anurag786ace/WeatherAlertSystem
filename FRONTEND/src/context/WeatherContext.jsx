import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { POPULAR_INDIAN_HUBS } from '../data/indiaCities';
import { DRILL_SCENARIOS } from '../components/SimulationDrillBar';

const WeatherContext = createContext(null);
const API_BASE = '/api/weather';

// Polling interval (ms) – re-fetch every 60 seconds to ensure fresh real-time data
const POLL_INTERVAL = 60 * 1000;

export function WeatherProvider({ children, city, onCityChange }) {
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [allCities, setAllCities] = useState([]);
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [eonetEvents, setEonetEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  // Simulation Drill State
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentScenario, setCurrentScenario] = useState('fani_2019');
  const [simulationStepIndex, setSimulationStepIndex] = useState(0);

  const fetchWeather = useCallback(async (cityName, isFresh = false) => {
    if (!cityName) return;
    try {
      setLoading(true);
      setError(null);

      const hubsList = Array.from(new Set([cityName, ...POPULAR_INDIAN_HUBS]));
      const freshParam = isFresh ? '&fresh=true' : '';
      const [currentRes, forecastRes, multiRes, alertsRes, eventsRes] = await Promise.all([
        fetch(`${API_BASE}/current?city=${encodeURIComponent(cityName)}${freshParam}`),
        fetch(`${API_BASE}/forecast?city=${encodeURIComponent(cityName)}${freshParam}`),
        fetch(`${API_BASE}/multi?cities=${encodeURIComponent(hubsList.join(','))}${freshParam}`),
        fetch(`${API_BASE}/live-alerts?city=${encodeURIComponent(cityName)}`),
        fetch(`/api/events?limit=25`).catch(() => null)
      ]);

      if (currentRes.ok) {
        const currentData = await currentRes.json();
        if (currentData.success) {
          setCurrent(currentData);
        }
      }

      if (forecastRes.ok) {
        const forecastData = await forecastRes.json();
        if (forecastData.success) {
          setForecast(forecastData);
        }
      }

      if (multiRes.ok) {
        const multiData = await multiRes.json();
        if (multiData.success && multiData.cities) {
          setAllCities(multiData.cities);
        }
      }

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        if (alertsData.success && alertsData.alerts) {
          setLiveAlerts(alertsData.alerts);
        }
      }

      if (eventsRes && eventsRes.ok) {
        const eventsData = await eventsRes.json();
        if (eventsData.success && Array.isArray(eventsData.data)) {
          setEonetEvents(eventsData.data);
        }
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error('WeatherContext fetch error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and when city changes
  useEffect(() => {
    fetchWeather(city);

    // Set up polling every 60s for continuous real-time sync
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => fetchWeather(city), POLL_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [city, fetchWeather]);

  const refresh = useCallback((isFresh = true) => fetchWeather(city, isFresh), [city, fetchWeather]);

  // Simulation Controls
  const startSimulation = useCallback((scenarioId = 'fani_2019') => {
    const sc = DRILL_SCENARIOS.find(s => s.id === scenarioId) || DRILL_SCENARIOS[0];
    setCurrentScenario(sc.id);
    setSimulationStepIndex(0);
    setIsSimulating(true);
    if (onCityChange && sc.defaultCity) {
      onCityChange({
        city: sc.defaultCity,
        state: sc.region.split(',')[1]?.trim() || 'Odisha',
        country: 'India',
        lat: 19.8135,
        lon: 85.8312
      });
    }
  }, [onCityChange]);

  const stopSimulation = useCallback(() => {
    setIsSimulating(false);
    fetchWeather(city, true);
  }, [city, fetchWeather]);

  const selectScenario = useCallback((scenarioId) => {
    const sc = DRILL_SCENARIOS.find(s => s.id === scenarioId) || DRILL_SCENARIOS[0];
    setCurrentScenario(sc.id);
    setSimulationStepIndex(0);
    if (onCityChange && sc.defaultCity) {
      onCityChange({
        city: sc.defaultCity,
        state: sc.region.split(',')[1]?.trim() || 'Odisha',
        country: 'India',
        lat: 19.8135,
        lon: 85.8312
      });
    }
  }, [onCityChange]);

  const selectStep = useCallback((stepIndexOrFn) => {
    setSimulationStepIndex(stepIndexOrFn);
  }, []);

  // Calculate simulated effective weather when simulation is active
  const activeScenarioObj = DRILL_SCENARIOS.find(s => s.id === currentScenario) || DRILL_SCENARIOS[0];
  const stepObj = activeScenarioObj.steps[simulationStepIndex] || activeScenarioObj.steps[0];

  const simulatedCurrent = isSimulating ? {
    success: true,
    name: activeScenarioObj.defaultCity,
    city: activeScenarioObj.defaultCity,
    state: activeScenarioObj.region.split(',')[1]?.trim() || 'Odisha',
    coord: { lat: 19.8135, lon: 85.8312 },
    main: {
      temp: stepObj.tempC,
      feels_like: stepObj.tempC + 4,
      temp_min: stepObj.tempC - 2,
      temp_max: stepObj.tempC + 2,
      pressure: stepObj.pressureHpa,
      humidity: 92
    },
    wind: {
      speed: +(stepObj.windKm / 3.6).toFixed(1),
      gust: +(stepObj.windKm / 3.6 * 1.2).toFixed(1),
      deg: 120
    },
    weather: [
      {
        main: stepObj.windKm >= 120 ? 'Thunderstorm' : 'Rain',
        description: stepObj.alertHeadline,
        icon: stepObj.windKm >= 120 ? '11d' : '10d'
      }
    ],
    riskScore: stepObj.riskScore,
    riskLevel: stepObj.riskLevel,
    isSimulation: true,
    scenarioName: activeScenarioObj.name,
    phase: stepObj.phase
  } : null;

  const effectiveCurrent = isSimulating ? simulatedCurrent : current;

  const simulatedAlerts = isSimulating ? [
    {
      id: `sim-${stepObj.phase}`,
      headline: stepObj.alertHeadline,
      severity: stepObj.riskScore >= 80 ? 'Catastrophic' : stepObj.riskScore >= 60 ? 'Severe' : 'Moderate',
      severityColor: stepObj.riskScore >= 80 ? 'bg-rose-950 text-rose-300 border-rose-500/50' : 'bg-amber-950 text-amber-300 border-amber-500/50',
      description: `${activeScenarioObj.name} (${stepObj.phase}): Sustained winds of ${stepObj.windKm} km/h, rain of ${stepObj.rainMm} mm/h. ${stepObj.alertHeadline}`,
      urgency: 'Immediate',
      category: 'Met',
      event: activeScenarioObj.hazardType
    }
  ] : null;

  const effectiveAlerts = isSimulating ? simulatedAlerts : liveAlerts;

  return (
    <WeatherContext.Provider value={{ 
      current: effectiveCurrent, 
      forecast, 
      allCities, 
      liveAlerts: effectiveAlerts, 
      eonetEvents,
      loading: isSimulating ? false : loading, 
      error, 
      lastUpdated, 
      refresh,
      // Simulation state & handlers
      isSimulating,
      currentScenario,
      simulationStepIndex,
      startSimulation,
      stopSimulation,
      selectScenario,
      selectStep,
      activeScenarioObj,
      currentStepObj: stepObj
    }}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error('useWeather must be used within a <WeatherProvider>');
  return ctx;
}

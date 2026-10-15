// Service to interact with Pexels API via secure backend proxy (/api/wallpapers)
// The Pexels API key is safely stored on the server and never exposed to client browsers.

// Curated search themes reflecting emergency weather, cyclones, thunderstorms, and dramatic atmospheric skies
export const PEXELS_WEATHER_QUERIES = [
  'dark storm clouds lightning',
  'cyclone storm ocean tempest',
  'atmospheric thunderstorm night',
  'dramatic stormy sea waves',
  'monsoon dark sky rain',
  'supercell storm vortex',
  'hurricane satellite atmosphere',
  'dramatic lightning thunderstorm clouds',
  'ocean tempest stormy weather'
];

const CACHE_KEY = 'resona_pexels_cache_pool';
const CURRENT_BG_KEY = 'resona_dashboard_bg';
const AUTO_REFRESH_KEY = 'resona_pexels_auto_refresh';

/**
 * Check if dynamic Pexels auto-refresh is active (defaults to true)
 */
export function isPexelsAutoRefreshEnabled() {
  try {
    const val = localStorage.getItem(AUTO_REFRESH_KEY);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

/**
 * Set dynamic auto-refresh toggle
 */
export function setPexelsAutoRefreshEnabled(enabled) {
  try {
    localStorage.setItem(AUTO_REFRESH_KEY, String(enabled));
  } catch {}
}

/**
 * Format a raw Pexels photo object into the Resona wallpaper schema
 */
export function formatPexelsWallpaper(photo) {
  if (!photo || !photo.src) return null;
  return {
    id: `pexels-${photo.id}`,
    name: photo.alt ? photo.alt.slice(0, 48) : 'Atmospheric Storm Wallpaper',
    tag: 'Pexels 4K Dynamic',
    url: photo.src.large2x || photo.src.original || photo.src.large,
    thumbnail: photo.src.medium || photo.src.large || photo.src.tiny,
    photographer: photo.photographer || 'Pexels Contributor',
    photographerUrl: photo.photographer_url || 'https://www.pexels.com',
    pexelsUrl: photo.url,
    description: `Photo by ${photo.photographer || 'Contributor'} via Pexels.`
  };
}

/**
 * Fetch a fresh, random atmospheric wallpaper via secure backend proxy
 */
export async function fetchRandomPexelsWallpaper(customQuery = null) {
  try {
    const queryParam = customQuery ? `?query=${encodeURIComponent(customQuery)}` : '';
    const res = await fetch(`/api/wallpapers/random${queryParam}`);

    if (!res.ok) {
      console.warn('Backend wallpaper proxy responded with status:', res.status);
      return getCachedFallbackWallpaper();
    }

    const data = await res.json();
    if (!data.success || !data.photo) {
      return getCachedFallbackWallpaper();
    }

    const chosenWallpaper = formatPexelsWallpaper(data.photo);

    // Save into cache pool for offline / instant load fallback
    if (data.photosPool && data.photosPool.length > 0) {
      cachePexelsPhotos(data.photosPool);
    }

    return chosenWallpaper || getCachedFallbackWallpaper();
  } catch (err) {
    console.warn('Failed to fetch wallpaper from backend proxy:', err.message);
    return getCachedFallbackWallpaper();
  }
}

/**
 * Fetch a list of wallpapers via backend proxy for gallery view in WallpaperSelector
 */
export async function fetchPexelsWallpapersList(query = 'storm clouds', perPage = 8) {
  try {
    const url = `/api/wallpapers/search?query=${encodeURIComponent(query)}&per_page=${perPage}`;
    const res = await fetch(url);

    if (!res.ok) return [];
    const data = await res.json();
    return (data.photos || []).map(formatPexelsWallpaper).filter(Boolean);
  } catch (err) {
    console.warn('Wallpaper list fetch error:', err.message);
    return [];
  }
}

/**
 * Cache photos in localStorage to provide instant background loading on refresh before network returns
 */
function cachePexelsPhotos(rawPhotos) {
  try {
    const formatted = rawPhotos.slice(0, 10).map(formatPexelsWallpaper).filter(Boolean);
    localStorage.setItem(CACHE_KEY, JSON.stringify(formatted));
  } catch {}
}

/**
 * Get a cached Pexels photo or default
 */
export function getCachedFallbackWallpaper() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const list = JSON.parse(cached);
      if (Array.isArray(list) && list.length > 0) {
        return list[Math.floor(Math.random() * list.length)];
      }
    }
  } catch {}

  // Fallback to high-resolution storm visual
  return {
    id: 'pexels-fallback',
    name: 'Supercyclone Orbital Vortex',
    tag: 'Pexels Dynamic Fallback',
    url: '/cyclone_satellite_bg.jpg',
    thumbnail: '/cyclone_satellite_bg.jpg',
    description: 'Dynamic atmospheric cyclone vortex background.'
  };
}

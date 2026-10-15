const express = require('express');
const router = express.Router();

const PEXELS_API_KEY = process.env.PEXELS_API_KEY || '';

const PEXELS_WEATHER_QUERIES = [
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

/**
 * GET /api/wallpapers/search
 * Query params: query (string), per_page (number), page (number)
 */
router.get('/search', async (req, res) => {
  try {
    if (!PEXELS_API_KEY) {
      return res.status(503).json({
        success: false,
        error: 'PEXELS_API_KEY is not configured on the backend server',
        photos: []
      });
    }

    const query = req.query.query || 'storm clouds';
    const perPage = parseInt(req.query.per_page, 10) || 8;
    const page = parseInt(req.query.page, 10) || 1;

    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&per_page=${perPage}&page=${page}`;
    const pexelsRes = await fetch(url, {
      headers: {
        Authorization: PEXELS_API_KEY
      }
    });

    if (!pexelsRes.ok) {
      console.warn(`Pexels API upstream status: ${pexelsRes.status}`);
      return res.status(pexelsRes.status).json({
        success: false,
        error: `Upstream Pexels error (status ${pexelsRes.status})`,
        photos: []
      });
    }

    const data = await pexelsRes.json();
    return res.json({
      success: true,
      photos: data.photos || []
    });
  } catch (err) {
    console.error('Pexels search proxy error:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message,
      photos: []
    });
  }
});

/**
 * GET /api/wallpapers/random
 * Query params: query (optional string)
 */
router.get('/random', async (req, res) => {
  try {
    if (!PEXELS_API_KEY) {
      return res.status(503).json({
        success: false,
        error: 'PEXELS_API_KEY is not configured on the backend server'
      });
    }

    const query = req.query.query || PEXELS_WEATHER_QUERIES[Math.floor(Math.random() * PEXELS_WEATHER_QUERIES.length)];
    const page = Math.floor(Math.random() * 6) + 1;

    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&per_page=15&page=${page}`;
    const pexelsRes = await fetch(url, {
      headers: {
        Authorization: PEXELS_API_KEY
      }
    });

    if (!pexelsRes.ok) {
      console.warn(`Pexels API upstream status: ${pexelsRes.status}`);
      return res.status(pexelsRes.status).json({
        success: false,
        error: `Upstream Pexels error (status ${pexelsRes.status})`
      });
    }

    const data = await pexelsRes.json();
    const photos = data.photos || [];
    if (photos.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No wallpapers found for query'
      });
    }

    const chosen = photos[Math.floor(Math.random() * photos.length)];
    return res.json({
      success: true,
      photo: chosen,
      photosPool: photos
    });
  } catch (err) {
    console.error('Pexels random proxy error:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;

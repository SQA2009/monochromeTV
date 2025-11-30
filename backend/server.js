const express = require("express");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const HISTORY_FILE = path.join(__dirname, "history.json");

function loadJson(file) { try { return JSON.parse(fs.readFileSync(file)); } catch { return {}; } }
function saveJson(file, data) { fs.writeFileSync(file, JSON.stringify(data, null, 2)); }
let history = loadJson(HISTORY_FILE);

const AXIOS_OPTS = {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  },
  timeout: 15000
};

function formatTidalImage(imgId, size="1280x1280") {
  if (!imgId) return "";
  return `https://resources.tidal.com/images/${imgId.replace(/-/g, "/")}/${size}.jpg`;
}

function getTargetServer(req) {
  const server = req.headers['x-server-url'];
  if (!server) throw new Error("No server selected");
  return server.replace(/\/$/, "");
}

// --- HELPER: SMART DATA EXTRACTOR ---
// Handles: { albums: ... }, [{ albums: ... }], { items: ... }, [...]
function extractItems(data, type) {
  // 1. Unwrap single-item array if present (Fixes your issue)
  let root = data;
  if (Array.isArray(data) && data.length === 1 && data[0] && !data[0].id) {
     root = data[0]; 
  }

  console.log(`[DEBUG] Parsing keys: ${Object.keys(root).join(", ")}`);

  // 2. Look for specific type (albums, tracks, artists)
  if (root[type] && root[type].items) return root[type].items;
  
  // 3. Fallbacks
  if (root.items) return root.items;
  if (Array.isArray(root)) return root;
  
  return [];
}

// --- ENDPOINTS ---

app.post("/server/test", async (req, res) => {
  const { url } = req.body;
  try {
    await axios.get(`${url}/track/?id=20115564&quality=LOSSLESS`, AXIOS_OPTS);
    res.json({ status: "Online" });
  } catch (e) {
    res.json({ status: "Offline", error: e.message });
  }
});

app.get("/stream/:id", async (req, res) => {
  try {
    const server = getTargetServer(req);
    const id = req.params.id;
    const targetUrl = `${server}/track/?id=${id}&quality=LOSSLESS`;
    
    console.log(`[STREAM] ${targetUrl}`);
    const resp = await axios.get(targetUrl, AXIOS_OPTS);
    const data = resp.data;

    let link = null;
    let metadata = {};
    let specs = { audioMode: "STEREO", bitDepth: 16, sampleRate: 44100, quality: "LOSSLESS" };

    // Stream data parsing
    if (Array.isArray(data)) {
      const urlObj = data.find(x => x.OriginalTrackUrl);
      if (urlObj) link = urlObj.OriginalTrackUrl;

      const specObj = data.find(x => x.audioMode || x.bitDepth);
      if (specObj) Object.assign(specs, specObj);

      const metaObj = data.find(x => x.id && x.title);
      if (metaObj) metadata = metaObj;
    } else if (data && data.OriginalTrackUrl) {
      link = data.OriginalTrackUrl;
    }

    if (link) res.json({ link, specs, metadata });
    else res.status(404).json({ error: "No stream found" });

  } catch (e) {
    console.error("Stream Error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// --- SEARCH ENDPOINTS (Now using extractItems) ---

app.get("/search/tracks", async (req, res) => {
  try {
    const server = getTargetServer(req);
    const url = `${server}/search/?s=${encodeURIComponent(req.query.q)}`;
    console.log(`[SEARCH-TRACKS] ${url}`);
    
    const resp = await axios.get(url, AXIOS_OPTS);
    const items = extractItems(resp.data, "tracks");
    
    console.log(`[SEARCH-TRACKS] Found ${items.length} items.`);

    const results = items.slice(0, 25).map(t => ({
      id: t.id,
      title: t.title,
      artist: t.artist?.name || (t.artists && t.artists[0]?.name) || "Unknown",
      duration: t.duration,
      coverUrl: t.album?.cover ? formatTidalImage(t.album.cover) : "",
      explicit: t.explicit
    }));
    res.json({ results });
  } catch (e) { res.json({ results: [] }); }
});

app.get("/search/albums", async (req, res) => {
  try {
    const server = getTargetServer(req);
    const url = `${server}/search/?al=${encodeURIComponent(req.query.q)}`;
    console.log(`[SEARCH-ALBUMS] ${url}`);

    const resp = await axios.get(url, AXIOS_OPTS);
    // FIX: Explicitly look for 'albums' key using robust extractor
    const items = extractItems(resp.data, "albums");
    
    console.log(`[SEARCH-ALBUMS] Found ${items.length} items.`);
    
    const results = items.map(a => ({
      id: a.id,
      title: a.title,
      artist: (a.artists && a.artists[0]?.name) || "Unknown",
      duration: a.duration,
      coverUrl: a.cover ? formatTidalImage(a.cover) : "",
      releaseDate: a.releaseDate,
      explicit: a.explicit
    }));
    
    history[req.query.q] = Date.now();
    saveJson(HISTORY_FILE, history);
    res.json({ results });
  } catch (e) { res.json({ results: [] }); }
});

app.get("/search/artists", async (req, res) => {
  try {
    const server = getTargetServer(req);
    const url = `${server}/search/?a=${encodeURIComponent(req.query.q)}`;
    console.log(`[SEARCH-ARTISTS] ${url}`);

    const resp = await axios.get(url, AXIOS_OPTS);
    const items = extractItems(resp.data, "artists");

    console.log(`[SEARCH-ARTISTS] Found ${items.length} items.`);
    
    const results = items.map(a => ({
      id: a.id,
      name: a.name,
      picture: a.picture ? formatTidalImage(a.picture, "750x750") : ""
    }));
    res.json({ results });
  } catch (e) { res.json({ results: [] }); }
});

app.get("/album/:id", async (req, res) => {
  try {
    const server = getTargetServer(req);
    const id = req.params.id;
    const url = `${server}/albums/${id}/tracks?countryCode=US`;
    console.log(`[ALBUM] ${url}`);

    const resp = await axios.get(url, AXIOS_OPTS);
    // Uses the same robust extractor, but typically albums return "items" directly at root or inside an object
    const items = extractItems(resp.data, "items"); 
    
    console.log(`[ALBUM] Found ${items.length} tracks.`);

    const results = items.map(t => ({
      id: t.id,
      title: t.title,
      artist: t.artist?.name || "Unknown",
      duration: t.duration,
      explicit: t.explicit,
      trackNumber: t.trackNumber
    }));
    res.json({ results });

  } catch (e) { 
    console.error(`[ALBUM] Failed: ${e.message}`);
    res.json({ results: [] }); 
  }
});

app.get("/history", (req, res) => res.json({ history }));
app.delete("/history", (req, res) => { history = {}; saveJson(HISTORY_FILE, history); res.json({ ok: true }); });

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
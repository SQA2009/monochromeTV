const express = require("express");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;

const HISTORY_FILE = path.join(__dirname, "history.json");
const CACHE_FILE = path.join(__dirname, "cache.json");

function loadJson(file) {
  try { return JSON.parse(fs.readFileSync(file)); } catch { return {}; }
}
function saveJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
let history = loadJson(HISTORY_FILE);
let cache = loadJson(CACHE_FILE);

const MAIN_SEARCH_SERVER = "https://ohio.monochrome.tf";

function formatTidalImage(imgId, size="1280x1280") {
  return imgId ? `https://resources.tidal.com/images/${imgId.replace(/-/g, "/")}/${size}.jpg` : "";
}

const MAX_TRACKS_TO_LINK = 10; // Set to limit, change as needed

// Helper to get stream URL for a track
async function getTrackStreamUrl(trackId) {
  try {
    // Using your own backend endpoint, faster to call remote directly if possible
    const url = `https://maus.qqdl.site/track/?id=${trackId}&quality=LOSSLESS`;
    const resp = await axios.get(url, { timeout: 5000 });
    // Sometimes streamUrl is in different spot; parse as usual
    let streamUrl;
    if (Array.isArray(resp.data)) {
      const meta = resp.data.find(x => x.OriginalTrackUrl);
      if (meta && meta.OriginalTrackUrl) streamUrl = meta.OriginalTrackUrl;
      else {
        const manifestObj = resp.data.find(x => x.manifest);
        if (manifestObj && manifestObj.manifest) streamUrl = null; // expand logic if needed
      }
    }
    return streamUrl;
  } catch (e) {
    return null;
  }
}

app.get("/search/tracks", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Missing query" });
  try {
    const url = `${MAIN_SEARCH_SERVER}/search/?s=${encodeURIComponent(query)}`;
    const resp = await axios.get(url);

    let items = [];
    if (Array.isArray(resp.data)) {
      items = resp.data;
    } else if (resp.data.tracks?.items) {
      items = resp.data.tracks.items;
    } else if (resp.data.items) {
      items = resp.data.items;
    } else {
      items = [];
    }

    // Use at most MAX_TRACKS_TO_LINK tracks per search for speed
    const topItems = items
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, MAX_TRACKS_TO_LINK);

    // Fetch stream URLs concurrently
    const linkPromises = topItems.map(async t => {
      const streamUrl = await getTrackStreamUrl(t.id);
      return streamUrl || t.url; // fallback to Tidal if stream fails
    });
    const streamLinks = await Promise.all(linkPromises);

    // Build results
    const results = topItems.map((t, idx) => ({
      id: t.id,
      title: t.title,
      artist: t.artist?.name || (t.artists && t.artists[0] && t.artists[0].name) || "Unknown",
      duration: t.duration,
      popularity: t.popularity || 0,
      coverUrl: (t.album && t.album.cover)
        ? formatTidalImage(t.album.cover)
        : (t.cover ? formatTidalImage(t.cover) : ""),
      explicit: t.explicit,
      link: streamLinks[idx] // The music file
    }));

    res.json({ results });
  } catch (e) {
    console.error("Track search error:", e.message);
    res.json({ results: [], error: "Upstream failed" });
  }
});

function formatTidalImage(imgId, size="1280x1280") {
  return imgId ? `https://resources.tidal.com/images/${imgId.replace(/-/g, "/")}/${size}.jpg` : "";
}

// --- Albums ---
app.get("/search/albums", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Missing query" });

  try {
    const url = `${MAIN_SEARCH_SERVER}/search/?al=${encodeURIComponent(query)}`;
    const resp = await axios.get(url);
    const items = resp.data.albums?.items || [];

    const results = items
      .map(a => ({
        id: a.id,
        title: a.title,
        artist: (a.artists && a.artists[0] && a.artists[0].name) || "Unknown",
        duration: a.duration,
        popularity: a.popularity || 0,
        coverUrl: a.cover
          ? formatTidalImage(a.cover)
          : "",
        releaseDate: a.releaseDate,
        explicit: a.explicit,
        link: a.url
      }))
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    if (results.length === 0) {
      results.push({
        title: `${query} (Demo - No results)`,
        artist: "Unknown",
        duration: "0:00",
        coverUrl: "",
        link: "https://monochrome.tf",
        popularity: 0,
        explicit: false
      });
    }

    history[query] = Date.now();
    cache[query] = results;
    saveJson(HISTORY_FILE, history);
    saveJson(CACHE_FILE, cache);

    res.json({ results });
  } catch (e) {
    console.error("Album search error:", e);
    res.json({ results: [], error: "Upstream failed" });
  }
});

// --- Artists ---
app.get("/search/artists", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Missing query" });

  function formatArtistPicture(picId) {
    return picId ? `https://resources.tidal.com/images/${picId.replace(/-/g, "/")}/750x750.jpg` : "";
  }

  try {
    const url = `${MAIN_SEARCH_SERVER}/search/?a=${encodeURIComponent(query)}`;
    const resp = await axios.get(url);

    // Debug prints!
    console.log("Raw response data:", JSON.stringify(resp.data, null, 2));

    let items = [];
    if (Array.isArray(resp.data) && resp.data[0]?.artists?.items) {
      items = resp.data[0].artists.items;
    } else if (resp.data.artists?.items) {
      items = resp.data.artists.items;
    } else {
      items = [];
    }

    console.log("Artists items chosen:", JSON.stringify(items, null, 2));

    const results = items
      .map(a => ({
        id: a.id,
        name: a.name,
        popularity: a.popularity || 0,
        picture: formatArtistPicture(a.picture),
        link: a.url
      }))
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    if (results.length === 0) {
      results.push({
        name: `${query} (Demo - No results)`,
        popularity: 0,
        picture: "",
        link: "https://monochrome.tf"
      });
    }

    history[query] = Date.now();
    cache[query] = results;
    saveJson(HISTORY_FILE, history);
    saveJson(CACHE_FILE, cache);

    res.json({ results });
  } catch (e) {
    console.error("Artist search error:", e.message);
    res.json({ results: [], error: "Upstream failed" });
  }
});

// --- Stream Endpoint (unchanged from previous; not shown for brevity) ---

app.get("/history", (_req, res) => {
  res.json({ history });
});

app.delete("/history", (_req, res) => {
  history = {};
  cache = {};
  saveJson(HISTORY_FILE, history);
  saveJson(CACHE_FILE, cache);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
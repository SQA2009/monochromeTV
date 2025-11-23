const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

const HISTORY_FILE = path.join(__dirname, "history.json");
const CACHE_FILE = path.join(__dirname, "cache.json");

// Load or initialize history/cache
function loadJson(file) {
  try { return JSON.parse(fs.readFileSync(file)); } catch { return {}; }
}
function saveJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

let history = loadJson(HISTORY_FILE);
let cache = loadJson(CACHE_FILE);

app.get("/search", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Missing query" });

  // Check cache
  if (cache[query]) {
    history[query] = Date.now();
    saveJson(HISTORY_FILE, history);
    return res.json({ results: cache[query], cached: true });
  }

  try {
    const resp = await axios.get(`https://monochrome.tf/search?q=${encodeURIComponent(query)}`);
    const $ = cheerio.load(resp.data);

    // Example: parsing result items (tune for monochrome.tf's real HTML)
    const results = [];
    $(".music-result").each((_, el) => {
      results.push({
        title: $(el).find("h2").text(),
        link: $(el).find("a").attr("href"),
      });
    });

    cache[query] = results;
    history[query] = Date.now();
    saveJson(CACHE_FILE, cache);
    saveJson(HISTORY_FILE, history);

    res.json({ results, cached: false });
  } catch (e) {
    res.status(500).json({ error: "Failed to search monochrome.tf", details: e.message });
  }
});

app.get("/history", (_req, res) => {
  res.json({ history });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
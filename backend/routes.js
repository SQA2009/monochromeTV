const express = require("express");
const axios = require("axios");
const { getBrowser, closePage } = require("./browser");
const { CSS, navigateAndSearch } = require("./scraper");

const router = express.Router();
const BASE_URL = "https://tidal.squid.wtf/";

// --- SEARCH ---
router.get("/search/:category", async (req, res) => {
    const { category } = req.params;
    const { q } = req.query;
    const serverUrl = req.headers['x-server-url'] || BASE_URL;

    if (!q) return res.status(400).json({ error: "Missing query" });

    const config = CSS[category] || CSS.tracks;
    let page;

    try {
        const browser = await getBrowser();
        page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        await navigateAndSearch(page, q, category, serverUrl);

        const results = await page.evaluate((cfg, cat, query) => {
            const rows = Array.from(document.querySelectorAll(cfg.ROW));
            const validRows = rows.filter(r => r.innerText.trim().length > 0 && r.querySelector('img'));

            return validRows.map((row, idx) => {
                const titleEl = row.querySelector(cfg.TITLE);
                const imgEl = row.querySelector(cfg.COVER);
                let cover = imgEl ? imgEl.src : "";
                if (cover) cover = cover.replace("160x160", "640x640");

                let artistName = "Unknown";
                if (cfg.ARTIST) {
                    const artistEl = row.querySelector(cfg.ARTIST);
                    if (artistEl) artistName = artistEl.innerText.trim();
                }

                if (artistName === "Unknown" && cat === "albums") {
                    const pTag = row.querySelector('p');
                    if (pTag) artistName = pTag.innerText.trim();
                }

                // Extract Album ID from link
                let id = idx.toString();
                const linkEl = row.closest('a');
                if (linkEl) {
                    const href = linkEl.getAttribute('href');
                    const match = href.match(/\/album\/(\d+)/);
                    if (match) id = match[1];
                }

                return {
                    id: id,
                    title: titleEl ? titleEl.innerText.trim() : "Unknown",
                    artist: artistName,
                    coverUrl: cover,
                    query: query,
                    exactTitle: titleEl ? titleEl.innerText.trim() : ""
                };
            });
        }, config, category, q);

        console.log(`[SEARCH] Found ${results.length} results`);
        res.json({ results });

    } catch (e) {
        console.error(`[SEARCH] Error:`, e);
        res.status(500).json({ results: [], error: e.message });
    } finally {
        await closePage(page);
    }
});

// --- ALBUM DETAILS (NEW) ---
router.get("/album/:id", async (req, res) => {
    const { id } = req.params;
    const serverUrl = req.headers['x-server-url'] || BASE_URL;

    let page;
    try {
        const browser = await getBrowser();
        page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        // Navigate directly to album page
        const albumUrl = `${serverUrl.replace(/\/$/, "")}/album/${id}`;
        console.log(`[ALBUM] Navigating to: ${albumUrl}`);
        
        await page.goto(albumUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        
        // Wait for track list
        try {
            await page.waitForSelector('.track-glass', { timeout: 10000 });
        } catch(e) {
            console.warn("[ALBUM] No .track-glass found, might be empty album");
        }

        const results = await page.evaluate((sel) => {
            const rows = Array.from(document.querySelectorAll('.track-glass'));
            return rows.map((row, idx) => {
                const titleEl = row.querySelector('h3');
                const artistEl = row.querySelector('div > a');
                const durEl = row.querySelector('span:last-child');
                
                return {
                    id: idx,
                    title: titleEl ? titleEl.innerText.trim() : `Track ${idx+1}`,
                    artist: artistEl ? artistEl.innerText.trim() : "",
                    duration: durEl ? durEl.innerText.trim() : "",
                    exactTitle: titleEl ? titleEl.innerText.trim() : ""
                };
            });
        }, CSS);

        console.log(`[ALBUM] Found ${results.length} tracks`);
        res.json({ results });

    } catch (e) {
        console.error("[ALBUM] Error:", e);
        res.status(500).json({ results: [], error: e.message });
    } finally {
        await closePage(page);
    }
});

// --- STREAM ---
router.get("/stream", async (req, res) => {
    const { q, title } = req.query;
    const searchQuery = q || title; 
    const targetTitle = title || q;

    if (!searchQuery) return res.status(400).json({ error: "Missing query params" });

    let page;
    try {
        const browser = await getBrowser();
        page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        console.log(`[STREAM] ${searchQuery} -> ${targetTitle}`);

        const mediaPromise = new Promise((resolve) => {
            const timer = setTimeout(() => resolve(null), 25000);
            page.on('request', req => {
                const url = req.url();
                if ((url.includes("0.flac") || url.includes("0.mp4")) && url.includes("token=")) {
                    clearTimeout(timer);
                    resolve(url);
                }
            });
        });

        // Always use "tracks" mode for streaming
        await navigateAndSearch(page, searchQuery, "tracks", BASE_URL);

        const clickedData = await page.evaluate((sel, tTitle) => {
            const rows = Array.from(document.querySelectorAll(sel.ROW));
            let row = rows.find(r => r.querySelector(sel.TITLE)?.innerText.trim() === tTitle);
            
            // Fuzzy match
            if (!row) row = rows.find(r => r.querySelector(sel.TITLE)?.innerText.toLowerCase().includes(tTitle.toLowerCase()));
            
            // Fallback
            if (!row && rows.length > 0) row = rows[0];

            if (row) {
                const d = row.querySelector(sel.DURATION)?.innerText.trim() || "";
                const clickTarget = row.querySelector(sel.TITLE) || row;
                clickTarget.click();
                return { success: true, fallbackDuration: d };
            }
            return { success: false };
        }, CSS.tracks, targetTitle);

        if (!clickedData.success) throw new Error("Could not find title to click");

        const streamUrl = await mediaPromise;

        // Scrape Duration
        await new Promise(r => setTimeout(r, 2000));
        const trueDuration = await page.evaluate(() => {
            try {
                const xpath = "/html/body/div/div[1]/div[2]/div/div/div/div/div[1]/div/span[2]";
                const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                return result.singleNodeValue ? result.singleNodeValue.textContent.trim() : null;
            } catch (err) { return null; }
        });

        if (!streamUrl) return res.status(404).json({ error: "Timeout" });

        const result = {
            link: "",
            metadata: { duration: trueDuration || clickedData.fallbackDuration },
            specs: { quality: streamUrl.includes(".flac") ? "LOSSLESS" : "HIGH (Stitched)" }
        };

        if (streamUrl.includes(".flac")) {
            result.link = streamUrl;
        } else {
            result.link = `${req.protocol}://${req.get('host')}/stitch?url=${encodeURIComponent(streamUrl)}`;
        }

        res.json(result);
    } catch (e) {
        console.error("[STREAM] Error:", e);
        res.status(500).json({ error: e.message });
    } finally {
        await closePage(page);
    }
});

// --- STITCH ---
router.get("/stitch", async (req, res) => {
    const baseUrl = req.query.url;
    if (!baseUrl) return res.status(400).send("Missing url");

    res.setHeader('Content-Type', 'audio/mp4');
    let segmentIndex = 0;
    let isFinished = false;

    const streamNextSegment = async () => {
        if (isFinished) return;
        const segmentUrl = baseUrl.replace(/(\d+)\.(mp4|m4a)/, `${segmentIndex}.$2`);
        try {
            const response = await axios({
                method: 'get',
                url: segmentUrl,
                responseType: 'stream',
                validateStatus: (status) => status < 400
            });
            response.data.pipe(res, { end: false });
            response.data.on('end', () => { segmentIndex++; streamNextSegment(); });
            response.data.on('error', () => { res.end(); });
        } catch (e) {
            isFinished = true;
            res.end(); 
        }
    };
    streamNextSegment();
});

module.exports = router;
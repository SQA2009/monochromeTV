const CSS = {
    common: {
        INPUT: "input[class*='placeholder\\:text-gray-400']",
        TAB_BASE: ".cursor-pointer",
    },
    tracks: {
        ROW: ".track-glass",
        TITLE: "h3",
        ARTIST: "div > a",
        COVER: "img",
        DURATION: "span:last-child"
    },
    albums: {
        ROW: "div.group.relative.text-left",
        TITLE: "h3",
        ARTIST: "p.text-gray-400",
        COVER: "img",
        DURATION: null
    },
    artists: {
        ROW: "div.group.relative.text-left",
        TITLE: "h3",
        ARTIST: null,
        COVER: "img",
        DURATION: null
    },
    // NEW: Selectors for the Album Detail View
    albumDetails: {
        ROW: ".track-glass", // Reuse track glass class
        TITLE: "h3",
        ARTIST: "div > a",
        DURATION: "span:last-child"
    }
};

async function navigateAndSearch(page, query, categoryKey, serverUrl) {
    // 1. Navigate
    console.log(`[NAV] Going to ${serverUrl}`);
    await page.goto(serverUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // 2. Search First
    console.log(`[NAV] Searching for: ${query}`);
    try {
        await page.waitForSelector(CSS.common.INPUT, { timeout: 5000 });
        await page.click(CSS.common.INPUT, { clickCount: 3 });
        await page.keyboard.press('Backspace');
        await page.type(CSS.common.INPUT, query);
        await page.keyboard.press('Enter');
    } catch (e) {
        throw new Error("Search input interaction failed");
    }

    // 3. Switch Category
    const catMap = { "tracks": "Tracks", "albums": "Albums", "artists": "Artists", "playlists": "Playlists" };
    const uiText = catMap[categoryKey] || "Tracks";
    
    console.log(`[NAV] Switching tab to: ${uiText}`);
    await new Promise(r => setTimeout(r, 1500)); 

    const switched = await page.evaluate((text) => {
        const elements = Array.from(document.querySelectorAll('div, button, a'));
        const tab = elements.find(el => 
            (el.style.cursor === 'pointer' || el.className.includes('cursor-pointer')) &&
            el.innerText && el.innerText.trim().toLowerCase() === text.toLowerCase()
        );
        if (tab) {
            tab.click();
            return true;
        }
        return false;
    }, uiText);

    if (switched) {
        await new Promise(r => setTimeout(r, 1500)); 
    } else {
        console.warn(`[NAV] Tab '${uiText}' not found.`);
    }

    // 4. Wait for Content
    const config = CSS[categoryKey] || CSS.tracks;
    try {
        await page.waitForSelector(config.ROW, { timeout: 8000 });
    } catch (e) {
        console.warn(`[NAV] No results found for ${categoryKey}`);
    }
}

module.exports = { CSS, navigateAndSearch };
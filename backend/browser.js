const puppeteer = require("puppeteer");

let browserInstance;

async function getBrowser() {
    if (!browserInstance || !browserInstance.isConnected()) {
        console.log("[BROWSER] Launching new instance...");
        browserInstance = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1280,800']
        });
    }
    return browserInstance;
}

async function closePage(page) {
    if (page) {
        try {
            await page.close();
        } catch (e) {
            console.error("[BROWSER] Error closing page:", e.message);
        }
    }
}

module.exports = { getBrowser, closePage };
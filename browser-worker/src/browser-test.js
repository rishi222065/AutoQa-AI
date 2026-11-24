
const { chromium } = require("playwright");

async function main() {
    const browser = await chromium.launch({
        headless: false,
    });

    const page = await browser.newPage();

    await page.goto("https://example.com");

    console.log("Page title:", await page.title());
    console.log("Browser:", browser.browserType().name());

    await page.screenshot({
        path: "chromium-test.png",
        fullPage: true,
    });

    await browser.close();

    console.log("Chromium test completed successfully!");
}

main().catch((error) => {
    console.error("Chromium test failed:", error);
    process.exit(1);
});

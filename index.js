const express = require('express');
const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

const app = express();
const PORT = process.env.PORT || 3000;

console.log(">>> FINAL-STRICT BenchApp bot starting...");

app.get('/scrape', async (req, res) => {
  console.log(">>> /scrape endpoint hit");

  let browser;
  try {
    const executablePath = await chromium.executablePath;
    if (!executablePath) {
      throw new Error("Chromium not available in this environment. Cannot proceed.");
    }

    console.log(">>> Launching Puppeteer with Render-compatible Chromium...");
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    console.log(">>> Navigating to login...");
    await page.goto('https://www.benchapp.com/login', { waitUntil: 'networkidle0' });

    console.log(">>> Logging in...");
    await page.type('input[name="email"]', process.env.BENCHAPP_EMAIL);
    await page.type('input[name="password"]', process.env.BENCHAPP_PASS);

    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);

    console.log(">>> Visiting schedule page...");
    await page.goto('https://www.benchapp.com/schedule/list', { waitUntil: 'networkidle0' });

    console.log(">>> Extracting game data...");
    const games = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr')).filter(row =>
        row.querySelector('a[href*="/schedule/game-"]')
      );

      return rows.map(row => {
        const dateBox = row.querySelector('.dateBox');
        const time = dateBox?.querySelector('.time')?.innerText || '';
        const day = dateBox?.querySelector('.dayOfWeek')?.innerText || '';
        const date = dateBox?.querySelector('.dayOfMonth')?.innerText || '';
        const gameIdLink = row.querySelector('a[href*="/schedule/game-"]');
        const gameIdMatch = gameIdLink?.getAttribute('href')?.match(/game-(\d+)/);
        const gameId = gameIdMatch ? gameIdMatch[1] : '';
        const location = row.querySelector('.location')?.getAttribute('title') || '';

        return { day, date, time, gameId, location };
      });
    });

    console.log(">>> Done! Sending JSON.");
    await browser.close();
    res.json(games);
  } catch (error) {
    console.error(">>> ERROR:", error.message);
    if (browser) await browser.close();
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`>>> Server listening on port ${PORT}`);
});
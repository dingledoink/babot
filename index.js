const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = parseInt(process.env.PORT || "8080", 10);

console.log(">>> FULL Puppeteer BenchApp bot starting...");

app.get("/", (req, res) => {
  res.send("BenchApp bot is running.");
});

app.get("/scrape", async (req, res) => {
  console.log(">>> /scrape endpoint hit");

  let browser;
  try {
    console.log(">>> Launching Puppeteer (full)...");
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
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
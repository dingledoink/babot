import express from 'express';
import puppeteer from 'puppeteer-core';
import * as cheerio from 'cheerio';

const app = express();
const PORT = process.env.PORT || 8080;
const BENCHAPP_EMAIL = process.env.BENCHAPP_EMAIL;
const BENCHAPP_PASS = process.env.BENCHAPP_PASS;

app.get('/scrape', async (req, res) => {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium-browser',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto('https://www.benchapp.com/login', { waitUntil: 'networkidle2' });

    await page.type('input[name="email"]', BENCHAPP_EMAIL);
    await page.type('input[name="password"]', BENCHAPP_PASS);
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);

    await page.goto('https://www.benchapp.com/schedule/list', { waitUntil: 'networkidle2' });

    const html = await page.content();
    const $ = cheerio.load(html);
    const events = [];

    $('a[href^="/schedule/game-"]').each((i, el) => {
      const href = $(el).attr('href');
      if (href) {
        const match = href.match(/\/schedule\/game-(\d+)/); // ✅ FIXED
        if (match) {
          events.push(match[1]);
        }
      }
    });

    res.json({ game_ids: events });
  } catch (err) {
    console.error('Scraper error:', err);
    res.status(500).json({ error: err.message || err.toString() });
  } finally {
    if (browser) await browser.close();
  }
});

app.get('/', (req, res) => {
  res.send('BenchApp bot is running.');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

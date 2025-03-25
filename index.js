import puppeteer from 'puppeteer';
import express from 'express';
import dotenv from 'dotenv';
import * as cheerio from 'cheerio';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

let lastHTML = ''; // save last raw HTML here for debugging

app.get('/games', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // 1. LOGIN
    await page.goto('https://www.benchapp.com/login?redirect=%2Fschedule%2Flist', {
      waitUntil: 'networkidle2'
    });

    await page.type('input[name="email"]', process.env.BENCHAPP_EMAIL);
    await page.type('input[name="password"]', process.env.BENCHAPP_PASS);
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);

    // 2. GO TO SCHEDULE
    await page.goto('https://www.benchapp.com/schedule/list', {
      waitUntil: 'networkidle2'
    });

    const html = await page.content();
    lastHTML = html; // store it so we can view via /debug

    const $ = cheerio.load(html);
    const gameData = [];

    $('div.date').each((i, el) => {
      const dateText = $(el).text().trim();
      const gameLink = $(el).nextAll('a[href*="/schedule/game-"]').first();
      const href = gameLink.attr('href');
      if (href) {
        const match = href.match(/\/schedule\/game-(\d+)/);
        if (match) {
          gameData.push({
            date: dateText,
            gameId: match[1],
          });
        }
      }
    });

    await browser.close();
    res.json({ gameData });
  } catch (err) {
    console.error('Scrape failed:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/debug', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.send(lastHTML || '<p>No HTML has been scraped yet.</p>');
});

app.get('/', (req, res) => {
  res.send('BenchApp bot is live.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

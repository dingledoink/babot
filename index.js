import puppeteer from 'puppeteer';
import express from 'express';
import dotenv from 'dotenv';
import * as cheerio from 'cheerio';
import fs from 'fs';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

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

    // 2. VISIT SCHEDULE
    await page.goto('https://www.benchapp.com/schedule/list', {
      waitUntil: 'networkidle2'
    });

    const html = await page.content();

    // Save raw HTML so we can debug
    fs.writeFileSync('/app/schedule_debug.html', html);

    const $ = cheerio.load(html);
    const gameData = [];

    const dateElements = $('div.date');
    console.log(`Found ${dateElements.length} date elements`);

    dateElements.each((i, el) => {
      const dateText = $(el).text().trim();

      // Try to locate a nearby game link
      const nextLink = $(el).nextAll().find('a[href*="/schedule/game-"]').first();
      const href = nextLink.attr('href');

      if (href) {
        console.log(`Found game link after ${dateText}: ${href}`);
        const match = href.match(/\/schedule\/game-(\d+)/);
        if (match) {
          gameData.push({
            date: dateText,
            gameId: match[1],
          });
        }
      } else {
        console.log(`⚠️ No game link found after ${dateText}`);
      }
    });

    await browser.close();
    res.json({ gameData });

  } catch (err) {
    console.error('Scrape failed:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('BenchApp Bot is running.');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

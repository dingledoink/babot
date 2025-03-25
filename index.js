import puppeteer from 'puppeteer';
import express from 'express';
import dotenv from 'dotenv';
import * as cheerio from 'cheerio';

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

    // Navigate to login page
    await page.goto('https://www.benchapp.com/login?redirect=%2Fschedule%2Flist', {
      waitUntil: 'networkidle2'
    });

    // Fill in login form
    await page.type('input[name="email"]', process.env.BENCHAPP_EMAIL);
    await page.type('input[name="password"]', process.env.BENCHAPP_PASS);
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);

    // Go to schedule page
    await page.goto('https://www.benchapp.com/schedule/list', {
      waitUntil: 'networkidle2'
    });

    const html = await page.content();
    const $ = cheerio.load(html);
    const gameData = [];

    const dateEls = $('div.date');
    dateEls.each((i, el) => {
      const dateText = $(el).text().trim();
      const gameLink = $(el).next().find('a[href*="/schedule/game-"]').attr('href');

      if (gameLink) {
        const match = gameLink.match(/\/schedule\/game-(\d+)/);
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

app.get('/', (req, res) => {
  res.send('BenchApp Bot is running.');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

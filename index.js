import express from 'express';
import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
import cheerio from 'cheerio';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('BenchApp Scraper is live.');
});

app.get('/debug', async (req, res) => {
  res.json({ message: 'Debug OK' });
});

app.get('/games', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto('https://www.benchapp.com/login?redirect=%2Fschedule%2Flist', {
      waitUntil: 'networkidle2',
      timeout: 0
    });

    await page.type('input[name="email"]', process.env.BENCHAPP_EMAIL);
    await page.type('input[name="password"]', process.env.BENCHAPP_PASS);
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 0 })
    ]);

    await page.goto('https://www.benchapp.com/schedule/list', {
      waitUntil: 'networkidle2',
      timeout: 0
    });

    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);
    const gameData = [];

    let currentDate = '';

    $('.date, .mHide a').each((_, el) => {
      const $el = $(el);

      if ($el.hasClass('date')) {
        currentDate = $el.text().trim();
      }

      if ($el.attr('href') && $el.attr('href').includes('/schedule/game-')) {
        const href = $el.attr('href');
        const match = href.match(/\/schedule\/game-(\d+)/);
        if (match) {
          gameData.push({
            date: currentDate,
            gameId: match[1]
          });
        }
      }
    });

    res.json({ gameData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

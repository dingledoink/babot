import express from 'express';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/scrape', async (req, res) => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.goto('https://www.benchapp.com/schedule/list', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    const content = await page.content();
    const $ = cheerio.load(content);
    const games = [];

    $('a[href*="/schedule/game-"]').each((i, el) => {
      const href = $(el).attr('href');
      const date = $(el).closest('.game-card').find('.date').text().trim();
      const match = href.match(/\/schedule\/game-(\d+)/);
      if (match) {
        games.push({ gameId: match[1], date });
      }
    });

    res.json(games);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await browser.close();
  }
});

app.get('/', (req, res) => {
  res.send('BenchApp Scraper is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

import express from 'express';
import puppeteer from 'puppeteer-core';
import cheerio from 'cheerio';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Utility to delay actions
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

app.get('/games', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: '/usr/bin/google-chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Go to login page
    await page.goto('https://www.benchapp.com/login', { waitUntil: 'networkidle2' });

    // Fill in login form
    await page.type('input[name="email"]', process.env.BENCHAPP_EMAIL, { delay: 30 });
    await page.type('input[name="password"]', process.env.BENCHAPP_PASS, { delay: 30 });

    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]);

    // Navigate to the schedule list
    await page.goto('https://www.benchapp.com/schedule/list', { waitUntil: 'networkidle2' });

    const html = await page.content();
    const $ = cheerio.load(html);

    const gameData = [];

    $('div.date').each((i, elem) => {
      const date = $(elem).text().trim();
      const gameLink = $(elem).next().find('a[href^="/schedule/game-"]').attr('href');
      if (gameLink) {
        const gameId = gameLink.match(/game-(\d+)/)?.[1];
        if (gameId) {
          gameData.push({ date, gameId });
        }
      }
    });

    await browser.close();
    res.json({ gameData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('BenchApp scraper running.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

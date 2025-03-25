import express from 'express';
import puppeteer from 'puppeteer-core';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

const BENCHAPP_EMAIL = process.env.BENCHAPP_EMAIL;
const BENCHAPP_PASS = process.env.BENCHAPP_PASS;

app.get('/games', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/google-chrome', // For Railway or other environments
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto('https://www.benchapp.com/login', { waitUntil: 'networkidle2' });

    // Login
    await page.type('input[name="email"]', BENCHAPP_EMAIL);
    await page.type('input[name="password"]', BENCHAPP_PASS);
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);

    // Navigate to schedule list
    await page.goto('https://www.benchapp.com/schedule/list', { waitUntil: 'networkidle2' });
    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);
    const gameData = [];

    let currentDate = null;

    $('div.date, td.mHide a[href^="/schedule/game-"]').each((_, el) => {
      const tag = $(el).get(0).tagName;

      if (tag === 'div') {
        currentDate = $(el).text().trim();
      } else if (tag === 'a') {
        const href = $(el).attr('href');
        const match = href.match(/\/schedule\/game-(\d+)/);
        if (match && currentDate) {
          gameData.push({
            gameId: match[1],
            date: currentDate
          });
        }
      }
    });

    res.json({ gameData });
  } catch (err) {
    console.error('Error scraping schedule:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// index.js
import puppeteer from 'puppeteer-core';
import express from 'express';
import cheerio from 'cheerio';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.get('/scrape', async (req, res) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: '/usr/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto('https://www.benchapp.com/login?redirect=%2Fschedule%2Flist', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    await page.type('input[name="email"]', process.env.BENCHAPP_EMAIL);
    await page.type('input[name="password"]', process.env.BENCHAPP_PASS);
    await page.click('button[type="submit"]');

    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });

    await page.goto('https://www.benchapp.com/schedule/list', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    const content = await page.content();
    const $ = cheerio.load(content);

    const gameIds = [];
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (href) {
        const match = href.match(/\/schedule\/game-(\d+)/);
        if (match) {
          gameIds.push(match[1]);
        }
      }
    });

    res.json({ games: [...new Set(gameIds)] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

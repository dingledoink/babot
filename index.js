import puppeteer from 'puppeteer-core';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

const PORT = process.env.PORT || 8080;

app.get('/scrape', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/google-chrome-stable',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    await page.goto('https://www.benchapp.com/login', { waitUntil: 'networkidle2' });

    await page.type('input[name="email"]', process.env.BENCHAPP_EMAIL);
    await page.type('input[name="password"]', process.env.BENCHAPP_PASS);

    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]);

    // Screenshot after login
    await page.screenshot({ path: 'after-login.png' });

    await page.goto('https://www.benchapp.com/schedule/list', { waitUntil: 'networkidle2' });

    // Capture page HTML before scraping
    const html = await page.content();
    console.log('PAGE HTML:', html.slice(0, 1000)); // Just print part of it to logs

    const links = await page.$$eval('a[href^="/schedule/game-"]', anchors =>
      anchors.map(a => a.getAttribute('href'))
    );

    const gameIds = [...new Set(
      links
        .map(href => {
          const match = href.match(/\/schedule\/game-(\d+)/);
          return match ? match[1] : null;
        })
        .filter(Boolean)
    )];

    await browser.close();

    res.json(gameIds);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

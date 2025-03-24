import express from 'express';
import puppeteer from 'puppeteer-core';
import * as cheerio from 'cheerio';


const app = express();
const port = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser', // Adjust if needed
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: 'new'
    });

    const page = await browser.newPage();
    await page.goto('https://www.benchapp.com/login', {
      waitUntil: 'networkidle2',
      timeout: 0
    });

    // Wait for input fields and fill in credentials
    await page.type('input[name="email"]', process.env.BENCHAPP_EMAIL);
    await page.type('input[name="password"]', process.env.BENCHAPP_PASS);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 0 });

    // Navigate to the schedule list
    await page.goto('https://www.benchapp.com/schedule/list', {
      waitUntil: 'networkidle2',
      timeout: 0
    });

    const content = await page.content();
    await browser.close();

    const $ = cheerio.load(content);
    const pageTitle = $('title').text();

    res.json({ title: pageTitle });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Something went wrong' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

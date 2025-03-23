import puppeteer from 'puppeteer';

const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/scrape', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    await page.goto('https://www.benchapp.com/schedule/list', { waitUntil: 'domcontentloaded' });

    const html = await page.content();
    await browser.close();

    res.send(html);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log('✅ Server running on port', PORT);
});
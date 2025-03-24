import express from 'express';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

const app = express();
const port = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto('https://www.benchapp.com/login?redirect=%2Fschedule%2Flist', { waitUntil: 'networkidle0' });

    const html = await page.content();
    await browser.close();

    res.send({ html });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

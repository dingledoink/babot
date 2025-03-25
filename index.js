import puppeteer from 'puppeteer';
import express from 'express';
import dotenv from 'dotenv';
import cheerio from 'cheerio';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/test', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // Needed for Railway
    });

    const page = await browser.newPage();
    await page.goto('https://example.com');
    const html = await page.content();
    const $ = cheerio.load(html);
    const title = $('title').text();

    await browser.close();
    res.json({ title });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

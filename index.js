import express from 'express';
import pkg from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

const { executablePath } = pkg;

const app = express();
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('BenchApp Bot is running.');
});

app.get('/scrape', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      args: pkg.args,
      executablePath: await executablePath || '/usr/bin/chromium-browser',
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto('https://example.com');
    const title = await page.title();
    await browser.close();

    res.json({ title });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`>>> FINAL-STRICT BenchApp bot (Railway) starting...`);
  console.log(`>>> Server listening on port ${port}`);
});

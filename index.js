import puppeteer from 'puppeteer-core';
import express from 'express';
import fs from 'fs';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (_req, res) => {
  res.send('BenchApp bot server running!');
});

app.get('/scrape', async (_req, res) => {
  let browser;
  try {
    const path = '/nix/store/6rjqfr6v5g6m68ksqljnykg8x4r1kv15-chromium-122.0.6261.128/bin/chromium';

    if (!fs.existsSync(path)) {
      throw new Error(`Chromium not found at ${path}`);
    }

    browser = await puppeteer.launch({
      headless: true,
      executablePath: path,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto('https://example.com');
    const content = await page.content();

    res.send({ html: content });
  } catch (err) {
    console.error('SCRAPE ERROR:', err);
    res.status(500).send({ error: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

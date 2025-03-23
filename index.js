import express from 'express';
import { launch } from 'puppeteer-core';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/', (_req, res) => {
  res.send('✅ BenchApp Bot is up and running.');
});

app.get('/scrape', async (_req, res) => {
  try {
    const chromiumPath = process.env.CHROMIUM_PATH || '/usr/bin/chromium';
    const browser = await launch({
      executablePath: chromiumPath,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: 'new'
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
  console.log(`✅ Server listening on port ${port}`);
});

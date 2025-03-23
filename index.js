import puppeteer from 'puppeteer-core';
import express from 'express';
import fs from 'fs';
import { execSync } from 'child_process';

const app = express();
const port = process.env.PORT || 3000;

function findChromiumPath() {
  try {
    const chromiumPath = execSync('which chromium').toString().trim();
    if (fs.existsSync(chromiumPath)) return chromiumPath;
  } catch (err) {}

  try {
    const chromiumBrowserPath = execSync('which chromium-browser').toString().trim();
    if (fs.existsSync(chromiumBrowserPath)) return chromiumBrowserPath;
  } catch (err) {}

  return null;
}

app.get('/', (_req, res) => {
  res.send('BenchApp bot server running!');
});

app.get('/scrape', async (_req, res) => {
  let browser;
  try {
    const executablePath = findChromiumPath();
    if (!executablePath) {
      throw new Error('Chromium not found anywhere on system');
    }

    browser = await puppeteer.launch({
      headless: true,
      executablePath,
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

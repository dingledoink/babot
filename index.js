import express from 'express';
import puppeteer from 'puppeteer-core';
import chrome from 'chrome-aws-lambda';
import path from 'path';
import fs from 'fs';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('BenchApp Bot is alive!');
});

app.get('/scrape', async (req, res) => {
  try {
    const executablePath = await chrome.executablePath || '/usr/bin/chromium-browser';

    // If fallback doesn't exist, throw a useful error
    if (!fs.existsSync(executablePath)) {
      throw new Error(`Chromium executable not found at: ${executablePath}`);
    }

    const browser = await puppeteer.launch({
      args: chrome.args,
      executablePath,
      headless: chrome.headless,
      defaultViewport: chrome.defaultViewport,
    });

    const page = await browser.newPage();
    await page.goto('https://example.com'); // Replace this with your real URL

    const title = await page.title();
    await browser.close();

    res.json({ title });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

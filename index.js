import puppeteer from 'puppeteer-core';
import chrome from 'chrome-aws-lambda';
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
  let browser = null;

  try {
    let executablePath = await chrome.executablePath;

    if (!executablePath) {
      executablePath = '/usr/bin/chromium-browser';
    }

    browser = await puppeteer.launch({
      args: chrome.args,
      defaultViewport: chrome.defaultViewport,
      executablePath,
      headless: chrome.headless,
    });

    const page = await browser.newPage();
    await page.goto('https://www.benchapp.com/login?redirect=%2Fschedule%2Flist');

    const html = await page.content();
    res.json({ html });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

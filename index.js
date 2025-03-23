import express from 'express';
import puppeteer from 'puppeteer-core';
import chrome from 'chrome-aws-lambda';

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('BenchApp bot is up and running with /scrape!');
});

app.get('/scrape', async (req, res) => {
  try {
    const execPath = typeof chrome.executablePath === 'function'
      ? await chrome.executablePath()
      : chrome.executablePath || '/usr/bin/chromium-browser';

    const browser = await puppeteer.launch({
      args: chrome.args,
      executablePath: execPath,
      headless: chrome.headless,
    });

    const page = await browser.newPage();
    await page.goto('https://www.benchapp.com/schedule/list', { waitUntil: 'networkidle2' });
    const content = await page.content();
    await browser.close();

    res.send({ html: content });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`>>> FINAL-STRICT BenchApp bot (Railway) starting...`);
  console.log(`>>> Server listening on port ${PORT}`);
});

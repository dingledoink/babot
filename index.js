import express from 'express';
import { executablePath } from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('BenchApp bot is up and running with /scrape!');
});

app.get('/scrape', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      args: chrome.args,
      executablePath: await executablePath(),
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

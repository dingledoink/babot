import chrome from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      args: chrome.args,
      executablePath: await chrome.executablePath,
      headless: chrome.headless,
    });

    const page = await browser.newPage();
    await page.goto('https://www.benchapp.com/login', { waitUntil: 'networkidle0' });

    const html = await page.content();
    await browser.close();

    res.json({ html });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
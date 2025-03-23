import puppeteer from 'puppeteer-core';
import chrome from 'chrome-aws-lambda';
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
  let browser = null;

  try {
    const execPath = await chrome.executablePath || '/usr/bin/chromium-browser';
    console.log("Resolved executablePath:", execPath);

    browser = await puppeteer.launch({
      args: chrome.args,
      executablePath: execPath,
      headless: chrome.headless,
      ignoreDefaultArgs: ['--disable-extensions'],
    });

    const page = await browser.newPage();
    await page.goto('https://www.benchapp.com/login?redirect=%2Fschedule%2Flist', {
      waitUntil: 'networkidle0',
    });

    const html = await page.content();
    res.send({ html });
  } catch (error) {
    console.error("Error during Puppeteer launch or scrape:", error);
    res.status(500).send({ error: error.message });
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

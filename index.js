import express from 'express';
import puppeteer from 'puppeteer-core';
import lambda from 'chrome-aws-lambda';

const app = express();

app.get('/', (req, res) => {
  res.send('BenchApp Scraper is running.');
});

app.get('/scrape', async (req, res) => {
  let browser = null;

  try {
    browser = await puppeteer.launch({
      args: lambda.args,
      executablePath: await lambda.executablePath(),
      headless: lambda.headless,
      defaultViewport: lambda.defaultViewport
    });

    const page = await browser.newPage();
    await page.goto('https://example.com');

    const title = await page.title();
    await browser.close();
    res.json({ title });
  } catch (err) {
    if (browser) await browser.close();
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
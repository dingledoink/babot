import express from 'express';
import puppeteer from 'puppeteer-core';
import lambda from 'chrome-aws-lambda';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('BenchApp Bot is running!');
});

app.get('/scrape', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      args: lambda.args,
      executablePath: await lambda.executablePath,
      headless: true,
      defaultViewport: lambda.defaultViewport,
    });

    const page = await browser.newPage();
    await page.goto('https://example.com'); // <-- Replace this with your target URL

    const title = await page.title();

    await browser.close();

    res.json({ title });
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

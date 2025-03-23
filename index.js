import puppeteer from 'puppeteer-core';
import * as lambda from 'chrome-aws-lambda';
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (_req, res) => {
  res.send('BenchApp bot server running!');
});

app.get('/scrape', async (_req, res) => {
  let browser;

  try {
    const executablePath = await lambda.executablePath ?? '/usr/bin/chromium';

    browser = await puppeteer.launch({
      args: lambda.args,
      defaultViewport: lambda.defaultViewport,
      headless: true,
      executablePath
    });

    const page = await browser.newPage();
    await page.goto('https://example.com'); // change to your target
    const content = await page.content();

    res.send({ html: content });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

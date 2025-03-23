import puppeteer from 'puppeteer-core';
import express from 'express';
import * as lambda from 'chrome-aws-lambda';

const app = express();
const port = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
  let browser = null;

  try {
    const executablePath = await lambda.executablePath || '/usr/bin/chromium';

    browser = await puppeteer.launch({
      args: lambda.args,
      defaultViewport: lambda.defaultViewport,
      executablePath,
      headless: lambda.headless,
    });

    const page = await browser.newPage();
    await page.goto('https://www.benchapp.com/login?redirect=/schedule/list');

    const content = await page.content();
    res.send({ html: content });
  } catch (error) {
    res.status(500).send({ error: error.message });
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
import express from 'express';
import pkg from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

const { executablePath } = pkg;

const app = express();
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('BenchApp Bot is running!');
});

app.get('/scrape', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      args: pkg.args,
      defaultViewport: pkg.defaultViewport,
      executablePath: await executablePath(),
      headless: true,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.goto('https://www.benchapp.com/schedule/list');

    const content = await page.content();
    await browser.close();

    res.send({ html: content });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

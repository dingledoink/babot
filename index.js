import chromeLambda from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';
import express from 'express';

const app = express();
const port = process.env.PORT || 8080;

app.get('/scrape', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      args: chromeLambda.args,
      defaultViewport: chromeLambda.defaultViewport,
      executablePath: await chromeLambda.executablePath,
      headless: chromeLambda.headless,
    });

    const page = await browser.newPage();
    await page.goto('https://www.benchapp.com/schedule/list', { waitUntil: 'networkidle2' });

    const html = await page.content();
    await browser.close();
    res.send({ html });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('BenchApp bot is running!');
});

app.listen(port, () => {
  console.log(`>>> FINAL-STRICT BenchApp bot starting...`);
  console.log(`>>> Server listening on port ${port}`);
});
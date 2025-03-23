import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/scrape', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto('https://www.benchapp.com/schedule/list');
    const html = await page.content();
    await browser.close();

    res.send({ html });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('BenchApp Bot is alive!');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
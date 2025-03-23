import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('✅ BenchApp bot is live');
});

app.get('/scrape', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto('https://www.benchapp.com/schedule/list');
    const content = await page.content();
    await browser.close();

    res.send({ html: content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`>>> FINAL BenchApp bot listening on port ${PORT}`);
});

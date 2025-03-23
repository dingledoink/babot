import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('BenchApp Bot is Live!');
});

app.get('/scrape', async (req, res) => {
  try {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    console.log("Opening new page...");
    const page = await browser.newPage();

    console.log("Navigating to BenchApp login...");
    await page.goto('https://www.benchapp.com/login', { waitUntil: 'networkidle2' });

    console.log("Filling in login form...");
    await page.type('input[name=email]', process.env.BENCHAPP_EMAIL);
    await page.type('input[name=password]', process.env.BENCHAPP_PASSWORD);
    await page.click('button[type=submit]');

    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    console.log("Navigating to schedule list...");
    await page.goto('https://www.benchapp.com/schedule/list', { waitUntil: 'networkidle2' });

    const html = await page.content();
    await browser.close();
    console.log("Scraping complete.");

    res.send(html);
  } catch (err) {
    console.error("Error during scrape:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`>>> BenchApp bot server listening on port ${PORT}`);
});
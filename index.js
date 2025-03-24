import puppeteer from 'puppeteer-core';
import * as cheerio from 'cheerio';
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/scrape', async (req, res) => {
  const email = process.env.BENCHAPP_EMAIL;
  const password = process.env.BENCHAPP_PASS;

  if (!email || !password) {
    return res.status(500).json({ error: 'Missing BENCHAPP_EMAIL or BENCHAPP_PASS' });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Navigate to login page
    await page.goto('https://www.benchapp.com/login', { waitUntil: 'networkidle2', timeout: 60000 });

    // Type in login credentials
    await page.type('input[name="email"]', email, { delay: 50 });
    await page.type('input[name="password"]', password, { delay: 50 });

    // Click login and wait for navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 }),
      page.click('button[type="submit"]'),
    ]);

    // Go to the schedule list page
    await page.goto('https://www.benchapp.com/schedule/list', { waitUntil: 'networkidle2', timeout: 60000 });

    const content = await page.content();
    const $ = cheerio.load(content);

    // Return full HTML so you can refine later
    res.json({ html: $.html() });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

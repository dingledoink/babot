import puppeteer from 'puppeteer-core';
import dotenv from 'dotenv';

dotenv.config();

const loginUrl = 'https://www.benchapp.com/login?redirect=/schedule/list';

const run = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: process.env.CHROME_PATH || '/usr/bin/chromium-browser'
  });

  const page = await browser.newPage();
  await page.goto(loginUrl, { waitUntil: 'networkidle2' });

  await page.type('input[name="email"]', process.env.BENCHAPP_EMAIL, { delay: 50 });
  await page.type('input[name="password"]', process.env.BENCHAPP_PASS, { delay: 50 });

  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
  ]);

  console.log('Login successful! Now on:', page.url());

  await browser.close();
};

run().catch(err => {
  console.error('Error:', err);
});

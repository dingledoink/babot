import puppeteer from 'puppeteer-core';
import * as lambda from 'chrome-aws-lambda';
import express from 'express';
import { execSync } from 'child_process';
import fs from 'fs';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (_req, res) => {
  res.send('BenchApp bot server running!');
});

app.get('/scrape', async (_req, res) => {
  let browser;

  try {
    // Dynamically locate Chromium binary
    let executablePath = await lambda.executablePath;
    if (!executablePath || !fs.existsSync(executablePath)) {
      try {
        const path = execSync('which chromium || which chromium-browser || which google-chrome').toString().trim();
        if (fs.existsSync(path)) {
          executablePath = path;
        } else {
          throw new Error('Chromium not found');
        }
      } catch {
        throw new Error('Chromium executable not found anywhere');
      }
    }

    browser = await puppeteer.launch({
      args: lambda.args,
      defaultViewport: lambda.defaultViewport,
      headless: true,
      executablePath
    });

    const page = await browser.newPage();
    await page.goto('https://example.com');
    const content = await page.content();

    res.send({ html: content });
  } catch (err) {
    console.error('SCRAPE ERROR:', err);
    res.status(500).send({ error: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

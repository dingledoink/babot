import express from "express";
import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

const app = express();
const port = process.env.PORT || 3000;

app.get("/scrape", async (req, res) => {
  let browser = null;
  try {
    const executablePath = await chromium.executablePath;
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto("https://www.benchapp.com/login?redirect=/schedule/list");

    const content = await page.content();
    res.json({ html: content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

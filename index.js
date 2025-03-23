import express from "express";
import { launch } from "puppeteer-core";
import chrome from "chrome-aws-lambda";

const app = express();
const port = process.env.PORT || 3000;

app.get("/scrape", async (req, res) => {
  try {
    const executablePath = await chrome.executablePath || "/usr/bin/chromium";
    const browser = await launch({
      args: chrome.args,
      defaultViewport: chrome.defaultViewport,
      executablePath,
      headless: chrome.headless,
    });

    const page = await browser.newPage();
    await page.goto("https://www.benchapp.com/login", { waitUntil: "networkidle0" });

    const html = await page.content();
    await browser.close();
    res.json({ html });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

import express from "express";
import { executablePath } from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

const app = express();
const port = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("BenchApp Bot is alive");
});

app.get("/scrape", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      args: chrome.args,
      executablePath: await executablePath(),
      headless: chrome.headless,
    });

    const page = await browser.newPage();
    await page.goto("https://example.com");
    const content = await page.content();
    await browser.close();

    res.send({ html: content });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`>>> FINAL-STRICT BenchApp bot (Railway) starting...`);
  console.log(`>>> Server listening on port ${port}`);
});

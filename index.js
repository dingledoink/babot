import express from "express";
import puppeteer from "puppeteer-core";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/", (req, res) => {
  res.send("BenchApp Bot is running.");
});

app.get("/scrape", async (req, res) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      executablePath: "/usr/bin/google-chrome-stable", // Railway-compatible
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto("https://www.benchapp.com/login?redirect=%2Fschedule%2Flist", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    await page.type('input[name="email"]', process.env.BENCHAPP_EMAIL, { delay: 30 });
    await page.type('input[name="password"]', process.env.BENCHAPP_PASS, { delay: 30 });
    await page.click('button[type="submit"]');

    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 });

    await page.goto("https://www.benchapp.com/schedule/list", {
      waitUntil: "networkidle2",
    });

    const html = await page.content();
    const $ = cheerio.load(html);
    const games = [];

    $("a").each((i, el) => {
      const href = $(el).attr("href");
      const match = href?.match(/\/schedule\/game-(\d+)/);
      if (match) {
        games.push({
          gameId: match[1],
          link: `https://www.benchapp.com${href}`,
        });
      }
    });

    res.json({ games });
  } catch (error) {
    console.error("Error scraping:", error);
    res.status(500).json({ error: error.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

import * as cheerio from "cheerio";
import puppeteer from "puppeteer"; // not puppeteer-core
import dotenv from "dotenv";
import fetch from "node-fetch";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

app.get("/", (_req, res) => {
  res.send("BenchApp bot is running.");
});

app.get("/scrape", async (_req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    await page.goto("https://www.benchapp.com/login?redirect=%2Fschedule%2Flist", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    await page.type('input[name="email"]', process.env.BENCHAPP_EMAIL);
    await page.type('input[name="password"]', process.env.BENCHAPP_PASS);
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }),
    ]);

    await page.goto("https://www.benchapp.com/schedule/list", {
      waitUntil: "networkidle2"
    });

    const html = await page.content();
    const $ = cheerio.load(html);

    const gameLinks = [];

    $('a[href*="/schedule/game-"]').each((_i, el) => {
      const href = $(el).attr("href");
      const match = href.match(/\/schedule\/game-(\d+)/);
      if (match) {
        gameLinks.push(match[1]);
      }
    });

    await browser.close();
    res.json({ gameIds: gameLinks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Scraping failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

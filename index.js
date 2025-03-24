import puppeteer from "puppeteer-core";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
import express from "express";
dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.get("/scrape", async (req, res) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      executablePath: "/usr/bin/google-chrome",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.goto("https://www.benchapp.com/login?redirect=%2Fschedule%2Flist", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    console.log("Login page loaded");

    await page.type('input[name="email"]', process.env.BENCHAPP_EMAIL);
    await page.type('input[name="password"]', process.env.BENCHAPP_PASS);

    console.log("Typed email and password");

    await page.click('button[type="submit"]');

    // Wait for schedule list links to load after login
    await page.waitForSelector("a[href^='/schedule/game-']", { timeout: 60000 });

    console.log("Schedule links loaded");

    const content = await page.content();
    const $ = cheerio.load(content);
    const gameIds = [];

    $("a[href*='/schedule/game-']").each((i, el) => {
      const href = $(el).attr("href");
      const match = href.match(/\/schedule\/game-(\d+)/);
      if (match) {
        gameIds.push(match[1]);
      }
    });

    res.json({ gameIds });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

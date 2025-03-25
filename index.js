import express from "express";
import puppeteer from "puppeteer-core";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.get("/games", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      executablePath: "/usr/bin/google-chrome",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true
    });

    const page = await browser.newPage();
    await page.goto("https://www.benchapp.com/schedule/list", {
      waitUntil: "networkidle2",
      timeout: 60000
    });

    const content = await page.content();
    await browser.close();

    const $ = cheerio.load(content);
    const gameData = [];

    let currentDate = null;

    $("div.date, td.mHide a").each((_, el) => {
      const $el = $(el);
      if ($el.hasClass("date")) {
        currentDate = $el.text().trim();
      } else {
        const href = $el.attr("href");
        const match = href && href.match(/\/schedule\/game-(\d+)/);
        if (match) {
          gameData.push({
            date: currentDate,
            gameId: match[1]
          });
        }
      }
    });

    res.json({ games: gameData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

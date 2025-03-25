import express from "express";
import * as cheerio from "cheerio";
import fetch from "node-fetch";
import puppeteer from "puppeteer-core";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


let gameData = [];

app.get("/games", (req, res) => {
  res.json({ games: gameData });
});

app.get("/game/:id", (req, res) => {
  const game = gameData.find(g => g.gameId === req.params.id);
  if (!game) return res.status(404).json({ error: "Not found" });
  res.json(game);
});

app.get("/scrape", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      executablePath: CHROME_EXECUTABLE_PATH,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto("https://www.benchapp.com/login?redirect=%2Fschedule%2Flist", { waitUntil: "networkidle2" });

    await page.type('input[name="email"]', EMAIL);
    await page.type('input[name="password"]', PASSWORD);
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: "networkidle2" })
    ]);

    const html = await page.content();
    const $ = cheerio.load(html);

    const games = [];
    let currentDate = "";

    $("div.date, td.mHide a[href*='/schedule/game-']").each((_, el) => {
      const tag = $(el);
      if (tag.hasClass("date")) {
        currentDate = tag.text().trim();
      } else {
        const href = tag.attr("href");
        const match = href.match(/\/schedule\/game-(\d+)/);
        if (match) {
          const gameId = match[1];
          games.push({ date: currentDate, gameId });
        }
      }
    });

    gameData = games;
    await browser.close();
    res.json({ gameIds: games });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`BenchApp bot listening on port ${PORT}`);
});

import express from 'express';
import puppeteer from 'puppeteer-core';
import cheerio from 'cheerio';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("BenchApp bot is running.");
});

app.get("/games", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.CHROME_EXECUTABLE_PATH || '/usr/bin/google-chrome',
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto("https://www.benchapp.com/login", { waitUntil: "networkidle2" });

    await page.type('input[name="email"]', process.env.BENCHAPP_EMAIL);
    await page.type('input[name="password"]', process.env.BENCHAPP_PASS);
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);

    await page.goto("https://www.benchapp.com/schedule/list", { waitUntil: "networkidle2" });

    const html = await page.content();
    const $ = cheerio.load(html);

    const gameData = [];

    $("div.date").each((_, dateElem) => {
      const date = $(dateElem).text().trim();
      const gameAnchor = $(dateElem).next().find("a[href*='/schedule/game-']").first();

      if (gameAnchor.length) {
        const href = gameAnchor.attr("href");
        const match = href.match(/\/schedule\/game-(\d+)/);
        if (match) {
          const gameId = match[1];
          gameData.push({ date, gameId });
        }
      }
    });

    await browser.close();
    res.json({ gameData });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/debug", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.CHROME_EXECUTABLE_PATH || '/usr/bin/google-chrome',
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto("https://www.benchapp.com/login", { waitUntil: "networkidle2" });

    await page.type('input[name="email"]', process.env.BENCHAPP_EMAIL);
    await page.type('input[name="password"]', process.env.BENCHAPP_PASS);
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);

    await page.goto("https://www.benchapp.com/schedule/list", { waitUntil: "networkidle2" });
    const html = await page.content();
    await browser.close();

    res.set("Content-Type", "text/html");
    res.send(html);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

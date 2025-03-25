import express from "express";
import fetch from "node-fetch";
import cheerio from "cheerio";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.get("/games", async (req, res) => {
  try {
    const response = await fetch("https://www.benchapp.com/schedule/list", {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const html = await response.text();
    const $ = cheerio.load(html);
    const gameData = [];

    const dates = $("div.date");

    dates.each((i, dateElem) => {
      const date = $(dateElem).text().trim();
      const anchor = $(dateElem).nextAll('a[href^="/schedule/game-"]').first();
      const href = anchor.attr("href");

      if (href) {
        const match = href.match(/\/schedule\/game-(\d+)/);
        if (match) {
          const gameId = match[1];
          gameData.push({ date, gameId });
        }
      }
    });

    console.log("Scraped game data:", gameData);
    res.json({ gameData });
  } catch (err) {
    console.error("Error scraping:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

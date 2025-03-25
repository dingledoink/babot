import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files (optional if using a frontend)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

app.get("/scrape", async (req, res) => {
  try {
    const response = await fetch("https://www.benchapp.com/schedule/list", {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    const gameData = [];
    let currentDate = null;

    $("div.date, td.mHide a").each((_, el) => {
      const tag = $(el);

      if (tag.hasClass("date")) {
        currentDate = tag.text().trim();
      } else {
        const href = tag.attr("href");
        const match = href?.match(/\/schedule\/game-(\d+)/);
        if (match && currentDate) {
          gameData.push({
            gameId: match[1],
            date: currentDate
          });
        }
      }
    });

    res.json({ gameData });
  } catch (err) {
    console.error("Error during scraping:", err);
    res.status(500).json({ error: "Scraping failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

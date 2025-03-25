import express from "express";
import axios from "axios";
import { JSDOM } from "jsdom";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

app.get("/games", async (req, res) => {
  try {
    const { data: html } = await axios.get("https://www.benchapp.com/schedule/list", {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const dom = new JSDOM(html);
    const document = dom.window.document;

    const dateElems = [...document.querySelectorAll("div.date")];
    const gameData = [];

    dateElems.forEach((dateElem) => {
      const date = dateElem.textContent.trim();
      let next = dateElem.nextElementSibling;

      while (next) {
        if (next.tagName === "A" && next.href.includes("/schedule/game-")) {
          const match = next.href.match(/\/schedule\/game-(\d+)/);
          if (match) {
            gameData.push({
              date,
              gameId: match[1]
            });
            break;
          }
        }
        next = next.nextElementSibling;
      }
    });

    console.log("Games scraped:", gameData);
    res.json({ gameData });
  } catch (err) {
    console.error("Error during scrape:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

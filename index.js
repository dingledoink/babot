// index.js
import express from "express";
import puppeteer from "puppeteer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.get("/games", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.goto("https://www.benchapp.com/schedule/list", {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    // Log in
    await page.type('input[name="email"]', process.env.BENCHAPP_EMAIL);
    await page.type('input[name="password"]', process.env.BENCHAPP_PASS);
    await Promise.all([
      page.click("button[type=submit]"),
      page.waitForNavigation({ waitUntil: "domcontentloaded" })
    ]);

    const content = await page.content();
    const gameData = [];

    const datesAndGames = await page.evaluate(() => {
      const entries = [];
      const dateEls = Array.from(document.querySelectorAll("div.date"));

      dateEls.forEach((dateEl) => {
        const dateText = dateEl.textContent.trim();
        let sibling = dateEl.nextElementSibling;

        while (sibling && !sibling.classList.contains("date")) {
          const link = sibling.querySelector("a[href*='/schedule/game-']");
          if (link) {
            const match = link.href.match(/\/schedule\/game-(\d+)/);
            if (match) {
              entries.push({ date: dateText, gameId: match[1] });
            }
          }
          sibling = sibling.nextElementSibling;
        }
      });
      return entries;
    });

    await browser.close();
    res.json({ gameData: datesAndGames });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

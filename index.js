import express from "express";
import puppeteer from "puppeteer";
import cheerio from "cheerio";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const EMAIL = process.env.BENCHAPP_EMAIL;
const PASSWORD = process.env.BENCHAPP_PASS;

app.get("/scrape", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.goto("https://www.benchapp.com/login?redirect=%2Fschedule%2Flist", {
      waitUntil: "networkidle2",
    });

    await page.type('input[name="email"]', EMAIL);
    await page.type('input[name="password"]', PASSWORD);
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);

    await page.goto("https://www.benchapp.com/schedule/list", {
      waitUntil: "networkidle2",
    });

    const content = await page.content();
    const $ = cheerio.load(content);

    const links = [];
    $("a[href*='/schedule/game-']").each((_, el) => {
      const href = $(el).attr("href");
      const match = href.match(/\/schedule\/game-(\d+)/);
      if (match) {
        links.push(match[1]);
      }
    });

    await browser.close();
    res.json({ games: links });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

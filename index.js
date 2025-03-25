import express from "express";
import puppeteer from "puppeteer-core";
import chrome from "chrome-aws-lambda";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.get("/scrape", async (req, res) => {
  let browser = null;

  try {
    console.log("🚀 Launching browser...");

    browser = await puppeteer.launch({
      args: chrome.args,
      executablePath: await chrome.executablePath,
      headless: chrome.headless,
    });

    const page = await browser.newPage();

    console.log("🌐 Navigating to login page...");
    await page.goto("https://www.benchapp.com/login?redirect=%2Fschedule%2Flist", {
      waitUntil: "networkidle2",
    });

    console.log("📝 Typing login credentials...");
    await page.type('input[name="email"]', process.env.BENCHAPP_EMAIL);
    await page.type('input[name="password"]', process.env.BENCHAPP_PASS);
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);

    console.log("✅ Logged in to BenchApp!");

    console.log("🗓 Navigating to schedule list...");
    await page.goto("https://www.benchapp.com/schedule/list", {
      waitUntil: "networkidle2",
    });

    // Save screenshot for debug
    await page.screenshot({ path: "schedule_page.png", fullPage: true });

    const content = await page.content();

    // Extract game data
    const gameData = [];
    const regex = /<div class="date">([^<]+)<\/div>[\s\S]*?<a href="\/schedule\/game-(\d+)">/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const date = match[1].trim();
      const gameId = match[2].trim();
      gameData.push({ gameId, date });
    }

    console.log(`🎯 Found ${gameData.length} games`);

    res.json({ gameData });

  } catch (error) {
    console.error("❌ Error in /scrape route:", error);
    res.status(500).json({ error: error.message });
  } finally {
    if (browser) {
      await browser.close();
      console.log("👋 Browser closed.");
    }
  }
});

app.listen(PORT, () => {
  console.log(`🔥 Server listening on port ${PORT}`);
});

import express from "express";
import puppeteer from "puppeteer-core";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("BenchApp bot is running.");
});

app.get("/games", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome"
    });

    const page = await browser.newPage();

    // Go to login page
    await page.goto("https://www.benchapp.com/login", { waitUntil: "networkidle0" });

    // Type login info
    await page.type('input[name="email"]', process.env.BENCHAPP_EMAIL, { delay: 50 });
    await page.type('input[name="password"]', process.env.BENCHAPP_PASS, { delay: 50 });

    // Click login button and wait for redirect
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: "networkidle0" })
    ]);

    // Now go to the schedule list page
    await page.goto("https://www.benchapp.com/schedule/list", { waitUntil: "networkidle0" });

    // Grab page content
    const html = await page.content();

    await browser.close();

    // Return HTML so we can debug and verify it’s the real schedule
    res.send(html);

  } catch (err) {
    console.error("ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

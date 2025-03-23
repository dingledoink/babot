import express from "express";
import puppeteer from "puppeteer";

const app = express();
const port = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("✅ Puppeteer bot is running.");
});

app.get("/scrape", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto("https://example.com");
    const title = await page.title();
    await browser.close();
    res.json({ title });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
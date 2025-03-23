import express from "express";
import puppeteer from "puppeteer";

const app = express();
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("BenchApp Bot is alive.");
});

app.get("/scrape", async (req, res) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto("https://example.com");
    const content = await page.content();
    await browser.close();
    res.send({ success: true, content });
  } catch (err) {
    if (browser) await browser.close();
    res.status(500).send({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

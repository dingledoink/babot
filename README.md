# BenchApp Bot (Lightweight Version)

This version uses `puppeteer-core` + `chrome-aws-lambda` to work better on low-resource platforms like Render's free tier.

## Render Setup

1. Upload to GitHub
2. Create a new Render Web Service:
   - Build Command: `npm install`
   - Start Command: `node index.js`
3. Set environment variables:
   - BENCHAPP_EMAIL
   - BENCHAPP_PASS
4. Deploy and test endpoint `/scrape`
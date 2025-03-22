# BenchApp Bot (Lightweight, Version-Locked)

Uses `puppeteer-core@10.4.0` and `chrome-aws-lambda@10.1.0` for Render compatibility.

## Render Setup

1. Upload to GitHub
2. In Render:
   - Build Command: `npm install`
   - Start Command: `node index.js`
3. Add env vars:
   - BENCHAPP_EMAIL
   - BENCHAPP_PASS
4. Deploy and test `/scrape`
# BenchApp Bot (Strict Chromium Check)

✅ Uses chrome-aws-lambda
✅ Verifies Chromium is available before launching browser
✅ Clean error handling for environments without Chromium

## Render Setup

1. Upload to GitHub
2. In Render:
   - Build Command: `npm install`
   - Start Command: `node index.js`
3. Add env vars:
   - BENCHAPP_EMAIL
   - BENCHAPP_PASS
4. Deploy and test `/scrape`
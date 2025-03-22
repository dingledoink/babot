# BenchApp Bot (Verbose Logging Version)

Bot to scrape BenchApp game schedule with extra logging for debugging on Render.

## Render Setup

1. Upload this repo to GitHub
2. Go to Render.com and create a new Web Service
3. Paste in your repo link and set:
   - Build Command: `npm install`
   - Start Command: `node index.js`
4. Set environment variables:
   - BENCHAPP_EMAIL
   - BENCHAPP_PASS
5. Deploy and watch the Logs tab for detailed build/runtime feedback
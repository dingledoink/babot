# BenchApp Bot

Cloud-based bot to log in, scrape the schedule, and return game info.

## Deploy on Render

1. Upload this repo to GitHub
2. Go to Render.com and create a new Web Service
3. Use the following:
   - Build Command: `npm install`
   - Start Command: `node index.js`
4. Set the environment variables:
   - BENCHAPP_EMAIL
   - BENCHAPP_PASS
5. Visit `/scrape` to fetch game data
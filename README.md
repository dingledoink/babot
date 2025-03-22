# BenchApp Bot (Railway-Ready)

✅ Uses chrome-aws-lambda
✅ Binds to PORT for Railway compatibility
✅ Includes root route for health check

## Deployment

1. Upload to GitHub
2. Deploy on Railway
3. Set:
   - Build Command: `npm install`
   - Start Command: `node index.js`
4. Add Environment Variables:
   - BENCHAPP_EMAIL
   - BENCHAPP_PASS
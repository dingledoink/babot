import express from 'express';

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('BenchApp bot is up and running!');
});

app.listen(PORT, () => {
  console.log(`>>> FINAL-STRICT BenchApp bot (Railway) starting...`);
  console.log(`>>> Server listening on port ${PORT}`);
});

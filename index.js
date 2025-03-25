import express from 'express';
import fetch from 'node-fetch';
import cheerio from 'cheerio';

const app = express();
const PORT = process.env.PORT || 8080;

const BASE_URL = 'https://www.benchapp.com/schedule/list';

app.get('/games', async (req, res) => {
  try {
    const response = await fetch(BASE_URL);
    const html = await response.text();
    const $ = cheerio.load(html);

    const games = [];
    let currentDate = '';

    $('div.date, td.mHide a[href*="/schedule/game-"]').each((i, el) => {
      if ($(el).hasClass('date')) {
        currentDate = $(el).text().trim();
      } else {
        const href = $(el).attr('href');
        const match = href.match(/\/schedule\/game-(\d+)/);
        if (match) {
          const gameId = match[1];
          const team = $(el).text().trim();
          games.push({ date: currentDate, team, gameId });
        }
      }
    });

    res.json({ gameData: games });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/game/:id', async (req, res) => {
  const gameId = req.params.id;
  const url = `https://www.benchapp.com/schedule/game-${gameId}`;

  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    const title = $('title').text().trim();
    res.json({ gameId, title });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

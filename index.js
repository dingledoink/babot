const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 8080;

const BASE_URL = 'https://www.benchapp.com/schedule/list';

// Utility to fetch and parse game data
async function fetchGameData() {
  try {
    const res = await fetch(BASE_URL);
    const html = await res.text();
    const $ = cheerio.load(html);

    const games = [];

    $('div.date').each((_, el) => {
      const date = $(el).text().trim();
      const next = $(el).nextAll('table').first();
      next.find('a[href^="/schedule/game-"]').each((_, link) => {
        const href = $(link).attr('href');
        const title = $(link).text().trim();
        const match = href.match(/game-(\d+)/);
        if (match) {
          games.push({
            gameId: match[1],
            title,
            date
          });
        }
      });
    });

    return games;
  } catch (err) {
    console.error('Fetch error:', err);
    return [];
  }
}

// Endpoint to get all games
app.get('/games', async (req, res) => {
  const data = await fetchGameData();
  res.json({ gameData: data });
});

// Endpoint to get a specific game by ID
app.get('/game/:id', async (req, res) => {
  const allGames = await fetchGameData();
  const game = allGames.find(g => g.gameId === req.params.id);
  if (game) {
    res.json({ game });
  } else {
    res.status(404).json({ error: 'Game not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

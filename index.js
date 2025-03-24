// ... all your imports and existing code remain above

// Move run() into a callable function for the route
async function scrapeBenchApp(req, res) {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/google-chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto('https://www.benchapp.com/login', { waitUntil: 'networkidle2' });

    await page.type('input[name="email"]', email);
    await page.type('input[name="password"]', password);
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]);

    await page.goto('https://www.benchapp.com/schedule/list', { waitUntil: 'networkidle2' });

    const content = await page.content();
    const $ = cheerio.load(content);
    const events = [];

    $('a[href^="/schedule/game-"]').each((i, el) => {
      const href = $(el).attr('href');
      if (href) {
        const match = href.match(/\\/schedule\\/game-(\\d+)/);
        if (match) {
          events.push(match[1]);
        }
      }
    });

    await browser.close();
    res.json({ success: true, games: events });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
}

const app = express();

app.get('/', (req, res) => res.send('Bot running. Nothing to see here.'));
app.get('/scrape', scrapeBenchApp);

app.listen(process.env.PORT || 8080);

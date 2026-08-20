const Parser = require('rss-parser');
const parser = new Parser();

const testUrls = [
  'https://www.dexerto.com/feed/',
  'https://esports.gg/feed/',
  'https://www.esports.net/news/counter-strike/feed/',
  'https://www.gosugamers.net/counterstrike/rss',
  'https://egw.news/rss',
  'https://theclutch.com.br/feed/',
  'https://ge.globo.com/rss/esports/cs/',
  'https://www.adrenaline.com.br/feed/',
  'https://flowgames.gg/feed/',
  'https://gamearena.gg/feed/',
  'https://fraglider.pt/feed/',
  'https://www.dust2.in/rss',
  'https://esportsinsider.com/feed',
  'https://www.fragster.com/feed/',
  'https://win.gg/feed/',
  'https://estnn.com/feed/',
  'https://cybersport.pl/tag/cs2/feed/',
  'https://www.vakarm.net/rss',
  'https://www.1pv.fr/rss',
  'https://store.steampowered.com/feeds/news/app/730/'
];

async function checkFeeds() {
  for (const url of testUrls) {
    try {
      await parser.parseURL(url);
      console.log(`[OK] ${url}`);
    } catch (e) {
      console.log(`[FAIL] ${url} - ${e.message}`);
    }
  }
}

checkFeeds();

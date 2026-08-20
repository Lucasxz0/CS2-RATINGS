const Parser = require('rss-parser');
const parser = new Parser();

async function testRSS() {
  try {
    const feed = await parser.parseURL('https://www.hltv.org/rss/news');
    console.log(feed.items.slice(0, 5).map(item => item.title));
  } catch (e) {
    console.error('RSS Error:', e);
  }
}
testRSS();

const Parser = require('rss-parser');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Faltam variáveis de ambiente do Supabase!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['content:encoded', 'contentEncoded']
    ]
  }
});

const FEEDS = [
  { url: 'https://www.dust2.com.br/rss', source: 'dust2br' },
  { url: 'https://www.hltv.org/rss/news', source: 'hltv' },
  { url: 'https://www.dust2.us/rss', source: 'dust2us' }
];

// Extrai imagem do HTML ou Content se o feed não enviar uma thumb clara
function extractImage(item) {
  if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) {
    return item.mediaContent.$.url;
  }
  const content = item.contentEncoded || item.content || item.description || '';
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  return imgMatch ? imgMatch[1] : null;
}

function cleanDescription(desc) {
  if (!desc) return '';
  // Remove HTML tags
  let text = desc.replace(/<[^>]*>?/gm, '');
  // Decodifica html entities basico
  text = text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"');
  return text.trim().substring(0, 150) + (text.length > 150 ? '...' : '');
}

async function run() {
  console.log('Iniciando captura de notícias...');
  let totalInserted = 0;

  for (const feed of FEEDS) {
    console.log(`Lendo: ${feed.source}`);
    try {
      const feedData = await parser.parseURL(feed.url);
      
      const inserts = feedData.items.map(item => ({
        guid: item.guid || item.id || item.link,
        title: item.title,
        summary: cleanDescription(item.contentSnippet || item.description),
        link: item.link,
        image_url: extractImage(item),
        source: feed.source,
        published_at: new Date(item.pubDate || item.isoDate).toISOString()
      }));

      // Inserir ignorando duplicatas (o guid é UNIQUE no banco)
      const { data, error } = await supabase
        .from('news_feed')
        .upsert(inserts, { onConflict: 'guid', ignoreDuplicates: true });

      if (error) {
        console.error(`Erro ao salvar no supabase (${feed.source}):`, error);
      } else {
        console.log(`Finalizado ${feed.source}.`);
      }
    } catch (e) {
      console.error(`Falha ao ler feed ${feed.source}:`, e.message);
    }
  }
  console.log('Rotina concluída.');
}

run();

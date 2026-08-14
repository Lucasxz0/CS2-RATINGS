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

// Fontes validadas que possuem feed RSS funcional
const FEEDS = [
  // 🥇 Essenciais
  { url: 'https://www.hltv.org/rss/news', source: 'hltv', lang: 'en', requireCSFilter: false },
  { url: 'https://www.dust2.com.br/rss', source: 'dust2br', lang: 'pt', requireCSFilter: false },
  { url: 'https://www.dust2.us/rss', source: 'dust2us', lang: 'en', requireCSFilter: false },
  { url: 'https://www.dexerto.com/counter-strike-2/feed/', source: 'dexerto', lang: 'en', requireCSFilter: false },
  
  // 🇧🇷 Brasil
  { url: 'https://www.adrenaline.com.br/feed/', source: 'adrenaline', lang: 'pt', requireCSFilter: true },
  { url: 'https://flowgames.gg/feed/', source: 'flowgames', lang: 'pt', requireCSFilter: true },
  
  // 🌎 Outras fontes internacionais
  { url: 'https://www.dust2.in/rss', source: 'dust2in', lang: 'en', requireCSFilter: false },
  { url: 'https://esportsinsider.com/feed', source: 'esportsinsider', lang: 'en', requireCSFilter: true },
  { url: 'https://win.gg/feed/', source: 'wingg', lang: 'en', requireCSFilter: true },
  { url: 'https://cybersport.pl/tag/cs2/feed/', source: 'cybersportpl', lang: 'pl', requireCSFilter: false },
];

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
  let text = desc.replace(/<[^>]*>?/gm, '');
  text = text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"');
  return text.trim().substring(0, 150) + (text.length > 150 ? '...' : '');
}

async function fetchOgImage(url) {
  try {
    // Timeout para não travar a rotina
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    const html = await res.text();
    const match = html.match(/<meta\s+(?:property|name)=['"]og:image['"]\s+content=['"]([^'"]+)['"]/i);
    return match ? match[1] : null;
  } catch (e) {
    return null;
  }
}

// Verifica se a notícia é realmente de CS2/CSGO
function isCSNews(title, summary) {
  const text = (title + ' ' + summary).toLowerCase();
  const keywords = ['cs2', 'cs:go', 'counter-strike', 'counter strike', 'valve', 's1mple', 'esl', 'major', 'fallen', 'iem', 'blast', 'pgl'];
  return keywords.some(kw => text.includes(kw));
}

async function processFeed(feed, translate) {
  console.log(`Lendo: ${feed.source}`);
  try {
    const feedData = await parser.parseURL(feed.url);
    const inserts = [];

    for (const item of feedData.items) {
      let title = item.title || '';
      let summary = cleanDescription(item.contentSnippet || item.description);

      // Filtro de relevância para sites gerais
      if (feed.requireCSFilter && !isCSNews(title, summary)) {
        continue; // Pula notícia se não for de CS
      }

      let imageUrl = extractImage(item);
      if (!imageUrl && item.link) {
        imageUrl = await fetchOgImage(item.link);
      }

      // Traduz se não for em português
      if (feed.lang !== 'pt' && translate) {
        try {
          title = (await translate(title, { to: 'pt' })).text;
          if (summary) {
            summary = (await translate(summary, { to: 'pt' })).text;
          }
        } catch (err) {
          console.error(`Erro ao traduzir notícia (${feed.source}): ${title}`, err.message);
        }
      }

      inserts.push({
        guid: item.guid || item.id || item.link,
        title: title,
        summary: summary,
        link: item.link,
        image_url: imageUrl,
        source: feed.source,
        published_at: new Date(item.pubDate || item.isoDate || Date.now()).toISOString()
      });
    }

    if (inserts.length > 0) {
      const { error } = await supabase
        .from('news_feed')
        .upsert(inserts, { onConflict: 'guid', ignoreDuplicates: true });

      if (error) {
        throw new Error(`Erro no Supabase: ${error.message}`);
      }
      console.log(`[OK] Finalizado ${feed.source} - ${inserts.length} itens.`);
    } else {
      console.log(`[OK] Finalizado ${feed.source} - Nenhum item novo ou de CS.`);
    }
  } catch (e) {
    console.error(`[FALHA] Feed ${feed.source}:`, e.message);
  }
}

async function run() {
  console.log('Iniciando captura de notícias...');

  let translate;
  try {
    const m = await import('@vitalets/google-translate-api');
    translate = m.translate;
  } catch (e) {
    console.error('Aviso: Falha ao carregar google-translate-api. Seguindo sem tradução.', e.message);
  }

  // Executa o processamento de todos os feeds concorrentemente
  await Promise.allSettled(FEEDS.map(feed => processFeed(feed, translate)));

  console.log('Rotina concluída.');
}

run();

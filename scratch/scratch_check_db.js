const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://pdyqoajbdyjiktnkxqqi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_0c5ydPhGf8lGIXTjrGiidQ_Jrp1WW_O';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const { data, error } = await supabase
    .from('pro_matches')
    .select('name, status, team1_score, team2_score, match_time, match_id')
    .order('match_time', { ascending: true })
    .limit(10);
    
  if (error) {
    console.error('Error fetching matches:', error);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

test();

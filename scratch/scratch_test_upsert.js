const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://pdyqoajbdyjiktnkxqqi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_0c5ydPhGf8lGIXTjrGiidQ_Jrp1WW_O';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const { data, error } = await supabase
    .from('pro_matches')
    .upsert([
      {
        match_id: 1624324,
        name: "Upper bracket semifinal 2: FURIA vs 9z",
        tournament_name: "Test",
        team1_score: 2,
        team2_score: 1,
        match_time: "2026-08-15T14:20:00+00:00",
        status: "finished"
      }
    ], { onConflict: 'match_id', ignoreDuplicates: false });
    
  console.log("Upsert result:", error ? error : "Success");
}
test();

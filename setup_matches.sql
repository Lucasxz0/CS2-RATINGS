-- Criação da tabela de partidas profissionais
CREATE TABLE IF NOT EXISTS public.pro_matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id INTEGER UNIQUE NOT NULL, -- ID original da PandaScore
    name TEXT NOT NULL, -- Ex: "FaZe vs NAVI"
    tournament_name TEXT NOT NULL, -- Ex: "IEM Cologne 2026"
    team1_name TEXT,
    team1_logo TEXT,
    team2_name TEXT,
    team2_logo TEXT,
    team1_score INTEGER DEFAULT 0,
    team2_score INTEGER DEFAULT 0,
    match_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL, -- "not_started", "running", "finished", "canceled"
    stream_url TEXT, -- Link da Twitch
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar segurança a nível de linha (RLS)
ALTER TABLE public.pro_matches ENABLE ROW LEVEL SECURITY;

-- Política de leitura: Todo mundo pode ler
CREATE POLICY "Matches are viewable by everyone" ON public.pro_matches
    FOR SELECT USING (true);

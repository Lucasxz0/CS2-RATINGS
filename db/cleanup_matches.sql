-- =====================================================
-- LIMPEZA EMERGENCIAL DA TABELA pro_matches
-- =====================================================
-- Execute este SQL no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/pdyqoajbdyjiktnkxqqi/editor
--
-- Por que limpar? Os dados atuais foram inseridos quando:
--   1. O endpoint era /csgo/ (errado → dados desatualizados)
--   2. O PANDASCORE_TOKEN não estava configurado (nada foi atualizado)
--
-- Após limpar, rode o workflow "Fetch Matches (CS2)" manualmente
-- no GitHub Actions para repopular com dados corretos.
-- =====================================================

-- Apaga todos os dados inválidos da tabela
TRUNCATE TABLE public.pro_matches;

-- Verificar se limpou (deve retornar 0 rows)
SELECT count(*) FROM public.pro_matches;

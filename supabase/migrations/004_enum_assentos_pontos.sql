-- ============================================================
-- PASSAGEM — Migration 004: Correcoes e melhorias
--
-- 1. Alterar enum tipo_embarcacao (adicionar barco, navio)
-- 2. Mover controle_assentos de embarcacoes para capacidade_acomodacao
-- 3. Backfill pontos_parada para itinerarios sem pontos
-- ============================================================

-- ========================
-- PARTE 1: Alterar enum tipo_embarcacao
-- PostgreSQL nao permite remover valores de enum, entao "catamara" fica
-- mas nao sera exibido na UI.
-- ========================

ALTER TYPE public.tipo_embarcacao ADD VALUE IF NOT EXISTS 'barco';
ALTER TYPE public.tipo_embarcacao ADD VALUE IF NOT EXISTS 'navio';

-- ========================
-- PARTE 2: Mover controle_assentos para capacidade_acomodacao
-- ========================

ALTER TABLE public.capacidade_acomodacao
  ADD COLUMN IF NOT EXISTS controle_assentos BOOLEAN NOT NULL DEFAULT false;

-- Migrar dados existentes: copiar flag da embarcacao para todas suas acomodacoes
UPDATE public.capacidade_acomodacao ca
SET controle_assentos = true
FROM public.embarcacoes e
WHERE ca.embarcacao_id = e.id AND e.controle_assentos = true;

-- ========================
-- PARTE 3: Backfill pontos_parada para itinerarios existentes
-- Itinerarios criados antes do auto-create podem nao ter pontos.
-- ========================

-- Inserir ponto de origem (ordem 1) apenas para itinerarios SEM nenhum ponto
INSERT INTO public.pontos_parada (itinerario_id, nome_local, ordem, duracao_parada_min)
SELECT i.id, i.origem, 1, 0
FROM public.itinerarios i
WHERE i.origem IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.pontos_parada pp
    WHERE pp.itinerario_id = i.id
  );

-- Inserir ponto de destino (proxima ordem disponivel) se nao existir
INSERT INTO public.pontos_parada (itinerario_id, nome_local, ordem, duracao_parada_min)
SELECT i.id, i.destino,
  COALESCE(
    (SELECT MAX(ordem) FROM public.pontos_parada pp WHERE pp.itinerario_id = i.id), 0
  ) + 1,
  0
FROM public.itinerarios i
WHERE i.destino IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.pontos_parada pp
    WHERE pp.itinerario_id = i.id AND pp.nome_local = i.destino
  );

-- ========================
-- PARTE 4: Refresh PostgREST schema cache
-- ========================

NOTIFY pgrst, 'reload schema';

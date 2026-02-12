-- ============================================================
-- PASSAGEM — Migration 003: Consolidar tudo no schema public
--
-- Problemas resolvidos:
--   1. Tabelas vendas.* e financeiro.* inacessiveis via PostgREST (default=public)
--   2. Migration 002 nunca foi aplicada (agencias, setores, capacidade faltando)
--   3. Novas features: itinerarios (origem/destino), embarcacoes (assentos)
--
-- Abordagem: mover tabelas existentes + criar faltantes no schema public
-- ============================================================

-- ========================
-- PARTE 1: Mover tabelas de vendas para public
-- ALTER TABLE SET SCHEMA preserva triggers, indexes, policies e FKs
-- ========================

ALTER TABLE vendas.passagens SET SCHEMA public;
ALTER TABLE vendas.encomendas SET SCHEMA public;
ALTER TABLE vendas.comissoes SET SCHEMA public;

-- ========================
-- PARTE 2: Mover tabelas de financeiro para public
-- ========================

ALTER TABLE financeiro.despesas_viagem SET SCHEMA public;
ALTER TABLE financeiro.fechamento_caixa SET SCHEMA public;
ALTER TABLE financeiro.logs_auditoria SET SCHEMA public;

-- ========================
-- PARTE 3: Criar tabelas faltantes (migration 002 nunca rodou)
-- ========================

-- agencias
CREATE TABLE IF NOT EXISTS public.agencias (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome                TEXT NOT NULL,
  cnpj_cpf            TEXT,
  percentual_comissao NUMERIC(5,2) NOT NULL DEFAULT 0
    CHECK (percentual_comissao >= 0 AND percentual_comissao <= 100),
  ativa               BOOLEAN NOT NULL DEFAULT true,
  contato             TEXT,
  endereco            TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by          UUID REFERENCES auth.users(id)
);

-- setores_embarcacao
CREATE TABLE IF NOT EXISTS public.setores_embarcacao (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  embarcacao_id UUID NOT NULL REFERENCES public.embarcacoes(id) ON DELETE CASCADE,
  nome          TEXT NOT NULL,
  descricao     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- capacidade_acomodacao
CREATE TABLE IF NOT EXISTS public.capacidade_acomodacao (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  embarcacao_id      UUID NOT NULL REFERENCES public.embarcacoes(id) ON DELETE CASCADE,
  tipo_acomodacao_id UUID NOT NULL REFERENCES public.tipos_acomodacao(id) ON DELETE CASCADE,
  quantidade         INTEGER NOT NULL CHECK (quantidade >= 0),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(embarcacao_id, tipo_acomodacao_id)
);

-- transacoes (era financeiro.transacoes, agora em public)
CREATE TABLE IF NOT EXISTS public.transacoes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo             TEXT NOT NULL CHECK (tipo IN ('passagem', 'frete', 'despesa')),
  referencia_id    UUID,
  valor            NUMERIC(12,2) NOT NULL CHECK (valor >= 0),
  metodo_pagamento TEXT NOT NULL CHECK (metodo_pagamento IN ('pix', 'cartao', 'dinheiro')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by       UUID REFERENCES auth.users(id)
);

-- ========================
-- PARTE 4: Adicionar colunas faltantes em tabelas existentes
-- ========================

-- profiles.agencia_id (vinculo com agencia de venda)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS agencia_id UUID REFERENCES public.agencias(id);

-- passagens.data_nascimento (ja em public apos mover)
ALTER TABLE public.passagens
  ADD COLUMN IF NOT EXISTS data_nascimento DATE;

-- encomendas.setor_id (ja em public apos mover)
ALTER TABLE public.encomendas
  ADD COLUMN IF NOT EXISTS setor_id UUID REFERENCES public.setores_embarcacao(id);

-- ========================
-- PARTE 5: Novas colunas para features
-- ========================

-- Itinerarios: campos origem e destino
ALTER TABLE public.itinerarios
  ADD COLUMN IF NOT EXISTS origem TEXT;
ALTER TABLE public.itinerarios
  ADD COLUMN IF NOT EXISTS destino TEXT;

-- Embarcacoes: controle de assentos
ALTER TABLE public.embarcacoes
  ADD COLUMN IF NOT EXISTS controle_assentos BOOLEAN NOT NULL DEFAULT false;

-- Tabela de assentos individuais
CREATE TABLE IF NOT EXISTS public.assentos (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  embarcacao_id      UUID NOT NULL REFERENCES public.embarcacoes(id) ON DELETE CASCADE,
  tipo_acomodacao_id UUID NOT NULL REFERENCES public.tipos_acomodacao(id) ON DELETE CASCADE,
  numero             TEXT NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(embarcacao_id, tipo_acomodacao_id, numero)
);

-- ========================
-- PARTE 6: RLS + Policies para novas tabelas
-- ========================

ALTER TABLE public.agencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setores_embarcacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capacidade_acomodacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assentos ENABLE ROW LEVEL SECURITY;

-- agencias
CREATE POLICY "agencias_select" ON public.agencias
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "agencias_insert" ON public.agencias
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_owner());
CREATE POLICY "agencias_update" ON public.agencias
  FOR UPDATE TO authenticated USING (public.is_admin_or_owner());

-- setores_embarcacao
CREATE POLICY "setores_select" ON public.setores_embarcacao
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "setores_insert" ON public.setores_embarcacao
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_owner());
CREATE POLICY "setores_update" ON public.setores_embarcacao
  FOR UPDATE TO authenticated USING (public.is_admin_or_owner());
CREATE POLICY "setores_delete" ON public.setores_embarcacao
  FOR DELETE TO authenticated USING (public.is_admin_or_owner());

-- capacidade_acomodacao
CREATE POLICY "capacidade_select" ON public.capacidade_acomodacao
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "capacidade_insert" ON public.capacidade_acomodacao
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_owner());
CREATE POLICY "capacidade_update" ON public.capacidade_acomodacao
  FOR UPDATE TO authenticated USING (public.is_admin_or_owner());
CREATE POLICY "capacidade_delete" ON public.capacidade_acomodacao
  FOR DELETE TO authenticated USING (public.is_admin_or_owner());

-- transacoes
CREATE POLICY "transacoes_select" ON public.transacoes
  FOR SELECT TO authenticated USING (public.is_admin_or_owner());
CREATE POLICY "transacoes_insert" ON public.transacoes
  FOR INSERT TO authenticated WITH CHECK (true);

-- assentos
CREATE POLICY "assentos_select" ON public.assentos
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "assentos_insert" ON public.assentos
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_owner());
CREATE POLICY "assentos_update" ON public.assentos
  FOR UPDATE TO authenticated USING (public.is_admin_or_owner());
CREATE POLICY "assentos_delete" ON public.assentos
  FOR DELETE TO authenticated USING (public.is_admin_or_owner());

-- ========================
-- PARTE 7: Indexes
-- ========================

CREATE INDEX IF NOT EXISTS idx_agencias_ativa ON public.agencias(ativa);
CREATE INDEX IF NOT EXISTS idx_setores_embarcacao ON public.setores_embarcacao(embarcacao_id);
CREATE INDEX IF NOT EXISTS idx_capacidade_embarcacao ON public.capacidade_acomodacao(embarcacao_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_tipo ON public.transacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_transacoes_referencia ON public.transacoes(referencia_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_created ON public.transacoes(created_at);
CREATE INDEX IF NOT EXISTS idx_assentos_embarcacao ON public.assentos(embarcacao_id);

-- ========================
-- PARTE 8: Triggers para novas tabelas
-- ========================

CREATE TRIGGER set_audit_fields BEFORE INSERT OR UPDATE ON public.agencias
  FOR EACH ROW EXECUTE FUNCTION public.set_audit_fields();

CREATE TRIGGER set_audit_fields BEFORE INSERT ON public.transacoes
  FOR EACH ROW EXECUTE FUNCTION public.set_audit_fields();

-- ========================
-- PARTE 9: Refresh PostgREST schema cache
-- ========================

NOTIFY pgrst, 'reload schema';

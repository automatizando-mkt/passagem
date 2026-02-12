-- ============================================================
-- PASSAGEM — Migration 002: agencias, setores, capacidade, transacoes
-- Novas tabelas + colunas adicionais em tabelas existentes
-- ============================================================

-- ========================
-- TABELA: agencias (parceiros de venda)
-- ========================
CREATE TABLE public.agencias (
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

ALTER TABLE public.agencias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agencias_select" ON public.agencias
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "agencias_insert" ON public.agencias
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_owner());
CREATE POLICY "agencias_update" ON public.agencias
  FOR UPDATE TO authenticated USING (public.is_admin_or_owner());

CREATE TRIGGER set_audit_fields BEFORE INSERT OR UPDATE ON public.agencias
  FOR EACH ROW EXECUTE FUNCTION public.set_audit_fields();

CREATE INDEX idx_agencias_ativa ON public.agencias(ativa);

-- ========================
-- TABELA: setores_embarcacao (zonas de carga)
-- ========================
CREATE TABLE public.setores_embarcacao (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  embarcacao_id UUID NOT NULL REFERENCES public.embarcacoes(id) ON DELETE CASCADE,
  nome          TEXT NOT NULL,
  descricao     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.setores_embarcacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "setores_embarcacao_select" ON public.setores_embarcacao
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "setores_embarcacao_insert" ON public.setores_embarcacao
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_owner());
CREATE POLICY "setores_embarcacao_update" ON public.setores_embarcacao
  FOR UPDATE TO authenticated USING (public.is_admin_or_owner());
CREATE POLICY "setores_embarcacao_delete" ON public.setores_embarcacao
  FOR DELETE TO authenticated USING (public.is_admin_or_owner());

CREATE INDEX idx_setores_embarcacao ON public.setores_embarcacao(embarcacao_id);

-- ========================
-- TABELA: capacidade_acomodacao (lotacao por tipo de acomodacao por embarcacao)
-- ========================
CREATE TABLE public.capacidade_acomodacao (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  embarcacao_id      UUID NOT NULL REFERENCES public.embarcacoes(id) ON DELETE CASCADE,
  tipo_acomodacao_id UUID NOT NULL REFERENCES public.tipos_acomodacao(id) ON DELETE CASCADE,
  quantidade         INTEGER NOT NULL CHECK (quantidade >= 0),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(embarcacao_id, tipo_acomodacao_id)
);

ALTER TABLE public.capacidade_acomodacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "capacidade_acomodacao_select" ON public.capacidade_acomodacao
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "capacidade_acomodacao_insert" ON public.capacidade_acomodacao
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_owner());
CREATE POLICY "capacidade_acomodacao_update" ON public.capacidade_acomodacao
  FOR UPDATE TO authenticated USING (public.is_admin_or_owner());
CREATE POLICY "capacidade_acomodacao_delete" ON public.capacidade_acomodacao
  FOR DELETE TO authenticated USING (public.is_admin_or_owner());

CREATE INDEX idx_capacidade_acomodacao_embarcacao ON public.capacidade_acomodacao(embarcacao_id);

-- ========================
-- ENUMS financeiros
-- ========================
CREATE TYPE financeiro.metodo_pagamento AS ENUM ('pix', 'cartao', 'dinheiro');
CREATE TYPE financeiro.tipo_transacao AS ENUM ('passagem', 'frete', 'despesa');

-- ========================
-- TABELA: transacoes (movimentos financeiros)
-- ========================
CREATE TABLE financeiro.transacoes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo             financeiro.tipo_transacao NOT NULL,
  referencia_id    UUID,
  valor            NUMERIC(12,2) NOT NULL CHECK (valor >= 0),
  metodo_pagamento financeiro.metodo_pagamento NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by       UUID REFERENCES auth.users(id)
);

ALTER TABLE financeiro.transacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transacoes_select" ON financeiro.transacoes
  FOR SELECT TO authenticated USING (public.is_admin_or_owner());
CREATE POLICY "transacoes_insert" ON financeiro.transacoes
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE TRIGGER set_audit_fields BEFORE INSERT ON financeiro.transacoes
  FOR EACH ROW EXECUTE FUNCTION public.set_audit_fields();

CREATE INDEX idx_transacoes_tipo ON financeiro.transacoes(tipo);
CREATE INDEX idx_transacoes_referencia ON financeiro.transacoes(referencia_id);
CREATE INDEX idx_transacoes_created ON financeiro.transacoes(created_at);

-- ========================
-- ALTERACOES em tabelas existentes
-- ========================

-- profiles: vincular a agencia (opcional)
ALTER TABLE public.profiles ADD COLUMN agencia_id UUID REFERENCES public.agencias(id);

-- passagens: data de nascimento do passageiro
ALTER TABLE vendas.passagens ADD COLUMN data_nascimento DATE;

-- encomendas: setor de carga na embarcacao
ALTER TABLE vendas.encomendas ADD COLUMN setor_id UUID REFERENCES public.setores_embarcacao(id);

-- ========================
-- Grants para schemas (garantir acesso via PostgREST)
-- ========================
GRANT ALL ON ALL TABLES IN SCHEMA financeiro TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA financeiro TO anon, authenticated;

-- Notify PostgREST to refresh schema cache
NOTIFY pgrst, 'reload schema';

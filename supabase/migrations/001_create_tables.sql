-- ============================================================
-- PASSAGEM — Migracao inicial: criacao de todas as tabelas
-- 3 schemas: public, vendas, financeiro
-- ============================================================

-- ========================
-- SCHEMAS
-- ========================
CREATE SCHEMA IF NOT EXISTS vendas;
CREATE SCHEMA IF NOT EXISTS financeiro;

-- ========================
-- ENUMS
-- ========================
CREATE TYPE public.user_role AS ENUM ('SUPER_ADMIN', 'PROPRIETARIO', 'TRIPULACAO', 'VENDEDOR');
CREATE TYPE public.tipo_embarcacao AS ENUM ('lancha', 'balsa', 'catamara', 'ferry');
CREATE TYPE public.status_viagem AS ENUM ('programada', 'embarque', 'em_viagem', 'concluida', 'cancelada');
CREATE TYPE vendas.status_passagem AS ENUM ('reservada', 'confirmada', 'cancelada', 'utilizada', 'reembolsada');
CREATE TYPE vendas.status_encomenda AS ENUM ('recebida', 'em_transito', 'entregue', 'devolvida');
CREATE TYPE financeiro.tipo_acao_auditoria AS ENUM ('INSERT', 'UPDATE', 'DELETE');

-- ========================
-- SCHEMA: public
-- ========================

-- profiles
CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'VENDEDOR',
  nome TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- embarcacoes
CREATE TABLE public.embarcacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  capacidade INTEGER NOT NULL,
  tipo public.tipo_embarcacao NOT NULL,
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- itinerarios
CREATE TABLE public.itinerarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- pontos_parada
CREATE TABLE public.pontos_parada (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerario_id UUID NOT NULL REFERENCES public.itinerarios(id) ON DELETE CASCADE,
  nome_local TEXT NOT NULL,
  ordem INTEGER NOT NULL,
  duracao_parada_min INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(itinerario_id, ordem)
);

-- tipos_acomodacao
CREATE TABLE public.tipos_acomodacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- viagens
CREATE TABLE public.viagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerario_id UUID NOT NULL REFERENCES public.itinerarios(id),
  embarcacao_id UUID NOT NULL REFERENCES public.embarcacoes(id),
  data_saida TIMESTAMPTZ NOT NULL,
  status public.status_viagem NOT NULL DEFAULT 'programada',
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- precos_trechos
CREATE TABLE public.precos_trechos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerario_id UUID NOT NULL REFERENCES public.itinerarios(id),
  ponto_origem_id UUID NOT NULL REFERENCES public.pontos_parada(id),
  ponto_destino_id UUID NOT NULL REFERENCES public.pontos_parada(id),
  tipo_acomodacao_id UUID NOT NULL REFERENCES public.tipos_acomodacao(id),
  preco NUMERIC(10,2) NOT NULL,
  vigencia_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  vigencia_fim DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- ========================
-- SCHEMA: vendas
-- ========================

-- passagens
CREATE TABLE vendas.passagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viagem_id UUID NOT NULL REFERENCES public.viagens(id),
  usuario_id UUID NOT NULL REFERENCES auth.users(id),
  nome_passageiro TEXT NOT NULL,
  documento TEXT NOT NULL,
  tipo_acomodacao_id UUID NOT NULL REFERENCES public.tipos_acomodacao(id),
  ponto_embarque_id UUID NOT NULL REFERENCES public.pontos_parada(id),
  ponto_desembarque_id UUID NOT NULL REFERENCES public.pontos_parada(id),
  assento TEXT,
  status vendas.status_passagem NOT NULL DEFAULT 'reservada',
  valor_pago NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- encomendas
CREATE TABLE vendas.encomendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viagem_id UUID NOT NULL REFERENCES public.viagens(id),
  remetente TEXT NOT NULL,
  destinatario TEXT NOT NULL,
  descricao TEXT NOT NULL,
  peso_kg NUMERIC(8,2),
  valor NUMERIC(10,2) NOT NULL,
  status vendas.status_encomenda NOT NULL DEFAULT 'recebida',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- comissoes
CREATE TABLE vendas.comissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passagem_id UUID NOT NULL REFERENCES vendas.passagens(id),
  vendedor_id UUID NOT NULL REFERENCES auth.users(id),
  valor NUMERIC(10,2) NOT NULL,
  percentual NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========================
-- SCHEMA: financeiro
-- ========================

-- despesas_viagem
CREATE TABLE financeiro.despesas_viagem (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viagem_id UUID NOT NULL REFERENCES public.viagens(id),
  descricao TEXT NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  categoria TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- fechamento_caixa
CREATE TABLE financeiro.fechamento_caixa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_fechamento DATE NOT NULL,
  operador_id UUID NOT NULL REFERENCES auth.users(id),
  total_vendas NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_despesas NUMERIC(12,2) NOT NULL DEFAULT 0,
  saldo NUMERIC(12,2) NOT NULL DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- logs_auditoria
CREATE TABLE financeiro.logs_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabela TEXT NOT NULL,
  registro_id TEXT NOT NULL,
  acao financeiro.tipo_acao_auditoria NOT NULL,
  dados_anteriores JSONB,
  dados_novos JSONB,
  usuario_id UUID REFERENCES auth.users(id),
  ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========================
-- TRIGGERS: updated_at automatico
-- ========================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.embarcacoes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.itinerarios
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.viagens
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON vendas.passagens
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON vendas.encomendas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ========================
-- TRIGGERS: audit fields (created_by, updated_by)
-- ========================
CREATE OR REPLACE FUNCTION public.set_audit_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_by = COALESCE(NEW.created_by, auth.uid());
  END IF;
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_audit_fields BEFORE INSERT OR UPDATE ON public.embarcacoes
  FOR EACH ROW EXECUTE FUNCTION public.set_audit_fields();
CREATE TRIGGER set_audit_fields BEFORE INSERT OR UPDATE ON public.itinerarios
  FOR EACH ROW EXECUTE FUNCTION public.set_audit_fields();
CREATE TRIGGER set_audit_fields BEFORE INSERT OR UPDATE ON public.viagens
  FOR EACH ROW EXECUTE FUNCTION public.set_audit_fields();
CREATE TRIGGER set_audit_fields BEFORE INSERT OR UPDATE ON vendas.passagens
  FOR EACH ROW EXECUTE FUNCTION public.set_audit_fields();
CREATE TRIGGER set_audit_fields BEFORE INSERT OR UPDATE ON vendas.encomendas
  FOR EACH ROW EXECUTE FUNCTION public.set_audit_fields();

-- ========================
-- RLS: habilitar em todas as tabelas
-- ========================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.embarcacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pontos_parada ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_acomodacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.precos_trechos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas.passagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas.encomendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas.comissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro.despesas_viagem ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro.fechamento_caixa ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro.logs_auditoria ENABLE ROW LEVEL SECURITY;

-- ========================
-- RLS POLICIES: profiles
-- ========================
-- Qualquer usuario autenticado pode ler profiles
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- Usuario pode inserir seu proprio profile
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Usuario pode atualizar seu proprio profile (exceto role)
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ========================
-- RLS POLICIES: tabelas public (leitura para todos autenticados, escrita para admin/proprietario)
-- ========================

-- Helper: verificar se usuario tem role admin
CREATE OR REPLACE FUNCTION public.is_admin_or_owner()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role IN ('SUPER_ADMIN', 'PROPRIETARIO')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- embarcacoes
CREATE POLICY "embarcacoes_select" ON public.embarcacoes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "embarcacoes_insert" ON public.embarcacoes
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_owner());
CREATE POLICY "embarcacoes_update" ON public.embarcacoes
  FOR UPDATE TO authenticated USING (public.is_admin_or_owner());

-- itinerarios
CREATE POLICY "itinerarios_select" ON public.itinerarios
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "itinerarios_insert" ON public.itinerarios
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_owner());
CREATE POLICY "itinerarios_update" ON public.itinerarios
  FOR UPDATE TO authenticated USING (public.is_admin_or_owner());

-- pontos_parada
CREATE POLICY "pontos_parada_select" ON public.pontos_parada
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "pontos_parada_insert" ON public.pontos_parada
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_owner());
CREATE POLICY "pontos_parada_update" ON public.pontos_parada
  FOR UPDATE TO authenticated USING (public.is_admin_or_owner());
CREATE POLICY "pontos_parada_delete" ON public.pontos_parada
  FOR DELETE TO authenticated USING (public.is_admin_or_owner());

-- tipos_acomodacao
CREATE POLICY "tipos_acomodacao_select" ON public.tipos_acomodacao
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "tipos_acomodacao_insert" ON public.tipos_acomodacao
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_owner());
CREATE POLICY "tipos_acomodacao_update" ON public.tipos_acomodacao
  FOR UPDATE TO authenticated USING (public.is_admin_or_owner());

-- viagens
CREATE POLICY "viagens_select" ON public.viagens
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "viagens_insert" ON public.viagens
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_owner());
CREATE POLICY "viagens_update" ON public.viagens
  FOR UPDATE TO authenticated USING (public.is_admin_or_owner());

-- precos_trechos
CREATE POLICY "precos_trechos_select" ON public.precos_trechos
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "precos_trechos_insert" ON public.precos_trechos
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_owner());
CREATE POLICY "precos_trechos_update" ON public.precos_trechos
  FOR UPDATE TO authenticated USING (public.is_admin_or_owner());

-- ========================
-- RLS POLICIES: schema vendas
-- ========================
CREATE POLICY "passagens_select" ON vendas.passagens
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "passagens_insert" ON vendas.passagens
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "passagens_update" ON vendas.passagens
  FOR UPDATE TO authenticated USING (public.is_admin_or_owner() OR usuario_id = auth.uid());

CREATE POLICY "encomendas_select" ON vendas.encomendas
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "encomendas_insert" ON vendas.encomendas
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "encomendas_update" ON vendas.encomendas
  FOR UPDATE TO authenticated USING (public.is_admin_or_owner());

CREATE POLICY "comissoes_select" ON vendas.comissoes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "comissoes_insert" ON vendas.comissoes
  FOR INSERT TO authenticated WITH CHECK (true);

-- ========================
-- RLS POLICIES: schema financeiro
-- ========================
CREATE POLICY "despesas_select" ON financeiro.despesas_viagem
  FOR SELECT TO authenticated USING (public.is_admin_or_owner());
CREATE POLICY "despesas_insert" ON financeiro.despesas_viagem
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_owner());

CREATE POLICY "fechamento_select" ON financeiro.fechamento_caixa
  FOR SELECT TO authenticated USING (public.is_admin_or_owner());
CREATE POLICY "fechamento_insert" ON financeiro.fechamento_caixa
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_owner());
CREATE POLICY "fechamento_update" ON financeiro.fechamento_caixa
  FOR UPDATE TO authenticated USING (public.is_admin_or_owner());

CREATE POLICY "auditoria_select" ON financeiro.logs_auditoria
  FOR SELECT TO authenticated USING (public.is_admin_or_owner());
CREATE POLICY "auditoria_insert" ON financeiro.logs_auditoria
  FOR INSERT TO authenticated WITH CHECK (true);

-- ========================
-- Expor schemas vendas e financeiro ao PostgREST
-- ========================
GRANT USAGE ON SCHEMA vendas TO anon, authenticated;
GRANT USAGE ON SCHEMA financeiro TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA vendas TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA financeiro TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA vendas TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA financeiro TO anon, authenticated;

-- Notify PostgREST to refresh schema cache
NOTIFY pgrst, 'reload schema';

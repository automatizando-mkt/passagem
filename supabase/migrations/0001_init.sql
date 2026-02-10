-- ============================================================
-- Migracao 0001: Schema Inicial — Sistema Passagem
-- 3 Schemas: public, vendas, financeiro
-- ============================================================

-- Schemas
CREATE SCHEMA IF NOT EXISTS vendas;
CREATE SCHEMA IF NOT EXISTS financeiro;

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE public.user_role AS ENUM (
  'SUPER_ADMIN',
  'PROPRIETARIO',
  'TRIPULACAO',
  'VENDEDOR'
);

CREATE TYPE public.tipo_embarcacao AS ENUM (
  'lancha',
  'balsa',
  'catamara',
  'ferry'
);

CREATE TYPE public.status_viagem AS ENUM (
  'programada',
  'embarque',
  'em_viagem',
  'concluida',
  'cancelada'
);

CREATE TYPE vendas.status_passagem AS ENUM (
  'reservada',
  'confirmada',
  'cancelada',
  'utilizada',
  'reembolsada'
);

CREATE TYPE vendas.status_encomenda AS ENUM (
  'recebida',
  'em_transito',
  'entregue',
  'devolvida'
);

CREATE TYPE financeiro.tipo_acao_auditoria AS ENUM (
  'INSERT',
  'UPDATE',
  'DELETE'
);

-- ============================================================
-- FUNCOES AUXILIARES (triggers)
-- ============================================================

-- Atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Preenche created_by/updated_by com auth.uid()
CREATE OR REPLACE FUNCTION public.set_audit_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_by = COALESCE(NEW.created_by, auth.uid());
    NEW.updated_by = COALESCE(NEW.updated_by, auth.uid());
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.updated_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper: retorna role do usuario logado
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.user_role AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- SCHEMA PUBLIC
-- ============================================================

-- Profiles (vincula auth.users ao RBAC)
CREATE TABLE public.profiles (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       public.user_role NOT NULL DEFAULT 'VENDEDOR',
  nome       TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Embarcacoes
CREATE TABLE public.embarcacoes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT NOT NULL,
  capacidade  INTEGER NOT NULL CHECK (capacidade > 0),
  tipo        public.tipo_embarcacao NOT NULL,
  ativa       BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by  UUID REFERENCES auth.users(id),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by  UUID REFERENCES auth.users(id)
);

-- Itinerarios (rota com pontos de parada)
CREATE TABLE public.itinerarios (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT NOT NULL,
  descricao   TEXT,
  ativo       BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by  UUID REFERENCES auth.users(id),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by  UUID REFERENCES auth.users(id)
);

-- Pontos de Parada (ordenados dentro de um itinerario)
CREATE TABLE public.pontos_parada (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerario_id       UUID NOT NULL REFERENCES public.itinerarios(id) ON DELETE CASCADE,
  nome_local          TEXT NOT NULL,
  ordem               INTEGER NOT NULL,
  duracao_parada_min  INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (itinerario_id, ordem)
);

-- Tipos de Acomodacao (rede, cabine, leito, poltrona)
CREATE TABLE public.tipos_acomodacao (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT NOT NULL UNIQUE,
  descricao   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Viagens (instancia de um itinerario com data/hora)
CREATE TABLE public.viagens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerario_id   UUID NOT NULL REFERENCES public.itinerarios(id),
  embarcacao_id   UUID NOT NULL REFERENCES public.embarcacoes(id),
  data_saida      TIMESTAMPTZ NOT NULL,
  status          public.status_viagem NOT NULL DEFAULT 'programada',
  observacoes     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by      UUID REFERENCES auth.users(id),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by      UUID REFERENCES auth.users(id)
);

-- Precos por Trecho (origem -> destino + tipo acomodacao)
CREATE TABLE public.precos_trechos (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerario_id        UUID NOT NULL REFERENCES public.itinerarios(id),
  ponto_origem_id      UUID NOT NULL REFERENCES public.pontos_parada(id),
  ponto_destino_id     UUID NOT NULL REFERENCES public.pontos_parada(id),
  tipo_acomodacao_id   UUID NOT NULL REFERENCES public.tipos_acomodacao(id),
  preco                NUMERIC(12,2) NOT NULL CHECK (preco >= 0),
  vigencia_inicio      DATE NOT NULL DEFAULT CURRENT_DATE,
  vigencia_fim         DATE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by           UUID REFERENCES auth.users(id),

  CHECK (ponto_origem_id <> ponto_destino_id),
  CHECK (vigencia_fim IS NULL OR vigencia_fim > vigencia_inicio)
);

-- ============================================================
-- SCHEMA VENDAS
-- ============================================================

-- Passagens (soft delete: nunca DELETE, apenas status)
CREATE TABLE vendas.passagens (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viagem_id            UUID NOT NULL REFERENCES public.viagens(id),
  usuario_id           UUID NOT NULL REFERENCES auth.users(id),
  nome_passageiro      TEXT NOT NULL,
  documento            TEXT NOT NULL,
  tipo_acomodacao_id   UUID NOT NULL REFERENCES public.tipos_acomodacao(id),
  ponto_embarque_id    UUID NOT NULL REFERENCES public.pontos_parada(id),
  ponto_desembarque_id UUID NOT NULL REFERENCES public.pontos_parada(id),
  assento              TEXT,
  status               vendas.status_passagem NOT NULL DEFAULT 'reservada',
  valor_pago           NUMERIC(12,2) NOT NULL CHECK (valor_pago >= 0),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by           UUID REFERENCES auth.users(id),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by           UUID REFERENCES auth.users(id),

  CHECK (ponto_embarque_id <> ponto_desembarque_id)
);

-- Encomendas
CREATE TABLE vendas.encomendas (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viagem_id     UUID NOT NULL REFERENCES public.viagens(id),
  remetente     TEXT NOT NULL,
  destinatario  TEXT NOT NULL,
  descricao     TEXT NOT NULL,
  peso_kg       NUMERIC(8,2) CHECK (peso_kg > 0),
  valor         NUMERIC(12,2) NOT NULL CHECK (valor >= 0),
  status        vendas.status_encomenda NOT NULL DEFAULT 'recebida',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by    UUID REFERENCES auth.users(id),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by    UUID REFERENCES auth.users(id)
);

-- Comissoes
CREATE TABLE vendas.comissoes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passagem_id   UUID NOT NULL REFERENCES vendas.passagens(id),
  vendedor_id   UUID NOT NULL REFERENCES auth.users(id),
  valor         NUMERIC(12,2) NOT NULL CHECK (valor >= 0),
  percentual    NUMERIC(5,2) NOT NULL CHECK (percentual >= 0 AND percentual <= 100),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- SCHEMA FINANCEIRO
-- ============================================================

-- Despesas de Viagem
CREATE TABLE financeiro.despesas_viagem (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viagem_id   UUID NOT NULL REFERENCES public.viagens(id),
  descricao   TEXT NOT NULL,
  valor       NUMERIC(12,2) NOT NULL CHECK (valor >= 0),
  categoria   TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by  UUID REFERENCES auth.users(id)
);

-- Fechamento de Caixa
CREATE TABLE financeiro.fechamento_caixa (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_fechamento  DATE NOT NULL,
  operador_id      UUID NOT NULL REFERENCES auth.users(id),
  total_vendas     NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_despesas   NUMERIC(12,2) NOT NULL DEFAULT 0,
  saldo            NUMERIC(12,2) NOT NULL DEFAULT 0,
  observacoes      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by       UUID REFERENCES auth.users(id)
);

-- Logs de Auditoria
CREATE TABLE financeiro.logs_auditoria (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabela           TEXT NOT NULL,
  registro_id      UUID NOT NULL,
  acao             financeiro.tipo_acao_auditoria NOT NULL,
  dados_anteriores JSONB,
  dados_novos      JSONB,
  usuario_id       UUID REFERENCES auth.users(id),
  ip               INET,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- updated_at automatico
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

-- audit fields automaticos (created_by/updated_by)
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
CREATE TRIGGER set_audit_fields BEFORE INSERT OR UPDATE ON financeiro.despesas_viagem
  FOR EACH ROW EXECUTE FUNCTION public.set_audit_fields();
CREATE TRIGGER set_audit_fields BEFORE INSERT OR UPDATE ON financeiro.fechamento_caixa
  FOR EACH ROW EXECUTE FUNCTION public.set_audit_fields();

-- ============================================================
-- INDICES
-- ============================================================

CREATE INDEX idx_viagens_status_data ON public.viagens(status, data_saida);
CREATE INDEX idx_passagens_viagem_status ON vendas.passagens(viagem_id, status);
CREATE INDEX idx_passagens_usuario ON vendas.passagens(usuario_id);
CREATE INDEX idx_precos_trecho ON public.precos_trechos(itinerario_id, ponto_origem_id, ponto_destino_id);
CREATE INDEX idx_logs_tabela_registro ON financeiro.logs_auditoria(tabela, registro_id);
CREATE INDEX idx_pontos_parada_itinerario ON public.pontos_parada(itinerario_id, ordem);
CREATE INDEX idx_comissoes_vendedor ON vendas.comissoes(vendedor_id);
CREATE INDEX idx_encomendas_viagem ON vendas.encomendas(viagem_id);
CREATE INDEX idx_despesas_viagem ON financeiro.despesas_viagem(viagem_id);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

-- Habilitar RLS em TODAS as tabelas
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

-- =========================
-- PROFILES
-- =========================

-- Usuarios leem seu proprio profile
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

-- SUPER_ADMIN le todos os profiles
CREATE POLICY profiles_select_admin ON public.profiles
  FOR SELECT USING (public.get_user_role() = 'SUPER_ADMIN');

-- Profile criado automaticamente via trigger (nao precisa INSERT policy para usuario)
-- SUPER_ADMIN pode inserir/atualizar qualquer profile
CREATE POLICY profiles_all_admin ON public.profiles
  FOR ALL USING (public.get_user_role() = 'SUPER_ADMIN');

-- =========================
-- EMBARCACOES (leitura: todos logados | escrita: PROPRIETARIO+)
-- =========================

CREATE POLICY embarcacoes_select ON public.embarcacoes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY embarcacoes_modify ON public.embarcacoes
  FOR ALL USING (public.get_user_role() IN ('SUPER_ADMIN', 'PROPRIETARIO'));

-- =========================
-- ITINERARIOS (leitura: todos logados | escrita: PROPRIETARIO+)
-- =========================

CREATE POLICY itinerarios_select ON public.itinerarios
  FOR SELECT TO authenticated USING (true);

CREATE POLICY itinerarios_modify ON public.itinerarios
  FOR ALL USING (public.get_user_role() IN ('SUPER_ADMIN', 'PROPRIETARIO'));

-- =========================
-- PONTOS DE PARADA (leitura: todos | escrita: PROPRIETARIO+)
-- =========================

CREATE POLICY pontos_parada_select ON public.pontos_parada
  FOR SELECT TO authenticated USING (true);

CREATE POLICY pontos_parada_modify ON public.pontos_parada
  FOR ALL USING (public.get_user_role() IN ('SUPER_ADMIN', 'PROPRIETARIO'));

-- =========================
-- TIPOS ACOMODACAO (leitura: todos | escrita: PROPRIETARIO+)
-- =========================

CREATE POLICY tipos_acomodacao_select ON public.tipos_acomodacao
  FOR SELECT TO authenticated USING (true);

CREATE POLICY tipos_acomodacao_modify ON public.tipos_acomodacao
  FOR ALL USING (public.get_user_role() IN ('SUPER_ADMIN', 'PROPRIETARIO'));

-- =========================
-- VIAGENS (leitura: todos | escrita: PROPRIETARIO+)
-- =========================

CREATE POLICY viagens_select ON public.viagens
  FOR SELECT TO authenticated USING (true);

CREATE POLICY viagens_modify ON public.viagens
  FOR ALL USING (public.get_user_role() IN ('SUPER_ADMIN', 'PROPRIETARIO'));

-- =========================
-- PRECOS (leitura: todos | escrita: PROPRIETARIO+)
-- =========================

CREATE POLICY precos_select ON public.precos_trechos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY precos_modify ON public.precos_trechos
  FOR ALL USING (public.get_user_role() IN ('SUPER_ADMIN', 'PROPRIETARIO'));

-- =========================
-- PASSAGENS (usuario ve as suas | VENDEDOR cria | PROPRIETARIO+ ve todas)
-- =========================

CREATE POLICY passagens_select_own ON vendas.passagens
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY passagens_select_staff ON vendas.passagens
  FOR SELECT USING (
    public.get_user_role() IN ('SUPER_ADMIN', 'PROPRIETARIO', 'TRIPULACAO', 'VENDEDOR')
  );

CREATE POLICY passagens_insert ON vendas.passagens
  FOR INSERT WITH CHECK (
    public.get_user_role() IN ('SUPER_ADMIN', 'PROPRIETARIO', 'VENDEDOR')
  );

CREATE POLICY passagens_update ON vendas.passagens
  FOR UPDATE USING (
    public.get_user_role() IN ('SUPER_ADMIN', 'PROPRIETARIO', 'VENDEDOR')
  );

-- =========================
-- ENCOMENDAS (VENDEDOR cria | PROPRIETARIO+ ve todas)
-- =========================

CREATE POLICY encomendas_select ON vendas.encomendas
  FOR SELECT TO authenticated USING (
    public.get_user_role() IN ('SUPER_ADMIN', 'PROPRIETARIO', 'TRIPULACAO', 'VENDEDOR')
  );

CREATE POLICY encomendas_insert ON vendas.encomendas
  FOR INSERT WITH CHECK (
    public.get_user_role() IN ('SUPER_ADMIN', 'PROPRIETARIO', 'VENDEDOR')
  );

CREATE POLICY encomendas_update ON vendas.encomendas
  FOR UPDATE USING (
    public.get_user_role() IN ('SUPER_ADMIN', 'PROPRIETARIO', 'VENDEDOR')
  );

-- =========================
-- COMISSOES (VENDEDOR ve as suas | PROPRIETARIO+ ve todas)
-- =========================

CREATE POLICY comissoes_select_own ON vendas.comissoes
  FOR SELECT USING (auth.uid() = vendedor_id);

CREATE POLICY comissoes_select_staff ON vendas.comissoes
  FOR SELECT USING (
    public.get_user_role() IN ('SUPER_ADMIN', 'PROPRIETARIO')
  );

CREATE POLICY comissoes_insert ON vendas.comissoes
  FOR INSERT WITH CHECK (
    public.get_user_role() IN ('SUPER_ADMIN', 'PROPRIETARIO')
  );

-- =========================
-- FINANCEIRO (PROPRIETARIO+ apenas)
-- =========================

CREATE POLICY despesas_all ON financeiro.despesas_viagem
  FOR ALL USING (
    public.get_user_role() IN ('SUPER_ADMIN', 'PROPRIETARIO')
  );

CREATE POLICY fechamento_all ON financeiro.fechamento_caixa
  FOR ALL USING (
    public.get_user_role() IN ('SUPER_ADMIN', 'PROPRIETARIO')
  );

CREATE POLICY logs_select ON financeiro.logs_auditoria
  FOR SELECT USING (
    public.get_user_role() IN ('SUPER_ADMIN', 'PROPRIETARIO')
  );

-- Logs sao inseridos via trigger (SECURITY DEFINER), nao diretamente
CREATE POLICY logs_insert ON financeiro.logs_auditoria
  FOR INSERT WITH CHECK (
    public.get_user_role() = 'SUPER_ADMIN'
  );

-- ============================================================
-- TRIGGER: Criar profile automaticamente ao registrar usuario
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', NEW.email, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

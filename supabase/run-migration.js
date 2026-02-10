const fs = require("fs");
const path = require("path");

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!PROJECT_REF || !ACCESS_TOKEN) {
  console.error(
    "Variaveis de ambiente obrigatorias:\n" +
      "  SUPABASE_PROJECT_REF  — ref do projeto (ex: xcliwxewpjtiajquiwzu)\n" +
      "  SUPABASE_ACCESS_TOKEN — token de acesso (sbp_...)\n\n" +
      "Uso: SUPABASE_PROJECT_REF=xxx SUPABASE_ACCESS_TOKEN=yyy node supabase/run-migration.js"
  );
  process.exit(1);
}

const API_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

async function runSQL(sql, label) {
  console.log(`\n>> Executando: ${label}...`);
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error(`   ERRO (${res.status}): ${text}`);
    return false;
  }
  console.log(`   OK`);
  return true;
}

async function main() {
  const sqlFile = fs.readFileSync(
    path.join(__dirname, "migrations", "001_create_tables.sql"),
    "utf8"
  );

  // Split by section comments (-- ====)
  // We'll run the entire SQL in logical chunks to handle dependencies

  const chunks = [
    {
      label: "Schemas",
      sql: `CREATE SCHEMA IF NOT EXISTS vendas; CREATE SCHEMA IF NOT EXISTS financeiro;`,
    },
    {
      label: "Enums",
      sql: `
CREATE TYPE public.user_role AS ENUM ('SUPER_ADMIN', 'PROPRIETARIO', 'TRIPULACAO', 'VENDEDOR');
CREATE TYPE public.tipo_embarcacao AS ENUM ('lancha', 'balsa', 'catamara', 'ferry');
CREATE TYPE public.status_viagem AS ENUM ('programada', 'embarque', 'em_viagem', 'concluida', 'cancelada');
CREATE TYPE vendas.status_passagem AS ENUM ('reservada', 'confirmada', 'cancelada', 'utilizada', 'reembolsada');
CREATE TYPE vendas.status_encomenda AS ENUM ('recebida', 'em_transito', 'entregue', 'devolvida');
CREATE TYPE financeiro.tipo_acao_auditoria AS ENUM ('INSERT', 'UPDATE', 'DELETE');
      `,
    },
    {
      label: "Tabela profiles",
      sql: `
CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'VENDEDOR',
  nome TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
      `,
    },
    {
      label: "Tabela embarcacoes",
      sql: `
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
      `,
    },
    {
      label: "Tabela itinerarios",
      sql: `
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
      `,
    },
    {
      label: "Tabela pontos_parada",
      sql: `
CREATE TABLE public.pontos_parada (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerario_id UUID NOT NULL REFERENCES public.itinerarios(id) ON DELETE CASCADE,
  nome_local TEXT NOT NULL,
  ordem INTEGER NOT NULL,
  duracao_parada_min INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(itinerario_id, ordem)
);
      `,
    },
    {
      label: "Tabela tipos_acomodacao",
      sql: `
CREATE TABLE public.tipos_acomodacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
      `,
    },
    {
      label: "Tabela viagens",
      sql: `
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
      `,
    },
    {
      label: "Tabela precos_trechos",
      sql: `
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
      `,
    },
    {
      label: "Tabelas vendas (passagens + encomendas + comissoes)",
      sql: `
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

CREATE TABLE vendas.comissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passagem_id UUID NOT NULL REFERENCES vendas.passagens(id),
  vendedor_id UUID NOT NULL REFERENCES auth.users(id),
  valor NUMERIC(10,2) NOT NULL,
  percentual NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
      `,
    },
    {
      label: "Tabelas financeiro (despesas + fechamento + auditoria)",
      sql: `
CREATE TABLE financeiro.despesas_viagem (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viagem_id UUID NOT NULL REFERENCES public.viagens(id),
  descricao TEXT NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  categoria TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

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
      `,
    },
    {
      label: "Functions (set_updated_at + set_audit_fields)",
      sql: `
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $fn$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$fn$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.set_audit_fields()
RETURNS TRIGGER AS $fn$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_by = COALESCE(NEW.created_by, auth.uid());
  END IF;
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$fn$ LANGUAGE plpgsql SECURITY DEFINER;
      `,
    },
    {
      label: "Triggers updated_at",
      sql: `
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.embarcacoes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.itinerarios FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.viagens FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON vendas.passagens FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON vendas.encomendas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
      `,
    },
    {
      label: "Triggers audit_fields",
      sql: `
CREATE TRIGGER set_audit_fields BEFORE INSERT OR UPDATE ON public.embarcacoes FOR EACH ROW EXECUTE FUNCTION public.set_audit_fields();
CREATE TRIGGER set_audit_fields BEFORE INSERT OR UPDATE ON public.itinerarios FOR EACH ROW EXECUTE FUNCTION public.set_audit_fields();
CREATE TRIGGER set_audit_fields BEFORE INSERT OR UPDATE ON public.viagens FOR EACH ROW EXECUTE FUNCTION public.set_audit_fields();
CREATE TRIGGER set_audit_fields BEFORE INSERT OR UPDATE ON vendas.passagens FOR EACH ROW EXECUTE FUNCTION public.set_audit_fields();
CREATE TRIGGER set_audit_fields BEFORE INSERT OR UPDATE ON vendas.encomendas FOR EACH ROW EXECUTE FUNCTION public.set_audit_fields();
      `,
    },
    {
      label: "RLS enable",
      sql: `
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
      `,
    },
    {
      label: "RLS helper function",
      sql: `
CREATE OR REPLACE FUNCTION public.is_admin_or_owner()
RETURNS BOOLEAN AS $fn$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role IN ('SUPER_ADMIN', 'PROPRIETARIO')
  );
$fn$ LANGUAGE sql SECURITY DEFINER STABLE;
      `,
    },
    {
      label: "RLS policies profiles",
      sql: `
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
      `,
    },
    {
      label: "RLS policies public tables",
      sql: `
CREATE POLICY "embarcacoes_select" ON public.embarcacoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "embarcacoes_insert" ON public.embarcacoes FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_owner());
CREATE POLICY "embarcacoes_update" ON public.embarcacoes FOR UPDATE TO authenticated USING (public.is_admin_or_owner());

CREATE POLICY "itinerarios_select" ON public.itinerarios FOR SELECT TO authenticated USING (true);
CREATE POLICY "itinerarios_insert" ON public.itinerarios FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_owner());
CREATE POLICY "itinerarios_update" ON public.itinerarios FOR UPDATE TO authenticated USING (public.is_admin_or_owner());

CREATE POLICY "pontos_parada_select" ON public.pontos_parada FOR SELECT TO authenticated USING (true);
CREATE POLICY "pontos_parada_insert" ON public.pontos_parada FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_owner());
CREATE POLICY "pontos_parada_update" ON public.pontos_parada FOR UPDATE TO authenticated USING (public.is_admin_or_owner());
CREATE POLICY "pontos_parada_delete" ON public.pontos_parada FOR DELETE TO authenticated USING (public.is_admin_or_owner());

CREATE POLICY "tipos_acomodacao_select" ON public.tipos_acomodacao FOR SELECT TO authenticated USING (true);
CREATE POLICY "tipos_acomodacao_insert" ON public.tipos_acomodacao FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_owner());
CREATE POLICY "tipos_acomodacao_update" ON public.tipos_acomodacao FOR UPDATE TO authenticated USING (public.is_admin_or_owner());

CREATE POLICY "viagens_select" ON public.viagens FOR SELECT TO authenticated USING (true);
CREATE POLICY "viagens_insert" ON public.viagens FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_owner());
CREATE POLICY "viagens_update" ON public.viagens FOR UPDATE TO authenticated USING (public.is_admin_or_owner());

CREATE POLICY "precos_trechos_select" ON public.precos_trechos FOR SELECT TO authenticated USING (true);
CREATE POLICY "precos_trechos_insert" ON public.precos_trechos FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_owner());
CREATE POLICY "precos_trechos_update" ON public.precos_trechos FOR UPDATE TO authenticated USING (public.is_admin_or_owner());
      `,
    },
    {
      label: "RLS policies vendas",
      sql: `
CREATE POLICY "passagens_select" ON vendas.passagens FOR SELECT TO authenticated USING (true);
CREATE POLICY "passagens_insert" ON vendas.passagens FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "passagens_update" ON vendas.passagens FOR UPDATE TO authenticated USING (public.is_admin_or_owner() OR usuario_id = auth.uid());

CREATE POLICY "encomendas_select" ON vendas.encomendas FOR SELECT TO authenticated USING (true);
CREATE POLICY "encomendas_insert" ON vendas.encomendas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "encomendas_update" ON vendas.encomendas FOR UPDATE TO authenticated USING (public.is_admin_or_owner());

CREATE POLICY "comissoes_select" ON vendas.comissoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "comissoes_insert" ON vendas.comissoes FOR INSERT TO authenticated WITH CHECK (true);
      `,
    },
    {
      label: "RLS policies financeiro",
      sql: `
CREATE POLICY "despesas_select" ON financeiro.despesas_viagem FOR SELECT TO authenticated USING (public.is_admin_or_owner());
CREATE POLICY "despesas_insert" ON financeiro.despesas_viagem FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_owner());

CREATE POLICY "fechamento_select" ON financeiro.fechamento_caixa FOR SELECT TO authenticated USING (public.is_admin_or_owner());
CREATE POLICY "fechamento_insert" ON financeiro.fechamento_caixa FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_owner());
CREATE POLICY "fechamento_update" ON financeiro.fechamento_caixa FOR UPDATE TO authenticated USING (public.is_admin_or_owner());

CREATE POLICY "auditoria_select" ON financeiro.logs_auditoria FOR SELECT TO authenticated USING (public.is_admin_or_owner());
CREATE POLICY "auditoria_insert" ON financeiro.logs_auditoria FOR INSERT TO authenticated WITH CHECK (true);
      `,
    },
    {
      label: "Grants + schema reload",
      sql: `
GRANT USAGE ON SCHEMA vendas TO anon, authenticated;
GRANT USAGE ON SCHEMA financeiro TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA vendas TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA financeiro TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA vendas TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA financeiro TO anon, authenticated;
NOTIFY pgrst, 'reload schema';
      `,
    },
  ];

  let allOk = true;
  for (const chunk of chunks) {
    const ok = await runSQL(chunk.sql, chunk.label);
    if (!ok) {
      allOk = false;
      console.error(`\n!! Falha em "${chunk.label}". Abortando restante.`);
      break;
    }
  }

  if (allOk) {
    console.log("\n=== Migracao completa! Todas as tabelas criadas. ===");
  } else {
    console.log("\n=== Migracao interrompida com erros. ===");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});

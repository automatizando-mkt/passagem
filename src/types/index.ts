// ============================================================
// Tipos de Dominio — Sistema Passagem
// ============================================================

// --- Utilitarios ---

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

// --- Roles ---

export type UserRole = "SUPER_ADMIN" | "PROPRIETARIO" | "TRIPULACAO" | "VENDEDOR";

// --- Entidades: Schema Public ---

export interface Profile {
  user_id: string;
  role: UserRole;
  nome: string;
  agencia_id: string | null;
  created_at: string;
}

export interface Embarcacao {
  id: string;
  nome: string;
  capacidade: number;
  tipo: TipoEmbarcacao;
  ativa: boolean;
  controle_assentos: boolean;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

export type TipoEmbarcacao = "lancha" | "balsa" | "catamara" | "ferry";

export interface Itinerario {
  id: string;
  nome: string;
  descricao: string | null;
  origem: string | null;
  destino: string | null;
  ativo: boolean;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

export interface PontoParada {
  id: string;
  itinerario_id: string;
  nome_local: string;
  ordem: number;
  duracao_parada_min: number;
  created_at: string;
}

export interface TipoAcomodacao {
  id: string;
  nome: string;
  descricao: string | null;
  created_at: string;
}

export interface Viagem {
  id: string;
  itinerario_id: string;
  embarcacao_id: string;
  data_saida: string;
  status: StatusViagem;
  observacoes: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

export type StatusViagem =
  | "programada"
  | "embarque"
  | "em_viagem"
  | "concluida"
  | "cancelada";

export interface PrecoTrecho {
  id: string;
  itinerario_id: string;
  ponto_origem_id: string;
  ponto_destino_id: string;
  tipo_acomodacao_id: string;
  preco: number;
  vigencia_inicio: string;
  vigencia_fim: string | null;
  created_at: string;
  created_by: string | null;
}

export interface Agencia {
  id: string;
  nome: string;
  cnpj_cpf: string | null;
  percentual_comissao: number;
  ativa: boolean;
  contato: string | null;
  endereco: string | null;
  created_at: string;
  created_by: string | null;
}

export interface SetorEmbarcacao {
  id: string;
  embarcacao_id: string;
  nome: string;
  descricao: string | null;
  created_at: string;
}

export interface CapacidadeAcomodacao {
  id: string;
  embarcacao_id: string;
  tipo_acomodacao_id: string;
  quantidade: number;
  created_at: string;
}

export interface Assento {
  id: string;
  embarcacao_id: string;
  tipo_acomodacao_id: string;
  numero: string;
  created_at: string;
}

// --- Entidades: Schema Vendas ---

export interface Passagem {
  id: string;
  viagem_id: string;
  usuario_id: string;
  nome_passageiro: string;
  documento: string;
  data_nascimento: string | null;
  tipo_acomodacao_id: string;
  ponto_embarque_id: string;
  ponto_desembarque_id: string;
  assento: string | null;
  status: StatusPassagem;
  valor_pago: number;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

export type StatusPassagem =
  | "reservada"
  | "confirmada"
  | "cancelada"
  | "utilizada"
  | "reembolsada";

export interface Encomenda {
  id: string;
  viagem_id: string;
  remetente: string;
  destinatario: string;
  descricao: string;
  peso_kg: number | null;
  valor: number;
  setor_id: string | null;
  status: StatusEncomenda;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

export type StatusEncomenda =
  | "recebida"
  | "em_transito"
  | "entregue"
  | "devolvida";

export interface Comissao {
  id: string;
  passagem_id: string;
  vendedor_id: string;
  valor: number;
  percentual: number;
  created_at: string;
}

// --- Entidades: Schema Financeiro ---

export interface DespesaViagem {
  id: string;
  viagem_id: string;
  descricao: string;
  valor: number;
  categoria: string;
  created_at: string;
  created_by: string | null;
}

export interface FechamentoCaixa {
  id: string;
  data_fechamento: string;
  operador_id: string;
  total_vendas: number;
  total_despesas: number;
  saldo: number;
  observacoes: string | null;
  created_at: string;
  created_by: string | null;
}

export interface Transacao {
  id: string;
  tipo: TipoTransacao;
  referencia_id: string | null;
  valor: number;
  metodo_pagamento: MetodoPagamento;
  created_at: string;
  created_by: string | null;
}

export type TipoTransacao = "passagem" | "frete" | "despesa";
export type MetodoPagamento = "pix" | "cartao" | "dinheiro";

export interface LogAuditoria {
  id: string;
  tabela: string;
  registro_id: string;
  acao: "INSERT" | "UPDATE" | "DELETE";
  dados_anteriores: Record<string, unknown> | null;
  dados_novos: Record<string, unknown> | null;
  usuario_id: string | null;
  ip: string | null;
  created_at: string;
}

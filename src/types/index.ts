/** Rota de viagem entre dois portos */
export interface Rota {
  id: string;
  origem: string;
  destino: string;
  duracao_minutos: number;
  preco: number;
  ativa: boolean;
}

/** Embarcacao que realiza as viagens */
export interface Embarcacao {
  id: string;
  nome: string;
  capacidade: number;
  tipo: "lancha" | "balsa" | "catamar";
}

/** Viagem programada em uma data/hora especifica */
export interface Viagem {
  id: string;
  rota_id: string;
  embarcacao_id: string;
  data_saida: string;
  vagas_disponiveis: number;
  status: "programada" | "embarcando" | "em_viagem" | "concluida" | "cancelada";
}

/** Passagem comprada por um usuario */
export interface Passagem {
  id: string;
  viagem_id: string;
  usuario_id: string;
  nome_passageiro: string;
  documento: string;
  assento?: string;
  status: "pendente" | "confirmada" | "cancelada" | "utilizada";
  valor_pago: number;
  data_compra: string;
}

/** Tipo placeholder para o schema do Supabase (gerar com supabase gen types) */
export interface Database {
  public: {
    Tables: Record<string, unknown>;
  };
}

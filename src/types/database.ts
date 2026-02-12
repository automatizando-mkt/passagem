/**
 * Tipos do banco de dados Supabase — Sistema Passagem
 *
 * Todas as tabelas consolidadas no schema public para compatibilidade
 * com o client Supabase (PostgREST default schema).
 *
 * Para regenerar automaticamente:
 * npx supabase gen types typescript --project-id SEU_PROJECT_ID > src/types/database.ts
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          role: "SUPER_ADMIN" | "PROPRIETARIO" | "TRIPULACAO" | "VENDEDOR";
          nome: string;
          agencia_id: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          role?: "SUPER_ADMIN" | "PROPRIETARIO" | "TRIPULACAO" | "VENDEDOR";
          nome?: string;
          agencia_id?: string | null;
        };
        Update: {
          user_id?: string;
          role?: "SUPER_ADMIN" | "PROPRIETARIO" | "TRIPULACAO" | "VENDEDOR";
          nome?: string;
          agencia_id?: string | null;
        };
        Relationships: [];
      };
      embarcacoes: {
        Row: {
          id: string;
          nome: string;
          capacidade: number;
          tipo: "barco" | "navio" | "lancha" | "balsa" | "ferry";
          ativa: boolean;
          controle_assentos: boolean;
          created_at: string;
          created_by: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          nome: string;
          capacidade: number;
          tipo: "barco" | "navio" | "lancha" | "balsa" | "ferry";
          ativa?: boolean;
          controle_assentos?: boolean;
        };
        Update: {
          nome?: string;
          capacidade?: number;
          tipo?: "barco" | "navio" | "lancha" | "balsa" | "ferry";
          ativa?: boolean;
          controle_assentos?: boolean;
        };
        Relationships: [];
      };
      itinerarios: {
        Row: {
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
        };
        Insert: {
          nome: string;
          descricao?: string | null;
          origem?: string | null;
          destino?: string | null;
          ativo?: boolean;
        };
        Update: {
          nome?: string;
          descricao?: string | null;
          origem?: string | null;
          destino?: string | null;
          ativo?: boolean;
        };
        Relationships: [];
      };
      pontos_parada: {
        Row: {
          id: string;
          itinerario_id: string;
          nome_local: string;
          ordem: number;
          duracao_parada_min: number;
          created_at: string;
        };
        Insert: {
          itinerario_id: string;
          nome_local: string;
          ordem: number;
          duracao_parada_min?: number;
        };
        Update: {
          itinerario_id?: string;
          nome_local?: string;
          ordem?: number;
          duracao_parada_min?: number;
        };
        Relationships: [];
      };
      tipos_acomodacao: {
        Row: {
          id: string;
          nome: string;
          descricao: string | null;
          created_at: string;
        };
        Insert: {
          nome: string;
          descricao?: string | null;
        };
        Update: {
          nome?: string;
          descricao?: string | null;
        };
        Relationships: [];
      };
      viagens: {
        Row: {
          id: string;
          itinerario_id: string;
          embarcacao_id: string;
          data_saida: string;
          status:
            | "programada"
            | "embarque"
            | "em_viagem"
            | "concluida"
            | "cancelada";
          observacoes: string | null;
          created_at: string;
          created_by: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          itinerario_id: string;
          embarcacao_id: string;
          data_saida: string;
          status?:
            | "programada"
            | "embarque"
            | "em_viagem"
            | "concluida"
            | "cancelada";
          observacoes?: string | null;
        };
        Update: {
          itinerario_id?: string;
          embarcacao_id?: string;
          data_saida?: string;
          status?:
            | "programada"
            | "embarque"
            | "em_viagem"
            | "concluida"
            | "cancelada";
          observacoes?: string | null;
        };
        Relationships: [];
      };
      precos_trechos: {
        Row: {
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
        };
        Insert: {
          itinerario_id: string;
          ponto_origem_id: string;
          ponto_destino_id: string;
          tipo_acomodacao_id: string;
          preco: number;
          vigencia_inicio?: string;
          vigencia_fim?: string | null;
        };
        Update: {
          itinerario_id?: string;
          ponto_origem_id?: string;
          ponto_destino_id?: string;
          tipo_acomodacao_id?: string;
          preco?: number;
          vigencia_inicio?: string;
          vigencia_fim?: string | null;
        };
        Relationships: [];
      };
      agencias: {
        Row: {
          id: string;
          nome: string;
          cnpj_cpf: string | null;
          percentual_comissao: number;
          ativa: boolean;
          contato: string | null;
          endereco: string | null;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          nome: string;
          cnpj_cpf?: string | null;
          percentual_comissao?: number;
          ativa?: boolean;
          contato?: string | null;
          endereco?: string | null;
        };
        Update: {
          nome?: string;
          cnpj_cpf?: string | null;
          percentual_comissao?: number;
          ativa?: boolean;
          contato?: string | null;
          endereco?: string | null;
        };
        Relationships: [];
      };
      setores_embarcacao: {
        Row: {
          id: string;
          embarcacao_id: string;
          nome: string;
          descricao: string | null;
          created_at: string;
        };
        Insert: {
          embarcacao_id: string;
          nome: string;
          descricao?: string | null;
        };
        Update: {
          embarcacao_id?: string;
          nome?: string;
          descricao?: string | null;
        };
        Relationships: [];
      };
      capacidade_acomodacao: {
        Row: {
          id: string;
          embarcacao_id: string;
          tipo_acomodacao_id: string;
          quantidade: number;
          controle_assentos: boolean;
          created_at: string;
        };
        Insert: {
          embarcacao_id: string;
          tipo_acomodacao_id: string;
          quantidade: number;
          controle_assentos?: boolean;
        };
        Update: {
          embarcacao_id?: string;
          tipo_acomodacao_id?: string;
          quantidade?: number;
          controle_assentos?: boolean;
        };
        Relationships: [];
      };
      passagens: {
        Row: {
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
          status:
            | "reservada"
            | "confirmada"
            | "cancelada"
            | "utilizada"
            | "reembolsada";
          valor_pago: number;
          created_at: string;
          created_by: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          viagem_id: string;
          usuario_id: string;
          nome_passageiro: string;
          documento: string;
          data_nascimento?: string | null;
          tipo_acomodacao_id: string;
          ponto_embarque_id: string;
          ponto_desembarque_id: string;
          assento?: string | null;
          status?:
            | "reservada"
            | "confirmada"
            | "cancelada"
            | "utilizada"
            | "reembolsada";
          valor_pago: number;
        };
        Update: {
          viagem_id?: string;
          usuario_id?: string;
          nome_passageiro?: string;
          documento?: string;
          data_nascimento?: string | null;
          tipo_acomodacao_id?: string;
          ponto_embarque_id?: string;
          ponto_desembarque_id?: string;
          assento?: string | null;
          status?:
            | "reservada"
            | "confirmada"
            | "cancelada"
            | "utilizada"
            | "reembolsada";
          valor_pago?: number;
        };
        Relationships: [];
      };
      encomendas: {
        Row: {
          id: string;
          viagem_id: string;
          remetente: string;
          destinatario: string;
          descricao: string;
          peso_kg: number | null;
          valor: number;
          setor_id: string | null;
          status: "recebida" | "em_transito" | "entregue" | "devolvida";
          created_at: string;
          created_by: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          viagem_id: string;
          remetente: string;
          destinatario: string;
          descricao: string;
          peso_kg?: number | null;
          valor: number;
          setor_id?: string | null;
          status?: "recebida" | "em_transito" | "entregue" | "devolvida";
        };
        Update: {
          viagem_id?: string;
          remetente?: string;
          destinatario?: string;
          descricao?: string;
          peso_kg?: number | null;
          valor?: number;
          setor_id?: string | null;
          status?: "recebida" | "em_transito" | "entregue" | "devolvida";
        };
        Relationships: [];
      };
      comissoes: {
        Row: {
          id: string;
          passagem_id: string;
          vendedor_id: string;
          valor: number;
          percentual: number;
          created_at: string;
        };
        Insert: {
          passagem_id: string;
          vendedor_id: string;
          valor: number;
          percentual: number;
        };
        Update: {
          passagem_id?: string;
          vendedor_id?: string;
          valor?: number;
          percentual?: number;
        };
        Relationships: [];
      };
      transacoes: {
        Row: {
          id: string;
          tipo: "passagem" | "frete" | "despesa";
          referencia_id: string | null;
          valor: number;
          metodo_pagamento: "pix" | "cartao" | "dinheiro";
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          tipo: "passagem" | "frete" | "despesa";
          referencia_id?: string | null;
          valor: number;
          metodo_pagamento: "pix" | "cartao" | "dinheiro";
        };
        Update: {
          tipo?: "passagem" | "frete" | "despesa";
          referencia_id?: string | null;
          valor?: number;
          metodo_pagamento?: "pix" | "cartao" | "dinheiro";
        };
        Relationships: [];
      };
      despesas_viagem: {
        Row: {
          id: string;
          viagem_id: string;
          descricao: string;
          valor: number;
          categoria: string;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          viagem_id: string;
          descricao: string;
          valor: number;
          categoria: string;
        };
        Update: {
          viagem_id?: string;
          descricao?: string;
          valor?: number;
          categoria?: string;
        };
        Relationships: [];
      };
      fechamento_caixa: {
        Row: {
          id: string;
          data_fechamento: string;
          operador_id: string;
          total_vendas: number;
          total_despesas: number;
          saldo: number;
          observacoes: string | null;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          data_fechamento: string;
          operador_id: string;
          total_vendas?: number;
          total_despesas?: number;
          saldo?: number;
          observacoes?: string | null;
        };
        Update: {
          data_fechamento?: string;
          operador_id?: string;
          total_vendas?: number;
          total_despesas?: number;
          saldo?: number;
          observacoes?: string | null;
        };
        Relationships: [];
      };
      logs_auditoria: {
        Row: {
          id: string;
          tabela: string;
          registro_id: string;
          acao: "INSERT" | "UPDATE" | "DELETE";
          dados_anteriores: Record<string, unknown> | null;
          dados_novos: Record<string, unknown> | null;
          usuario_id: string | null;
          ip: string | null;
          created_at: string;
        };
        Insert: {
          tabela: string;
          registro_id: string;
          acao: "INSERT" | "UPDATE" | "DELETE";
          dados_anteriores?: Record<string, unknown> | null;
          dados_novos?: Record<string, unknown> | null;
          usuario_id?: string | null;
          ip?: string | null;
        };
        Update: {
          tabela?: string;
          registro_id?: string;
          acao?: "INSERT" | "UPDATE" | "DELETE";
          dados_anteriores?: Record<string, unknown> | null;
          dados_novos?: Record<string, unknown> | null;
          usuario_id?: string | null;
          ip?: string | null;
        };
        Relationships: [];
      };
      assentos: {
        Row: {
          id: string;
          embarcacao_id: string;
          tipo_acomodacao_id: string;
          numero: string;
          created_at: string;
        };
        Insert: {
          embarcacao_id: string;
          tipo_acomodacao_id: string;
          numero: string;
        };
        Update: {
          embarcacao_id?: string;
          tipo_acomodacao_id?: string;
          numero?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

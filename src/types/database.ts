/**
 * Tipos do banco de dados Supabase — Sistema Passagem
 *
 * 3 Schemas: public, vendas, financeiro
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
          created_at: string;
        };
        Insert: {
          user_id: string;
          role?: "SUPER_ADMIN" | "PROPRIETARIO" | "TRIPULACAO" | "VENDEDOR";
          nome?: string;
        };
        Update: {
          user_id?: string;
          role?: "SUPER_ADMIN" | "PROPRIETARIO" | "TRIPULACAO" | "VENDEDOR";
          nome?: string;
        };
        Relationships: [];
      };
      embarcacoes: {
        Row: {
          id: string;
          nome: string;
          capacidade: number;
          tipo: "lancha" | "balsa" | "catamara" | "ferry";
          ativa: boolean;
          created_at: string;
          created_by: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          nome: string;
          capacidade: number;
          tipo: "lancha" | "balsa" | "catamara" | "ferry";
          ativa?: boolean;
        };
        Update: {
          nome?: string;
          capacidade?: number;
          tipo?: "lancha" | "balsa" | "catamara" | "ferry";
          ativa?: boolean;
        };
        Relationships: [];
      };
      itinerarios: {
        Row: {
          id: string;
          nome: string;
          descricao: string | null;
          ativo: boolean;
          created_at: string;
          created_by: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          nome: string;
          descricao?: string | null;
          ativo?: boolean;
        };
        Update: {
          nome?: string;
          descricao?: string | null;
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
          status: "programada" | "embarque" | "em_viagem" | "concluida" | "cancelada";
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
          status?: "programada" | "embarque" | "em_viagem" | "concluida" | "cancelada";
          observacoes?: string | null;
        };
        Update: {
          itinerario_id?: string;
          embarcacao_id?: string;
          data_saida?: string;
          status?: "programada" | "embarque" | "em_viagem" | "concluida" | "cancelada";
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
  vendas: {
    Tables: {
      passagens: {
        Row: {
          id: string;
          viagem_id: string;
          usuario_id: string;
          nome_passageiro: string;
          documento: string;
          tipo_acomodacao_id: string;
          ponto_embarque_id: string;
          ponto_desembarque_id: string;
          assento: string | null;
          status: "reservada" | "confirmada" | "cancelada" | "utilizada" | "reembolsada";
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
          tipo_acomodacao_id: string;
          ponto_embarque_id: string;
          ponto_desembarque_id: string;
          assento?: string | null;
          status?: "reservada" | "confirmada" | "cancelada" | "utilizada" | "reembolsada";
          valor_pago: number;
        };
        Update: {
          viagem_id?: string;
          usuario_id?: string;
          nome_passageiro?: string;
          documento?: string;
          tipo_acomodacao_id?: string;
          ponto_embarque_id?: string;
          ponto_desembarque_id?: string;
          assento?: string | null;
          status?: "reservada" | "confirmada" | "cancelada" | "utilizada" | "reembolsada";
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
          status?: "recebida" | "em_transito" | "entregue" | "devolvida";
        };
        Update: {
          viagem_id?: string;
          remetente?: string;
          destinatario?: string;
          descricao?: string;
          peso_kg?: number | null;
          valor?: number;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
  financeiro: {
    Tables: {
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

/**
 * Tipos do banco de dados Supabase.
 *
 * Para gerar automaticamente a partir do schema real:
 * npx supabase gen types typescript --project-id SEU_PROJECT_ID > src/types/database.ts
 *
 * Por enquanto, este e um placeholder com a estrutura esperada.
 */
export interface Database {
  public: {
    Tables: {
      rotas: {
        Row: {
          id: string;
          origem: string;
          destino: string;
          duracao_minutos: number;
          preco: number;
          ativa: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["rotas"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["rotas"]["Insert"]>;
      };
      embarcacoes: {
        Row: {
          id: string;
          nome: string;
          capacidade: number;
          tipo: "lancha" | "balsa" | "catamar";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["embarcacoes"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["embarcacoes"]["Insert"]>;
      };
      viagens: {
        Row: {
          id: string;
          rota_id: string;
          embarcacao_id: string;
          data_saida: string;
          vagas_disponiveis: number;
          status: "programada" | "embarcando" | "em_viagem" | "concluida" | "cancelada";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["viagens"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["viagens"]["Insert"]>;
      };
      passagens: {
        Row: {
          id: string;
          viagem_id: string;
          usuario_id: string;
          nome_passageiro: string;
          documento: string;
          assento: string | null;
          status: "pendente" | "confirmada" | "cancelada" | "utilizada";
          valor_pago: number;
          data_compra: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["passagens"]["Row"], "id" | "created_at" | "data_compra">;
        Update: Partial<Database["public"]["Tables"]["passagens"]["Insert"]>;
      };
    };
  };
}

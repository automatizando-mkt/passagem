"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getPrice } from "@/services/pricing/get-price";
import { checkDisponibilidade } from "@/services/vendas/check-disponibilidade";
import type { ActionResult } from "@/types";
import { passagemFormSchema, type PassagemFormData } from "./schemas";

type CreatePassagemResult =
  | { success: true; passagem_id: string }
  | { success: false; error: string };

export async function createPassagem(
  data: PassagemFormData,
): Promise<CreatePassagemResult> {
  const parsed = passagemFormSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0].message };

  if (parsed.data.ponto_embarque_id === parsed.data.ponto_desembarque_id) {
    return { success: false, error: "Embarque e desembarque devem ser diferentes" };
  }

  const supabase = await createServerSupabaseClient();

  // Buscar viagem para obter embarcacao_id e itinerario_id
  const { data: viagem, error: viagemError } = await supabase
    .from("viagens")
    .select("id, embarcacao_id, itinerario_id, status")
    .eq("id", parsed.data.viagem_id)
    .single();

  if (viagemError || !viagem)
    return { success: false, error: "Viagem nao encontrada" };

  if (viagem.status !== "programada" && viagem.status !== "embarque")
    return { success: false, error: "Viagem nao esta disponivel para venda" };

  // Verificar disponibilidade
  const disponibilidade = await checkDisponibilidade(
    viagem.id,
    viagem.embarcacao_id,
    parsed.data.tipo_acomodacao_id,
  );

  if (!disponibilidade.disponivel) {
    return { success: false, error: "Lotacao esgotada para esta acomodacao" };
  }

  // Buscar preco
  const priceResult = await getPrice({
    itinerarioId: viagem.itinerario_id,
    pontoOrigemId: parsed.data.ponto_embarque_id,
    pontoDestinoId: parsed.data.ponto_desembarque_id,
    tipoAcomodacaoId: parsed.data.tipo_acomodacao_id,
  });

  if (!priceResult)
    return { success: false, error: "Preco nao configurado para este trecho" };

  // Buscar usuario autenticado
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Usuario nao autenticado" };

  // Inserir passagem
  const { data: passagem, error: passagemError } = await supabase
    .from("passagens")
    .insert({
      viagem_id: parsed.data.viagem_id,
      usuario_id: user.id,
      nome_passageiro: parsed.data.nome_passageiro,
      documento: parsed.data.documento,
      data_nascimento: parsed.data.data_nascimento || null,
      tipo_acomodacao_id: parsed.data.tipo_acomodacao_id,
      ponto_embarque_id: parsed.data.ponto_embarque_id,
      ponto_desembarque_id: parsed.data.ponto_desembarque_id,
      assento: parsed.data.assento || null,
      status: "confirmada",
      valor_pago: priceResult.preco,
    })
    .select("id")
    .single();

  if (passagemError)
    return { success: false, error: passagemError.message };

  // Inserir transacao financeira
  await supabase.from("transacoes").insert({
    tipo: "passagem",
    referencia_id: passagem.id,
    valor: priceResult.preco,
    metodo_pagamento: parsed.data.metodo_pagamento,
  });

  // Verificar se vendedor tem agencia para gerar comissao
  const { data: profile } = await supabase
    .from("profiles")
    .select("agencia_id")
    .eq("user_id", user.id)
    .single();

  if (profile?.agencia_id) {
    const { data: agencia } = await supabase
      .from("agencias")
      .select("percentual_comissao")
      .eq("id", profile.agencia_id)
      .single();

    if (agencia && agencia.percentual_comissao > 0) {
      const valorComissao = (priceResult.preco * agencia.percentual_comissao) / 100;
      await supabase.from("comissoes").insert({
        passagem_id: passagem.id,
        vendedor_id: user.id,
        valor: valorComissao,
        percentual: agencia.percentual_comissao,
      });
    }
  }

  revalidatePath("/vendas");
  revalidatePath("/vendas/passagens");
  return { success: true, passagem_id: passagem.id };
}

export async function updatePassagemStatus(
  id: string,
  status: "confirmada" | "cancelada" | "utilizada" | "reembolsada",
): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("passagens")
    .update({ status })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/vendas/passagens");
  return { success: true };
}

export async function fetchPrice(params: {
  itinerarioId: string;
  pontoOrigemId: string;
  pontoDestinoId: string;
  tipoAcomodacaoId: string;
}): Promise<{ preco: number } | null> {
  const result = await getPrice(params);
  if (!result) return null;
  return { preco: result.preco };
}

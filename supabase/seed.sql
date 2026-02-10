-- ============================================
-- Seed Data — Sistema Passagem
-- Execute APOS rodar a migracao 0001_init.sql
-- ============================================

-- Tipos de Acomodacao
INSERT INTO public.tipos_acomodacao (nome, descricao) VALUES
  ('Rede', 'Espaco para rede na area coberta'),
  ('Cabine', 'Cabine privativa com cama'),
  ('Leito', 'Poltrona-leito reclinavel'),
  ('Poltrona', 'Assento padrao');

-- Embarcacoes
INSERT INTO public.embarcacoes (nome, capacidade, tipo) VALUES
  ('Navegante I', 200, 'balsa'),
  ('Rapido do Norte', 80, 'catamara'),
  ('Estrela do Rio', 150, 'balsa'),
  ('Veloz II', 60, 'lancha');

-- Itinerario: Manaus - Parintins
INSERT INTO public.itinerarios (id, nome, descricao) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Manaus → Parintins', 'Rota principal via rio Amazonas');

INSERT INTO public.pontos_parada (itinerario_id, nome_local, ordem, duracao_parada_min) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Manaus', 1, 0),
  ('a0000000-0000-0000-0000-000000000001', 'Itacoatiara', 2, 30),
  ('a0000000-0000-0000-0000-000000000001', 'Parintins', 3, 0);

-- Itinerario: Manaus - Santarem
INSERT INTO public.itinerarios (id, nome, descricao) VALUES
  ('a0000000-0000-0000-0000-000000000002', 'Manaus → Santarem', 'Rota longa via Amazonas');

INSERT INTO public.pontos_parada (itinerario_id, nome_local, ordem, duracao_parada_min) VALUES
  ('a0000000-0000-0000-0000-000000000002', 'Manaus', 1, 0),
  ('a0000000-0000-0000-0000-000000000002', 'Parintins', 2, 45),
  ('a0000000-0000-0000-0000-000000000002', 'Obidos', 3, 30),
  ('a0000000-0000-0000-0000-000000000002', 'Santarem', 4, 0);

-- Itinerario: Belem - Macapa
INSERT INTO public.itinerarios (id, nome, descricao) VALUES
  ('a0000000-0000-0000-0000-000000000003', 'Belem → Macapa', 'Travessia para o Amapa');

INSERT INTO public.pontos_parada (itinerario_id, nome_local, ordem, duracao_parada_min) VALUES
  ('a0000000-0000-0000-0000-000000000003', 'Belem', 1, 0),
  ('a0000000-0000-0000-0000-000000000003', 'Breves', 2, 20),
  ('a0000000-0000-0000-0000-000000000003', 'Macapa', 3, 0);

-- Nota: Precos de trechos devem ser inseridos apos criar os pontos de parada.
-- Use os IDs gerados acima como referencia.
-- Exemplo (IDs reais variam):
-- INSERT INTO public.precos_trechos (itinerario_id, ponto_origem_id, ponto_destino_id, tipo_acomodacao_id, preco)
-- VALUES ('<itinerario_uuid>', '<origem_uuid>', '<destino_uuid>', '<acomodacao_uuid>', 150.00);

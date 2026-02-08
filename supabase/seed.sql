-- ============================================
-- Seed Data — Sistema Passagem
-- Execute apos criar as tabelas via migrations
-- ============================================

-- Rotas de exemplo
INSERT INTO rotas (origem, destino, duracao_minutos, preco, ativa) VALUES
  ('Manaus', 'Parintins', 1080, 150.00, true),
  ('Manaus', 'Santarem', 2160, 280.00, true),
  ('Belem', 'Macapa', 1440, 200.00, true),
  ('Manaus', 'Tefe', 720, 120.00, true);

-- Embarcacoes de exemplo
INSERT INTO embarcacoes (nome, capacidade, tipo) VALUES
  ('Navegante I', 200, 'balsa'),
  ('Rapido do Norte', 80, 'catamar'),
  ('Estrela do Rio', 150, 'balsa');

# Requisitos — Sistema Passagem

## Descricao
Sistema online para controle e venda de passagens de barco.

## Entidades Principais
- **Rota** — trajeto entre dois portos (origem, destino, preco, duracao)
- **Embarcacao** — barco que realiza viagens (nome, capacidade, tipo)
- **Viagem** — viagem programada em data/hora especifica (rota + embarcacao + vagas)
- **Passagem** — compra de um usuario para uma viagem (passageiro, assento, status, valor)

## Funcionalidades (a definir prioridade)
- [ ] Buscar rotas disponiveis
- [ ] Visualizar viagens programadas por rota
- [ ] Comprar passagem online
- [ ] Cancelar passagem
- [ ] Painel administrativo (CRUD rotas, embarcacoes, viagens)
- [ ] Autenticacao de usuarios (Supabase Auth)
- [ ] Controle de vagas por viagem
- [ ] Historico de compras do usuario

## Stack
- Next.js 15 (App Router)
- Supabase (PostgreSQL + Auth + RLS)
- TypeScript strict mode

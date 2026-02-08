# Passagem — Sistema de Venda de Passagens de Barco

Sistema online para controle e venda de passagens de barco.

## Stack
- **Frontend:** Next.js 15 (App Router) + React 19
- **Backend:** Next.js API Routes
- **Banco de dados:** Supabase (PostgreSQL hospedado)
- **Linguagem:** TypeScript (strict mode)

## Setup

1. Copie `.env.example` para `.env.local`
2. Preencha as variaveis do Supabase
3. Instale dependencias: `npm install`
4. Rode o dev server: `npm run dev`
5. Acesse: http://localhost:3000

## Estrutura

```
src/
├── app/            ← Paginas e rotas (Next.js App Router)
│   └── api/        ← API endpoints
├── components/     ← Componentes React reutilizaveis
├── lib/            ← Clientes e configuracoes (Supabase, etc.)
├── services/       ← Logica de negocio
├── types/          ← Tipos TypeScript do dominio
└── utils/          ← Funcoes utilitarias
tests/              ← Testes automatizados
docs/               ← Documentacao e planos
supabase/
├── migrations/     ← SQL migrations
└── seed.sql        ← Dados iniciais
```

# Auth Setup — Passagem

## Variaveis de Ambiente

Crie `projetos/passagem/.env.local` com:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_ACCESS_TOKEN=sbp_...
```

> **NEXT_PUBLIC_SUPABASE_URL** e **NEXT_PUBLIC_SUPABASE_ANON_KEY** ficam em Settings > API no dashboard do Supabase.
> **SUPABASE_ACCESS_TOKEN** e o token de acesso da conta (Settings > Access Tokens).

## Pre-requisitos no Supabase

1. **Auth habilitado** — Email/Password provider ativo (Authentication > Providers).
2. **Tabela `profiles`** — Criada pela migration `0001_init.sql`. Contem `user_id`, `role`, `nome`.
3. **Trigger `handle_new_user`** — Tambem na migration. Insere automaticamente um registro em `profiles` com role `VENDEDOR` quando um usuario se cadastra via `auth.signUp()`.
4. **RLS ativa** em `profiles` — Policies permitem leitura do proprio perfil.

## Fluxo de Auth

```
Usuario abre /
  |
  ├── Logado?  → redirect /(app)   [dashboard]
  └── Nao?     → Landing page      [links para /login e /signup]

/login
  └── signInWithPassword() → sucesso → /(app)

/signup
  └── signUp() → sucesso → /(app)
  └── Trigger cria profile com role VENDEDOR

/(app)/*
  └── Layout server-side:
      1. getUser() — sem user? redirect /login
      2. Busca profiles.role — sem profile? redirect /login
      3. Renderiza children com data-user-email e data-user-role

Middleware (todas as rotas):
  └── Refresh de sessao via getUser() — mantem cookies atualizados
```

## Arquivos Envolvidos

| Arquivo | Tipo | Funcao |
|---------|------|--------|
| `src/middleware.ts` | Server | Refresh de sessao em toda request |
| `src/lib/supabase.ts` | Client | `createClient()` para browser |
| `src/lib/supabase-server.ts` | Server | `createServerSupabaseClient()` com cookies |
| `src/app/(auth)/layout.tsx` | Server | Layout centralizado para login/signup |
| `src/app/(auth)/login/page.tsx` | Client | Formulario de login (RHF + Zod) |
| `src/app/(auth)/signup/page.tsx` | Client | Formulario de cadastro (RHF + Zod) |
| `src/app/(app)/layout.tsx` | Server | Guard SSR: redireciona se nao autenticado |
| `src/app/(app)/page.tsx` | Server | Busca user + profile, passa pro dashboard |
| `src/app/(app)/dashboard-content.tsx` | Client | Exibe email, role, nome, botao logout |
| `src/hooks/use-auth.ts` | Client | Hook: signIn, signUp, signOut, onAuthStateChange |
| `src/hooks/use-permission.ts` | Client | Hook: `can(action, resource)` baseado na role |
| `src/services/auth/get-profile.ts` | Server | Busca profile do usuario logado |

## Teste Manual

### 1. Criar conta

1. Rodar `npm run dev`
2. Abrir `http://localhost:3000`
3. Clicar "Cadastrar"
4. Preencher nome, email, senha (min 6 chars), confirmar senha
5. Clicar "Criar Conta"
6. **Esperado:** Toast "Conta criada!", redirect para dashboard com email e role VENDEDOR

### 2. Login

1. Abrir `http://localhost:3000/login`
2. Preencher email e senha do usuario criado
3. Clicar "Entrar"
4. **Esperado:** Redirect para dashboard

### 3. Protecao de rota

1. Abrir `http://localhost:3000/(app)` sem estar logado
2. **Esperado:** Redirect para `/login`

### 4. Logout

1. No dashboard, clicar "Sair"
2. **Esperado:** Redirect para `/`

### 5. Root redirect

1. Estando logado, abrir `http://localhost:3000`
2. **Esperado:** Redirect automatico para `/(app)`

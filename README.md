# Bar Controller Pro

PWA offline-first para operação de bar/comanda, focado em uso simples para pequenos estabelecimentos.

## Visão geral

- Operação principal:
  - `Venda avulsa` (fluxo rápido)
  - `Abrir comanda`
- Persistência local com Dexie (offline-first).
- Isolamento lógico por `tenantId`.
- Sessão persistente entre reloads.
- Suporte de autenticação em dois modos:
  - `local` (mock)
  - `api` (REST backend)

## Stack

- React + TypeScript
- Vite
- Dexie (IndexedDB)
- Tailwind (via CDN config no `index.html`)
- React Router DOM
- Storybook

## Requisitos

- Node.js 20+
- npm

## Rodando localmente

```bash
npm install
npm run dev
```

App em desenvolvimento: `http://localhost:3000`

Build de produção:

```bash
npm run build
npm run preview
```

## Scripts

- `npm run dev`: sobe app em modo desenvolvimento (HMR)
- `npm run build`: build de produção
- `npm run preview`: preview da build
- `npm run storybook`: sobe Storybook
- `npm run build-storybook`: build estática do Storybook

## Autenticação

### Modo local (padrão)

Sem configuração extra, o app usa autenticação local (mock) com dados no Dexie.

### Modo API

Configure em `.env.local`:

```env
VITE_AUTH_MODE=api
VITE_API_BASE_URL=http://localhost:3000
```

Contrato esperado no backend:

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

## Sessão

A sessão é persistida e restaurada via:

- `auth_session_v1`
- `auth_user_id`

No modo local, existe fallback entre as duas chaves para evitar perda de login em reload.

## Rotas

- `/lock`
- `/`
- `/sale`
- `/sales`
- `/customers`
- `/customers/new`
- `/customers/detail?customerId=...`
- `/monthly`
- `/monthly/detail?customerId=...`
- `/inventory`
- `/reports`
- `/users`

## Dados e isolamento (tenant)

As entidades principais possuem `tenantId` e são carregadas/salvas por escopo de tenant:

- `customers`
- `products`
- `orders`
- `monthlyAccounts`
- `users`
- `inventoryAdjustments`

## Tema (cores)

Tema centralizado com tokens CSS:

- `index.css`
- `services/theme.ts`

Recursos:

- modo padrão
- modo `high-contrast`
- tokens customizáveis via `applyCustomThemeTokens`

## Formulários reutilizáveis

Componentes em `components/form`:

- `FormInput`
- `FormSelect`
- `FormCheckbox`
- `FormRadio`
- `FormButton`
- `FormLabel`

## Regras de negócio principais

- Status de pedido: `open`, `payment`, `closed`
- Venda avulsa persiste como pedido fechado
- Estoque baixa automaticamente na venda
- Bloqueio para produto inativo ou sem estoque
- Remoção de item restaura estoque
- Remoção do último pagamento (admin)

## Estrutura resumida

- `App.tsx`: orquestração principal do app
- `pages/*`: telas
- `services/db.ts`: Dexie + seed
- `services/auth.ts`: autenticação (local/api)
- `services/theme.ts`: tema
- `utils/monthly.ts`: regras de mensalista

## Notas de operação

- Projeto é pensado para operação simples.
- Prioridade: evitar confusão e perda de venda.
- Commits preferencialmente atômicos por assunto.

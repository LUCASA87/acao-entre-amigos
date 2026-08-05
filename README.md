# Ação Entre Amigos

Sistema de venda de números (1–500) com React, Vite, TypeScript, Tailwind CSS e Supabase.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- Supabase
- React Router
- React Hook Form + Zod
- TanStack Query
- Lucide React
- Sonner
- jsPDF + SheetJS (Excel)

## Configuração

1. Instale as dependências:

```bash
npm install
```

2. Copie o arquivo de ambiente:

```bash
cp .env.example .env
```

3. Preencha no `.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
VITE_CAMPANHA_NOME=Ação Entre Amigos
VITE_VALOR_NUMERO=2
```

4. Execute a migration SQL em `supabase/migrations/20260804210000_create_rifa_numeros.sql` no SQL Editor do Supabase (se ainda não rodou).

5. Inicie o projeto:

```bash
npm run dev
```

Na primeira carga, o sistema cria automaticamente os números **1–500** com status **Disponivel**.

## Funcionalidades

- Grade com 500 números coloridos por status
- Modal de compra (nome, telefone, vendedor, pagamento)
- Modal de detalhes para números vendidos/reservados
- Pesquisa por número, nome, telefone ou vendedor
- Filtro: todos / livres / reservados / pagos
- Relatórios com exportação PDF e Excel
- Deploy pronto para Vercel (`vercel.json` com SPA rewrite)

## Deploy na Vercel

1. Importe o repositório na Vercel
2. Configure as variáveis de ambiente (`VITE_*`)
3. Build command: `npm run build`
4. Output directory: `dist`

## Scripts

| Comando        | Descrição              |
|----------------|------------------------|
| `npm run dev`  | Servidor de desenvolvimento |
| `npm run build`| Build de produção      |
| `npm run preview` | Preview do build    |

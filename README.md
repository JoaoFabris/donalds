# 🍔 Donalds — Food Ordering App

Aplicação web de pedidos em restaurantes com QR Code, desenvolvida com **Next.js 15**, **Prisma**, **Stripe** e **Tailwind CSS**.

---

## 📋 Visão Geral

O **Donalds** é um sistema de pedidos para restaurantes acessado via QR Code. O cliente escaneia o código na mesa ou no balcão, escolhe entre consumo no local ou retirada, navega pelo cardápio, adiciona itens ao carrinho e finaliza o pagamento diretamente pelo celular — sem precisar instalar nenhum app.

---

## ✨ Funcionalidades

- Acesso via slug único por restaurante (`/[slug]`)
- Seleção de método de consumo: **dine in** ou **takeaway**
- Cardápio organizado por categorias com scroll horizontal
- Página de detalhes do produto com controle de quantidade
- Carrinho lateral com Sheet (Vaul/Radix UI)
- Finalização de pedido com CPF do cliente
- Integração com **Stripe Checkout** para pagamento
- Webhook do Stripe para confirmar e atualizar status do pedido
- Consulta de pedidos por CPF
- Seed do banco de dados para popular restaurante de exemplo

---

## 🛠️ Stack Técnica

| Camada | Tecnologias |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **Linguagem** | TypeScript |
| **ORM** | Prisma + PostgreSQL |
| **Pagamento** | Stripe |
| **UI** | Tailwind CSS, Radix UI, shadcn/ui, Lucide React |
| **Formulários** | React Hook Form + Zod |
| **Notificações** | Sonner |
| **Animações** | tailwindcss-animate |

---

## 🚀 Como rodar localmente

### Pré-requisitos

- Node.js >= 18
- PostgreSQL rodando localmente ou em nuvem
- Conta no Stripe (para pagamentos)

### 1. Clone o repositório

```bash
git clone https://github.com/JoaoFabris/donalds.git
cd donalds
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/donalds"

STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Execute as migrations e o seed

```bash
npx prisma migrate dev
npx prisma db seed
```

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 🪝 Configurando o Webhook do Stripe

Para testar o webhook localmente, instale o [Stripe CLI](https://stripe.com/docs/stripe-cli) e rode:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copie o `whsec_...` gerado e cole em `STRIPE_WEBHOOK_SECRET` no seu `.env`.

---

## 🗂️ Estrutura do Projeto

```
src/
├── app/
│   ├── [slug]/               # Páginas do restaurante (slug único)
│   │   ├── page.tsx          # Seleção do método de consumo
│   │   ├── menu/             # Cardápio e detalhes do produto
│   │   │   ├── actions/      # Server Actions (criar pedido, checkout Stripe)
│   │   │   ├── contexts/     # Contexto do carrinho
│   │   │   └── [productId]/  # Página de detalhes do produto
│   │   └── orders/           # Consulta de pedidos por CPF
│   └── api/
│       └── webhooks/stripe/  # Webhook para confirmação de pagamento
├── components/ui/             # Componentes reutilizáveis (shadcn/ui)
├── data/                      # Queries ao banco de dados
├── helpers/                   # Funções utilitárias (CPF, moeda)
└── lib/                       # Instância do Prisma e utils

prisma/
├── schema.prisma              # Modelagem do banco de dados
├── seed.ts                    # Seed com restaurante de exemplo
└── migrations/                # Histórico de migrations
```

---

## 📦 Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm run start` | Inicia o servidor em produção |
| `npm run lint` | Roda o ESLint |
| `npx prisma db seed` | Popula o banco com dados de exemplo |
| `npx prisma studio` | Abre o Prisma Studio (GUI do banco) |

---

## 📄 Licença

Este projeto foi desenvolvido para fins de aprendizado e portfólio.

---

Desenvolvido por [João Fabris](https://github.com/JoaoFabris) 🚀
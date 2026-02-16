<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Bar Controller Pro (Caderninho do Fiado)

PWA offline-first para pequenos bares e conveniências, com foco em operação simples.

## Fluxos principais

- Abertura do app:
  - Com sessão válida (`auth_user_id`) abre em `Home`.
  - Sem sessão abre em `Lock`.
  - A tela educacional (`ig_feed`) virou opcional e não bloqueia início.
- Comandas:
  - Criação e gestão de comandas com status `open`, `payment`, `closed`.
  - Mesa segue aleatória de `01` a `30`.
- Venda avulsa com pagamento imediato:
  - Agora persiste como `Order` real fechado (`status: closed`).
  - Salva itens + pagamento (PIX/Dinheiro/Cartão).
  - Entra em relatórios e métricas.

## Regras de estoque

- Baixa automática de estoque quando itens entram em venda:
  - em comanda aberta;
  - em quick sale (pagamento imediato).
- Não permite vender produto:
  - `inactive`;
  - sem estoque (`stock <= 0`).
- Exibe alerta visual de `Baixo estoque` quando `stock <= minStock`.
- Desfazer item na comanda restaura estoque automaticamente.

## Correções operacionais (desfazer)

- Na tela da comanda:
  - Remover item com confirmação.
  - Recalcular totais imediatamente.
- Pagamentos:
  - Remover último pagamento (somente admin).
  - Mostra feedback visual “Pagamento removido”.

## Estoque operacional simples

- Entrada de mercadoria:
  - Seleciona produto + quantidade positiva.
  - Aplica `stock += quantidade`.
- Perda/Quebra:
  - Seleciona produto + quantidade positiva.
  - Aplica `stock = max(0, stock - quantidade)`.
- Fluxos feitos para uso rápido com botões e campos grandes.

## Mensalistas

- Mantida lógica atual:
  - bloqueio por atraso;
  - desbloqueio com pagamento de 50%;
  - redutor de 10% no disponível com saldo em aberto.
- Tela de detalhe agora explica regras no painel “Como funciona”.

## Relatórios

- Considera pedidos fechados (comanda fechada + quick sale).
- Exibe pagamentos por método.
- Separa:
  - `Em aberto (comandas)`;
  - `Em aberto (mensalistas)`;
  - total em aberto.

## Executar localmente

**Pré-requisito:** Node.js

1. Instalar dependências:
   `npm install`
2. Configurar chave Gemini em `.env.local` (se usar insights IA).
3. Rodar:
   `npm run dev`

# Sistema de Billing & Subscription - Retrat.ai

Este documento descreve o sistema completo de billing e assinaturas implementado para o Retrat.ai.

## Arquitetura

### Componentes Principais

1. **Database Schema** (`schema-subscriptions.sql`)
   - Tabelas para planos, assinaturas, uso e eventos Stripe
   - Funções SQL para verificação de cotas e tracking de uso
   - RLS (Row Level Security) configurado

2. **Serviços**
   - `StripeService`: Integração com API do Stripe
   - `BillingService`: Lógica de negócio e integração com banco

3. **APIs**
   - `/api/billing/plans` - Listar planos disponíveis
   - `/api/billing/subscription` - Info da assinatura do usuário
   - `/api/billing/checkout` - Criar sessão de checkout
   - `/api/billing/portal` - Portal de gerenciamento
   - `/api/webhooks/stripe` - Processar eventos do Stripe

4. **Interface**
   - `/pricing` - Página de planos e preços
   - `/billing` - Dashboard de billing do usuário
   - `useBilling` hook para estado global

## Planos Disponíveis

### Free (Gratuito)
- 5 gerações por semana
- Resolução 1024x1024
- Com marca d'água
- R$ 0/mês

### Pro (Profissional)
- Gerações ilimitadas
- Resolução até 2048x2048
- Sem marca d'água
- Suporte prioritário
- R$ 29,00/mês

## Fluxo de Uso

### 1. Verificação de Cota
```typescript
const canGenerate = await billingService.canUserGenerate(userId)
if (!canGenerate) {
  // Usuário excedeu cota
}
```

### 2. Incremento de Uso
```typescript
await billingService.incrementUsage(userId)
```

### 3. Upgrade de Plano
```typescript
const sessionUrl = await billingService.createCheckoutSession(
  userId,
  'pro',
  successUrl,
  cancelUrl
)
// Redirecionar usuário para sessionUrl
```

## Webhooks do Stripe

O sistema processa os seguintes eventos:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

Todos os eventos são logados para debugging e auditoria.

## Database Functions

### `can_user_generate(user_uuid)`
Verifica se o usuário pode gerar baseado na cota atual.

### `increment_user_usage(user_uuid)`
Incrementa o contador de uso do usuário no período atual.

### `get_user_subscription(user_uuid)`
Retorna a assinatura ativa do usuário com detalhes do plano.

## Configuração

### Variáveis de Ambiente
```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Database Setup
Execute o arquivo `schema-subscriptions.sql` no Supabase para criar as tabelas e funções necessárias.

### Stripe Setup
1. Criar produtos e preços no Dashboard do Stripe
2. Configurar webhook endpoint: `/api/webhooks/stripe`
3. Atualizar `getPlanIdFromPriceId()` com os IDs corretos

## Monitoramento

- Todos os eventos Stripe são logados na tabela `stripe_events`
- Erros são logados no console com contexto completo
- Usage records mantêm histórico por período

## Segurança

- Verificação de assinatura do webhook
- RLS no Supabase para isolamento de dados
- Service role usado apenas para webhooks
- Validação de entrada com Zod

## Testando

### Modo Teste
Use as chaves de teste do Stripe para desenvolvimento:
- Cartões de teste: 4242 4242 4242 4242
- Webhooks locais: Use ngrok ou equivalente

### Cenários de Teste
1. Upgrade de plano gratuito para Pro
2. Cancelamento de assinatura
3. Falha de pagamento
4. Exceder cota gratuita
5. Renovação automática

## Limitações Conhecidas

- Período de cota é semanal (segunda a domingo)
- Planos são apenas mensais por enquanto
- Não suporta downgrade automático
- Webhooks precisam de retry manual se falharem

## Próximos Passos

- [ ] Implementar planos anuais com desconto
- [ ] Adicionar métricas de uso detalhadas
- [ ] Sistema de cupons/promoções
- [ ] Alertas de uso próximo ao limite
- [ ] Relatórios de faturamento
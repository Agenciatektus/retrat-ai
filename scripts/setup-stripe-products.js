const Stripe = require('stripe');

// Inicializar Stripe com a chave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

async function createStripeProducts() {
  try {
    console.log('🚀 Criando produtos e preços no Stripe...\n');

    // 1. Criar produto Free (apenas para referência, não terá preço)
    console.log('📝 Criando produto Free...');
    const freeProduct = await stripe.products.create({
      name: 'Retrat.ai - Gratuito',
      description: 'Plano gratuito com 5 gerações por semana',
      metadata: {
        plan_id: 'free'
      }
    });
    console.log(`✅ Produto Free criado: ${freeProduct.id}\n`);

    // 2. Criar produto Pro
    console.log('📝 Criando produto Pro...');
    const proProduct = await stripe.products.create({
      name: 'Retrat.ai - Pro',
      description: 'Plano profissional com gerações ilimitadas e recursos avançados',
      metadata: {
        plan_id: 'pro'
      }
    });
    console.log(`✅ Produto Pro criado: ${proProduct.id}`);

    // 3. Criar preço para o produto Pro (R$ 29,00/mês)
    console.log('💰 Criando preço para o produto Pro...');
    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 2900, // R$ 29,00 em centavos
      currency: 'brl',
      recurring: {
        interval: 'month',
      },
      metadata: {
        plan_id: 'pro'
      }
    });
    console.log(`✅ Preço Pro criado: ${proPrice.id}\n`);

    // 4. Mostrar resumo
    console.log('📋 RESUMO DOS IDS CRIADOS:');
    console.log('================================');
    console.log(`Free Product ID: ${freeProduct.id}`);
    console.log(`Pro Product ID:  ${proProduct.id}`);
    console.log(`Pro Price ID:    ${proPrice.id}`);
    console.log('================================\n');

    // 5. Gerar SQL para atualizar a base de dados
    console.log('🗄️  SQL para atualizar os planos no banco:');
    console.log('================================');
    console.log(`UPDATE subscription_plans SET stripe_price_id = NULL WHERE id = 'free';`);
    console.log(`UPDATE subscription_plans SET stripe_price_id = '${proPrice.id}' WHERE id = 'pro';`);
    console.log('================================\n');

    // 6. Gerar configuração para .env
    console.log('⚙️  Adicione estas variáveis ao seu .env.local:');
    console.log('================================');
    console.log(`STRIPE_FREE_PRODUCT_ID=${freeProduct.id}`);
    console.log(`STRIPE_PRO_PRODUCT_ID=${proProduct.id}`);
    console.log(`STRIPE_PRO_PRICE_ID=${proPrice.id}`);
    console.log('================================\n');

    console.log('✅ Configuração do Stripe concluída!');
    console.log('📌 Próximos passos:');
    console.log('   1. Execute o SQL acima no Supabase');
    console.log('   2. Adicione as variáveis ao .env.local');
    console.log('   3. Configure o webhook no Stripe Dashboard');

  } catch (error) {
    console.error('❌ Erro ao criar produtos:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('🔑 Verifique se STRIPE_SECRET_KEY está configurada corretamente');
    }
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY não encontrada nas variáveis de ambiente');
    process.exit(1);
  }

  createStripeProducts();
}

module.exports = { createStripeProducts };
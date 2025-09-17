import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: "var(--border-glass)" }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 flex items-center justify-center rounded" style={{ color: "var(--accent-gold)" }}>
                📷
              </div>
              <span className="font-heading text-2xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                Retrat.ai
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/login" className="px-4 py-2 rounded-lg transition-colors hover:opacity-80" style={{ color: "var(--foreground-muted)" }}>
                Entrar
              </Link>
              <Link href="/signup" className="px-6 py-2 rounded-lg font-medium transition-colors hover:opacity-90" style={{ backgroundColor: "var(--accent-gold)", color: "#000" }}>
                Começar Grátis
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4">
        
        {/* Hero Section */}
        <section className="text-center py-20">
          <h1 className="font-heading text-5xl md:text-6xl font-bold mb-6 leading-tight" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
            Seu Book Fotográfico,<br />
            <span style={{ color: "var(--accent-gold)" }}>Sem Estúdio. Sem Fotógrafo.</span><br />
            Em Minutos.
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
            Crie retratos hiper-realistas e editoriais a partir das suas próprias fotos.<br />
            Basta enviar uma referência de estilo e uma selfie — nós cuidamos do resto.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <Link href="/signup" className="px-8 py-3 rounded-lg font-semibold text-lg transition-all hover:scale-105" style={{ backgroundColor: "var(--accent-gold)", color: "#000" }}>
              Criar Meu Primeiro Retrato
            </Link>
            <button className="px-8 py-3 rounded-lg font-semibold text-lg border transition-all hover:opacity-80" style={{ borderColor: "var(--border-glass)", color: "var(--foreground)" }}>
              ▶ Ver Demonstração
            </button>
          </div>
          
          <p className="text-sm" style={{ color: "var(--foreground-subtle)" }}>
            ✓ 3 retratos grátis • ✓ Sem cartão de crédito • ✓ Resultados em 5 minutos
          </p>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
              Como Funciona
            </h2>
            <p className="text-xl" style={{ color: "var(--foreground-muted)" }}>
              Transforme suas fotos em retratos profissionais em 4 passos simples
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center p-6 rounded-xl" style={{ backgroundColor: "var(--surface-glass)", backdropFilter: "var(--backdrop-blur)" }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: "var(--accent-gold)", color: "#000" }}>
                📂
              </div>
              <h3 className="font-heading text-xl font-semibold mb-3" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                Crie seu Projeto
              </h3>
              <p style={{ color: "var(--foreground-muted)" }}>
                Dê um nome e organize suas fotos em um projeto personalizado.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center p-6 rounded-xl" style={{ backgroundColor: "var(--surface-glass)", backdropFilter: "var(--backdrop-blur)" }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: "var(--accent-gold)", color: "#000" }}>
                📸
              </div>
              <h3 className="font-heading text-xl font-semibold mb-3" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                Envie suas Fotos Pessoais
              </h3>
              <p style={{ color: "var(--foreground-muted)" }}>
                Selfies, corpo inteiro, o que quiser. Nossa IA se adapta a qualquer tipo de foto.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center p-6 rounded-xl" style={{ backgroundColor: "var(--surface-glass)", backdropFilter: "var(--backdrop-blur)" }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: "var(--accent-gold)", color: "#000" }}>
                🖼️
              </div>
              <h3 className="font-heading text-xl font-semibold mb-3" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                Escolha uma Referência
              </h3>
              <p style={{ color: "var(--foreground-muted)" }}>
                Do Pinterest, revista ou editorial. Defina o estilo do seu retrato profissional.
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center p-6 rounded-xl" style={{ backgroundColor: "var(--surface-glass)", backdropFilter: "var(--backdrop-blur)" }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: "var(--accent-gold)", color: "#000" }}>
                ⚡
              </div>
              <h3 className="font-heading text-xl font-semibold mb-3" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                Receba seu Retrato Pronto
              </h3>
              <p style={{ color: "var(--foreground-muted)" }}>
                Imagem realista com estilo profissional, pronta em poucos minutos.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
              Por que Escolher o Retrat.ai?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="p-6 rounded-xl" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="w-12 h-12 mb-4 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--accent-gold-muted)" }}>
                💰
              </div>
              <h3 className="font-heading text-xl font-semibold mb-3" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                Economia Radical
              </h3>
              <p style={{ color: "var(--foreground-muted)" }}>
                Sessões profissionais custam R$ 500-2000. Aqui você paga R$ 29 por 20 retratos únicos.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="p-6 rounded-xl" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="w-12 h-12 mb-4 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--accent-gold-muted)" }}>
                ⚡
              </div>
              <h3 className="font-heading text-xl font-semibold mb-3" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                Velocidade Incomparável
              </h3>
              <p style={{ color: "var(--foreground-muted)" }}>
                Sem agendamentos, sem deslocamentos. Resultados profissionais em minutos, não semanas.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="p-6 rounded-xl" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="w-12 h-12 mb-4 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--accent-gold-muted)" }}>
                🎨
              </div>
              <h3 className="font-heading text-xl font-semibold mb-3" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                Versatilidade Total
              </h3>
              <p style={{ color: "var(--foreground-muted)" }}>
                Explore estilos impossíveis na vida real. Mude cenários, iluminação e mood instantaneamente.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 text-center">
          <div className="max-w-3xl mx-auto p-8 rounded-xl" style={{ backgroundColor: "var(--surface-glass)", backdropFilter: "var(--backdrop-blur)" }}>
            <h2 className="font-heading text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
              Pronto para Criar Seu Primeiro Retrato?
            </h2>
            <p className="text-xl mb-8" style={{ color: "var(--foreground-muted)" }}>
              Junte-se a milhares de pessoas que já descobriram uma nova forma de se expressar através da fotografia.
            </p>
            
            <Link href="/signup" className="inline-block px-8 py-3 rounded-lg font-semibold text-lg transition-all hover:scale-105" style={{ backgroundColor: "var(--accent-gold)", color: "#000" }}>
              Começar Agora - É Grátis
            </Link>
            
            <p className="text-sm mt-4" style={{ color: "var(--foreground-subtle)" }}>
              Sem compromissos. Cancele quando quiser.
            </p>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t py-12" style={{ borderColor: "var(--border)" }}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-6 h-6 flex items-center justify-center" style={{ color: "var(--accent-gold)" }}>
                📷
              </div>
              <span className="font-heading text-xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                Retrat.ai
              </span>
            </div>
            <p style={{ color: "var(--foreground-muted)" }}>
              © 2024 Retrat.ai. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
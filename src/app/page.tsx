import Link from "next/link"
import { Camera, Play, CheckCircle, Users, Zap, Star, Palette, FolderPlus, Upload, Image, ArrowRight, ChevronRight } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      {/* Header Fixo */}
      <header className="fixed top-0 w-full z-50 border-b backdrop-blur-md" style={{ borderColor: "var(--border-glass)", backgroundColor: "var(--background-alpha)" }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Camera className="w-8 h-8" style={{ color: "var(--accent-gold)" }} />
              <span className="font-heading text-2xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                Retrat.ai
              </span>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#como-funciona" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: "var(--foreground-muted)" }}>
                Como funciona
              </a>
              <a href="#exemplos" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: "var(--foreground-muted)" }}>
                Exemplos
              </a>
              <a href="#planos" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: "var(--foreground-muted)" }}>
                Planos
              </a>
              <a href="#faq" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: "var(--foreground-muted)" }}>
                FAQ
              </a>
            </nav>
            
            {/* Actions */}
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
      <main className="pt-20">
        
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Hero Text */}
            <div>
              <h1 className="font-heading text-5xl md:text-6xl font-bold mb-6 leading-tight" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                Seu Book Fotográfico,<br />
                <span style={{ color: "var(--accent-gold)" }}>Sem Estúdio. Sem Fotógrafo.</span><br />
                Em Minutos.
              </h1>
              <p className="text-xl mb-8 max-w-2xl leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
                Crie retratos hiper-realistas e editoriais a partir das suas próprias fotos.<br />
                Basta enviar uma referência de estilo e uma selfie — nós cuidamos do resto.
              </p>
              
              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Link href="/signup" className="px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 text-center" style={{ backgroundColor: "var(--accent-gold)", color: "#000" }}>
                  Criar Meu Primeiro Retrato
                </Link>
                <button className="px-8 py-4 rounded-lg font-semibold text-lg border transition-all hover:opacity-80 flex items-center justify-center gap-2" style={{ borderColor: "var(--border-glass)", color: "var(--foreground)" }}>
                  <Play className="w-5 h-5" />
                  Ver Demonstração
                </button>
              </div>

              {/* Microcopy */}
              <div className="flex flex-wrap items-center gap-6 text-sm" style={{ color: "var(--foreground-muted)" }}>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
                  <span>15 retratos grátis/mês</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
                  <span>Sem cartão</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
                  <span>Resultados em minutos</span>
                </div>
              </div>
            </div>

            {/* Hero Images */}
            <div className="space-y-6">
              {/* Slot A - Colagem 3 fotos 3:4 */}
              <div className="p-6 rounded-xl" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="aspect-[3/4] rounded-lg flex items-center justify-center text-xs text-center p-2" style={{ backgroundColor: "var(--surface-glass)", color: "var(--foreground-muted)" }}>
                    [Editorial urbano]<br/>
                    Luz natural + contraste
                  </div>
                  <div className="aspect-[3/4] rounded-lg flex items-center justify-center text-xs text-center p-2" style={{ backgroundColor: "var(--surface-glass)", color: "var(--foreground-muted)" }}>
                    [Vintage suave]<br/>
                    Tons quentes + grão
                  </div>
                  <div className="aspect-[3/4] rounded-lg flex items-center justify-center text-xs text-center p-2" style={{ backgroundColor: "var(--surface-glass)", color: "var(--foreground-muted)" }}>
                    [Flash 2000s]<br/>
                    Alto contraste + brilho
                  </div>
                </div>
                <p className="text-sm text-center" style={{ color: "var(--foreground-muted)" }}>
                  "Mesmo estilo, mesma luz, mesmo mood."
                </p>
              </div>

              {/* Slot B - UI Mock 16:9 */}
              <div className="aspect-video rounded-xl border-2 border-dashed flex items-center justify-center text-center p-8" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-glass)" }}>
                <div>
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--accent-gold-muted)" }}>
                    <FolderPlus className="w-6 h-6" style={{ color: "var(--accent-gold)" }} />
                  </div>
                  <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                    [Screenshot do dashboard]<br/>
                    Interface de projetos
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Como Funciona */}
        <section id="como-funciona" className="py-20" style={{ backgroundColor: "var(--surface-glass)" }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-heading text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                Como Funciona
              </h2>
              <p className="text-xl" style={{ color: "var(--foreground-muted)" }}>
                Transforme suas fotos em retratos profissionais em 4 passos simples
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12">
              {/* Passo 1 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--accent-gold-muted)" }}>
                    <FolderPlus className="w-6 h-6" style={{ color: "var(--accent-gold)" }} />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-xl font-semibold mb-3" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                    Crie seu Projeto
                  </h3>
                  <p className="mb-4" style={{ color: "var(--foreground-muted)" }}>
                    Dê um nome e organize suas fotos por tema ou objetivo.
                  </p>
                  <div className="aspect-video rounded-lg border-2 border-dashed flex items-center justify-center text-xs" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", color: "var(--foreground-muted)" }}>
                    [UI – Criar projeto (16:9)]<br/>
                    Tela de criação de projeto
                  </div>
                </div>
              </div>

              {/* Passo 2 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--accent-gold-muted)" }}>
                    <Upload className="w-6 h-6" style={{ color: "var(--accent-gold)" }} />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-xl font-semibold mb-3" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                    Envie suas Fotos
                  </h3>
                  <p className="mb-4" style={{ color: "var(--foreground-muted)" }}>
                    Selfies, corpo inteiro, detalhes — quanto mais ângulos, melhor.
                  </p>
                  <div className="aspect-[3/2] rounded-lg border-2 border-dashed flex items-center justify-center text-xs" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", color: "var(--foreground-muted)" }}>
                    [Grid de uploads (3:2)]<br/>
                    Grade de fotos pessoais enviadas
                  </div>
                </div>
              </div>

              {/* Passo 3 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--accent-gold-muted)" }}>
                    <Image className="w-6 h-6" style={{ color: "var(--accent-gold)" }} />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-xl font-semibold mb-3" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                    Escolha uma Referência
                  </h3>
                  <p className="mb-4" style={{ color: "var(--foreground-muted)" }}>
                    Estilo, pose, luz e paleta — defina o clima do retrato.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="aspect-[3/4] rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-xs relative" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", color: "var(--foreground-muted)" }}>
                      <div className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: "var(--accent-gold)", color: "#000" }}>
                        Referência
                      </div>
                      [Foto referência]
                    </div>
                    <div className="aspect-[3/4] rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-xs relative" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", color: "var(--foreground-muted)" }}>
                      <div className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: "var(--accent-gold)", color: "#000" }}>
                        Resultado
                      </div>
                      [Retrato gerado]
                    </div>
                  </div>
                  <p className="text-xs text-center mt-2" style={{ color: "var(--foreground-muted)" }}>
                    "Fidelidade de luz e enquadramento."
                  </p>
                </div>
              </div>

              {/* Passo 4 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--accent-gold-muted)" }}>
                    <Zap className="w-6 h-6" style={{ color: "var(--accent-gold)" }} />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-xl font-semibold mb-3" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                    Receba sua Imagem
                  </h3>
                  <p className="mb-4" style={{ color: "var(--foreground-muted)" }}>
                    Retratos prontos para feed, stories e portfólio — exporte em 1 clique.
                  </p>
                  <div className="flex gap-2">
                    <div className="aspect-[4/5] flex-1 rounded-lg border-2 border-dashed flex items-center justify-center text-xs" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", color: "var(--foreground-muted)" }}>
                      4:5<br/>Feed
                    </div>
                    <div className="aspect-square flex-1 rounded-lg border-2 border-dashed flex items-center justify-center text-xs" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", color: "var(--foreground-muted)" }}>
                      1:1<br/>Post
                    </div>
                    <div className="aspect-[9/16] flex-1 rounded-lg border-2 border-dashed flex items-center justify-center text-xs" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", color: "var(--foreground-muted)" }}>
                      9:16<br/>Stories
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Exemplos */}
        <section id="exemplos" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-heading text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                Veja o que você consegue criar
              </h2>
            </div>
            
            {/* Grid de Exemplos */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {[
                { title: "Minimalist Modern", desc: "luz de janela, pele natural" },
                { title: "Vintage Cinematic", desc: "tons quentes, granulação leve" },
                { title: "Flash Paparazzi 2000s", desc: "contraste alto, brilho pontual" },
                { title: "Organic Naturalistic", desc: "verde suave, DOF real" },
                { title: "Noir Classic", desc: "preto e branco, sombra dramática" },
                { title: "Editorial Urbano", desc: "neons frios + recortes duros" }
              ].map((style, index) => (
                <div key={index} className="aspect-[3/4] rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-center p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-glass)", color: "var(--foreground-muted)" }}>
                  <div className="text-xs font-medium mb-2" style={{ color: "var(--foreground)" }}>
                    {style.title}
                  </div>
                  <div className="text-xs">
                    {style.desc}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-sm mb-12" style={{ color: "var(--foreground-muted)" }}>
              "Consistência de estilo, luz e atmosfera."
            </p>

            {/* Comparativos */}
            <div className="space-y-12">
              {/* Antes/Depois */}
              <div className="text-center">
                <h3 className="font-heading text-2xl font-semibold mb-6" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                  Antes/Depois
                </h3>
                <div className="aspect-video max-w-4xl mx-auto rounded-lg border-2 border-dashed flex items-center justify-center" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-glass)", color: "var(--foreground-muted)" }}>
                  [Slider 16:9 - Antes/Depois]<br/>
                  Comparação com controle deslizante
                </div>
                <p className="text-sm mt-4" style={{ color: "var(--foreground-muted)" }}>
                  &ldquo;Melhoria de pele, contraste e direção de luz sem perder naturalidade.&rdquo;
                </p>
              </div>

              {/* Referência/Resultado */}
              <div className="text-center">
                <h3 className="font-heading text-2xl font-semibold mb-6" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                  Referência/Resultado
                </h3>
                <div className="flex gap-6 justify-center flex-wrap">
                  {[1, 2, 3].map((pair) => (
                    <div key={pair} className="grid grid-cols-2 gap-4">
                      <div className="aspect-[3/4] w-32 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-xs relative" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", color: "var(--foreground-muted)" }}>
                        <div className="absolute top-2 left-2 px-1 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: "var(--accent-gold)", color: "#000" }}>
                          Ref
                        </div>
                        Par {pair}
                      </div>
                      <div className="aspect-[3/4] w-32 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-xs relative" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", color: "var(--foreground-muted)" }}>
                        <div className="absolute top-2 left-2 px-1 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: "var(--accent-gold)", color: "#000" }}>
                          Res
                        </div>
                        Par {pair}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm mt-4" style={{ color: "var(--foreground-muted)" }}>
                  &ldquo;Correspondência de paleta, pose e DOF.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Por que escolher */}
        <section className="py-20" style={{ backgroundColor: "var(--surface-glass)" }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-heading text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                Por que Escolher o Retrat.ai?
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Direção de arte guiada */}
              <div className="p-6 rounded-xl" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="aspect-[3/4] mb-4 rounded-lg border-2 border-dashed flex items-center justify-center text-xs" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-glass)", color: "var(--foreground-muted)" }}>
                  [Close do painel]<br/>
                  Luz/ângulo/paleta
                </div>
                <div className="w-12 h-12 mb-4 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--accent-gold-muted)" }}>
                  <Palette className="w-6 h-6" style={{ color: "var(--accent-gold)" }} />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                  Direção de Arte Guiada
                </h3>
                <p style={{ color: "var(--foreground-muted)" }}>
                  Controle preciso de luz, ângulo e paleta. Nossa IA entende direção fotográfica como um profissional.
                </p>
              </div>

              {/* Qualidade editorial */}
              <div className="p-6 rounded-xl" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="aspect-[3/4] mb-4 rounded-lg border-2 border-dashed flex items-center justify-center text-xs" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-glass)", color: "var(--foreground-muted)" }}>
                  [Retrato HD]<br/>
                  Microtexturas
                </div>
                <div className="w-12 h-12 mb-4 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--accent-gold-muted)" }}>
                  <Star className="w-6 h-6" style={{ color: "var(--accent-gold)" }} />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                  Qualidade Editorial
                </h3>
                <p style={{ color: "var(--foreground-muted)" }}>
                  Detalhes de pele, cabelo e textura que rivalizam com sessões profissionais. Sem perder naturalidade.
                </p>
              </div>

              {/* Velocidade real */}
              <div className="p-6 rounded-xl" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="aspect-video mb-4 rounded-lg border-2 border-dashed flex items-center justify-center text-xs" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-glass)", color: "var(--foreground-muted)" }}>
                  [Barra de progresso]<br/>
                  "Gerando sua imagem…"
                </div>
                <div className="w-12 h-12 mb-4 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--accent-gold-muted)" }}>
                  <Zap className="w-6 h-6" style={{ color: "var(--accent-gold)" }} />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                  Velocidade Real
                </h3>
                <p style={{ color: "var(--foreground-muted)" }}>
                  2-5 minutos do upload ao resultado final. Sem agendamentos, sem espera, sem complicação.
                </p>
              </div>

              {/* Custo sob controle */}
              <div className="p-6 rounded-xl" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="aspect-video mb-4 rounded-lg border-2 border-dashed flex items-center justify-center text-xs" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-glass)", color: "var(--foreground-muted)" }}>
                  [Card dos créditos]<br/>
                  Mensais
                </div>
                <div className="w-12 h-12 mb-4 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--accent-gold-muted)" }}>
                  <CheckCircle className="w-6 h-6" style={{ color: "var(--accent-gold)" }} />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                  Custo Sob Controle
                </h3>
                <p style={{ color: "var(--foreground-muted)" }}>
                  De R$0 a R$99/mês. Sem surpresas, sem cobranças extras inesperadas. Você escolhe quando usar premium.
                </p>
              </div>

              {/* Fluxo simples */}
              <div className="p-6 rounded-xl" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="aspect-[3/4] mb-4 rounded-lg border-2 border-dashed flex items-center justify-center text-xs" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-glass)", color: "var(--foreground-muted)" }}>
                  [Galeria por projeto]<br/>
                  Organizada
                </div>
                <div className="w-12 h-12 mb-4 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--accent-gold-muted)" }}>
                  <FolderPlus className="w-6 h-6" style={{ color: "var(--accent-gold)" }} />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                  Fluxo Simples
                </h3>
                <p style={{ color: "var(--foreground-muted)" }}>
                  Organize por projeto, tema ou cliente. Tudo fica salvo e acessível para reutilizar quando precisar.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Planos e Preços */}
        <section id="planos" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-heading text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                Planos e Preços
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Free */}
              <div className="p-6 rounded-xl" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="aspect-[3/2] mb-4 rounded-lg border-2 border-dashed flex items-center justify-center text-xs" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-glass)", color: "var(--foreground-muted)" }}>
                  [Grid 3 retratos]<br/>
                  Qualidade standard
                </div>
                <h3 className="font-heading text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                  Free
                </h3>
                <div className="text-3xl font-bold mb-4" style={{ color: "var(--accent-gold)" }}>
                  R$ 0<span className="text-base font-normal" style={{ color: "var(--foreground-muted)" }}>/mês</span>
                </div>
                <p className="text-sm mb-4" style={{ color: "var(--foreground-muted)" }}>
                  Para experimentar sem compromisso
                </p>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
                    <span>15 fotos/mês (standard)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
                    <span>Resolução padrão • marca d'água discreta</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
                    <span>Galeria por projeto e variações básicas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
                    <span>Exportação para feed e stories</span>
                  </li>
                </ul>
                <Link href="/signup" className="w-full px-4 py-2 rounded-lg font-medium text-center block transition-colors hover:opacity-90" style={{ backgroundColor: "var(--accent-gold)", color: "#000" }}>
                  Começar Grátis
                </Link>
              </div>

              {/* Pro */}
              <div className="p-6 rounded-xl relative" style={{ backgroundColor: "var(--surface)", border: "2px solid var(--accent-gold)" }}>
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "var(--accent-gold)", color: "#000" }}>
                  Mais Popular
                </div>
                <div className="aspect-[3/2] mb-4 rounded-lg border-2 border-dashed flex items-center justify-center text-xs" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-glass)", color: "var(--foreground-muted)" }}>
                  [Trio retratos HD]<br/>
                  Sem marca d'água
                </div>
                <h3 className="font-heading text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                  Pro
                </h3>
                <div className="text-3xl font-bold mb-4" style={{ color: "var(--accent-gold)" }}>
                  R$ 29<span className="text-base font-normal" style={{ color: "var(--foreground-muted)" }}>/mês</span>
                </div>
                <p className="text-sm mb-4" style={{ color: "var(--foreground-muted)" }}>
                  Para criadores que publicam toda semana
                </p>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
                    <span>120 fotos/mês (standard)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
                    <span>HD • sem marca d'água</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
                    <span>Fundo transparente + variações avançadas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
                    <span>Premium sob demanda: R$ 0,99/foto</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
                    <span>Suporte por e-mail</span>
                  </li>
                </ul>
                <Link href="/signup" className="w-full px-4 py-2 rounded-lg font-medium text-center block transition-colors hover:opacity-90" style={{ backgroundColor: "var(--accent-gold)", color: "#000" }}>
                  Assinar Pro
                </Link>
              </div>

              {/* Creator */}
              <div className="p-6 rounded-xl" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="aspect-[3/2] mb-4 rounded-lg border-2 border-dashed flex items-center justify-center text-xs" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-glass)", color: "var(--foreground-muted)" }}>
                  [Carrossel 6 imagens]<br/>
                  Premium incluído
                </div>
                <h3 className="font-heading text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                  Creator
                </h3>
                <div className="text-3xl font-bold mb-4" style={{ color: "var(--accent-gold)" }}>
                  R$ 59<span className="text-base font-normal" style={{ color: "var(--foreground-muted)" }}>/mês</span>
                </div>
                <p className="text-sm mb-4" style={{ color: "var(--foreground-muted)" }}>
                  Para quem vive de conteúdo
                </p>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
                    <span>300 fotos/mês (standard)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
                    <span>5 fotos Premium inclusas/mês</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
                    <span>HD, fundo transparente, controle fino de estilo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
                    <span>Exportações em lote (carrossel e reels)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
                    <span>Suporte prioritário</span>
                  </li>
                </ul>
                <Link href="/signup" className="w-full px-4 py-2 rounded-lg font-medium text-center block transition-colors hover:opacity-90" style={{ backgroundColor: "var(--accent-gold)", color: "#000" }}>
                  Assinar Creator
                </Link>
              </div>

              {/* Studio */}
              <div className="p-6 rounded-xl" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="aspect-[3/2] mb-4 rounded-lg border-2 border-dashed flex items-center justify-center text-xs" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-glass)", color: "var(--foreground-muted)" }}>
                  [Mosaico 2×3]<br/>
                  Selo "prioritário"
                </div>
                <h3 className="font-heading text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                  Studio
                </h3>
                <div className="text-3xl font-bold mb-4" style={{ color: "var(--accent-gold)" }}>
                  R$ 99<span className="text-base font-normal" style={{ color: "var(--foreground-muted)" }}>/mês</span>
                </div>
                <p className="text-sm mb-4" style={{ color: "var(--foreground-muted)" }}>
                  Para volumes altos e campanhas
                </p>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
                    <span>600 fotos/mês (standard)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
                    <span>20 fotos Premium inclusas/mês</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
                    <span>HD+, presets por projeto, variações em série</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
                    <span>Processamento prioritário</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
                    <span>Suporte dedicado</span>
                  </li>
                </ul>
                <Link href="/signup" className="w-full px-4 py-2 rounded-lg font-medium text-center block transition-colors hover:opacity-90" style={{ backgroundColor: "var(--accent-gold)", color: "#000" }}>
                  Assinar Studio
                </Link>
              </div>
            </div>

            {/* Notas */}
            <div className="text-center text-sm space-y-1" style={{ color: "var(--foreground-muted)" }}>
              <p>Créditos renovam mensalmente (não cumulativos). Premium extra: R$ 0,99/foto. +100 standard: R$ 6,00.</p>
              <p>Use apenas fotos e referências que você tem direito de utilizar.</p>
            </div>
          </div>
        </section>

        {/* Depoimentos */}
        <section className="py-20" style={{ backgroundColor: "var(--surface-glass)" }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-heading text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                O que nossos usuários dizem
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
              {/* Depoimento 1 */}
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full border-2 border-dashed flex items-center justify-center text-xs" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", color: "var(--foreground-muted)" }}>
                  [Retrato 1:1]<br/>
                  Editorial
                </div>
                <blockquote className="text-lg mb-4" style={{ color: "var(--foreground)" }}>
                  "Troquei minhas fotos de perfil todo mês. Ficou com cara de editorial."
                </blockquote>
                <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                  — Maria Silva, Influenciadora
                </p>
              </div>

              {/* Depoimento 2 */}
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full border-2 border-dashed flex items-center justify-center text-xs" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", color: "var(--foreground-muted)" }}>
                  [Retrato 1:1]<br/>
                  Profissional
                </div>
                <blockquote className="text-lg mb-4" style={{ color: "var(--foreground)" }}>
                  "Economizei tempo e fechei 3 jobs com o novo book."
                </blockquote>
                <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                  — João Santos, Fotógrafo
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-heading text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                Perguntas Frequentes
              </h2>
            </div>
            
            <div className="max-w-3xl mx-auto space-y-8">
              {[
                {
                  question: "Como funcionam os créditos?",
                  answer: "Cada geração usa 1 crédito standard. Premium usa a cota inclusa ou é cobrado como extra."
                },
                {
                  question: "O que é Premium?",
                  answer: "Cenas que exigem fidelidade extra de fusão/estilo. Só é cobrado quando usado."
                },
                {
                  question: "Posso cancelar ou mudar de plano?",
                  answer: "Sim, a qualquer momento. Upgrade imediato."
                },
                {
                  question: "Onde posso usar as imagens?",
                  answer: "Em redes e portfólio, desde que você tenha direito sobre as fotos enviadas e referências."
                }
              ].map((faq, index) => (
                <div key={index} className="p-6 rounded-xl" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                  <h3 className="font-heading text-xl font-semibold mb-3" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                    {faq.question}
                  </h3>
                  <p style={{ color: "var(--foreground-muted)" }}>
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20" style={{ backgroundColor: "var(--surface-glass)" }}>
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="font-heading text-4xl font-bold mb-8" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
                Pronto para criar seu primeiro retrato?
              </h2>
              
              {/* Colagem 2x2 */}
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
                {["Editorial", "Vintage", "Noir", "Naturalista"].map((style, index) => (
                  <div key={index} className="aspect-[3/4] rounded-lg border-2 border-dashed flex items-center justify-center text-xs" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", color: "var(--foreground-muted)" }}>
                    [{style}]
                  </div>
                ))}
              </div>
              <p className="text-sm mb-8" style={{ color: "var(--foreground-muted)" }}>
                "Quatro estilos de retrato lado a lado."
              </p>
              
              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup" className="px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105" style={{ backgroundColor: "var(--accent-gold)", color: "#000" }}>
                  Criar Meu Primeiro Retrato
                </Link>
                <Link href="/signup" className="px-8 py-4 rounded-lg font-semibold text-lg border transition-all hover:opacity-80" style={{ borderColor: "var(--border-glass)", color: "var(--foreground)" }}>
                  Começar Grátis
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12" style={{ borderColor: "var(--border)" }}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Camera className="w-6 h-6" style={{ color: "var(--accent-gold)" }} />
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

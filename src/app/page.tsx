"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, Sparkles, CheckCircle, Users, Zap, Star } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border-glass">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Camera className="w-8 h-8 text-accent-gold" />
              <span className="font-heading text-2xl font-bold text-foreground">
                Retrat.ai
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Entrar</Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary">Começar Grátis</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4">
        
        {/* Hero Section */}
        <section className="text-center py-20">
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Seu Book Fotográfico,<br />
            <span className="text-accent-gold">Sem Estúdio. Sem Fotógrafo.</span><br />
            Em Minutos.
          </h1>
          <p className="text-xl text-foreground-muted mb-8 max-w-3xl mx-auto leading-relaxed">
            Crie retratos hiper-realistas e editoriais a partir das suas próprias fotos.<br />
            Basta enviar uma referência de estilo e uma selfie — nós cuidamos do resto.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <Link href="/signup">
              <Button variant="primary" className="text-lg px-8 py-4">
                👉 Assinar Agora e Criar Meu Book
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-foreground-subtle">
            ✨ Teste grátis disponível no plano Free
          </p>
        </section>

        {/* Como Funciona */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold text-foreground mb-4">
              🎨 Como Funciona
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card variant="clean" className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-background">1</span>
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2">📂 Crie seu projeto</h3>
                <p className="text-foreground-muted">
                  Dê um nome e organize suas fotos
                </p>
              </CardContent>
            </Card>

            <Card variant="clean" className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-background">2</span>
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2">📸 Envie suas fotos</h3>
                <p className="text-foreground-muted">
                  Selfies, corpo inteiro, o que quiser
                </p>
              </CardContent>
            </Card>

            <Card variant="clean" className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-background">3</span>
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2">🖼️ Escolha uma referência</h3>
                <p className="text-foreground-muted">
                  Do Pinterest, revista ou editorial
                </p>
              </CardContent>
            </Card>

            <Card variant="clean" className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-background">4</span>
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2">⚡ Receba seu retrato</h3>
                <p className="text-foreground-muted">
                  Imagem realista com estilo profissional
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Para Quem */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
                🎯 Para Quem
              </h2>
              <p className="text-xl text-foreground-muted max-w-3xl mx-auto">
                Nossa plataforma é perfeita para diferentes perfis que buscam qualidade profissional
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card variant="clean" className="text-center">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-background" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-2">Modelos & Influencers</h3>
                  <p className="text-foreground-muted">
                    Crie portfólios profissionais sem custos de estúdio
                  </p>
                </CardContent>
              </Card>

              <Card variant="clean" className="text-center">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-background" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-2">Fotógrafos</h3>
                  <p className="text-foreground-muted">
                    Ofereça novos serviços aos seus clientes
                  </p>
                </CardContent>
              </Card>

              <Card variant="clean" className="text-center">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-background" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-2">Empresas</h3>
                  <p className="text-foreground-muted">
                    Retratos corporativos para equipes e materiais
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefícios */}
        <section className="py-20 bg-surface">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
                ✨ Benefícios
              </h2>
              <p className="text-xl text-foreground-muted max-w-3xl mx-auto">
                Por que escolher o Retrat.ai para seus retratos profissionais
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-background" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2">Qualidade Editorial</h3>
                <p className="text-foreground-muted">
                  Resultados comparáveis a sessões fotográficas profissionais
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-background" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2">Entrega Rápida</h3>
                <p className="text-foreground-muted">
                  Receba seus retratos em minutos, não em dias
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-background" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2">Custo-Benefício</h3>
                <p className="text-foreground-muted">
                  Até 90% mais barato que sessões fotográficas tradicionais
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-background" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2">Sem Limitações</h3>
                <p className="text-foreground-muted">
                  Gere quantos retratos quiser, quando quiser
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-background" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2">Estilos Diversos</h3>
                <p className="text-foreground-muted">
                  De editorial a lifestyle, escolha o que combina com você
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-background" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2">Fácil de Usar</h3>
                <p className="text-foreground-muted">
                  Interface intuitiva, sem necessidade de conhecimento técnico
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Planos */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
                💎 Planos
              </h2>
              <p className="text-xl text-foreground-muted max-w-3xl mx-auto">
                Escolha o plano ideal para suas necessidades
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Plano Free */}
              <Card variant="clean" className="text-center">
                <CardHeader>
                  <CardTitle className="font-heading text-2xl">Free</CardTitle>
                  <div className="text-3xl font-bold text-accent-gold">R$ 0</div>
                  <CardDescription>Para experimentar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-success mr-2" />
                      <span className="text-sm">5 gerações/mês</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-success mr-2" />
                      <span className="text-sm">Resolução HD</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-success mr-2" />
                      <span className="text-sm">Suporte por email</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Começar Grátis
                  </Button>
                </CardContent>
              </Card>

              {/* Plano Pro */}
              <Card variant="clean" className="text-center border-accent-gold">
                <CardHeader>
                  <CardTitle className="font-heading text-2xl">Pro</CardTitle>
                  <div className="text-3xl font-bold text-accent-gold">R$ 29</div>
                  <CardDescription>Para profissionais</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-success mr-2" />
                      <span className="text-sm">100 gerações/mês</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-success mr-2" />
                      <span className="text-sm">Resolução 4K</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-success mr-2" />
                      <span className="text-sm">Prioridade na fila</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-success mr-2" />
                      <span className="text-sm">Suporte prioritário</span>
                    </div>
                  </div>
                  <Button className="w-full bg-accent-gold hover:bg-accent-gold-hover text-background">
                    Assinar Pro
                  </Button>
                </CardContent>
              </Card>

              {/* Plano Creator */}
              <Card variant="clean" className="text-center">
                <CardHeader>
                  <CardTitle className="font-heading text-2xl">Creator</CardTitle>
                  <div className="text-3xl font-bold text-accent-gold">R$ 79</div>
                  <CardDescription>Para criadores</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-success mr-2" />
                      <span className="text-sm">500 gerações/mês</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-success mr-2" />
                      <span className="text-sm">Resolução 4K</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-success mr-2" />
                      <span className="text-sm">Estilos exclusivos</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-success mr-2" />
                      <span className="text-sm">API access</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Assinar Creator
                  </Button>
                </CardContent>
              </Card>

              {/* Plano Studio */}
              <Card variant="clean" className="text-center">
                <CardHeader>
                  <CardTitle className="font-heading text-2xl">Studio</CardTitle>
                  <div className="text-3xl font-bold text-accent-gold">R$ 199</div>
                  <CardDescription>Para estúdios</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-success mr-2" />
                      <span className="text-sm">Gerações ilimitadas</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-success mr-2" />
                      <span className="text-sm">Resolução 8K</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-success mr-2" />
                      <span className="text-sm">White-label</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-success mr-2" />
                      <span className="text-sm">Suporte dedicado</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Assinar Studio
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border-glass py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Camera className="w-6 h-6 text-accent-gold" />
              <span className="font-heading text-xl font-bold text-foreground">
                Retrat.ai
              </span>
            </div>
            
            <div className="flex space-x-6 text-sm text-foreground-muted">
              <Link href="/about" className="hover:text-foreground transition-colors">
                Sobre o projeto
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Termos de uso
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Política de privacidade
              </Link>
            </div>
          </div>
          
          <div className="text-center mt-8 text-sm text-foreground-subtle">
            © 2024 Retrat.ai. Direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}

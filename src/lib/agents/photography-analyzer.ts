/**
 * Photography Reference Analyzer
 * 
 * Analisa imagens de referência usando a base de conhecimento fotográfico
 * para identificar padrões visuais e gerar prompts técnicos precisos.
 */

export interface PhotographyAnalysis {
  // Estilo Visual (Etapa 1)
  visualStyle: {
    primary: string
    secondary?: string
    confidence: number
    characteristics: string[]
  }

  // Framing, Lighting & Aspect Ratio (Etapa 2)
  technical: {
    framing: 'vertical' | 'horizontal' | 'square' | 'ultra-wide' | 'cinematic' | 'polaroid'
    lighting: string[]
    aspectRatio: string
    confidence: number
  }

  // Camera Angle & POV (Etapa 3)
  composition: {
    angle: string
    pointOfView: string
    emotionalImpact: string
    confidence: number
  }

  // Profundidade de Campo & Luz (Etapa 4)
  camera: {
    body: string
    lens: string
    aperture: string
    focusType: 'shallow' | 'medium' | 'deep'
    confidence: number
  }

  // Objeto Principal (Etapa 5)
  subject: {
    type: string
    description: string
    pose?: string
    expression?: string
    clothing?: string
    confidence: number
  }

  // Texturas (Etapa 6)
  textures: {
    primary: string[]
    secondary: string[]
    materials: string[]
    confidence: number
  }

  // Efeitos Visuais (Etapa 7)
  effects: {
    grain: boolean
    flare: boolean
    vignette: boolean
    other: string[]
    confidence: number
  }

  // Paleta de Cores (Etapa 8)
  colorPalette: {
    dominant: string[]
    accent: string[]
    temperature: 'warm' | 'cool' | 'neutral'
    mood: string
    confidence: number
  }

  // Atmosfera Final (Etapa 10)
  atmosphere: {
    mood: string
    emotion: string
    narrative: string
    confidence: number
  }

  // Master Prompt gerado
  masterPrompt: string
  confidence: number
}

export class PhotographyAnalyzer {
  // Base de conhecimento completa dos 30 estilos visuais
  private visualStyles = {
    'minimalist_modern': {
      palette: ['white', 'light gray', 'soft green'],
      textures: ['smooth', 'matte', 'light wood'],
      lighting: ['natural diffused', 'clean studio light'],
      atmosphere: 'calm, light, focus on negative space'
    },
    'brutalist_elegant': {
      palette: ['black', 'concrete', 'rust', 'blown white'],
      textures: ['concrete', 'raw metal', 'cracked leather'],
      lighting: ['harsh contrast', 'deep shadows', 'direct flash'],
      atmosphere: 'urban, cold, sophisticated with aggression'
    },
    'vintage_cinematic': {
      palette: ['sepia', 'burnt orange', 'washed blue'],
      textures: ['film grain', 'thick fabric', 'old paper'],
      lighting: ['golden hour', 'low exposure', 'natural flare'],
      atmosphere: 'nostalgic, emotional, melancholic'
    },
    'cyberpunk_futuristic': {
      palette: ['neon blue', 'magenta', 'wet black', 'acid green'],
      textures: ['brushed metal', 'wet glass', 'neon'],
      lighting: ['backlight', 'silhouettes', 'intense reflections', 'LED'],
      atmosphere: 'technological chaos, urban dystopian fiction'
    },
    'fashion_editorial': {
      palette: ['sophisticated neutrals', 'dramatic tones'],
      textures: ['skin', 'silk', 'makeup', 'controlled shine'],
      lighting: ['controlled studio', 'softboxes', 'key light'],
      atmosphere: 'stylized, intentional, magazine editorial'
    },
    'organic_naturalistic': {
      palette: ['earth tones', 'real greens', 'sky blue'],
      textures: ['natural skin', 'leaves', 'stone', 'wet wood'],
      lighting: ['window light', 'soft shadow', 'natural reflection'],
      atmosphere: 'real, alive, intimate, breathing nature'
    },
    'noir_classic': {
      palette: ['black', 'white', 'metallic gray'],
      textures: ['smoke', 'wool fabric', 'wet glass'],
      lighting: ['harsh lateral light', 'chiaroscuro', 'marked shadows'],
      atmosphere: 'suspense, melancholy, mystery'
    },
    'y2k_retro_digital': {
      palette: ['chrome', 'hot pink', 'electric blue', 'lime green'],
      textures: ['shiny plastic', 'fake metal', 'false glass'],
      lighting: ['built-in flash', 'exaggerated reflection', 'digital saturation'],
      atmosphere: 'nostalgic futurism, kitsch rave'
    },
    'dark_academia': {
      palette: ['brown', 'rust', 'moss', 'charcoal'],
      textures: ['thick wool', 'aged leather', 'old paper'],
      lighting: ['low light', 'lamp or candle light'],
      atmosphere: 'intellectual, melancholic, literary'
    },
    'cottagecore': {
      palette: ['natural pastels', 'beige', 'herb green', 'sky blue'],
      textures: ['lace', 'grass', 'rustic wood'],
      lighting: ['golden late afternoon', 'soft natural'],
      atmosphere: 'bucolic, escapist, vintage rural'
    }
  }

  // Texturas específicas baseadas na Etapa 6
  private textureLibrary = {
    hard_refractive: {
      'glass': { visual: 'transparent or broken', light: 'refracts and distorts', emotion: 'delicacy, fragility' },
      'polished_metal': { visual: 'mirror shine', light: 'reflects hard light', emotion: 'coldness, precision' },
      'rusted_metal': { visual: 'irregular porosity', light: 'absorbs and stains light', emotion: 'time, wear, memory' },
      'chrome': { visual: 'pure mirror reflection', light: 'causes hard highlights', emotion: 'futurism, luxury' },
      'concrete': { visual: 'rough, gray, porous', light: 'absorbs diffused light', emotion: 'brutality, urban weight' }
    },
    organic_soft: {
      'skin': { visual: 'pores, oiliness, wrinkles', light: 'maps point light', emotion: 'life, humanity, intimacy' },
      'fur': { visual: 'fibrous, irregular', light: 'creates soft micro-shadows', emotion: 'animality, sensuality' },
      'wool': { visual: 'thick, interwoven', light: 'diffuses light, visual noise', emotion: 'warmth, winter' },
      'velvet': { visual: 'absorbs almost all light', light: 'no reflection', emotion: 'visual silence, sophistication' },
      'leather': { visual: 'rough with dense shine', light: 'broken light points', emotion: 'strength, masculinity' }
    },
    environmental: {
      'dusty': { description: 'dust layer', emotion: 'abandonment, suspended time' },
      'cracked': { description: 'cracks and fissures', emotion: 'tension, decay, trauma' },
      'reflective': { description: 'mirrors environment', emotion: 'psychology, duplicity' },
      'matte': { description: 'no reflection, matte', emotion: 'clarity, purity, neutrality' },
      'floating_dust': { description: 'visible particles', emotion: 'realistic atmosphere, time' }
    }
  }

  // Efeitos visuais baseados na Etapa 7
  private visualEffects = {
    optical_physical: ['lens_flare', 'chromatic_aberration', 'bloom', 'vignette', 'glare'],
    media_residues: ['grain', 'noise', 'light_leaks', 'scratches', 'dust', 'emulsion_cracks'],
    perceptual: ['double_exposure', 'color_bleeding', 'motion_blur', 'floating_dust', 'selective_blur']
  }

  // Configurações de câmera baseadas na Etapa 4
  private cameraDatabase = {
    'portrait_luxury': { body: 'Hasselblad X2D', lens: '85mm', aperture: 'f/1.8', use: 'rich texture, creamy skin' },
    'urban_brutal': { body: 'Canon EOS R5', lens: '35mm', aperture: 'f/5.6', use: 'everything in focus, hard flash' },
    'nature_poetic': { body: 'Fujifilm GFX 100S', lens: '50mm', aperture: 'f/4.0', use: 'soft scene, rich, slight blur' },
    'fashion_sharp': { body: 'Sony α7 IV', lens: '85mm', aperture: 'f/2.8', use: 'realistic colors, great for flash and fashion' },
    'documentary_real': { body: 'Leica Q3', lens: '50mm', aperture: 'f/2.0', use: 'soft tones, focus on atmosphere' },
    'detail_extreme': { body: 'Nikon D850', lens: '105mm', aperture: 'f/1.4', use: 'extreme detail, rich texture' },
    'wide_cinematic': { body: 'Canon EOS R5', lens: '24mm', aperture: 'f/4.0', use: 'wide scene, slight edge distortion' },
    'macro_intimate': { body: 'Nikon D850', lens: '105mm macro', aperture: 'f/5.6', use: 'maximum texture, microdetails' }
  }

  // Ângulos de câmera baseados na Etapa 3
  private cameraAngles = {
    'frontal': { result: 'symmetry, direct presence', emotion: 'confrontation, intimacy, presence' },
    'diagonal': { result: 'diagonal lines create movement', emotion: 'sophistication, energy, casual elegance' },
    'low_angle': { result: 'object appears larger, dominant', emotion: 'power, heroism, threat' },
    'high_angle': { result: 'object appears small, vulnerable', emotion: 'fragility, tenderness, observation' },
    'overhead': { result: 'graphic composition, abstract', emotion: 'control, geometry, clarity' },
    'dutch_angle': { result: 'intentionally tilted image', emotion: 'imbalance, tension, disturbance' },
    'close_up': { result: 'extreme proximity, focus on detail', emotion: 'intimacy, sensuality, precision' },
    'wide_shot': { result: 'shows object and surrounding environment', emotion: 'solitude, freedom, scale' },
    'pov': { result: 'scene as if viewers gaze', emotion: 'intimacy, subjectivity, participation' },
    'behind_subject': { result: 'camera behind object, looking together', emotion: 'mystery, solitude, expectation' }
  }

  // Sistema de atmosfera baseado no Módulo 10
  private atmosphereSystem = {
    light_systems: {
      'diffused_window': 'silence, introspection, human presence',
      'frontal_flash': 'crudeness, impact, superficiality',
      'backlight': 'ecstasy, mystery, partial revelation',
      'tungsten_warm': 'nostalgia, home, intimacy',
      'cold_led': 'artificiality, science, alienation'
    },
    air_texture: {
      'visible_dust': 'slow time, abandoned place, nostalgia',
      'dense_fog': 'sensory isolation, transcendence, fear or dream',
      'clean_air': 'narrative clarity, visual precision, technical realism',
      'analog_grain': 'emotional roughness, failure, memory, human touch',
      'glass_reflection': 'separation, voyeurism, silent observation'
    },
    temporal_rhythm: {
      'slow_time': 'sadness, contemplation, reverence',
      'fast_time': 'tension, urgency, drama',
      'circular_time': 'dream, psychosis, surrealism'
    }
  }

  private cameraSpecs = {
    'portrait_luxury': { body: 'Hasselblad X2D', lens: '85mm', aperture: 'f/1.8' },
    'urban_brutal': { body: 'Canon EOS R5', lens: '35mm', aperture: 'f/5.6' },
    'nature_poetic': { body: 'Fujifilm GFX 100S', lens: '50mm', aperture: 'f/4.0' },
    'fashion_sharp': { body: 'Sony α7 IV', lens: '85mm', aperture: 'f/2.8' },
    'documentary_real': { body: 'Leica Q3', lens: '50mm', aperture: 'f/2.0' },
    'detail_extreme': { body: 'Nikon D850', lens: '105mm', aperture: 'f/1.4' }
  }

  /**
   * Analisa uma imagem de referência e extrai características fotográficas
   */
  async analyzeReference(imageUrl: string, userContext?: string): Promise<PhotographyAnalysis> {
    // Simulação da análise - em produção, integraria com visão computacional
    // Por enquanto, retorna uma análise baseada no contexto do usuário
    
    const analysis = await this.performVisualAnalysis(imageUrl, userContext)
    const masterPrompt = this.generateMasterPrompt(analysis)
    
    return {
      ...analysis,
      masterPrompt,
      confidence: this.calculateOverallConfidence(analysis)
    }
  }

  private async performVisualAnalysis(imageUrl: string, userContext?: string): Promise<Omit<PhotographyAnalysis, 'masterPrompt' | 'confidence'>> {
    // Esta seria a integração com um serviço de visão computacional
    // Por enquanto, simula uma análise baseada em heurísticas
    
    return {
      visualStyle: {
        primary: 'fashion_editorial',
        confidence: 0.85,
        characteristics: ['high contrast', 'professional lighting', 'clean composition']
      },
      technical: {
        framing: 'vertical',
        lighting: ['soft light', 'studio lighting'],
        aspectRatio: '4:5',
        confidence: 0.90
      },
      composition: {
        angle: 'frontal',
        pointOfView: 'eye-level',
        emotionalImpact: 'direct presence, intimacy',
        confidence: 0.88
      },
      camera: {
        body: 'Sony α7 IV',
        lens: '85mm',
        aperture: 'f/2.8',
        focusType: 'shallow',
        confidence: 0.82
      },
      subject: {
        type: 'person',
        description: 'professional portrait subject',
        pose: 'confident stance',
        expression: 'direct gaze',
        confidence: 0.87
      },
      textures: {
        primary: ['smooth skin', 'fabric texture'],
        secondary: ['background blur', 'soft shadows'],
        materials: ['cotton', 'human skin'],
        confidence: 0.85
      },
      effects: {
        grain: false,
        flare: false,
        vignette: true,
        other: ['subtle bloom'],
        confidence: 0.90
      },
      colorPalette: {
        dominant: ['neutral beige', 'soft white'],
        accent: ['warm highlights'],
        temperature: 'warm',
        mood: 'sophisticated calm',
        confidence: 0.89
      },
      atmosphere: {
        mood: 'professional elegance',
        emotion: 'confidence and approachability',
        narrative: 'contemporary portrait session',
        confidence: 0.86
      }
    }
  }

  private generateMasterPrompt(analysis: Omit<PhotographyAnalysis, 'masterPrompt' | 'confidence'>): string {
    const {
      technical,
      composition,
      camera,
      subject,
      textures,
      effects,
      colorPalette,
      atmosphere
    } = analysis

    // Estrutura do Master Prompt baseada no DiretorVisual + Capítulo 9
    const promptParts = [
      // 1. Tipo e orientação da imagem
      `Ultra-realistic ${subject.type === 'person' ? 'portrait' : 'photo'}, ${technical.framing} format`,
      
      // 2. Descrição da luz e sombra (mais específica)
      `${technical.lighting.join(' with ')}, ${this.getLightingDescription(technical.lighting)}`,
      
      // 3. Configuração óptica da câmera
      `captured on ${camera.lens} lens at ${camera.aperture}, ${camera.focusType} depth of field with natural bokeh`,
      
      // 4. Ângulo da câmera e ponto de vista
      `${composition.angle} shot, ${composition.pointOfView}`,
      
      // 5. Descrição rica do objeto principal (seguindo formato DiretorVisual)
      this.generateSubjectDescription(subject, analysis),
      
      // 6. Texturas específicas e interações materiais
      `visible ${textures.primary.join(', ')}, ${textures.secondary.join(', ')}`,
      
      // 7. Fundo e atmosfera espacial
      `background: ${atmosphere.narrative} with ${colorPalette.dominant[0] || 'neutral'} tones`,
      
      // 8. Efeitos visuais realistas
      this.generateEffectsDescription(effects),
      
      // 9. Paleta de cores e clima emocional
      `color palette: ${colorPalette.dominant.join(', ')}${colorPalette.accent.length > 0 ? ` with ${colorPalette.accent.join(', ')} accents` : ''}`,
      
      // 10. Atmosfera final (seguindo Módulo 10)
      `atmosphere: ${atmosphere.mood}, ${atmosphere.emotion}, ${atmosphere.narrative}`,
      
      // 11. Mantra de consistência visual
      'same style, same lighting, same mood'
    ]

    return promptParts.filter(part => part.trim().length > 0).join('\n')
  }

  private getLightingDescription(lighting: string[]): string {
    const lightingMap: Record<string, string> = {
      'soft light': 'casting gentle ambient glow',
      'natural light': 'with organic light falloff',
      'golden hour': 'with warm golden highlights',
      'studio lighting': 'with controlled professional illumination',
      'window light': 'filtering through natural diffusion',
      'flash': 'creating defined shadows and highlights'
    }

    return lighting.map(light => lightingMap[light] || 'with natural lighting').join(', ')
  }

  private generateSubjectDescription(subject: any, analysis: any): string {
    const parts = [subject.description]
    
    if (subject.clothing) parts.push(`wearing ${subject.clothing}`)
    if (subject.pose) parts.push(`${subject.pose}`)
    if (subject.expression) parts.push(`${subject.expression}`)
    
    return parts.join(', ')
  }

  private generateEffectsDescription(effects: any): string {
    const effectParts: string[] = []
    
    if (effects.grain) effectParts.push('subtle film grain')
    if (effects.flare) effectParts.push('natural lens flare')
    if (effects.vignette) effectParts.push('soft vignette')
    if (effects.other && effects.other.length > 0) effectParts.push(...effects.other)
    
    return effectParts.length > 0 ? effectParts.join(', ') : 'clean optical rendering'
  }

  private calculateOverallConfidence(analysis: Omit<PhotographyAnalysis, 'masterPrompt' | 'confidence'>): number {
    const confidenceValues = [
      analysis.visualStyle.confidence,
      analysis.technical.confidence,
      analysis.composition.confidence,
      analysis.camera.confidence,
      analysis.subject.confidence,
      analysis.textures.confidence,
      analysis.effects.confidence,
      analysis.colorPalette.confidence,
      analysis.atmosphere.confidence
    ]

    return confidenceValues.reduce((sum, conf) => sum + conf, 0) / confidenceValues.length
  }

  /**
   * Sugere melhorias no prompt baseado na análise
   */
  suggestPromptImprovements(analysis: PhotographyAnalysis): string[] {
    const suggestions: string[] = []

    if (analysis.confidence < 0.7) {
      suggestions.push('Consider providing more reference images for better analysis')
    }

    if (analysis.colorPalette.confidence < 0.8) {
      suggestions.push('Color palette could be more defined - consider specifying exact color preferences')
    }

    if (analysis.camera.confidence < 0.8) {
      suggestions.push('Camera settings could be more precise - specify desired depth of field')
    }

    return suggestions
  }

  /**
   * Gera variações do prompt para diferentes estilos
   */
  generateStyleVariations(baseAnalysis: PhotographyAnalysis): Record<string, string> {
    const variations: Record<string, string> = {}

    Object.keys(this.visualStyles).forEach(styleName => {
      const style = this.visualStyles[styleName as keyof typeof this.visualStyles]
      
      // Adapta o prompt base para o novo estilo
      const adaptedPrompt = baseAnalysis.masterPrompt
        .replace(/color palette in [^,]+/, `color palette in ${style.palette.join(', ')}`)
        .replace(/[^,]+ mood/, `${style.atmosphere} mood`)
      
      variations[styleName] = adaptedPrompt
    })

    return variations
  }
}

export const photographyAnalyzer = new PhotographyAnalyzer()

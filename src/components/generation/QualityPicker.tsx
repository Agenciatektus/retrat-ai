'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Zap, Crown, Gauge, Info } from 'lucide-react'
import { ADDON_PRICES_BRL, formatBRL, getEngineDisplayName, getEngineDescription } from '@/lib/pricing'
import { type QualityLevel } from '@/lib/engines'

interface QualityOption {
  key: QualityLevel
  label: string
  description: string
  price?: number
  icon: React.ReactNode
  popular?: boolean
  included?: boolean
}

const QUALITY_OPTIONS: QualityOption[] = [
  {
    key: 'standard',
    label: 'Standard',
    description: 'Qualidade padrão SDXL, ideal para a maioria dos casos',
    icon: <Gauge className="h-4 w-4" />,
    included: true
  },
  {
    key: 'fast',
    label: 'Fast',
    description: 'Geração rápida com Imagen-4, resultados em ~10 segundos',
    price: ADDON_PRICES_BRL.fast,
    icon: <Zap className="h-4 w-4" />,
    popular: true
  },
  {
    key: 'premium',
    label: 'Premium',
    description: 'Máxima qualidade fotorrealística com Imagen-4',
    price: ADDON_PRICES_BRL.premium,
    icon: <Crown className="h-4 w-4" />
  }
]

interface QualityPickerProps {
  selectedQuality: QualityLevel
  onQualityChange: (quality: QualityLevel) => void
  useKontext: boolean
  onKontextChange: (useKontext: boolean) => void
  disabled?: boolean
  showKontextOption?: boolean
  userPlan?: string
  premiumCreditsAvailable?: number
  className?: string
}

export function QualityPicker({
  selectedQuality,
  onQualityChange,
  useKontext,
  onKontextChange,
  disabled = false,
  showKontextOption = true,
  userPlan = 'free',
  premiumCreditsAvailable = 0,
  className = ''
}: QualityPickerProps) {
  const handleQualitySelect = (quality: QualityLevel) => {
    if (disabled) return
    onQualityChange(quality)
  }

  const getPriceDisplay = (option: QualityOption) => {
    if (option.included) {
      return <Badge variant="secondary">Incluso</Badge>
    }

    if (option.key === 'premium' && premiumCreditsAvailable > 0) {
      return (
        <div className="text-xs text-green-600">
          {premiumCreditsAvailable} disponível{premiumCreditsAvailable > 1 ? 's' : ''}
        </div>
      )
    }

    if (option.price) {
      return (
        <div className="text-sm font-medium text-orange-600">
          +{formatBRL(option.price)}
        </div>
      )
    }

    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold mb-2">Qualidade de Geração</h3>
        <p className="text-sm text-gray-600 mb-4">
          Escolha a qualidade desejada para sua geração
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {QUALITY_OPTIONS.map((option) => (
            <Card
              key={option.key}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedQuality === option.key
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:border-gray-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleQualitySelect(option.key)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {option.icon}
                    <span className="font-medium">{option.label}</span>
                    {option.popular && (
                      <Badge variant="default" className="text-xs">
                        Popular
                      </Badge>
                    )}
                  </div>
                  {getPriceDisplay(option)}
                </div>

                <p className="text-sm text-gray-600 mb-3">
                  {option.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="quality"
                      value={option.key}
                      checked={selectedQuality === option.key}
                      onChange={() => handleQualitySelect(option.key)}
                      disabled={disabled}
                      className="text-blue-600"
                    />
                  </div>

                  {option.key === 'premium' && option.price && (
                    <div className="text-xs text-gray-500">
                      ~60s
                    </div>
                  )}
                  {option.key === 'fast' && (
                    <div className="text-xs text-gray-500">
                      ~10s
                    </div>
                  )}
                  {option.key === 'standard' && (
                    <div className="text-xs text-gray-500">
                      ~30s
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Kontext Option */}
      {showKontextOption && (
        <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <Checkbox
              id="use-kontext"
              checked={useKontext}
              onCheckedChange={(checked) => onKontextChange(!!checked)}
              disabled={disabled}
            />
            <div className="flex-1">
              <label
                htmlFor="use-kontext"
                className="text-sm font-medium cursor-pointer"
              >
                Edição de texto/contexto complexo (Kontext)
              </label>
              <p className="text-xs text-gray-600 mt-1">
                Especializado em textos, placas e contexto complexo. 
                {premiumCreditsAvailable > 0 
                  ? ` Usa 1 crédito premium (${premiumCreditsAvailable} disponível${premiumCreditsAvailable > 1 ? 's' : ''}).`
                  : ` Requer pagamento adicional de ${formatBRL(ADDON_PRICES_BRL.premium)}.`
                }
              </p>
            </div>
            <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
          </div>
        </div>
      )}

      {/* Pricing Summary */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Custo estimado:</span>
          <span className="font-medium">
            {selectedQuality === 'standard' && 'Incluso no plano'}
            {selectedQuality === 'fast' && formatBRL(ADDON_PRICES_BRL.fast)}
            {selectedQuality === 'premium' && (
              premiumCreditsAvailable > 0 
                ? 'Crédito premium incluso'
                : formatBRL(ADDON_PRICES_BRL.premium)
            )}
            {useKontext && selectedQuality !== 'premium' && (
              ` + ${premiumCreditsAvailable > 0 
                ? 'crédito premium'
                : formatBRL(ADDON_PRICES_BRL.premium)
              }`
            )}
          </span>
        </div>

        {(selectedQuality !== 'standard' || useKontext) && (
          <div className="mt-2 text-xs text-gray-500">
            <Info className="h-3 w-3 inline mr-1" />
            {selectedQuality !== 'standard' && premiumCreditsAvailable === 0 && (
              'Pagamento será solicitado antes da geração. '
            )}
            Cancelável a qualquer momento.
          </div>
        )}
      </div>
    </div>
  )
}

export default QualityPicker

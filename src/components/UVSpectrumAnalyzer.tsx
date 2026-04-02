import { useEffect, useRef, useState } from 'react'
import type { UVSpectrumReading } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sun, Warning } from '@phosphor-icons/react'

interface UVSpectrumAnalyzerProps {
  readings: UVSpectrumReading[]
  isRecording?: boolean
  className?: string
}

export function UVSpectrumAnalyzer({ readings, isRecording, className }: UVSpectrumAnalyzerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [latestReading, setLatestReading] = useState<UVSpectrumReading | null>(null)

  useEffect(() => {
    if (readings.length > 0) {
      setLatestReading(readings[readings.length - 1])
    }
  }, [readings])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !latestReading) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height
    const padding = 40

    ctx.clearRect(0, 0, width, height)

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, width, height)

    const wavelengths = latestReading.wavelengths
    const intensities = latestReading.intensities

    if (wavelengths.length === 0) return

    const minWavelength = Math.min(...wavelengths)
    const maxWavelength = Math.max(...wavelengths)
    const maxIntensity = Math.max(...intensities)

    const gradient = ctx.createLinearGradient(padding, 0, width - padding, 0)
    gradient.addColorStop(0, '#8b5cf6')
    gradient.addColorStop(0.5, '#6366f1')
    gradient.addColorStop(1, '#3b82f6')

    ctx.strokeStyle = gradient
    ctx.lineWidth = 2
    ctx.beginPath()

    wavelengths.forEach((wavelength, i) => {
      const x = padding + ((wavelength - minWavelength) / (maxWavelength - minWavelength)) * (width - padding * 2)
      const y = height - padding - (intensities[i] / maxIntensity) * (height - padding * 2)

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    ctx.fillStyle = gradient
    ctx.globalAlpha = 0.2
    ctx.lineTo(width - padding, height - padding)
    ctx.lineTo(padding, height - padding)
    ctx.closePath()
    ctx.fill()
    ctx.globalAlpha = 1

    if (latestReading.peakWavelength) {
      const peakX = padding + ((latestReading.peakWavelength - minWavelength) / (maxWavelength - minWavelength)) * (width - padding * 2)
      ctx.strokeStyle = '#fbbf24'
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(peakX, padding)
      ctx.lineTo(peakX, height - padding)
      ctx.stroke()
      ctx.setLineDash([])
    }

    ctx.fillStyle = '#9ca3af'
    ctx.font = '11px JetBrains Mono, monospace'
    ctx.textAlign = 'center'
    ctx.fillText(`${minWavelength.toFixed(0)} nm`, padding, height - 10)
    ctx.fillText(`${maxWavelength.toFixed(0)} nm`, width - padding, height - 10)
    
    ctx.save()
    ctx.translate(15, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Intensity', 0, 0)
    ctx.restore()

    if (isRecording) {
      ctx.fillStyle = '#ef4444'
      ctx.beginPath()
      ctx.arc(width - 20, 20, 5, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [latestReading, isRecording])

  const getUVIndexColor = (index?: number) => {
    if (!index) return 'secondary'
    if (index < 3) return 'default'
    if (index < 6) return 'default'
    if (index < 8) return 'destructive'
    if (index < 11) return 'destructive'
    return 'destructive'
  }

  const getUVIndexLabel = (index?: number) => {
    if (!index) return 'N/A'
    if (index < 3) return 'Low'
    if (index < 6) return 'Moderate'
    if (index < 8) return 'High'
    if (index < 11) return 'Very High'
    return 'Extreme'
  }

  return (
    <Card className={`p-4 bg-card border-border ${className || ''}`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun size={20} weight="fill" className="text-accent" />
            <h3 className="font-semibold text-sm">UV Spectrum</h3>
          </div>
          <div className="flex items-center gap-2">
            {latestReading?.anomalyDetected && (
              <Badge variant="destructive" className="gap-1 text-xs">
                <Warning size={14} weight="fill" />
                Anomaly
              </Badge>
            )}
            <Badge variant="secondary" className="font-mono text-xs">
              {readings.length} samples
            </Badge>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          className="w-full h-48 rounded border border-border"
          style={{ imageRendering: 'crisp-edges' }}
        />

        {latestReading && (
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-muted rounded px-2 py-1">
              <div className="text-muted-foreground">UV Index</div>
              <div className="font-semibold flex items-center gap-1">
                {latestReading.uvIndex?.toFixed(1) || 'N/A'}
                <span className="text-muted-foreground">({getUVIndexLabel(latestReading.uvIndex)})</span>
              </div>
            </div>
            <div className="bg-muted rounded px-2 py-1">
              <div className="text-muted-foreground">Peak λ</div>
              <div className="font-semibold">{latestReading.peakWavelength?.toFixed(1) || 'N/A'} nm</div>
            </div>
            <div className="bg-muted rounded px-2 py-1">
              <div className="text-muted-foreground">UVA</div>
              <div className="font-semibold">{latestReading.uvaIntensity.toFixed(2)} W/m²</div>
            </div>
            <div className="bg-muted rounded px-2 py-1">
              <div className="text-muted-foreground">UVB</div>
              <div className="font-semibold">{latestReading.uvbIntensity.toFixed(2)} W/m²</div>
            </div>
            <div className="bg-muted rounded px-2 py-1 col-span-2">
              <div className="text-muted-foreground">UVC</div>
              <div className="font-semibold">{latestReading.uvcIntensity.toFixed(2)} W/m²</div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

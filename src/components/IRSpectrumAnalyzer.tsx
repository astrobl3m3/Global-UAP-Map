import { useEffect, useRef, useState } from 'react'
import type { IRSpectrumReading } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Thermometer, Warning } from '@phosphor-icons/react'

interface IRSpectrumAnalyzerProps {
  readings: IRSpectrumReading[]
  isRecording?: boolean
  className?: string
}

export function IRSpectrumAnalyzer({ readings, isRecording, className }: IRSpectrumAnalyzerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [latestReading, setLatestReading] = useState<IRSpectrumReading | null>(null)

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

    ctx.strokeStyle = '#ef4444'
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

  return (
    <Card className={`p-4 bg-card border-border ${className || ''}`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Thermometer size={20} weight="fill" className="text-destructive" />
            <h3 className="font-semibold text-sm">IR Spectrum</h3>
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
              <div className="text-muted-foreground">Peak λ</div>
              <div className="font-semibold">{latestReading.peakWavelength?.toFixed(1) || 'N/A'} nm</div>
            </div>
            <div className="bg-muted rounded px-2 py-1">
              <div className="text-muted-foreground">Total Irradiance</div>
              <div className="font-semibold">{latestReading.totalIrradiance.toFixed(2)} W/m²</div>
            </div>
            {latestReading.temperature !== undefined && (
              <div className="bg-muted rounded px-2 py-1 col-span-2">
                <div className="text-muted-foreground">Temperature (calculated)</div>
                <div className="font-semibold">{latestReading.temperature.toFixed(1)}°C</div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Waveform, SpeakerHigh } from '@phosphor-icons/react'

interface LiveAudioSpectrumProps {
  stream: MediaStream | null
  isActive: boolean
}

export function LiveAudioSpectrum({ stream, isActive }: LiveAudioSpectrumProps) {
  const [frequencyData, setFrequencyData] = useState<Uint8Array>(new Uint8Array(0))
  const [dominantFrequency, setDominantFrequency] = useState<number>(0)
  const [peakLevel, setPeakLevel] = useState<number>(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (stream && isActive) {
      startAnalysis()
    } else {
      stopAnalysis()
    }

    return () => {
      stopAnalysis()
    }
  }, [stream, isActive])

  const startAnalysis = () => {
    if (!stream) return

    try {
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)

      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.8
      analyser.minDecibels = -90
      analyser.maxDecibels = -10

      source.connect(analyser)

      audioContextRef.current = audioContext
      analyserRef.current = analyser

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      setFrequencyData(dataArray)

      updateVisualization()
    } catch (error) {
      console.error('Error starting audio analysis:', error)
    }
  }

  const stopAnalysis = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    analyserRef.current = null
  }

  const updateVisualization = () => {
    if (!analyserRef.current) return

    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    analyser.getByteFrequencyData(dataArray)
    setFrequencyData(new Uint8Array(dataArray))

    const maxIndex = dataArray.indexOf(Math.max(...dataArray))
    const sampleRate = audioContextRef.current?.sampleRate || 44100
    const frequency = (maxIndex * sampleRate) / (2 * bufferLength)
    setDominantFrequency(frequency)

    const peak = Math.max(...dataArray) / 255
    setPeakLevel(peak)

    drawSpectrum(dataArray)

    animationFrameRef.current = requestAnimationFrame(updateVisualization)
  }

  const drawSpectrum = (dataArray: Uint8Array) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const barWidth = (width / dataArray.length) * 2.5

    ctx.clearRect(0, 0, width, height)

    const gradient = ctx.createLinearGradient(0, height, 0, 0)
    gradient.addColorStop(0, 'oklch(0.75 0.15 200 / 0.2)')
    gradient.addColorStop(0.3, 'oklch(0.75 0.15 200 / 0.5)')
    gradient.addColorStop(0.7, 'oklch(0.75 0.15 200 / 0.8)')
    gradient.addColorStop(1, 'oklch(0.75 0.15 200)')

    let x = 0

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * height

      ctx.fillStyle = gradient
      ctx.fillRect(x, height - barHeight, barWidth, barHeight)

      x += barWidth + 1
    }

    ctx.strokeStyle = 'oklch(0.75 0.15 200)'
    ctx.lineWidth = 2
    ctx.beginPath()

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * height
      const barX = i * (barWidth + 1) + barWidth / 2
      const barY = height - barHeight

      if (i === 0) {
        ctx.moveTo(barX, barY)
      } else {
        ctx.lineTo(barX, barY)
      }
    }

    ctx.stroke()
  }

  const frequencyToNote = (freq: number): string => {
    if (freq < 20) return ''
    
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    const a4 = 440
    const c0 = a4 * Math.pow(2, -4.75)
    
    const halfSteps = Math.round(12 * Math.log2(freq / c0))
    const octave = Math.floor(halfSteps / 12)
    const note = notes[halfSteps % 12]
    
    return `${note}${octave}`
  }

  if (!isActive) {
    return null
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-accent/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Waveform size={18} weight="fill" className="text-accent" />
          Live Audio Spectrum
        </CardTitle>
        <CardDescription className="text-xs">
          Real-time frequency analysis during recording
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <canvas
            ref={canvasRef}
            width={600}
            height={120}
            className="w-full h-[120px] rounded-lg border border-border bg-background/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-secondary/30 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-1">
              <SpeakerHigh size={14} weight="fill" className="text-accent" />
              <span className="text-xs text-muted-foreground">Dominant Freq</span>
            </div>
            <div className="font-mono text-sm font-medium">
              {dominantFrequency > 20 ? (
                <>
                  {dominantFrequency.toFixed(1)} Hz
                  {frequencyToNote(dominantFrequency) && (
                    <span className="text-xs text-muted-foreground ml-2">
                      ({frequencyToNote(dominantFrequency)})
                    </span>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground">--</span>
              )}
            </div>
          </div>

          <div className="p-3 bg-secondary/30 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Peak Level</span>
              <Badge 
                variant={peakLevel > 0.9 ? 'destructive' : peakLevel > 0.7 ? 'default' : 'secondary'}
                className="text-xs h-5 px-2"
              >
                {peakLevel > 0.9 ? 'CLIP' : peakLevel > 0.7 ? 'HIGH' : 'OK'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-100 ${
                    peakLevel > 0.9 
                      ? 'bg-destructive' 
                      : peakLevel > 0.7 
                        ? 'bg-accent' 
                        : 'bg-success'
                  }`}
                  style={{ width: `${peakLevel * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono w-10 text-right">
                {(peakLevel * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center pt-1">
          {frequencyData.length} frequency bins • FFT size: {analyserRef.current?.fftSize || 2048}
        </div>
      </CardContent>
    </Card>
  )
}

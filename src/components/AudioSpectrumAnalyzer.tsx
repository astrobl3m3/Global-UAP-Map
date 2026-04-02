import { useEffect, useRef, useState } from 'react'
import type { MediaFile } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Waveform, ChartBar, SpeakerHigh } from '@phosphor-icons/react'

interface AudioSpectrumAnalyzerProps {
  audio: MediaFile
}

interface FrequencyPeak {
  frequency: number
  magnitude: number
  note?: string
}

export function AudioSpectrumAnalyzer({ audio }: AudioSpectrumAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [spectrumData, setSpectrumData] = useState<number[]>([])
  const [frequencyBands, setFrequencyBands] = useState<{ label: string; value: number }[]>([])
  const [dominantFrequencies, setDominantFrequencies] = useState<FrequencyPeak[]>([])
  const [fundamentalFrequency, setFundamentalFrequency] = useState<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const barsCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    analyzeAudio()
  }, [audio])

  useEffect(() => {
    if (spectrumData.length > 0) {
      drawSpectrum()
      drawFrequencyBars()
    }
  }, [spectrumData])

  const analyzeAudio = async () => {
    if (isAnalyzing) return

    setIsAnalyzing(true)

    try {
      const response = await fetch(audio.url)
      const arrayBuffer = await response.arrayBuffer()
      const audioContext = new AudioContext()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      )

      const source = offlineContext.createBufferSource()
      source.buffer = audioBuffer

      const analyser = offlineContext.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.8

      source.connect(analyser)
      analyser.connect(offlineContext.destination)

      const frequencyData = new Uint8Array(analyser.frequencyBinCount)
      
      const channelData = audioBuffer.getChannelData(0)
      const sampleRate = audioBuffer.sampleRate
      const fftSize = 2048
      const hopSize = fftSize / 4
      
      let maxMagnitudes = new Float32Array(analyser.frequencyBinCount)
      
      for (let i = 0; i < channelData.length - fftSize; i += hopSize) {
        const segment = channelData.slice(i, i + fftSize)
        const spectrum = performFFT(segment, sampleRate)
        
        for (let j = 0; j < spectrum.length && j < maxMagnitudes.length; j++) {
          maxMagnitudes[j] = Math.max(maxMagnitudes[j], spectrum[j])
        }
      }

      const normalizedSpectrum = Array.from(maxMagnitudes).map(v => v)
      setSpectrumData(normalizedSpectrum)

      const peaks = findPeaks(normalizedSpectrum, sampleRate, analyser.frequencyBinCount)
      setDominantFrequencies(peaks.slice(0, 10))

      if (peaks.length > 0) {
        setFundamentalFrequency(peaks[0].frequency)
      }

      const bands = calculateFrequencyBands(normalizedSpectrum, sampleRate, analyser.frequencyBinCount)
      setFrequencyBands(bands)

      await audioContext.close()
    } catch (error) {
      console.error('Error analyzing audio:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const performFFT = (signal: Float32Array, sampleRate: number): Float32Array => {
    const n = signal.length
    const magnitude = new Float32Array(n / 2)

    for (let k = 0; k < n / 2; k++) {
      let real = 0
      let imag = 0

      for (let t = 0; t < n; t++) {
        const angle = (2 * Math.PI * k * t) / n
        real += signal[t] * Math.cos(angle)
        imag -= signal[t] * Math.sin(angle)
      }

      magnitude[k] = Math.sqrt(real * real + imag * imag) / n
    }

    return magnitude
  }

  const findPeaks = (spectrum: number[], sampleRate: number, binCount: number): FrequencyPeak[] => {
    const peaks: FrequencyPeak[] = []
    const threshold = Math.max(...spectrum) * 0.1

    for (let i = 1; i < spectrum.length - 1; i++) {
      if (
        spectrum[i] > threshold &&
        spectrum[i] > spectrum[i - 1] &&
        spectrum[i] > spectrum[i + 1]
      ) {
        const frequency = (i * sampleRate) / (2 * binCount)
        peaks.push({
          frequency,
          magnitude: spectrum[i],
          note: frequencyToNote(frequency),
        })
      }
    }

    return peaks.sort((a, b) => b.magnitude - a.magnitude)
  }

  const frequencyToNote = (freq: number): string => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    const a4 = 440
    const c0 = a4 * Math.pow(2, -4.75)
    
    if (freq < 20 || freq > 20000) return ''
    
    const halfSteps = Math.round(12 * Math.log2(freq / c0))
    const octave = Math.floor(halfSteps / 12)
    const note = notes[halfSteps % 12]
    
    return `${note}${octave}`
  }

  const calculateFrequencyBands = (
    spectrum: number[],
    sampleRate: number,
    binCount: number
  ): { label: string; value: number }[] => {
    const bands = [
      { label: 'Sub-bass (20-60 Hz)', range: [20, 60] },
      { label: 'Bass (60-250 Hz)', range: [60, 250] },
      { label: 'Low Mids (250-500 Hz)', range: [250, 500] },
      { label: 'Mids (500-2k Hz)', range: [500, 2000] },
      { label: 'Upper Mids (2k-4k Hz)', range: [2000, 4000] },
      { label: 'Presence (4k-6k Hz)', range: [4000, 6000] },
      { label: 'Brilliance (6k-20k Hz)', range: [6000, 20000] },
    ]

    return bands.map(({ label, range }) => {
      const startBin = Math.floor((range[0] * 2 * binCount) / sampleRate)
      const endBin = Math.floor((range[1] * 2 * binCount) / sampleRate)
      
      let sum = 0
      for (let i = startBin; i < endBin && i < spectrum.length; i++) {
        sum += spectrum[i]
      }
      
      const average = sum / (endBin - startBin)
      return { label, value: average }
    })
  }

  const drawSpectrum = () => {
    const canvas = canvasRef.current
    if (!canvas || spectrumData.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const barWidth = width / spectrumData.length

    ctx.clearRect(0, 0, width, height)

    const gradient = ctx.createLinearGradient(0, height, 0, 0)
    gradient.addColorStop(0, 'oklch(0.75 0.15 200 / 0.3)')
    gradient.addColorStop(0.5, 'oklch(0.75 0.15 200 / 0.7)')
    gradient.addColorStop(1, 'oklch(0.75 0.15 200)')

    ctx.fillStyle = gradient

    const maxValue = Math.max(...spectrumData)
    
    spectrumData.forEach((value, index) => {
      const normalizedValue = maxValue > 0 ? value / maxValue : 0
      const barHeight = normalizedValue * height * 0.9
      const x = index * barWidth
      const y = height - barHeight

      ctx.fillRect(x, y, barWidth - 1, barHeight)
    })

    ctx.strokeStyle = 'oklch(0.75 0.15 200)'
    ctx.lineWidth = 2
    ctx.beginPath()
    
    spectrumData.forEach((value, index) => {
      const normalizedValue = maxValue > 0 ? value / maxValue : 0
      const x = index * barWidth + barWidth / 2
      const y = height - normalizedValue * height * 0.9

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    
    ctx.stroke()
  }

  const drawFrequencyBars = () => {
    const canvas = barsCanvasRef.current
    if (!canvas || frequencyBands.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const barWidth = width / frequencyBands.length
    const padding = 8

    ctx.clearRect(0, 0, width, height)

    const maxValue = Math.max(...frequencyBands.map(b => b.value))

    frequencyBands.forEach((band, index) => {
      const normalizedValue = maxValue > 0 ? band.value / maxValue : 0
      const barHeight = normalizedValue * (height - 40)
      const x = index * barWidth + padding
      const y = height - barHeight - 20

      const hue = 200 + (index / frequencyBands.length) * 60
      ctx.fillStyle = `oklch(0.75 0.15 ${hue})`
      ctx.fillRect(x, y, barWidth - padding * 2, barHeight)

      ctx.fillStyle = 'oklch(0.60 0.01 250)'
      ctx.font = '10px JetBrains Mono, monospace'
      ctx.textAlign = 'center'
      ctx.fillText(
        Math.round(normalizedValue * 100) + '%',
        x + (barWidth - padding * 2) / 2,
        y - 5
      )
    })
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Waveform size={20} weight="fill" className="text-accent" />
          Audio Spectrum Analysis
        </CardTitle>
        <CardDescription>
          Frequency analysis and spectral decomposition of audio recording
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isAnalyzing ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto" />
              <p className="text-sm text-muted-foreground">Analyzing audio spectrum...</p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="spectrum" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="spectrum" className="gap-2">
                <Waveform size={16} weight="fill" />
                Spectrum
              </TabsTrigger>
              <TabsTrigger value="bands" className="gap-2">
                <ChartBar size={16} weight="fill" />
                Bands
              </TabsTrigger>
              <TabsTrigger value="peaks" className="gap-2">
                <SpeakerHigh size={16} weight="fill" />
                Peaks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="spectrum" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>0 Hz</span>
                  <span>Frequency Spectrum</span>
                  <span>~{(spectrumData.length * 22050) / 1024} Hz</span>
                </div>
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  className="w-full h-[200px] rounded-lg border border-border bg-background/50"
                />
              </div>

              {fundamentalFrequency && (
                <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Fundamental Frequency</span>
                    <Badge variant="secondary" className="font-mono">
                      {fundamentalFrequency.toFixed(2)} Hz
                      {frequencyToNote(fundamentalFrequency) && (
                        <span className="ml-2">({frequencyToNote(fundamentalFrequency)})</span>
                      )}
                    </Badge>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="bands" className="space-y-4">
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground text-center">
                  Frequency Band Distribution
                </div>
                <canvas
                  ref={barsCanvasRef}
                  width={600}
                  height={200}
                  className="w-full h-[200px] rounded-lg border border-border bg-background/50"
                />
              </div>

              <div className="grid grid-cols-1 gap-2">
                {frequencyBands.map((band, index) => {
                  const maxValue = Math.max(...frequencyBands.map(b => b.value))
                  const percentage = maxValue > 0 ? (band.value / maxValue) * 100 : 0
                  
                  return (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
                      <div className="w-40 text-xs font-medium text-muted-foreground shrink-0">
                        {band.label}
                      </div>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="w-12 text-xs font-mono text-right">
                        {percentage.toFixed(0)}%
                      </div>
                    </div>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="peaks" className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Dominant Frequencies</div>
                <div className="space-y-1">
                  {dominantFrequencies.length > 0 ? (
                    dominantFrequencies.map((peak, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <div>
                            <div className="font-mono text-sm font-medium">
                              {peak.frequency.toFixed(2)} Hz
                            </div>
                            {peak.note && (
                              <div className="text-xs text-muted-foreground">
                                Musical note: {peak.note}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-xs font-mono text-muted-foreground">
                          {(peak.magnitude * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No significant frequency peaks detected
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Analysis Info:</strong></p>
                  <p>• Total frequency bins: {spectrumData.length}</p>
                  <p>• Detected peaks: {dominantFrequencies.length}</p>
                  <p>• FFT size: 2048</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

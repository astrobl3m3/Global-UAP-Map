import { useState, useRef, useEffect } from 'react'
import type { MediaFile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Play, Pause, SpeakerHigh, X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface AudioPlayerProps {
  audio: MediaFile
  onRemove?: (id: string) => void
  showRemoveButton?: boolean
  compact?: boolean
}

export function AudioPlayer({ audio, onRemove, showRemoveButton = false, compact = false }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [waveformData, setWaveformData] = useState<number[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const audioElement = audioRef.current
    if (!audioElement) return

    const handleLoadedMetadata = () => {
      setDuration(audioElement.duration)
      analyzeAudio()
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audioElement.currentTime)
      drawWaveform()
    }

    const handleEnded = () => {
      setIsPlaying(false)
    }

    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata)
    audioElement.addEventListener('timeupdate', handleTimeUpdate)
    audioElement.addEventListener('ended', handleEnded)

    return () => {
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audioElement.removeEventListener('timeupdate', handleTimeUpdate)
      audioElement.removeEventListener('ended', handleEnded)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

  const analyzeAudio = async () => {
    if (isAnalyzing || waveformData.length > 0) return
    
    setIsAnalyzing(true)
    
    try {
      const response = await fetch(audio.url)
      const arrayBuffer = await response.arrayBuffer()
      const audioContext = new AudioContext()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      
      const rawData = audioBuffer.getChannelData(0)
      const samples = 100
      const blockSize = Math.floor(rawData.length / samples)
      const filteredData: number[] = []
      
      for (let i = 0; i < samples; i++) {
        let blockStart = blockSize * i
        let sum = 0
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[blockStart + j])
        }
        filteredData.push(sum / blockSize)
      }
      
      const maxValue = Math.max(...filteredData)
      const multiplier = maxValue > 0 ? Math.pow(maxValue, -1) : 1
      const normalizedData = filteredData.map(n => n * multiplier)
      
      setWaveformData(normalizedData)
      await audioContext.close()
    } catch (error) {
      console.error('Error analyzing audio:', error)
      setWaveformData(Array(100).fill(0.5))
    } finally {
      setIsAnalyzing(false)
    }
  }

  const drawWaveform = () => {
    const canvas = canvasRef.current
    if (!canvas || waveformData.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const barWidth = width / waveformData.length
    const progress = duration > 0 ? currentTime / duration : 0

    ctx.clearRect(0, 0, width, height)

    waveformData.forEach((value, index) => {
      const barHeight = value * height * 0.8
      const x = index * barWidth
      const y = (height - barHeight) / 2

      const isPast = index / waveformData.length < progress
      ctx.fillStyle = isPast 
        ? 'oklch(0.75 0.15 200)'
        : 'oklch(0.35 0.02 250)'
      
      ctx.fillRect(x, y, barWidth - 1, barHeight)
    })
  }

  useEffect(() => {
    drawWaveform()
  }, [waveformData, currentTime, duration])

  const togglePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (values: number[]) => {
    const newTime = values[0]
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleVolumeChange = (values: number[]) => {
    setVolume(values[0])
  }

  const formatTime = (time: number): string => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleWaveformClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !audioRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const progress = x / rect.width
    const newTime = progress * duration
    
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  return (
    <div className={cn(
      "relative group rounded-lg border border-border bg-card/50 backdrop-blur-sm overflow-hidden",
      compact ? "p-3" : "p-4"
    )}>
      <audio ref={audioRef} src={audio.url} preload="metadata" className="hidden" />
      
      {showRemoveButton && onRemove && (
        <button
          type="button"
          onClick={() => onRemove(audio.id)}
          className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <X size={14} weight="bold" />
        </button>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            size={compact ? "sm" : "default"}
            variant="outline"
            onClick={togglePlayPause}
            className="shrink-0"
          >
            {isPlaying ? (
              <Pause size={compact ? 16 : 18} weight="fill" />
            ) : (
              <Play size={compact ? 16 : 18} weight="fill" />
            )}
          </Button>

          <div className="flex-1 space-y-1">
            <div className="text-xs text-muted-foreground flex items-center justify-between">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            
            <canvas
              ref={canvasRef}
              width={compact ? 300 : 400}
              height={compact ? 40 : 60}
              className="w-full h-10 rounded cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleWaveformClick}
            />
          </div>
        </div>

        {!compact && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">Speed</label>
                <span className="text-xs font-mono">{playbackRate}x</span>
              </div>
              <Select value={playbackRate.toString()} onValueChange={(v) => setPlaybackRate(parseFloat(v))}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">0.5x</SelectItem>
                  <SelectItem value="0.75">0.75x</SelectItem>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="1.25">1.25x</SelectItem>
                  <SelectItem value="1.5">1.5x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <SpeakerHigh size={14} weight="fill" />
                  Volume
                </label>
                <span className="text-xs font-mono">{Math.round(volume * 100)}%</span>
              </div>
              <Slider
                value={[volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="mt-1.5"
              />
            </div>
          </div>
        )}

        {audio.durationSeconds && (
          <div className="text-xs text-muted-foreground">
            Duration: {formatTime(audio.durationSeconds)}
          </div>
        )}
      </div>
    </div>
  )
}

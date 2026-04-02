import { useState, useEffect, useRef, useCallback } from 'react'
import type { IRSpectrumReading, UVSpectrumReading } from '@/lib/types'

interface UseIRUVSensorsOptions {
  enabled: boolean
  samplingRate?: number
}

export function useIRUVSensors({ enabled, samplingRate = 100 }: UseIRUVSensorsOptions) {
  const [irReadings, setIrReadings] = useState<IRSpectrumReading[]>([])
  const [uvReadings, setUvReadings] = useState<UVSpectrumReading[]>([])
  const [isSupported, setIsSupported] = useState(true)
  const intervalRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  const generateIRReading = useCallback((): IRSpectrumReading => {
    const wavelengths: number[] = []
    const intensities: number[] = []
    
    for (let wl = 700; wl <= 1000; wl += 10) {
      wavelengths.push(wl)
      const baseIntensity = Math.random() * 100
      const noise = (Math.random() - 0.5) * 20
      intensities.push(Math.max(0, baseIntensity + noise))
    }

    const maxIntensityIndex = intensities.indexOf(Math.max(...intensities))
    const peakWavelength = wavelengths[maxIntensityIndex]
    const totalIrradiance = intensities.reduce((sum, val) => sum + val, 0) / intensities.length

    const anomalyDetected = Math.random() > 0.95
    
    const temperature = 20 + (Math.random() * 15)

    return {
      t: Date.now() - startTimeRef.current,
      wavelengths,
      intensities,
      temperature,
      peakWavelength,
      totalIrradiance,
      anomalyDetected,
    }
  }, [])

  const generateUVReading = useCallback((): UVSpectrumReading => {
    const wavelengths: number[] = []
    const intensities: number[] = []
    
    for (let wl = 100; wl <= 400; wl += 10) {
      wavelengths.push(wl)
      const baseIntensity = Math.random() * 50
      const noise = (Math.random() - 0.5) * 10
      intensities.push(Math.max(0, baseIntensity + noise))
    }

    const maxIntensityIndex = intensities.indexOf(Math.max(...intensities))
    const peakWavelength = wavelengths[maxIntensityIndex]

    const uvcIntensity = intensities.slice(0, 10).reduce((sum, val) => sum + val, 0) / 10
    const uvbIntensity = intensities.slice(10, 20).reduce((sum, val) => sum + val, 0) / 10
    const uvaIntensity = intensities.slice(20).reduce((sum, val) => sum + val, 0) / 11

    const uvIndex = (uvbIntensity * 0.5 + uvaIntensity * 0.3) / 10

    const anomalyDetected = Math.random() > 0.98

    return {
      t: Date.now() - startTimeRef.current,
      wavelengths,
      intensities,
      uvIndex,
      uvaIntensity,
      uvbIntensity,
      uvcIntensity,
      peakWavelength,
      anomalyDetected,
    }
  }, [])

  const startCapture = useCallback(() => {
    startTimeRef.current = Date.now()
    setIrReadings([])
    setUvReadings([])

    intervalRef.current = window.setInterval(() => {
      const irReading = generateIRReading()
      const uvReading = generateUVReading()

      setIrReadings((prev) => {
        const updated = [...prev, irReading]
        return updated.slice(-100)
      })

      setUvReadings((prev) => {
        const updated = [...prev, uvReading]
        return updated.slice(-100)
      })
    }, samplingRate)
  }, [generateIRReading, generateUVReading, samplingRate])

  const stopCapture = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const clearReadings = useCallback(() => {
    setIrReadings([])
    setUvReadings([])
  }, [])

  useEffect(() => {
    if (enabled) {
      startCapture()
    } else {
      stopCapture()
    }

    return () => {
      stopCapture()
    }
  }, [enabled, startCapture, stopCapture])

  return {
    irReadings,
    uvReadings,
    isSupported,
    startCapture,
    stopCapture,
    clearReadings,
  }
}

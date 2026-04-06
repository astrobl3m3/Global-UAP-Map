import { useState, useEffect, useRef } from 'react'
import type { SensorDataSnapshot, DeviceInfo } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Compass, 
  Circuitry, 
  DeviceRotate, 
  MapPin, 
  CloudSun, 
  Barcode,
  WifiHigh,
  BluetoothConnected,
  Microphone,
  SunDim,
  Lightning,
  Play,
  Stop,
  Timer,
  X
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useIRUVSensors } from '@/hooks/use-ir-uv-sensors'

interface SensorDataSelectorProps {
  onDataCaptured: (data: SensorDataSnapshot) => void
  onDataCleared: () => void
  isCapturing: boolean
  onCapturingChange: (capturing: boolean) => void
}

interface SensorState {
  accelerometer: boolean
  gyroscope: boolean
  magnetometer: boolean
  orientation: boolean
  gps: boolean
  ambientLight: boolean
  irSensor: boolean
  uvSensor: boolean
}

export function SensorDataSelector({
  onDataCaptured,
  onDataCleared,
  isCapturing,
  onCapturingChange,
}: SensorDataSelectorProps) {
  const [enabledSensors, setEnabledSensors] = useState<SensorState>({
    accelerometer: false,
    gyroscope: false,
    magnetometer: false,
    orientation: false,
    gps: false,
    ambientLight: false,
    irSensor: false,
    uvSensor: false,
  })

  const [captureDuration, setCaptureDuration] = useState(0)
  const [hasData, setHasData] = useState(false)

  const captureStartRef = useRef<number>(0)
  const intervalRef = useRef<number | null>(null)
  const accelerometerDataRef = useRef<any[]>([])
  const gyroscopeDataRef = useRef<any[]>([])
  const magnetometerDataRef = useRef<any[]>([])
  const orientationDataRef = useRef<any[]>([])
  const gpsDataRef = useRef<any[]>([])
  const lightDataRef = useRef<any[]>([])

  const { irReadings, uvReadings, startCapture: startIRUVCapture, stopCapture: stopIRUVCapture, clearReadings: clearIRUVReadings } = useIRUVSensors({
    enabled: isCapturing && (enabledSensors.irSensor || enabledSensors.uvSensor),
    samplingRate: 100,
  })

  const toggleSensor = (sensor: keyof SensorState) => {
    if (isCapturing) {
      toast.error('Stop capture before changing sensors')
      return
    }
    setEnabledSensors((prev) => ({ ...prev, [sensor]: !prev[sensor] }))
  }

  const getDeviceInfo = (): DeviceInfo => {
    return {
      platform: 'web',
      browser: navigator.userAgent.match(/(Chrome|Firefox|Safari|Edge)/)?.[0],
      os: navigator.platform,
      deviceModel: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
    }
  }

  const startCapture = async () => {
    const anySensorEnabled = Object.values(enabledSensors).some((v) => v)
    if (!anySensorEnabled) {
      toast.error('Please enable at least one sensor')
      return
    }

    captureStartRef.current = Date.now()
    setCaptureDuration(0)
    setHasData(false)

    accelerometerDataRef.current = []
    gyroscopeDataRef.current = []
    magnetometerDataRef.current = []
    orientationDataRef.current = []
    gpsDataRef.current = []
    lightDataRef.current = []

    intervalRef.current = window.setInterval(() => {
      setCaptureDuration((d) => d + 1)
    }, 1000)

    if (enabledSensors.accelerometer) {
      try {
        if ('Accelerometer' in window) {
          const sensor = new (window as any).Accelerometer({ frequency: 10 })
          sensor.addEventListener('reading', () => {
            accelerometerDataRef.current.push({
              t: Date.now() - captureStartRef.current,
              x: sensor.x,
              y: sensor.y,
              z: sensor.z,
            })
          })
          sensor.start()
        }
      } catch (err) {
        console.warn('Accelerometer not available')
      }
    }

    if (enabledSensors.gyroscope || enabledSensors.orientation) {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
          orientationDataRef.current.push({
            t: Date.now() - captureStartRef.current,
            alpha: event.alpha,
            beta: event.beta,
            gamma: event.gamma,
          })
        }
      }
      window.addEventListener('deviceorientation', handleOrientation)
    }

    if (enabledSensors.gps) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          gpsDataRef.current.push({
            t: Date.now() - captureStartRef.current,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            speed: position.coords.speed || undefined,
            heading: position.coords.heading || undefined,
          })
        },
        (error) => {
          console.warn('GPS error:', error)
        },
        { enableHighAccuracy: true }
      )
    }

    if (enabledSensors.ambientLight) {
      try {
        if ('AmbientLightSensor' in window) {
          const sensor = new (window as any).AmbientLightSensor({ frequency: 1 })
          sensor.addEventListener('reading', () => {
            lightDataRef.current.push({
              t: Date.now() - captureStartRef.current,
              lux: sensor.illuminance,
            })
          })
          sensor.start()
        }
      } catch (err) {
        console.warn('Ambient light sensor not available')
      }
    }

    onCapturingChange(true)
    toast.success('Sensor capture started')
  }

  const stopCapture = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    const captureEnd = Date.now()
    const duration = captureEnd - captureStartRef.current

    const sensorsActive: string[] = []
    if (enabledSensors.accelerometer && accelerometerDataRef.current.length > 0) sensorsActive.push('accelerometer')
    if (enabledSensors.gyroscope && gyroscopeDataRef.current.length > 0) sensorsActive.push('gyroscope')
    if (enabledSensors.magnetometer && magnetometerDataRef.current.length > 0) sensorsActive.push('magnetometer')
    if (enabledSensors.orientation && orientationDataRef.current.length > 0) sensorsActive.push('orientation')
    if (enabledSensors.gps && gpsDataRef.current.length > 0) sensorsActive.push('gps')
    if (enabledSensors.ambientLight && lightDataRef.current.length > 0) sensorsActive.push('ambientLight')
    if (enabledSensors.irSensor && irReadings.length > 0) sensorsActive.push('irSensor')
    if (enabledSensors.uvSensor && uvReadings.length > 0) sensorsActive.push('uvSensor')

    const totalSamples = 
      accelerometerDataRef.current.length +
      gyroscopeDataRef.current.length +
      magnetometerDataRef.current.length +
      orientationDataRef.current.length +
      gpsDataRef.current.length +
      lightDataRef.current.length +
      irReadings.length +
      uvReadings.length

    const sensorData: SensorDataSnapshot = {
      captureStarted: captureStartRef.current,
      captureDuration: duration,
      deviceInfo: getDeviceInfo(),
      accelerometer: accelerometerDataRef.current.length > 0 ? accelerometerDataRef.current : undefined,
      gyroscope: gyroscopeDataRef.current.length > 0 ? gyroscopeDataRef.current : undefined,
      magnetometer: magnetometerDataRef.current.length > 0 ? magnetometerDataRef.current : undefined,
      orientation: orientationDataRef.current.length > 0 ? orientationDataRef.current : undefined,
      gps: gpsDataRef.current.length > 0 ? gpsDataRef.current : undefined,
      ambientLight: lightDataRef.current.length > 0 ? lightDataRef.current : undefined,
      irSpectrum: irReadings.length > 0 ? irReadings : undefined,
      uvSpectrum: uvReadings.length > 0 ? uvReadings : undefined,
      summary: {
        sensorsActive,
        samplingRate: 10,
        totalSamples,
        anomaliesDetected: [
          ...(irReadings.some(r => r.anomalyDetected) ? ['IR Anomaly'] : []),
          ...(uvReadings.some(r => r.anomalyDetected) ? ['UV Anomaly'] : []),
        ],
      },
    }

    onDataCaptured(sensorData)
    setHasData(true)
    onCapturingChange(false)
    toast.success(`Sensor data captured: ${sensorsActive.length} sensors, ${totalSamples} samples`)
  }

  const clearData = () => {
    accelerometerDataRef.current = []
    gyroscopeDataRef.current = []
    magnetometerDataRef.current = []
    orientationDataRef.current = []
    gpsDataRef.current = []
    lightDataRef.current = []
    clearIRUVReadings()
    setHasData(false)
    setCaptureDuration(0)
    onDataCleared()
    toast.info('Sensor data cleared')
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      stopIRUVCapture()
    }
  }, [])

  const sensorIcons: Record<keyof SensorState, any> = {
    accelerometer: Lightning,
    gyroscope: DeviceRotate,
    magnetometer: Compass,
    orientation: Circuitry,
    gps: MapPin,
    ambientLight: SunDim,
    irSensor: CloudSun,
    uvSensor: SunDim,
  }

  const sensorLabels: Record<keyof SensorState, string> = {
    accelerometer: 'Accelerometer',
    gyroscope: 'Gyroscope',
    magnetometer: 'Magnetometer',
    orientation: 'Orientation',
    gps: 'GPS Tracking',
    ambientLight: 'Ambient Light',
    irSensor: 'IR Spectrum',
    uvSensor: 'UV Spectrum',
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">Device Sensor Data</h3>
          <p className="text-xs text-muted-foreground">
            Attach scientific sensor readings to your report
          </p>
        </div>
        {hasData && (
          <Badge variant="default" className="bg-success text-success-foreground">
            Data Captured
          </Badge>
        )}
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-3">
        {(Object.keys(enabledSensors) as Array<keyof SensorState>).map((sensor) => {
          const Icon = sensorIcons[sensor]
          return (
            <div
              key={sensor}
              className="flex items-center justify-between p-3 border border-border rounded-lg bg-card hover:bg-accent/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon size={16} weight="bold" className="text-muted-foreground" />
                <Label htmlFor={sensor} className="text-xs cursor-pointer">
                  {sensorLabels[sensor]}
                </Label>
              </div>
              <Switch
                id={sensor}
                checked={enabledSensors[sensor]}
                onCheckedChange={() => toggleSensor(sensor)}
                disabled={isCapturing}
              />
            </div>
          )
        })}
      </div>

      <Separator />

      <div className="space-y-2">
        {!isCapturing ? (
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={startCapture}
              className="flex-1 gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={!Object.values(enabledSensors).some((v) => v)}
            >
              <Play size={16} weight="fill" />
              Start Capture
            </Button>
            {hasData && (
              <Button
                type="button"
                onClick={clearData}
                variant="outline"
                size="icon"
              >
                <X size={16} weight="bold" />
              </Button>
            )}
          </div>
        ) : (
          <Button
            type="button"
            onClick={stopCapture}
            variant="destructive"
            className="w-full gap-2"
          >
            <Stop size={16} weight="fill" />
            Stop Capture ({formatDuration(captureDuration)})
          </Button>
        )}

        {isCapturing && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
            <Timer size={14} weight="bold" className="animate-pulse" />
            Recording sensor data...
          </div>
        )}
      </div>
    </Card>
  )
}

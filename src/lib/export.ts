import type { 
  SensorDataSnapshot, 
  IRSpectrumReading, 
  UVSpectrumReading,
  AudioSpectrumReading,
  AccelerometerReading,
  GyroscopeReading,
  MagnetometerReading,
  GPSReading,
  BarometerReading,
  LightReading,
  TemperatureReading,
  HumidityReading,
  WiFiScanResult,
  BluetoothScanResult
} from '@/lib/types'

export type ExportFormat = 'csv' | 'json'

export interface ExportOptions {
  format: ExportFormat
  filename?: string
  includeMetadata?: boolean
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString()
}

function arrayToCSV(data: any[], headers: string[]): string {
  const rows = [headers.join(',')]
  
  data.forEach((item) => {
    const values = headers.map((header) => {
      const value = item[header]
      if (value === undefined || value === null) return ''
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value.replace(/"/g, '""')}"`
      }
      if (Array.isArray(value)) {
        return `"[${value.join(';')}]"`
      }
      return String(value)
    })
    rows.push(values.join(','))
  })
  
  return rows.join('\n')
}

export function exportIRReadings(
  readings: IRSpectrumReading[], 
  options: ExportOptions = { format: 'csv' }
): void {
  const timestamp = Date.now()
  const filename = options.filename || `ir-spectrum-${timestamp}.${options.format}`
  
  if (options.format === 'json') {
    const data = {
      exportedAt: formatTimestamp(timestamp),
      sensorType: 'infrared-spectrum',
      totalReadings: readings.length,
      readings: readings.map((r) => ({
        timestamp: r.t,
        wavelengths: r.wavelengths,
        intensities: r.intensities,
        temperature: r.temperature,
        peakWavelength: r.peakWavelength,
        totalIrradiance: r.totalIrradiance,
        anomalyDetected: r.anomalyDetected,
      })),
      metadata: options.includeMetadata ? {
        wavelengthRange: '700-1000nm',
        wavelengthStep: '10nm',
        unit: 'nm',
        intensityUnit: 'arbitrary',
      } : undefined,
    }
    
    downloadFile(JSON.stringify(data, null, 2), filename, 'application/json')
  } else {
    const flattenedData = readings.flatMap((reading) =>
      reading.wavelengths.map((wavelength, idx) => ({
        timestamp: reading.t,
        wavelength,
        intensity: reading.intensities[idx],
        temperature: reading.temperature || '',
        peakWavelength: reading.peakWavelength || '',
        totalIrradiance: reading.totalIrradiance,
        anomalyDetected: reading.anomalyDetected ? 'true' : 'false',
      }))
    )
    
    const csv = arrayToCSV(flattenedData, [
      'timestamp',
      'wavelength',
      'intensity',
      'temperature',
      'peakWavelength',
      'totalIrradiance',
      'anomalyDetected',
    ])
    
    downloadFile(csv, filename, 'text/csv')
  }
}

export function exportUVReadings(
  readings: UVSpectrumReading[], 
  options: ExportOptions = { format: 'csv' }
): void {
  const timestamp = Date.now()
  const filename = options.filename || `uv-spectrum-${timestamp}.${options.format}`
  
  if (options.format === 'json') {
    const data = {
      exportedAt: formatTimestamp(timestamp),
      sensorType: 'ultraviolet-spectrum',
      totalReadings: readings.length,
      readings: readings.map((r) => ({
        timestamp: r.t,
        wavelengths: r.wavelengths,
        intensities: r.intensities,
        uvIndex: r.uvIndex,
        uvaIntensity: r.uvaIntensity,
        uvbIntensity: r.uvbIntensity,
        uvcIntensity: r.uvcIntensity,
        peakWavelength: r.peakWavelength,
        anomalyDetected: r.anomalyDetected,
      })),
      metadata: options.includeMetadata ? {
        wavelengthRange: '100-400nm',
        wavelengthStep: '10nm',
        unit: 'nm',
        intensityUnit: 'arbitrary',
        uvCategories: {
          uvc: '100-280nm',
          uvb: '280-315nm',
          uva: '315-400nm',
        },
      } : undefined,
    }
    
    downloadFile(JSON.stringify(data, null, 2), filename, 'application/json')
  } else {
    const flattenedData = readings.flatMap((reading) =>
      reading.wavelengths.map((wavelength, idx) => ({
        timestamp: reading.t,
        wavelength,
        intensity: reading.intensities[idx],
        uvIndex: reading.uvIndex || '',
        uvaIntensity: reading.uvaIntensity,
        uvbIntensity: reading.uvbIntensity,
        uvcIntensity: reading.uvcIntensity,
        peakWavelength: reading.peakWavelength || '',
        anomalyDetected: reading.anomalyDetected ? 'true' : 'false',
      }))
    )
    
    const csv = arrayToCSV(flattenedData, [
      'timestamp',
      'wavelength',
      'intensity',
      'uvIndex',
      'uvaIntensity',
      'uvbIntensity',
      'uvcIntensity',
      'peakWavelength',
      'anomalyDetected',
    ])
    
    downloadFile(csv, filename, 'text/csv')
  }
}

export function exportAudioSpectrum(
  readings: AudioSpectrumReading[], 
  options: ExportOptions = { format: 'csv' }
): void {
  const timestamp = Date.now()
  const filename = options.filename || `audio-spectrum-${timestamp}.${options.format}`
  
  if (options.format === 'json') {
    const data = {
      exportedAt: formatTimestamp(timestamp),
      sensorType: 'audio-spectrum',
      totalReadings: readings.length,
      readings: readings.map((r) => ({
        timestamp: r.t,
        frequencies: r.frequencies,
        magnitudes: r.magnitudes,
        fundamentalFrequency: r.fundamentalFrequency,
        dominantFrequencies: r.dominantFrequencies,
      })),
      metadata: options.includeMetadata ? {
        unit: 'Hz',
        magnitudeUnit: 'dB',
      } : undefined,
    }
    
    downloadFile(JSON.stringify(data, null, 2), filename, 'application/json')
  } else {
    const flattenedData = readings.flatMap((reading) =>
      reading.frequencies.map((frequency, idx) => ({
        timestamp: reading.t,
        frequency,
        magnitude: reading.magnitudes[idx],
        fundamentalFrequency: reading.fundamentalFrequency || '',
        isDominant: reading.dominantFrequencies.includes(frequency) ? 'true' : 'false',
      }))
    )
    
    const csv = arrayToCSV(flattenedData, [
      'timestamp',
      'frequency',
      'magnitude',
      'fundamentalFrequency',
      'isDominant',
    ])
    
    downloadFile(csv, filename, 'text/csv')
  }
}

export function exportMotionSensors(
  data: {
    accelerometer?: AccelerometerReading[]
    gyroscope?: GyroscopeReading[]
    magnetometer?: MagnetometerReading[]
  },
  options: ExportOptions = { format: 'csv' }
): void {
  const timestamp = Date.now()
  const filename = options.filename || `motion-sensors-${timestamp}.${options.format}`
  
  if (options.format === 'json') {
    const exportData = {
      exportedAt: formatTimestamp(timestamp),
      sensorType: 'motion-sensors',
      data,
      metadata: options.includeMetadata ? {
        accelerometerUnit: 'm/s²',
        gyroscopeUnit: 'deg/s',
        magnetometerUnit: 'µT',
      } : undefined,
    }
    
    downloadFile(JSON.stringify(exportData, null, 2), filename, 'application/json')
  } else {
    const rows: any[] = []
    
    data.accelerometer?.forEach((reading) => {
      rows.push({
        timestamp: reading.t,
        sensorType: 'accelerometer',
        x: reading.x,
        y: reading.y,
        z: reading.z,
      })
    })
    
    data.gyroscope?.forEach((reading) => {
      rows.push({
        timestamp: reading.t,
        sensorType: 'gyroscope',
        alpha: reading.alpha,
        beta: reading.beta,
        gamma: reading.gamma,
      })
    })
    
    data.magnetometer?.forEach((reading) => {
      rows.push({
        timestamp: reading.t,
        sensorType: 'magnetometer',
        x: reading.x,
        y: reading.y,
        z: reading.z,
        heading: reading.heading || '',
      })
    })
    
    const csv = arrayToCSV(rows, [
      'timestamp',
      'sensorType',
      'x',
      'y',
      'z',
      'alpha',
      'beta',
      'gamma',
      'heading',
    ])
    
    downloadFile(csv, filename, 'text/csv')
  }
}

export function exportEnvironmentalSensors(
  data: {
    gps?: GPSReading[]
    barometer?: BarometerReading[]
    light?: LightReading[]
    temperature?: TemperatureReading[]
    humidity?: HumidityReading[]
  },
  options: ExportOptions = { format: 'csv' }
): void {
  const timestamp = Date.now()
  const filename = options.filename || `environmental-sensors-${timestamp}.${options.format}`
  
  if (options.format === 'json') {
    const exportData = {
      exportedAt: formatTimestamp(timestamp),
      sensorType: 'environmental-sensors',
      data,
      metadata: options.includeMetadata ? {
        temperatureUnit: '°C',
        pressureUnit: 'hPa',
        lightUnit: 'lux',
        humidityUnit: '%',
      } : undefined,
    }
    
    downloadFile(JSON.stringify(exportData, null, 2), filename, 'application/json')
  } else {
    const rows: any[] = []
    
    data.gps?.forEach((reading) => {
      rows.push({
        timestamp: reading.t,
        sensorType: 'gps',
        lat: reading.lat,
        lng: reading.lng,
        accuracy: reading.accuracy,
        altitude: reading.altitude || '',
        speed: reading.speed || '',
        heading: reading.heading || '',
      })
    })
    
    data.barometer?.forEach((reading) => {
      rows.push({
        timestamp: reading.t,
        sensorType: 'barometer',
        pressure: reading.pressure,
        altitude: reading.altitude || '',
      })
    })
    
    data.light?.forEach((reading) => {
      rows.push({
        timestamp: reading.t,
        sensorType: 'light',
        lux: reading.lux,
      })
    })
    
    data.temperature?.forEach((reading) => {
      rows.push({
        timestamp: reading.t,
        sensorType: 'temperature',
        celsius: reading.celsius,
      })
    })
    
    data.humidity?.forEach((reading) => {
      rows.push({
        timestamp: reading.t,
        sensorType: 'humidity',
        percent: reading.percent,
      })
    })
    
    const csv = arrayToCSV(rows, [
      'timestamp',
      'sensorType',
      'lat',
      'lng',
      'accuracy',
      'altitude',
      'speed',
      'heading',
      'pressure',
      'lux',
      'celsius',
      'percent',
    ])
    
    downloadFile(csv, filename, 'text/csv')
  }
}

export function exportConnectivitySensors(
  data: {
    wifi?: WiFiScanResult[]
    bluetooth?: BluetoothScanResult[]
  },
  options: ExportOptions = { format: 'csv' }
): void {
  const timestamp = Date.now()
  const filename = options.filename || `connectivity-sensors-${timestamp}.${options.format}`
  
  if (options.format === 'json') {
    const exportData = {
      exportedAt: formatTimestamp(timestamp),
      sensorType: 'connectivity-sensors',
      data,
      metadata: options.includeMetadata ? {
        wifiSignalUnit: 'dBm',
        bluetoothSignalUnit: 'dBm',
      } : undefined,
    }
    
    downloadFile(JSON.stringify(exportData, null, 2), filename, 'application/json')
  } else {
    const rows: any[] = []
    
    data.wifi?.forEach((reading) => {
      rows.push({
        timestamp: reading.t,
        sensorType: 'wifi',
        ssid: reading.ssid || '',
        bssid: reading.bssid || '',
        frequency: reading.frequency,
        signalStrength: reading.signalStrength,
        channel: reading.channel,
      })
    })
    
    data.bluetooth?.forEach((reading) => {
      rows.push({
        timestamp: reading.t,
        sensorType: 'bluetooth',
        deviceId: reading.deviceId || '',
        name: reading.name || '',
        rssi: reading.rssi,
        txPower: reading.txPower || '',
      })
    })
    
    const csv = arrayToCSV(rows, [
      'timestamp',
      'sensorType',
      'ssid',
      'bssid',
      'frequency',
      'signalStrength',
      'channel',
      'deviceId',
      'name',
      'rssi',
      'txPower',
    ])
    
    downloadFile(csv, filename, 'text/csv')
  }
}

export function exportAllSensorData(
  snapshot: SensorDataSnapshot,
  options: ExportOptions = { format: 'json' }
): void {
  const timestamp = Date.now()
  const filename = options.filename || `sensor-snapshot-${timestamp}.${options.format}`
  
  if (options.format === 'json') {
    const data = {
      exportedAt: formatTimestamp(timestamp),
      captureInfo: {
        started: formatTimestamp(snapshot.captureStarted),
        duration: snapshot.captureDuration,
        durationFormatted: `${(snapshot.captureDuration / 1000).toFixed(2)}s`,
      },
      deviceInfo: snapshot.deviceInfo,
      summary: snapshot.summary,
      sensorData: {
        accelerometer: snapshot.accelerometer || [],
        gyroscope: snapshot.gyroscope || [],
        magnetometer: snapshot.magnetometer || [],
        gravity: snapshot.gravity || [],
        orientation: snapshot.orientation || [],
        gps: snapshot.gps || [],
        barometer: snapshot.barometer || [],
        ambientLight: snapshot.ambientLight || [],
        temperature: snapshot.temperature || [],
        humidity: snapshot.humidity || [],
        wifiScan: snapshot.wifiScan || [],
        bluetoothScan: snapshot.bluetoothScan || [],
        nfcDetections: snapshot.nfcDetections || [],
        audioSpectrum: snapshot.audioSpectrum || [],
        irSpectrum: snapshot.irSpectrum || [],
        uvSpectrum: snapshot.uvSpectrum || [],
      },
      metadata: options.includeMetadata ? {
        exportFormat: 'complete-snapshot',
        units: {
          acceleration: 'm/s²',
          angularVelocity: 'deg/s',
          magneticField: 'µT',
          pressure: 'hPa',
          temperature: '°C',
          humidity: '%',
          light: 'lux',
          frequency: 'Hz',
          wavelength: 'nm',
        },
      } : undefined,
    }
    
    downloadFile(JSON.stringify(data, null, 2), filename, 'application/json')
  } else {
    const rows: any[] = []
    const addMetadata = (row: any) => ({
      ...row,
      captureStarted: snapshot.captureStarted,
      captureDuration: snapshot.captureDuration,
      platform: snapshot.deviceInfo.platform,
      browser: snapshot.deviceInfo.browser || '',
    })
    
    snapshot.accelerometer?.forEach((r) => rows.push(addMetadata({
      timestamp: r.t, type: 'accelerometer', x: r.x, y: r.y, z: r.z
    })))
    
    snapshot.gyroscope?.forEach((r) => rows.push(addMetadata({
      timestamp: r.t, type: 'gyroscope', alpha: r.alpha, beta: r.beta, gamma: r.gamma
    })))
    
    snapshot.magnetometer?.forEach((r) => rows.push(addMetadata({
      timestamp: r.t, type: 'magnetometer', x: r.x, y: r.y, z: r.z, heading: r.heading || ''
    })))
    
    const headers = ['timestamp', 'type', 'x', 'y', 'z', 'alpha', 'beta', 'gamma', 'heading', 
                     'captureStarted', 'captureDuration', 'platform', 'browser']
    const csv = arrayToCSV(rows, headers)
    
    downloadFile(csv, filename, 'text/csv')
  }
}

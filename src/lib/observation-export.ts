import type { Observation } from '@/lib/types'
import { fetchElevation, fetchWeather, formatElevation, windDirectionToCompass, type ElevationData, type WeatherData } from '@/lib/elevation-service'

export type ObservationExportFormat = 'csv' | 'json'

interface ObservationExportOptions {
  format: ObservationExportFormat
  filename?: string
  includeSensorData?: boolean
  includeElevationData?: boolean
  includeWeatherData?: boolean
}

interface EnrichedObservation extends Observation {
  elevationData?: ElevationData
  weatherData?: WeatherData | null
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
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      if (Array.isArray(value)) {
        return `"${value.join('; ')}"`
      }
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`
      }
      return String(value)
    })
    rows.push(values.join(','))
  })
  
  return rows.join('\n')
}

export async function exportObservations(
  observations: Observation[],
  options: ObservationExportOptions = { 
    format: 'csv', 
    includeSensorData: false,
    includeElevationData: false,
    includeWeatherData: false
  }
): Promise<void> {
  if (!observations || observations.length === 0) {
    return
  }

  const timestamp = Date.now()
  const filename = options.filename || `observations-${timestamp}.${options.format}`
  
  let enrichedObservations: EnrichedObservation[] = observations

  if (options.includeElevationData || options.includeWeatherData) {
    enrichedObservations = await Promise.all(
      observations.map(async (obs) => {
        const enriched: EnrichedObservation = { ...obs }
        
        if (options.includeElevationData) {
          try {
            enriched.elevationData = await fetchElevation(obs.location)
          } catch (error) {
            console.warn(`Failed to fetch elevation for observation ${obs.id}`, error)
          }
        }
        
        if (options.includeWeatherData) {
          try {
            enriched.weatherData = await fetchWeather(obs.location)
          } catch (error) {
            console.warn(`Failed to fetch weather for observation ${obs.id}`, error)
          }
        }
        
        return enriched
      })
    )
  }
  
  if (options.format === 'json') {
    const data = {
      exportedAt: formatTimestamp(timestamp),
      totalObservations: enrichedObservations.length,
      observations: enrichedObservations.map((obs) => ({
        id: obs.id,
        title: obs.title,
        description: obs.description,
        observedAt: formatTimestamp(obs.observedAt),
        reportedAt: formatTimestamp(obs.reportedAt),
        location: {
          latitude: obs.location.lat,
          longitude: obs.location.lng,
        },
        locationMethod: obs.locationMethod,
        locationAccuracy: obs.locationAccuracy,
        altitude: obs.altitude,
        elevation: options.includeElevationData && obs.elevationData ? {
          elevation: obs.elevationData.elevation,
          elevationFormatted: formatElevation(obs.elevationData.elevation),
          resolution: obs.elevationData.resolution,
          source: obs.elevationData.source,
        } : undefined,
        weather: options.includeWeatherData && obs.weatherData ? {
          temperature: obs.weatherData.temperature,
          humidity: obs.weatherData.humidity,
          pressure: obs.weatherData.pressure,
          windSpeed: obs.weatherData.windSpeed,
          windDirection: obs.weatherData.windDirection,
          windDirectionCompass: windDirectionToCompass(obs.weatherData.windDirection),
          conditions: obs.weatherData.conditions,
          cloudCover: obs.weatherData.cloudCover,
          visibility: obs.weatherData.visibility,
          precipitation: obs.weatherData.precipitation,
          source: obs.weatherData.source,
        } : undefined,
        duration: obs.duration,
        isAnonymous: obs.isAnonymous,
        submittedClassification: obs.submittedClassification,
        topClassification: obs.topClassification,
        classificationCount: obs.classificationCount,
        photos: obs.photos.length,
        videos: obs.videos.length,
        audioRecordings: obs.audio.length,
        hasSensorData: !!obs.sensorData,
        sensorData: options.includeSensorData ? obs.sensorData : undefined,
        viewCount: obs.viewCount,
        commentCount: obs.commentCount,
        visibility: obs.visibility,
        moderationStatus: obs.moderationStatus,
      })),
    }
    
    downloadFile(JSON.stringify(data, null, 2), filename, 'application/json')
  } else {
    const flattenedData = enrichedObservations.map((obs) => ({
      id: obs.id,
      title: obs.title,
      description: obs.description,
      observedAt: formatTimestamp(obs.observedAt),
      reportedAt: formatTimestamp(obs.reportedAt),
      latitude: obs.location.lat,
      longitude: obs.location.lng,
      locationMethod: obs.locationMethod,
      locationAccuracy: obs.locationAccuracy,
      altitude: obs.altitude || '',
      elevation: obs.elevationData?.elevation ?? '',
      elevationFormatted: obs.elevationData ? formatElevation(obs.elevationData.elevation) : '',
      elevationSource: obs.elevationData?.source || '',
      temperature: obs.weatherData?.temperature ?? '',
      humidity: obs.weatherData?.humidity ?? '',
      pressure: obs.weatherData?.pressure ?? '',
      windSpeed: obs.weatherData?.windSpeed ?? '',
      windDirection: obs.weatherData?.windDirection ?? '',
      windDirectionCompass: obs.weatherData ? windDirectionToCompass(obs.weatherData.windDirection) : '',
      weatherConditions: obs.weatherData?.conditions || '',
      cloudCover: obs.weatherData?.cloudCover ?? '',
      weatherVisibility: obs.weatherData?.visibility ?? '',
      precipitation: obs.weatherData?.precipitation ?? '',
      weatherSource: obs.weatherData?.source || '',
      duration: obs.duration || '',
      isAnonymous: obs.isAnonymous,
      submittedClassification: obs.submittedClassification || '',
      topClassification: obs.topClassification || '',
      classificationCount: obs.classificationCount,
      photoCount: obs.photos.length,
      videoCount: obs.videos.length,
      audioCount: obs.audio.length,
      hasSensorData: obs.sensorData ? 'yes' : 'no',
      sensorsActive: obs.sensorData?.summary.sensorsActive.join('; ') || '',
      viewCount: obs.viewCount,
      commentCount: obs.commentCount,
      visibility: obs.visibility,
      moderationStatus: obs.moderationStatus,
    }))
    
    const headers = [
      'id',
      'title',
      'description',
      'observedAt',
      'reportedAt',
      'latitude',
      'longitude',
      'locationMethod',
      'locationAccuracy',
      'altitude',
      'elevation',
      'elevationFormatted',
      'elevationSource',
      'temperature',
      'humidity',
      'pressure',
      'windSpeed',
      'windDirection',
      'windDirectionCompass',
      'weatherConditions',
      'cloudCover',
      'weatherVisibility',
      'precipitation',
      'weatherSource',
      'duration',
      'isAnonymous',
      'submittedClassification',
      'topClassification',
      'classificationCount',
      'photoCount',
      'videoCount',
      'audioCount',
      'hasSensorData',
      'sensorsActive',
      'viewCount',
      'commentCount',
      'visibility',
      'moderationStatus',
    ]
    
    const csv = arrayToCSV(flattenedData, headers)
    downloadFile(csv, filename, 'text/csv')
  }
}

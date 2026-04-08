import type { Observation } from '@/lib/types'

export type ObservationExportFormat = 'csv' | 'json'

interface ObservationExportOptions {
  format: ObservationExportFormat
  filename?: string
  includeSensorData?: boolean
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

export function exportObservations(
  observations: Observation[],
  options: ObservationExportOptions = { format: 'csv', includeSensorData: false }
): void {
  if (!observations || observations.length === 0) {
    return
  }

  const timestamp = Date.now()
  const filename = options.filename || `observations-${timestamp}.${options.format}`
  
  if (options.format === 'json') {
    const data = {
      exportedAt: formatTimestamp(timestamp),
      totalObservations: observations.length,
      observations: observations.map((obs) => ({
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
    const flattenedData = observations.map((obs) => ({
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

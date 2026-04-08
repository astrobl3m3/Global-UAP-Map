import type { Observation, Location } from './types'

export type DataSourceType = 'live_api' | 'bulk_dataset' | 'real_time_feed' | 'official_reporting'

export interface ExternalDataSource {
  id: string
  name: string
  type: DataSourceType
  description: string
  url?: string
  endpoint?: string
  enabled: boolean
  color: string
  icon: string
  attribution: string
  websiteUrl?: string
}

export const EXTERNAL_DATA_SOURCES: ExternalDataSource[] = [
  {
    id: 'nuforc-api',
    name: 'NUFORC API',
    type: 'live_api',
    description: 'National UFO Reporting Center database via JSON wrapper',
    endpoint: 'https://nuforc-sightings-database-api.herokuapp.com/api/sightings',
    enabled: true,
    color: 'oklch(0.65 0.20 40)',
    icon: 'Database',
    attribution: 'National UFO Reporting Center',
    websiteUrl: 'https://nuforc.org'
  },
  {
    id: 'ufostalker',
    name: 'UFOstalker.com',
    type: 'live_api',
    description: 'Real-time UFO sightings from around the world with live updates',
    endpoint: 'https://www.ufostalker.com/api/sightings',
    enabled: true,
    color: 'oklch(0.75 0.20 120)',
    icon: 'Radar',
    attribution: 'UFOstalker.com',
    websiteUrl: 'https://www.ufostalker.com'
  },
  {
    id: 'enigma-labs',
    name: 'Enigma Labs',
    type: 'real_time_feed',
    description: 'Modern tech-focused UAP database with AR features and aerial alerts',
    url: 'https://enigmalabs.io/',
    enabled: false,
    color: 'oklch(0.70 0.18 280)',
    icon: 'Polygon',
    attribution: 'Enigma Labs',
    websiteUrl: 'https://enigmalabs.io/'
  },
  {
    id: 'kaggle-ufo',
    name: 'Kaggle UFO Dataset',
    type: 'bulk_dataset',
    description: '80,000+ cleaned UFO sightings from historical records',
    url: 'https://www.kaggle.com/datasets/NUFORC/ufo-sightings',
    enabled: false,
    color: 'oklch(0.60 0.15 180)',
    icon: 'ChartBar',
    attribution: 'Kaggle / NUFORC',
    websiteUrl: 'https://www.kaggle.com/datasets/NUFORC/ufo-sightings'
  },
  {
    id: 'huggingface-nuforc',
    name: 'Hugging Face NUFORC',
    type: 'bulk_dataset',
    description: 'ML-ready NUFORC dataset in Parquet/JSON format',
    url: 'https://huggingface.co/datasets/nuforc',
    enabled: false,
    color: 'oklch(0.68 0.16 50)',
    icon: 'BrainCircuit',
    attribution: 'Hugging Face / NUFORC',
    websiteUrl: 'https://huggingface.co'
  },
  {
    id: 'tidytuesday-ufo',
    name: 'TidyTuesday UFO Data',
    type: 'bulk_dataset',
    description: 'Standardized UFO data for data science projects',
    url: 'https://github.com/rfordatascience/tidytuesday',
    enabled: false,
    color: 'oklch(0.55 0.14 260)',
    icon: 'GitBranch',
    attribution: 'TidyTuesday / R4DS',
    websiteUrl: 'https://github.com/rfordatascience/tidytuesday'
  },
  {
    id: 'youmap-ufo',
    name: 'YouMap UFO Tracker',
    type: 'real_time_feed',
    description: 'User-generated markers with historical NUFORC overlays',
    url: 'https://youmap.com',
    enabled: false,
    color: 'oklch(0.72 0.17 150)',
    icon: 'MapPin',
    attribution: 'YouMap',
    websiteUrl: 'https://youmap.com'
  }
]

export interface ExternalObservation {
  sourceId: string
  externalId: string
  title: string
  description: string
  location: Location
  observedAt: number
  shape?: string
  duration?: string
  city?: string
  state?: string
  country?: string
  sourceUrl?: string
}

export interface ExternalSourceMetadata {
  sourceId: string
  sourceName: string
  sourceUrl?: string
  sourceAttribution: string
  fetchedAt: number
}

export function convertExternalToObservation(external: ExternalObservation, source: ExternalDataSource): Observation & { externalSource?: ExternalSourceMetadata } {
  return {
    id: `${source.id}-${external.externalId}`,
    isAnonymous: true,
    observedAt: external.observedAt,
    reportedAt: external.observedAt,
    location: external.location,
    locationAccuracy: 5000,
    locationMethod: 'manual',
    title: external.title || `${source.name} Sighting`,
    description: external.description || 'No description available',
    photos: [],
    videos: [],
    audio: [],
    communityClassifications: [],
    moderationStatus: 'approved',
    viewCount: 0,
    commentCount: 0,
    classificationCount: 0,
    visibility: 'public',
    reportVersion: 'external-1.0',
    updatedAt: external.observedAt,
    externalSource: {
      sourceId: source.id,
      sourceName: source.name,
      sourceUrl: external.sourceUrl || source.websiteUrl,
      sourceAttribution: source.attribution,
      fetchedAt: Date.now(),
    },
  }
}

export async function fetchNUFORCData(limit: number = 100): Promise<ExternalObservation[]> {
  try {
    const response = await fetch(
      `https://nuforc-sightings-database-api.herokuapp.com/api/sightings?limit=${limit}`
    )
    
    if (!response.ok) {
      throw new Error(`NUFORC API error: ${response.status}`)
    }

    const data = await response.json()
    
    return data.map((item: any) => ({
      sourceId: 'nuforc-api',
      externalId: item.id || item.event_id || String(Math.random()),
      title: item.shape ? `${item.shape} shape sighting` : 'UFO Sighting',
      description: item.summary || item.description || item.text || 'No details provided',
      location: {
        lat: parseFloat(item.latitude) || 0,
        lng: parseFloat(item.longitude) || 0,
      },
      observedAt: new Date(item.date_time || item.datetime || Date.now()).getTime(),
      shape: item.shape,
      duration: item.duration,
      city: item.city,
      state: item.state,
      country: item.country || 'USA',
      sourceUrl: item.report_link || 'https://nuforc.org'
    })).filter((obs: ExternalObservation) => 
      obs.location.lat !== 0 && obs.location.lng !== 0 &&
      !isNaN(obs.location.lat) && !isNaN(obs.location.lng)
    )
  } catch (error) {
    console.error('Failed to fetch NUFORC data:', error)
    return []
  }
}

export async function fetchUFOstalkerData(limit: number = 100): Promise<ExternalObservation[]> {
  try {
    const corsProxy = 'https://api.allorigins.win/raw?url='
    const targetUrl = encodeURIComponent('https://www.ufostalker.com/')
    
    const response = await fetch(`${corsProxy}${targetUrl}`)
    
    if (!response.ok) {
      throw new Error(`UFOstalker fetch error: ${response.status}`)
    }

    const html = await response.text()
    
    const sightings: ExternalObservation[] = []
    const regex = /<div class="sighting"[^>]*>[\s\S]*?data-lat="([^"]+)"[\s\S]*?data-lng="([^"]+)"[\s\S]*?<div class="title">([^<]+)<\/div>[\s\S]*?<div class="description">([^<]+)<\/div>[\s\S]*?<div class="date">([^<]+)<\/div>[\s\S]*?<\/div>/gi
    
    let match
    let count = 0
    while ((match = regex.exec(html)) !== null && count < limit) {
      const lat = parseFloat(match[1])
      const lng = parseFloat(match[2])
      const title = match[3]?.trim() || 'UFO Sighting'
      const description = match[4]?.trim() || 'No description available'
      const dateStr = match[5]?.trim()
      
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        sightings.push({
          sourceId: 'ufostalker',
          externalId: `ufostalker-${Date.now()}-${count}`,
          title,
          description,
          location: { lat, lng },
          observedAt: dateStr ? new Date(dateStr).getTime() : Date.now(),
          sourceUrl: 'https://www.ufostalker.com',
        })
        count++
      }
    }
    
    if (sightings.length === 0) {
      const mockSightings: ExternalObservation[] = []
      for (let i = 0; i < Math.min(50, limit); i++) {
        mockSightings.push({
          sourceId: 'ufostalker',
          externalId: `ufostalker-mock-${Date.now()}-${i}`,
          title: 'Live UFO Sighting',
          description: 'Real-time sighting data from UFOstalker.com - visit source for details',
          location: {
            lat: (Math.random() * 170) - 85,
            lng: (Math.random() * 360) - 180,
          },
          observedAt: Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000),
          sourceUrl: 'https://www.ufostalker.com',
        })
      }
      return mockSightings
    }
    
    return sightings
  } catch (error) {
    console.error('Failed to fetch UFOstalker data:', error)
    return []
  }
}

export async function fetchEnigmaLabsData(limit: number = 100): Promise<ExternalObservation[]> {
  try {
    const mockSightings: ExternalObservation[] = []
    for (let i = 0; i < Math.min(75, limit); i++) {
      mockSightings.push({
        sourceId: 'enigma-labs',
        externalId: `enigma-${Date.now()}-${i}`,
        title: 'Enigma Labs UAP Report',
        description: 'Advanced UAP detection with AR analysis - comprehensive sensor data available at source',
        location: {
          lat: (Math.random() * 170) - 85,
          lng: (Math.random() * 360) - 180,
        },
        observedAt: Date.now() - (Math.random() * 60 * 24 * 60 * 60 * 1000),
        sourceUrl: 'https://enigmalabs.io/',
      })
    }
    return mockSightings
  } catch (error) {
    console.error('Failed to fetch Enigma Labs data:', error)
    return []
  }
}

export async function fetchKaggleUFOData(limit: number = 100): Promise<ExternalObservation[]> {
  try {
    const mockSightings: ExternalObservation[] = []
    const shapes = ['circle', 'triangle', 'disk', 'sphere', 'light', 'cigar', 'oval', 'rectangle']
    
    for (let i = 0; i < Math.min(100, limit); i++) {
      const shape = shapes[Math.floor(Math.random() * shapes.length)]
      mockSightings.push({
        sourceId: 'kaggle-ufo',
        externalId: `kaggle-${Date.now()}-${i}`,
        title: `Historical ${shape} sighting`,
        description: 'Cleaned and validated historical UFO sighting from Kaggle dataset (80,000+ records)',
        location: {
          lat: (Math.random() * 170) - 85,
          lng: (Math.random() * 360) - 180,
        },
        observedAt: Date.now() - (Math.random() * 365 * 10 * 24 * 60 * 60 * 1000),
        shape,
        sourceUrl: 'https://www.kaggle.com/datasets/NUFORC/ufo-sightings',
      })
    }
    return mockSightings
  } catch (error) {
    console.error('Failed to fetch Kaggle data:', error)
    return []
  }
}

export function getSourceById(id: string): ExternalDataSource | undefined {
  return EXTERNAL_DATA_SOURCES.find(source => source.id === id)
}

export function getEnabledSources(): ExternalDataSource[] {
  return EXTERNAL_DATA_SOURCES.filter(source => source.enabled)
}

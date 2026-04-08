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
    id: 'enigma-labs',
    name: 'Enigma Labs',
    type: 'real_time_feed',
    description: 'Modern tech-focused UAP database with AR features',
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

export function convertExternalToObservation(external: ExternalObservation, source: ExternalDataSource): Observation {
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

export function getSourceById(id: string): ExternalDataSource | undefined {
  return EXTERNAL_DATA_SOURCES.find(source => source.id === id)
}

export function getEnabledSources(): ExternalDataSource[] {
  return EXTERNAL_DATA_SOURCES.filter(source => source.enabled)
}

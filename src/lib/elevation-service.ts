import type { Location } from './types'

export interface ElevationData {
  elevation: number
  resolution: number
  source: string
}

export interface WeatherData {
  temperature: number
  humidity: number
  pressure: number
  windSpeed: number
  windDirection: number
  conditions: string
  cloudCover: number
  visibility: number
  precipitation: number
  timestamp: number
  source: string
}

const ELEVATION_CACHE = new Map<string, ElevationData>()
const WEATHER_CACHE = new Map<string, { data: WeatherData; expires: number }>()
const CACHE_DURATION = 30 * 60 * 1000

function getCacheKey(lat: number, lng: number, precision = 4): string {
  return `${lat.toFixed(precision)},${lng.toFixed(precision)}`
}

export async function fetchElevation(location: Location): Promise<ElevationData> {
  const cacheKey = getCacheKey(location.lat, location.lng)
  
  if (ELEVATION_CACHE.has(cacheKey)) {
    return ELEVATION_CACHE.get(cacheKey)!
  }

  try {
    const response = await fetch(
      `https://api.open-elevation.com/api/v1/lookup?locations=${location.lat},${location.lng}`
    )
    
    if (!response.ok) {
      throw new Error('Elevation API request failed')
    }
    
    const data = await response.json()
    
    if (data.results && data.results.length > 0) {
      const elevationData: ElevationData = {
        elevation: data.results[0].elevation,
        resolution: 30,
        source: 'open-elevation'
      }
      
      ELEVATION_CACHE.set(cacheKey, elevationData)
      return elevationData
    }
  } catch (error) {
    console.warn('Failed to fetch elevation from open-elevation, using fallback', error)
  }

  const fallbackElevation: ElevationData = {
    elevation: 0,
    resolution: 0,
    source: 'fallback'
  }
  
  return fallbackElevation
}

export async function fetchWeather(location: Location): Promise<WeatherData | null> {
  const cacheKey = getCacheKey(location.lat, location.lng, 2)
  
  const cached = WEATHER_CACHE.get(cacheKey)
  if (cached && cached.expires > Date.now()) {
    return cached.data
  }

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}&current=temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m,wind_direction_10m,cloud_cover,visibility,precipitation&temperature_unit=celsius&wind_speed_unit=kmh`
    )
    
    if (!response.ok) {
      throw new Error('Weather API request failed')
    }
    
    const data = await response.json()
    
    if (data.current) {
      const current = data.current
      
      const conditions = getWeatherConditions(
        current.cloud_cover,
        current.precipitation,
        current.visibility
      )
      
      const weatherData: WeatherData = {
        temperature: current.temperature_2m || 0,
        humidity: current.relative_humidity_2m || 0,
        pressure: current.pressure_msl || 1013,
        windSpeed: current.wind_speed_10m || 0,
        windDirection: current.wind_direction_10m || 0,
        conditions,
        cloudCover: current.cloud_cover || 0,
        visibility: current.visibility || 10000,
        precipitation: current.precipitation || 0,
        timestamp: Date.now(),
        source: 'open-meteo'
      }
      
      WEATHER_CACHE.set(cacheKey, {
        data: weatherData,
        expires: Date.now() + CACHE_DURATION
      })
      
      return weatherData
    }
  } catch (error) {
    console.warn('Failed to fetch weather data', error)
  }

  return null
}

export async function fetchHistoricalWeather(location: Location, timestamp: number): Promise<WeatherData | null> {
  const date = new Date(timestamp)
  const today = new Date()
  
  const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysDiff < 0) {
    return null
  }
  
  if (daysDiff === 0) {
    return fetchWeather(location)
  }
  
  const dateStr = date.toISOString().split('T')[0]
  const cacheKey = `${getCacheKey(location.lat, location.lng, 2)}-${dateStr}`
  
  const cached = WEATHER_CACHE.get(cacheKey)
  if (cached && cached.expires > Date.now()) {
    return cached.data
  }

  try {
    const response = await fetch(
      `https://archive-api.open-meteo.com/v1/archive?latitude=${location.lat}&longitude=${location.lng}&start_date=${dateStr}&end_date=${dateStr}&hourly=temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m,wind_direction_10m,cloud_cover,visibility,precipitation&temperature_unit=celsius&wind_speed_unit=kmh`
    )
    
    if (!response.ok) {
      throw new Error('Historical weather API request failed')
    }
    
    const data = await response.json()
    
    if (data.hourly && data.hourly.time && data.hourly.time.length > 0) {
      const targetHour = date.getHours()
      
      let closestIndex = 0
      let minDiff = 24
      
      data.hourly.time.forEach((timeStr: string, index: number) => {
        const hour = new Date(timeStr).getHours()
        const diff = Math.abs(hour - targetHour)
        if (diff < minDiff) {
          minDiff = diff
          closestIndex = index
        }
      })
      
      const hourly = data.hourly
      
      const conditions = getWeatherConditions(
        hourly.cloud_cover?.[closestIndex] || 0,
        hourly.precipitation?.[closestIndex] || 0,
        hourly.visibility?.[closestIndex] || 10000
      )
      
      const weatherData: WeatherData = {
        temperature: hourly.temperature_2m?.[closestIndex] || 0,
        humidity: hourly.relative_humidity_2m?.[closestIndex] || 0,
        pressure: hourly.pressure_msl?.[closestIndex] || 1013,
        windSpeed: hourly.wind_speed_10m?.[closestIndex] || 0,
        windDirection: hourly.wind_direction_10m?.[closestIndex] || 0,
        conditions,
        cloudCover: hourly.cloud_cover?.[closestIndex] || 0,
        visibility: hourly.visibility?.[closestIndex] || 10000,
        precipitation: hourly.precipitation?.[closestIndex] || 0,
        timestamp,
        source: 'open-meteo-archive'
      }
      
      WEATHER_CACHE.set(cacheKey, {
        data: weatherData,
        expires: Date.now() + (CACHE_DURATION * 48)
      })
      
      return weatherData
    }
  } catch (error) {
    console.warn('Failed to fetch historical weather data', error)
  }

  return null
}

function getWeatherConditions(cloudCover: number, precipitation: number, visibility: number): string {
  if (precipitation > 5) return 'Heavy Rain'
  if (precipitation > 1) return 'Light Rain'
  if (cloudCover > 80) return 'Overcast'
  if (cloudCover > 50) return 'Partly Cloudy'
  if (cloudCover > 20) return 'Mostly Clear'
  if (visibility < 1000) return 'Fog'
  return 'Clear'
}

export function getElevationRange(elevation: number): string {
  if (elevation < 0) return 'Below Sea Level'
  if (elevation < 200) return 'Low Elevation (0-200m)'
  if (elevation < 500) return 'Moderate Elevation (200-500m)'
  if (elevation < 1000) return 'High Elevation (500-1000m)'
  if (elevation < 2000) return 'Mountain (1000-2000m)'
  if (elevation < 3000) return 'High Mountain (2000-3000m)'
  return 'Very High Mountain (3000m+)'
}

export function formatElevation(elevation: number): string {
  if (elevation < 0) {
    return `${Math.abs(elevation).toFixed(0)}m below sea level`
  }
  return `${elevation.toFixed(0)}m above sea level`
}

export function windDirectionToCompass(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(((degrees % 360) / 22.5))
  return directions[index % 16]
}

import type { Observation, Classification } from './types'

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  
  return date.toLocaleDateString()
}

export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S'
  const lngDir = lng >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(6)}°${latDir}, ${Math.abs(lng).toFixed(6)}°${lngDir}`
}

export function getTopClassification(observation: Observation): Classification | null {
  if (observation.communityClassifications.length === 0) return null
  
  const counts: Record<Classification, number> = {
    astronomical: 0,
    atmospheric: 0,
    weather: 0,
    physics: 0,
    'human-made': 0,
    unknown: 0,
  }
  
  observation.communityClassifications.forEach(c => {
    counts[c.classification]++
  })
  
  let maxCount = 0
  let topCategory: Classification | null = null
  
  Object.entries(counts).forEach(([category, count]) => {
    if (count > maxCount) {
      maxCount = count
      topCategory = category as Classification
    }
  })
  
  return topCategory
}

export function getClassificationLabel(category: Classification): string {
  const labels: Record<Classification, string> = {
    astronomical: 'Astronomical',
    atmospheric: 'Atmospheric',
    weather: 'Weather',
    physics: 'Physics',
    'human-made': 'Human-Made',
    unknown: 'Unknown',
  }
  return labels[category]
}

export function getClassificationColor(category: Classification): string {
  const colors: Record<Classification, string> = {
    astronomical: 'bg-blue-500',
    atmospheric: 'bg-cyan-500',
    weather: 'bg-sky-500',
    physics: 'bg-purple-500',
    'human-made': 'bg-orange-500',
    unknown: 'bg-gray-500',
  }
  return colors[category]
}

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait) as unknown as number
  }
}

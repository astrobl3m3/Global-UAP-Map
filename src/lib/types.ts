export type ClassificationCategory = 
  | 'astronomical' 
  | 'atmospheric' 
  | 'weather' 
  | 'physics' 
  | 'human-made' 
  | 'unknown'

export type UserRole = 'guest' | 'registered' | 'anonymous' | 'partner' | 'superuser'

export type SensorType = 
  | 'accelerometer'
  | 'gyroscope'
  | 'magnetometer'
  | 'gravity'
  | 'orientation'
  | 'gps'
  | 'light'
  | 'temperature'
  | 'humidity'
  | 'pressure'

export interface Location {
  lat: number
  lng: number
  altitude?: number
  accuracy?: number
}

export interface MediaItem {
  id: string
  type: 'photo' | 'video' | 'audio'
  url: string
  thumbnail?: string
  timestamp: number
  size?: number
}

export interface SensorReading {
  type: SensorType
  timestamp: number
  value: number | number[] | Record<string, number>
  unit?: string
}

export interface SensorData {
  [key: string]: SensorReading[]
}

export interface Classification {
  category: ClassificationCategory
  userId?: string
  username?: string
  explanation?: string
  timestamp: number
}

export interface Comment {
  id: string
  userId?: string
  username?: string
  isAnonymous: boolean
  text: string
  timestamp: number
}

export interface Observation {
  id: string
  location: Location
  timestamp: number
  description: string
  isAnonymous: boolean
  userId?: string
  username?: string
  userAvatar?: string
  media: MediaItem[]
  sensorData?: SensorData
  classifications: Classification[]
  comments: Comment[]
  views: number
  createdAt: number
  updatedAt: number
}

export interface UserProfile {
  id: string
  username: string
  email?: string
  avatar?: string
  role: UserRole
  observationCount: number
  joinedAt: number
}

export interface SensorPermissions {
  accelerometer: boolean
  gyroscope: boolean
  magnetometer: boolean
  gravity: boolean
  orientation: boolean
  gps: boolean
  light: boolean
  temperature: boolean
  humidity: boolean
  pressure: boolean
}

export interface Partner {
  id: string
  name: string
  description: string
  category: string
  logo?: string
  website?: string
  featured: boolean
}

export interface AppSettings {
  language: string
  mapStyle: string
  sensorPermissions: SensorPermissions
  notifications: boolean
  dataSharing: boolean
}

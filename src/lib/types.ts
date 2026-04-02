export interface User {
  id: string
  email?: string
  username?: string
  displayName?: string
  avatarUrl?: string
  createdAt: number
  lastLoginAt: number
  role: 'guest' | 'user' | 'partner' | 'moderator' | 'admin'
  emailVerified: boolean
  locale: string
  privacySettings: PrivacySettings
  sensorPermissions: SensorPermissions
}

export interface PrivacySettings {
  allowPublicProfile: boolean
  allowAnonymousReporting: boolean
  defaultAnonymous: boolean
  shareLocationPrecision: 'exact' | 'city' | 'region' | 'country'
  allowDataAnalytics: boolean
}

export interface SensorPermissions {
  accelerometer: boolean
  gyroscope: boolean
  magnetometer: boolean
  gps: boolean
  camera: boolean
  microphone: boolean
  ambientLight: boolean
  barometer: boolean
  temperature: boolean
  humidity: boolean
  bluetooth: boolean
  wifi: boolean
  nfc: boolean
  lastUpdated: number
}

export interface Observation {
  id: string
  userId?: string
  isAnonymous: boolean
  observedAt: number
  reportedAt: number
  location: Location
  locationAccuracy: number
  locationMethod: 'gps' | 'manual' | 'browser'
  altitude?: number
  title: string
  description: string
  duration?: number
  photos: MediaFile[]
  videos: MediaFile[]
  audio: MediaFile[]
  sensorData?: SensorDataSnapshot
  submittedClassification?: Classification
  communityClassifications: ClassificationVote[]
  topClassification?: Classification
  moderationStatus: 'pending' | 'approved' | 'flagged' | 'removed'
  moderationNotes?: string
  viewCount: number
  commentCount: number
  classificationCount: number
  visibility: 'public' | 'unlisted' | 'private'
  reportVersion: string
  updatedAt: number
}

export interface Location {
  lat: number
  lng: number
}

export interface MediaFile {
  id: string
  url: string
  thumbnailUrl?: string
  type: 'image' | 'video' | 'audio'
  mimeType: string
  sizeBytes: number
  durationSeconds?: number
  capturedAt: number
  metadata: MediaMetadata
}

export interface MediaMetadata {
  deviceModel?: string
  width?: number
  height?: number
  exif?: Record<string, any>
}

export type Classification =
  | 'astronomical'
  | 'atmospheric'
  | 'weather'
  | 'physics'
  | 'human-made'
  | 'unknown'

export interface ClassificationVote {
  userId: string
  classification: Classification
  confidence: 1 | 2 | 3 | 4 | 5
  explanation?: string
  votedAt: number
  upvotes: number
}

export interface SensorDataSnapshot {
  captureStarted: number
  captureDuration: number
  deviceInfo: DeviceInfo
  accelerometer?: AccelerometerReading[]
  gyroscope?: GyroscopeReading[]
  magnetometer?: MagnetometerReading[]
  gravity?: GravityReading[]
  orientation?: OrientationReading[]
  gps?: GPSReading[]
  barometer?: BarometerReading[]
  ambientLight?: LightReading[]
  temperature?: TemperatureReading[]
  humidity?: HumidityReading[]
  wifiScan?: WiFiScanResult[]
  bluetoothScan?: BluetoothScanResult[]
  nfcDetections?: NFCReading[]
  audioSpectrum?: AudioSpectrumReading[]
  summary: SensorSummary
}

export interface DeviceInfo {
  platform: 'web' | 'android' | 'ios'
  browser?: string
  browserVersion?: string
  os?: string
  osVersion?: string
  deviceModel?: string
  screenResolution?: string
}

export interface AccelerometerReading {
  t: number
  x: number
  y: number
  z: number
}

export interface GyroscopeReading {
  t: number
  alpha: number
  beta: number
  gamma: number
}

export interface MagnetometerReading {
  t: number
  x: number
  y: number
  z: number
  heading?: number
}

export interface GravityReading {
  t: number
  x: number
  y: number
  z: number
}

export interface OrientationReading {
  t: number
  alpha: number
  beta: number
  gamma: number
}

export interface GPSReading {
  t: number
  lat: number
  lng: number
  accuracy: number
  altitude?: number
  speed?: number
  heading?: number
}

export interface BarometerReading {
  t: number
  pressure: number
  altitude?: number
}

export interface LightReading {
  t: number
  lux: number
}

export interface TemperatureReading {
  t: number
  celsius: number
}

export interface HumidityReading {
  t: number
  percent: number
}

export interface WiFiScanResult {
  t: number
  ssid?: string
  bssid?: string
  frequency: number
  signalStrength: number
  channel: number
}

export interface BluetoothScanResult {
  t: number
  deviceId?: string
  name?: string
  rssi: number
  txPower?: number
}

export interface NFCReading {
  t: number
  tagType?: string
  detected: boolean
}

export interface AudioSpectrumReading {
  t: number
  frequencies: number[]
  magnitudes: number[]
  fundamentalFrequency?: number
  dominantFrequencies: number[]
}

export interface SensorSummary {
  sensorsActive: string[]
  samplingRate: number
  totalSamples: number
  anomaliesDetected?: string[]
}

export interface Comment {
  id: string
  observationId: string
  userId?: string
  isAnonymous: boolean
  content: string
  postedAt: number
  editedAt?: number
  parentCommentId?: string
  upvotes: number
  downvotes: number
  moderationStatus: 'approved' | 'flagged' | 'removed'
}

export interface Partner {
  id: string
  name: string
  description: string
  logoUrl: string
  websiteUrl: string
  category: PartnerCategory[]
  contactEmail: string
  approvedBy: string
  approvedAt: number
  status: 'pending' | 'active' | 'suspended'
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  displayPriority: number
  offerings: PartnerOffering[]
}

export type PartnerCategory =
  | 'books'
  | 'youtube'
  | 'equipment'
  | 'sensors'
  | 'astronomy'
  | 'physics'
  | 'astrophotography'
  | 'research'

export interface PartnerOffering {
  title: string
  description: string
  imageUrl: string
  externalUrl: string
  price?: string
  currency?: string
}

export interface ModerationFlag {
  id: string
  targetType: 'observation' | 'comment' | 'user'
  targetId: string
  reportedBy: string
  reason: FlagReason
  description?: string
  reportedAt: number
  status: 'pending' | 'reviewed' | 'actioned' | 'dismissed'
  reviewedBy?: string
  reviewedAt?: number
  actionTaken?: string
}

export type FlagReason =
  | 'spam'
  | 'harassment'
  | 'misinformation'
  | 'inappropriate-content'
  | 'privacy-violation'
  | 'duplicate'
  | 'other'

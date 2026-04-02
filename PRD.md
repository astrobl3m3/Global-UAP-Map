# Global UAP MAP - Product Requirements Document

A scientific, community-driven platform for documenting and analyzing unexplained aerial phenomena through structured observation reporting, device sensor telemetry, and collaborative analysis.

**Experience Qualities**:
1. **Scientific Credibility** - The platform prioritizes data accuracy, transparency, and evidence-based analysis over sensationalism
2. **Empowering Transparency** - Users maintain full control over their data with clear visibility into what's collected and how it's used
3. **Community-Driven Discovery** - Collaborative analysis and peer classification build collective understanding of phenomena

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This is a sophisticated platform combining real-time sensor data collection, geospatial visualization, media management, community interaction, privacy controls, and multi-role access management requiring multiple coordinated views and workflows.

## Essential Features

### Map-Based Observation Recording
- **Functionality**: Interactive global map allowing users to pinpoint sighting locations via manual placement, browser geolocation, or GPS coordinates
- **Purpose**: Establishes precise geographic context for all observations and enables spatial pattern analysis
- **Trigger**: User clicks "Report Sighting" button from main map view
- **Progression**: View map → Select location (pin/GPS/auto) → Confirm coordinates → Proceed to details form
- **Success criteria**: Location accuracy within 10m for GPS, manual pin placement functional across all zoom levels

### Multimedia Evidence Capture
- **Functionality**: Integrated photo, video, and audio recording with device camera/microphone access, including real-time audio spectrum visualization during recording
- **Purpose**: Provides visual and auditory evidence to support textual descriptions, with live frequency analysis for detecting anomalous audio patterns
- **Trigger**: User taps media capture buttons within report form
- **Progression**: Request permission → Open capture interface → Record/capture (with live spectrum for audio) → Preview → Attach to report → Continue or add more media
- **Success criteria**: All media types successfully upload, preview correctly, and associate with report metadata. Audio recordings display real-time frequency spectrum during capture showing dominant frequencies and peak levels

### Device Sensor Telemetry Collection
- **Functionality**: Automatic collection of available device sensors (accelerometer, gyroscope, magnetometer, light, pressure, etc.) during observation
- **Purpose**: Captures environmental and device state data that may correlate with phenomena observations
- **Trigger**: User enables sensor collection in report form or via settings
- **Progression**: Request sensor permissions → User grants/denies per sensor → Collect data during observation window → Attach telemetry to report → Display collected data summary
- **Success criteria**: Sensors collect at specified intervals, data persists with report, users can review before submission

### Anonymous & Identified Reporting
- **Functionality**: Toggle between anonymous submission and identified posting with user profile
- **Purpose**: Encourages reporting without fear of identification while allowing credibility building for verified users
- **Trigger**: User selects identity mode in report form
- **Progression**: Choose anonymous/identified → (If identified) confirm profile display → Submit with chosen attribution
- **Success criteria**: Reports correctly display attribution state, anonymous reports show no user linkage

### Community Observation Gallery
- **Functionality**: Public feed of all submitted sightings with filtering, search, and classification
- **Purpose**: Enables community review, discussion, and pattern recognition across reports
- **Trigger**: User navigates to Gallery tab
- **Progression**: View gallery grid/list → Filter by date/location/classification → Select observation → View details → Add comment/classification
- **Success criteria**: Gallery loads performantly with 100+ entries, filters work accurately, real-time updates appear

### Observation Classification System
- **Functionality**: Community voting on observation categories (Astronomical, Atmospheric, Weather, Physics, Human-Made, Unknown)
- **Purpose**: Crowdsources expert and community analysis to identify likely explanations
- **Trigger**: User views observation detail and selects classification
- **Progression**: View observation → Review evidence → Select classification category → Optionally add explanation → Submit classification
- **Success criteria**: Classifications aggregate correctly, top classification displays prominently, users can change votes

### Geographic Heatmap Visualization
- **Functionality**: Visual density map showing concentration of sightings across regions
- **Purpose**: Reveals geographic patterns and hotspot areas for investigation
- **Trigger**: User toggles heatmap view on main map
- **Progression**: View map → Enable heatmap layer → Density visualization renders → Zoom to explore regions → Click hotspots to see sightings
- **Success criteria**: Heatmap updates in real-time, accurately represents report density, performant at global and local scales

### Device Sensor Testing Mode
- **Functionality**: Standalone mode for testing and visualizing all available device sensors without reporting
- **Purpose**: Educational tool and debugging interface for understanding device capabilities
- **Trigger**: User navigates to Sensor Tester from settings or tools menu
- **Progression**: Open sensor tester → Grant sensor permissions → View live sensor data streams → Test individual sensors → Export data → Exit tester
- **Success criteria**: All available sensors display real-time data, visualizations are clear and responsive, export produces valid data file

### Granular Privacy Controls
- **Functionality**: Per-sensor permission toggles, data export, and deletion capabilities
- **Purpose**: GDPR compliance and user trust through transparency and control
- **Trigger**: User accesses Privacy & Data settings
- **Progression**: Open settings → View sensor permissions → Toggle individual sensors → Request data export/deletion → Confirm action → Receive confirmation
- **Success criteria**: Permissions persist correctly, export delivers complete data, deletion removes all user data within 30 days

### Partner Content Showcase
- **Functionality**: Curated section featuring approved partners (books, equipment, research institutions)
- **Purpose**: Sustainable platform through relevant commercial partnerships while supporting scientific community
- **Trigger**: User navigates to Partners tab
- **Progression**: View partner grid → Filter by category → Select partner → View details/offerings → External link/action
- **Success criteria**: Partners display correctly with clear attribution, links function, content is clearly marked as partner-sponsored

## Edge Case Handling

- **Offline Reporting**: Draft reports save locally and sync when connection restores
- **Permission Denial**: App gracefully handles denied sensor/media permissions with clear explanations
- **GPS Unavailable**: Manual map pin placement remains functional when geolocation fails
- **Duplicate Reports**: System detects potential duplicates by time/location and prompts user to review existing reports
- **Abusive Content**: Flagging system allows community reporting with moderator review queue
- **Sensor Unavailability**: UI adapts to show only available sensors per device capability
- **Large Media Files**: Compression and progressive upload for video/photo handling
- **Browser Compatibility**: Fallback UX for browsers without sensor API support

## Design Direction

The design should evoke **scientific rigor, measured curiosity, and data-driven discovery**. The interface should feel like a professional research instrument - precise, informative, and focused on evidence rather than speculation. Think observatory control panel meets modern data visualization platform. The aesthetic should inspire confidence in serious researchers while remaining accessible to the general public.

## Color Selection

A dark-themed, night-sky inspired palette emphasizing clarity and reducing eye strain for extended observation sessions, with accent colors that highlight data and actionable elements.

- **Primary Color**: Deep Space Blue `oklch(0.25 0.08 250)` - Communicates scientific authority and night-sky observation context
- **Secondary Color**: Slate Gray `oklch(0.35 0.02 250)` - Supporting surface color for cards and panels, maintaining visual hierarchy
- **Accent Color**: Stellar Cyan `oklch(0.75 0.15 200)` - High-visibility highlight for interactive elements, data points, and call-to-actions
- **Destructive Color**: Alert Red `oklch(0.60 0.22 25)` - Reserved for warnings and destructive actions
- **Success Color**: Confirmation Green `oklch(0.70 0.15 150)` - Positive feedback and successful states
- **Foreground/Background Pairings**:
  - Background `oklch(0.15 0.02 250)` on Deep Space: Light Gray text `oklch(0.95 0.01 250)` - Ratio 12.8:1 ✓
  - Primary `oklch(0.25 0.08 250)`: White text `oklch(0.98 0 0)` - Ratio 11.2:1 ✓
  - Accent Cyan `oklch(0.75 0.15 200)`: Dark text `oklch(0.15 0.02 250)` - Ratio 9.5:1 ✓
  - Secondary Slate `oklch(0.35 0.02 250)`: Light text `oklch(0.95 0.01 250)` - Ratio 7.1:1 ✓

## Font Selection

Typography should project technical precision while maintaining excellent readability for extended reading of observation reports and data analysis.

- **Primary Typeface**: Space Grotesk - A geometric sans-serif with technical character suitable for both UI elements and body content, evoking precision instruments
- **Data Typeface**: JetBrains Mono - Monospace font for sensor data, coordinates, timestamps, and technical readouts

**Typographic Hierarchy**:
- H1 (Page Titles): Space Grotesk Bold / 32px / tight letter-spacing (-0.02em)
- H2 (Section Headers): Space Grotesk Semibold / 24px / normal letter-spacing
- H3 (Card Titles): Space Grotesk Medium / 18px / normal letter-spacing
- Body (Descriptions): Space Grotesk Regular / 16px / relaxed line-height (1.6)
- Caption (Metadata): Space Grotesk Regular / 14px / muted color
- Data (Sensor Readouts): JetBrains Mono Medium / 14px / tabular spacing

## Animations

Animations should feel measured and purposeful, like scientific instruments coming online and data flowing through the system. Transitions should be smooth but quick, never impeding the user's workflow. Use subtle physics-based motion for interactive elements, with particular attention to map transitions, sensor data visualization updates, and state changes. Avoid flashy effects that would undermine the scientific credibility of the platform.

## Component Selection

**Components**:
- **Map Interface**: Full-viewport map component with custom overlays for pins, heatmap layer, and clustering
- **Dialog**: For report submission forms, media preview, and sensor permission flows
- **Card**: Observation cards in gallery, partner showcases, sensor data readouts
- **Tabs**: Main navigation between Map, Gallery, Sensors, Partners, Profile
- **Sheet**: Mobile-optimized bottom drawer for report details and sensor controls
- **Button**: Primary actions (Report Sighting, Submit), secondary (Cancel, Options), icon-only (sensor toggles)
- **Switch**: Sensor permission toggles, anonymous posting toggle
- **Input/Textarea**: Location description, observation details, comments
- **Select**: Classification categories, filter dropdowns, language selection
- **Badge**: Classification labels, sensor status indicators, new content markers
- **Avatar**: User profiles (when identified)
- **Accordion**: Sensor permission groups, FAQ sections
- **ScrollArea**: Long observation lists, sensor data streams
- **Separator**: Visual breaks between content sections
- **Tooltip**: Sensor explanations, icon clarifications
- **Toast**: Upload confirmations, error messages, permission prompts

**Customizations**:
- Custom Map component integrating OpenStreetMap with Leaflet
- Custom Heatmap overlay with gradient from transparent to accent color
- Custom Sensor Visualizer components for real-time data graphs
- Custom Media Capture interface with device API integration
- Custom classification voting component with visual aggregation
- **Custom LiveAudioSpectrum component**: Real-time frequency spectrum analyzer displaying dominant frequencies, peak levels, and waveform visualization during audio recording with FFT-based frequency analysis

**States**:
- Buttons: Distinct hover with cyan glow, active with scale reduction (0.98), disabled with reduced opacity
- Inputs: Focus with cyan ring and subtle lift effect, error state with red border pulse
- Cards: Hover elevation increase, selected state with accent border
- Switches: Smooth slide transition with color fade, haptic-style animation on toggle
- Map pins: Pulse animation on new reports, cluster expansion on interaction

**Icon Selection**:
- MapPin, MapTrifold - Location and mapping
- Camera, VideoCamera, Microphone - Media capture
- **Waveform, SpeakerHigh** - Real-time audio spectrum analysis and frequency visualization
- Compass, DeviceMobile, WifiHigh - Sensors
- ChartBar, TrendUp - Analytics
- Eye, EyeSlash - Privacy controls
- Users, ChatCircle - Community features
- ShieldCheck - Security and verification
- Export, Trash - Data management
- Plus, Check, X - Standard actions
- Warning, Info - Alerts and information

**Spacing**:
- Base unit: 4px
- Tight spacing: 8px (between related elements)
- Standard spacing: 16px (between components)
- Generous spacing: 24px (between sections)
- Section spacing: 48px (between major sections)
- Container padding: 16px mobile, 24px tablet, 32px desktop

**Mobile**:
- Bottom tab bar for primary navigation on mobile/tablet
- Sheet component for report forms instead of dialogs
- Collapsible sensor controls to maximize map viewport
- Touch-optimized map controls (larger pins, zoom buttons)
- Stacked layout for observation cards in gallery
- Hamburger menu for secondary navigation and settings
- Full-screen media capture interfaces
- Floating action button for quick report creation

---

## Data Model Schemas

### Core Entities

#### User
```typescript
interface User {
  id: string                    // UUID
  email?: string                // Optional for anonymous users
  username?: string
  displayName?: string
  avatarUrl?: string
  createdAt: timestamp
  lastLoginAt: timestamp
  role: 'guest' | 'user' | 'partner' | 'moderator' | 'admin'
  emailVerified: boolean
  locale: string                // ISO 639-1 language code
  privacySettings: PrivacySettings
  sensorPermissions: SensorPermissions
}

interface PrivacySettings {
  allowPublicProfile: boolean
  allowAnonymousReporting: boolean
  defaultAnonymous: boolean
  shareLocationPrecision: 'exact' | 'city' | 'region' | 'country'
  allowDataAnalytics: boolean
}

interface SensorPermissions {
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
  lastUpdated: timestamp
}
```

#### Observation (Sighting Report)
```typescript
interface Observation {
  id: string                    // UUID
  userId?: string               // Null if anonymous
  isAnonymous: boolean
  
  // Temporal data
  observedAt: timestamp         // When phenomenon was observed
  reportedAt: timestamp         // When report was submitted
  
  // Spatial data
  location: GeoPoint
  locationAccuracy: number      // meters
  locationMethod: 'gps' | 'manual' | 'browser'
  altitude?: number             // meters above sea level
  
  // Description
  title: string                 // Max 200 chars
  description: string           // Detailed verbatim account
  duration?: number             // seconds
  
  // Media
  photos: MediaFile[]
  videos: MediaFile[]
  audio: MediaFile[]
  
  // Sensor data
  sensorData?: SensorDataSnapshot
  
  // Classification & Moderation
  submittedClassification?: Classification
  communityClassifications: ClassificationVote[]
  topClassification?: Classification
  moderationStatus: 'pending' | 'approved' | 'flagged' | 'removed'
  moderationNotes?: string
  
  // Engagement
  viewCount: number
  commentCount: number
  classificationCount: number
  
  // Privacy
  visibility: 'public' | 'unlisted' | 'private'
  
  // Metadata
  reportVersion: string         // Schema version for future compatibility
  updatedAt: timestamp
}

interface GeoPoint {
  lat: number                   // WGS84 latitude
  lng: number                   // WGS84 longitude
}

interface MediaFile {
  id: string
  url: string                   // Cloud storage URL
  thumbnailUrl?: string
  type: 'image' | 'video' | 'audio'
  mimeType: string
  sizeBytes: number
  durationSeconds?: number      // For video/audio
  capturedAt: timestamp
  metadata: MediaMetadata
}

interface MediaMetadata {
  deviceModel?: string
  width?: number
  height?: number
  exif?: Record<string, any>   // EXIF data (location stripped for privacy)
}

type Classification = 
  | 'astronomical'              // Stars, planets, satellites
  | 'atmospheric'               // Auroras, atmospheric phenomena
  | 'weather'                   // Lightning, weather balloons
  | 'physics'                   // Lens flares, reflections
  | 'human-made'                // Aircraft, drones, fireworks
  | 'unknown'                   // Genuinely unexplained

interface ClassificationVote {
  userId: string
  classification: Classification
  confidence: 1 | 2 | 3 | 4 | 5  // 1=low, 5=high
  explanation?: string
  votedAt: timestamp
  upvotes: number
}
```

#### SensorDataSnapshot
```typescript
interface SensorDataSnapshot {
  captureStarted: timestamp
  captureDuration: number       // milliseconds
  deviceInfo: DeviceInfo
  
  // Motion sensors (arrays of timestamped readings)
  accelerometer?: AccelerometerReading[]
  gyroscope?: GyroscopeReading[]
  magnetometer?: MagnetometerReading[]
  gravity?: GravityReading[]
  orientation?: OrientationReading[]
  
  // Environmental
  gps?: GPSReading[]
  barometer?: BarometerReading[]
  ambientLight?: LightReading[]
  temperature?: TemperatureReading[]
  humidity?: HumidityReading[]
  
  // Connectivity & Proximity
  wifiScan?: WiFiScanResult[]
  bluetoothScan?: BluetoothScanResult[]
  nfcDetections?: NFCReading[]
  
  // Audio analysis
  audioSpectrum?: AudioSpectrumReading[]
  
  // Summary statistics
  summary: SensorSummary
}

interface DeviceInfo {
  platform: 'web' | 'android' | 'ios'
  browser?: string
  browserVersion?: string
  os?: string
  osVersion?: string
  deviceModel?: string
  screenResolution?: string
}

interface AccelerometerReading {
  t: number                     // milliseconds from captureStarted
  x: number                     // m/s²
  y: number
  z: number
}

interface GyroscopeReading {
  t: number
  alpha: number                 // degrees/second
  beta: number
  gamma: number
}

interface MagnetometerReading {
  t: number
  x: number                     // microtesla (µT)
  y: number
  z: number
  heading?: number              // degrees from north
}

interface GPSReading {
  t: number
  lat: number
  lng: number
  accuracy: number              // meters
  altitude?: number             // meters
  speed?: number                // m/s
  heading?: number              // degrees
}

interface BarometerReading {
  t: number
  pressure: number              // hectopascals (hPa)
  altitude?: number             // derived altitude in meters
}

interface LightReading {
  t: number
  lux: number                   // illuminance in lux
}

interface TemperatureReading {
  t: number
  celsius: number
}

interface HumidityReading {
  t: number
  percent: number               // 0-100
}

interface WiFiScanResult {
  t: number
  ssid?: string                 // Hashed for privacy
  bssid?: string                // Hashed for privacy
  frequency: number             // MHz
  signalStrength: number        // dBm
  channel: number
}

interface BluetoothScanResult {
  t: number
  deviceId?: string             // Hashed for privacy
  name?: string
  rssi: number                  // signal strength
  txPower?: number
}

interface NFCReading {
  t: number
  tagType?: string
  detected: boolean
}

interface AudioSpectrumReading {
  t: number
  frequencies: number[]         // Hz
  magnitudes: number[]          // dB
  fundamentalFrequency?: number // Hz
  dominantFrequencies: number[] // Top 5 frequencies
}

interface SensorSummary {
  sensorsActive: string[]
  samplingRate: number          // Hz
  totalSamples: number
  anomaliesDetected?: string[]  // Detected unusual patterns
}
```

#### Comment
```typescript
interface Comment {
  id: string
  observationId: string
  userId?: string               // Null if anonymous
  isAnonymous: boolean
  content: string
  postedAt: timestamp
  editedAt?: timestamp
  parentCommentId?: string      // For threaded replies
  upvotes: number
  downvotes: number
  moderationStatus: 'approved' | 'flagged' | 'removed'
}
```

#### Partner
```typescript
interface Partner {
  id: string
  name: string
  description: string
  logoUrl: string
  websiteUrl: string
  category: PartnerCategory[]
  contactEmail: string
  approvedBy: string            // Admin user ID
  approvedAt: timestamp
  status: 'pending' | 'active' | 'suspended'
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  displayPriority: number
  offerings: PartnerOffering[]
}

type PartnerCategory = 
  | 'books'
  | 'youtube'
  | 'equipment'
  | 'sensors'
  | 'astronomy'
  | 'physics'
  | 'astrophotography'
  | 'research'

interface PartnerOffering {
  title: string
  description: string
  imageUrl: string
  externalUrl: string
  price?: string
  currency?: string
}
```

#### ModerationFlag
```typescript
interface ModerationFlag {
  id: string
  targetType: 'observation' | 'comment' | 'user'
  targetId: string
  reportedBy: string            // User ID
  reason: FlagReason
  description?: string
  reportedAt: timestamp
  status: 'pending' | 'reviewed' | 'actioned' | 'dismissed'
  reviewedBy?: string           // Moderator user ID
  reviewedAt?: timestamp
  actionTaken?: string
}

type FlagReason = 
  | 'spam'
  | 'harassment'
  | 'misinformation'
  | 'inappropriate-content'
  | 'privacy-violation'
  | 'duplicate'
  | 'other'
```

### Database Relationships

```
Users (1) ──< (many) Observations
Users (1) ──< (many) Comments
Users (1) ──< (many) ClassificationVotes
Users (1) ──< (many) ModerationFlags

Observations (1) ──< (many) Comments
Observations (1) ──< (many) ClassificationVotes
Observations (1) ──< (many) MediaFiles
Observations (1) ──? (one optional) SensorDataSnapshot

Partners (1) ──< (many) PartnerOfferings
```

### Indexes & Performance

**Critical Indexes:**
- `Observations.location` (geospatial index for map queries)
- `Observations.observedAt` (temporal queries)
- `Observations.userId` (user's observations)
- `Observations.moderationStatus` (filtering)
- `Comments.observationId` (fetch comments for observation)
- `ClassificationVotes.observationId` (aggregate classifications)
- `Users.email` (authentication)
- `ModerationFlags.status` (moderator queue)

**Caching Strategy:**
- Heatmap data: 15-minute cache
- Popular observations: 5-minute cache
- User session data: Local storage
- Sensor data: No caching (privacy)

---

## Privacy & Sensor Permission UX Wording

### First-Time Sensor Permission Request

**Dialog Title:** "Enable Device Sensors for Scientific Data Collection"

**Body Text:**
> Global UAP MAP collects device sensor data to provide environmental context for your observations. This helps the scientific community analyze patterns and correlations.
>
> **You are always in control:**
> - Choose which sensors to enable
> - See exactly what data is collected
> - Disable sensors at any time
> - Export or delete your data whenever you want
>
> Your sensor data is:
> ✓ Encrypted in transit and at rest
> ✓ Never sold to third parties
> ✓ Only used for research purposes
> ✓ Anonymized in aggregate studies
>
> Would you like to review sensor options now?

**Buttons:** "Review Sensors" (primary), "Skip for Now" (secondary)

---

### Individual Sensor Permission Cards

#### Accelerometer & Gyroscope
**What it measures:** Device movement, tilt, and rotation

**Why we collect it:** Detects if your device was moving during the observation, which could affect camera shake or indicate movement of the phenomenon.

**Data collected:** X, Y, Z acceleration and rotation rates sampled at 10Hz

**Privacy note:** This data cannot identify you or your location.

---

#### Magnetometer (Compass)
**What it measures:** Magnetic field strength and direction

**Why we collect it:** Unusual magnetic field variations have been reported during some phenomena. This sensor also detects nearby metal objects.

**Data collected:** 3-axis magnetic field readings in microteslas (µT)

**Privacy note:** This sensor cannot track your location or identify you.

**Experimental:** This feature is considered experimental for anomaly detection.

---

#### GPS & Location
**What it measures:** Your precise geographic location

**Why we collect it:** Essential for mapping observations and identifying geographic patterns or hotspots.

**Data collected:** Latitude, longitude, altitude, accuracy, and speed

**Privacy note:** Your exact location is sensitive data. You can choose to:
- Share exact coordinates (for scientific precision)
- Round to city level (~10km radius)
- Round to region level (~100km radius)
- Submit without location (not recommended)

---

#### Camera & Microphone
**What it measures:** Visual and audio recordings

**Why we collect it:** Photos, videos, and audio provide crucial evidence for analysis and verification.

**Data collected:** Media files with timestamps (location data is stripped from EXIF by default)

**Privacy note:** Only media you explicitly capture and choose to upload is collected. You can preview and delete before submission.

---

#### Ambient Light Sensor
**What it measures:** Surrounding light intensity in lux

**Why we collect it:** Sudden changes in ambient light may correlate with luminous phenomena. Also helps validate visibility conditions.

**Data collected:** Light level readings sampled at 1Hz

**Privacy note:** Cannot determine your location or activities.

---

#### Barometer (Air Pressure)
**What it measures:** Atmospheric pressure

**Why we collect it:** Weather and atmospheric conditions may influence certain phenomena. Pressure changes can indicate altitude changes or weather systems.

**Data collected:** Pressure readings in hectopascals (hPa)

**Privacy note:** Cannot identify you or your precise location.

---

#### Wi-Fi & Bluetooth Scanning
**What it measures:** Nearby wireless signals (not content)

**Why we collect it:** Signal interference patterns may correlate with electromagnetic phenomena. Signal strength changes can act as a proximity detector.

**Data collected:** Anonymized network identifiers (hashed), signal strengths, frequencies

**Privacy note:** We hash all network names and device IDs. We cannot see what networks you connect to or any data transmitted.

**Experimental:** This feature is highly experimental and used for electromagnetic interference research.

---

#### Temperature & Humidity
**What it measures:** Ambient temperature and relative humidity

**Why we collect it:** Environmental context for atmospheric phenomena analysis.

**Data collected:** Temperature in Celsius and humidity percentage

**Privacy note:** Available only on devices with these sensors. Cannot identify you.

**Availability:** Limited to select devices.

---

### Sensor Data Summary (Pre-Submission)

**Title:** "Review Your Sensor Data"

**Body:**
> Before submitting your report, review what sensor data was collected:
>
> **Sensors Active:** [List of enabled sensors with checkmarks]
>
> **Duration:** [X minutes, Y seconds]
>
> **Sample Count:** [Total number of readings]
>
> **Detected Patterns:**
> - [Optional: "Unusual magnetic field variation detected"]
> - [Optional: "Significant device movement during capture"]
> - [Optional: "Ambient light level dropped by 40%"]
>
> You can download this raw data for your records or exclude any sensor from submission.

**Actions:**
- "Download Raw Data" (JSON export)
- "Remove [Sensor Name]" (per sensor)
- "Include All & Continue" (primary button)
- "Submit Without Sensor Data" (secondary)

---

### Data Export Request Confirmation

**Title:** "Request Your Data Export"

**Body:**
> As part of your privacy rights under GDPR and similar regulations, you can request a complete export of all your data.
>
> **Your export will include:**
> - All observations you've submitted (including anonymous ones tied to your session)
> - Comments and classifications
> - All sensor data collected
> - Account information and settings
> - Activity logs
>
> **Format:** JSON archive (machine-readable)
>
> **Delivery:** We'll email you a secure download link within 48 hours
>
> **Note:** This export does not delete your data. If you want to delete your account, use the "Delete My Account" option below.

**Buttons:** "Request Export", "Cancel"

---

### Data Deletion Request Confirmation

**Title:** "Delete My Account and Data"

**Body:**
> ⚠️ **This action cannot be undone.**
>
> Deleting your account will:
> - Permanently remove your profile and account
> - Delete all sensor data associated with your reports
> - Remove your name from any identified observations (they'll become anonymous)
> - Delete all comments and classifications you've made
> - Erase all media you've uploaded
>
> **What will remain:**
> - Anonymous observation records (without your identity) may remain for scientific research purposes only, aggregated and de-identified according to GDPR Article 89
> - Publicly visible observations you submitted will become permanently anonymous
>
> **Timeline:** Complete deletion within 30 days
>
> **Before you go:** Would you like to export your data first?

**Buttons:** "Export First", "Delete Everything", "Cancel"

---

### Anonymous Posting Toggle

**Label:** "Submit Anonymously"

**Help Text:** 
> Your observation will be published without any connection to your account. You won't be able to edit or delete it later, and you won't receive credit for the contribution.
>
> Choose anonymous if:
> - You prefer complete privacy
> - You're reporting a sensitive location
> - You don't want notifications about this report
>
> Note: We still collect IP addresses and device fingerprints for abuse prevention, but these are never published.

---

## Monetization & Partner Ethics Guardrails

### Partner Vetting Process

**Eligibility Criteria:**
1. **Scientific Integrity**: Partners must not promote pseudoscience, conspiracy theories, or products making unverifiable claims
2. **Educational Value**: Products/services should genuinely support observation, research, or education
3. **Transparency**: All pricing, affiliations, and business relationships must be clearly disclosed
4. **Data Ethics**: Partners may not require or request user data from the platform
5. **No Exploitation**: No fear-mongering, sensationalism, or exploitation of users' genuine curiosity

**Prohibited Partner Categories:**
- ❌ Conspiracy theory content creators
- ❌ Unverified "alien technology" or "free energy" products
- ❌ Psychic services, remote viewing, or paranormal investigation tools without scientific basis
- ❌ Products claiming to "attract" or "communicate with" extraterrestrial beings
- ❌ Any content promoting harm, discrimination, or dangerous activities
- ❌ Multi-level marketing (MLM) schemes

**Approved Partner Categories:**
- ✅ Astronomy equipment (telescopes, star trackers, filters)
- ✅ Science education books and courses
- ✅ Legitimate sensor equipment (magnetometers, spectrometers, radiation detectors)
- ✅ Astrophotography gear and software
- ✅ University research programs and citizen science initiatives
- ✅ Evidence-based physics and atmospheric science content
- ✅ Night sky observation tools and apps
- ✅ Weather monitoring equipment
- ✅ Reputable science communication YouTube channels

### Partner Content Display Requirements

**Mandatory Disclosures:**
- "Partner Content" badge on all partner materials
- "This is a paid partnership" notice where applicable
- Clear separation from user-generated content
- Dedicated Partners section (not mixed with observations)
- "Ad" or "Sponsored" labels on featured placements

**Revenue Sharing Models:**
1. **Affiliate Commission**: 5-15% commission on product sales via platform links
2. **Sponsored Placements**: Fixed monthly fee for featured positioning
3. **Premium Listings**: Annual fee for enhanced partner profile

**Reinvestment Commitment:**
- Minimum 40% of partner revenue reinvested into platform development
- 20% allocated to open scientific research grants
- Platform remains free for all core features (no paywalls for reporting or viewing data)

### Advertising Policy

**Never Allowed:**
- Ads in the reporting flow
- Ads overlaying map or observation data
- Retargeting based on user observations
- Sale of user location or sensor data
- Third-party ad networks with behavior tracking

**Potentially Allowed (with strict limits):**
- Contextual partner suggestions (e.g., "Need a magnetometer? See partner equipment")
- Optional newsletter with partner highlights (opt-in only)
- Annual partner showcase event

---

## Scientific Credibility Disclaimer Copy

### Global Site Disclaimer (Footer)

**Scientific Observation Disclaimer**

> Global UAP MAP is a community-driven platform for documenting unexplained aerial phenomena. All observations represent the subjective experiences of individual users and have not been independently verified.
>
> **This platform is not:**
> - A scientific authority on UAPs or extraterrestrial life
> - A source of verified or peer-reviewed research
> - A replacement for official reporting channels (e.g., aviation authorities)
>
> **This platform is:**
> - A tool for citizen science and data collection
> - A community for discussion and hypothesis sharing
> - A repository of observations for future analysis
>
> Most observations can be explained by natural or human-made phenomena including: aircraft, satellites, weather balloons, atmospheric effects, astronomical objects, drones, or optical phenomena.
>
> We encourage critical thinking, scientific skepticism, and evidence-based analysis. Extraordinary claims require extraordinary evidence.

---

### Individual Observation Disclaimer

**Displayed on every observation detail page:**

> ⓘ **Observation Notice**
>
> This report represents one person's observation and interpretation. It has not been independently verified. Community classifications are crowdsourced opinions, not scientific conclusions.
>
> If you witnessed a similar event, you can add a corroborating report or comment with your classification below.

---

### Sensor Data Experimental Notice

**Displayed when viewing sensor data:**

> 🧪 **Experimental Data**
>
> Sensor data collection is experimental and intended for research purposes. Device sensors have varying accuracy, and readings may be affected by device conditions, user movement, or environmental factors.
>
> Correlation between sensor readings and phenomena does not imply causation. Scientific analysis requires controlled conditions and replication.

---

### Report Submission Acknowledgment

**User must check box before submitting:**

> ☑ I understand that:
> - My report will be public and may be analyzed for research
> - I should only report genuine observations to the best of my knowledge
> - Deliberately false or misleading reports harm the scientific credibility of this platform
> - Most unexplained observations have natural or human-made explanations
> - This platform is not affiliated with any government or official investigation body

---

## Roadmap: MVP → Advanced Research Platform

### Phase 1: MVP (Months 1-3) - Foundation
**Goal:** Functional observation reporting and community platform

**Core Features:**
- ✅ Map-based observation reporting (manual pin + GPS)
- ✅ Photo/video upload (max 3 per report)
- ✅ Basic sensor data collection (GPS, accelerometer, magnetometer)
- ✅ User authentication (email/password + Google OAuth)
- ✅ Anonymous reporting option
- ✅ Public gallery view with filtering
- ✅ Basic classification system (6 categories)
- ✅ Simple comment threads
- ✅ Mobile-responsive web app
- ✅ Privacy settings and sensor permissions
- ✅ Admin moderation panel

**Success Metrics:**
- 100+ unique observations submitted
- 500+ registered users
- <3 second map load time
- Zero data breaches

---

### Phase 2: Community & Engagement (Months 4-6)
**Goal:** Build active community and improve data quality

**Features:**
- Geographic heatmap visualization
- Advanced filtering (date range, classification, distance)
- Observation clustering on map
- User profiles and reputation system
- Email notifications for comments/replies
- Enhanced media player (zoom, full-screen video)
- Multi-photo uploads (up to 10)
- Observation search (keyword, location)
- Data export for users (JSON)
- Partner directory (first 5-10 partners)
- Multi-language support (EN, ES, PT, FR, DE)

**Success Metrics:**
- 1,000+ observations
- 50%+ observations with community classifications
- 10+ active daily users
- 5+ vetted partners

---

### Phase 3: Advanced Sensors & Research Tools (Months 7-12)
**Goal:** Transform into serious research platform

**Features:**
- Full sensor suite integration (15+ sensors)
- Sensor testing mode (standalone)
- Audio spectrum analysis
- Bluetooth/Wi-Fi scanning (anonymized)
- Advanced sensor data visualization (graphs, timelines)
- Observation correlation engine (find similar reports)
- Weather API integration (historical conditions)
- Satellite pass prediction (identify ISS, Starlink)
- Astronomy API integration (planet positions, meteor showers)
- Bulk data export for researchers (CSV, JSON)
- API access for research institutions (OAuth-based)
- Enhanced moderation tools (AI-assisted flagging)
- Community voting on classifications (weighted by reputation)

**Success Metrics:**
- 5,000+ observations with sensor data
- 3+ research institutions using API
- 50+ partner relationships
- Published research citing platform data

---

### Phase 4: Mobile Apps & Real-Time Features (Months 13-18)
**Goal:** Native mobile apps and live observation features

**Features:**
- Native iOS app (Swift/SwiftUI)
- Native Android app (Kotlin/Jetpack Compose)
- Push notifications (nearby observations, alerts)
- Real-time observation feed (WebSocket updates)
- Live sensor streaming during observations
- Augmented reality (AR) overlay for sky observation
- Offline mode (draft observations sync when online)
- Advanced photo analysis (object detection, sky identification)
- Observation "quality score" based on evidence completeness
- Researcher verification badges
- Observation corroboration system (link related reports)
- Pattern detection alerts (unusual activity in region)

**Success Metrics:**
- 10,000+ mobile app installs
- 10,000+ total observations
- 1,000+ observations with full sensor suite
- App Store rating >4.5 stars

---

### Phase 5: Advanced Research Platform (Months 19-24)
**Goal:** Become leading citizen science platform for atmospheric phenomena

**Features:**
- Machine learning classification suggestions
- Automated duplicate detection
- 3D observation reconstruction (photogrammetry)
- Time-series analysis tools
- Collaboration tools (shared observation notebooks)
- Research grant program (fund community research)
- Academic partnership program
- Public API with rate limits (free tier + paid)
- Advanced data visualization dashboard
- Historical weather overlay on observations
- Flight path data integration (flight tracking APIs)
- Spectroscopy analysis tools
- Integration with professional observatory networks
- Peer review system for high-quality reports

**Success Metrics:**
- 25,000+ observations
- 5+ peer-reviewed papers using platform data
- 100+ research API users
- Platform sustainability (revenue covers costs)

---

## Backend Architecture Recommendation

### Recommended Stack: **Azure** (Primary) or **Supabase** (Alternative)

### Why Azure (Preferred for Scale & Compliance)

**Strengths:**
- ✅ **Enterprise-grade compliance**: GDPR, SOC 2, ISO 27001 compliant out of the box
- ✅ **Geospatial support**: Azure Cosmos DB has native GeoJSON and spatial indexing
- ✅ **Sensor data at scale**: Azure Time Series Insights perfect for sensor telemetry
- ✅ **Media handling**: Azure Blob Storage with CDN integration
- ✅ **Global reach**: 60+ regions for low-latency access worldwide
- ✅ **AI/ML integration**: Azure Cognitive Services for image analysis, content moderation
- ✅ **Identity**: Azure AD B2C for OAuth, social logins, MFA
- ✅ **Real-time**: Azure SignalR Service for live updates
- ✅ **Monitoring**: Application Insights for performance tracking

**Azure Architecture:**
```
┌─────────────────────────────────────────────────────┐
│                   Azure Front Door                  │
│            (CDN + WAF + DDoS Protection)            │
└─────────────────┬───────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼────┐   ┌───▼────┐   ┌───▼────┐
│ Static │   │  API   │   │SignalR │
│  Web   │   │  App   │   │Service │
│  App   │   │Service │   │(WebSkt)│
└────────┘   └───┬────┘   └────────┘
                 │
      ┌──────────┼──────────┐
      │          │          │
  ┌───▼───┐  ┌──▼───┐  ┌───▼────┐
  │Cosmos │  │ Blob │  │  Time  │
  │  DB   │  │Store │  │ Series │
  │(NoSQL)│  │(Media│  │Insights│
  └───────┘  └──────┘  └────────┘
      │
  ┌───▼────────┐
  │  Cognitive │
  │  Services  │
  │ (Vision AI)│
  └────────────┘
```

**Services Breakdown:**

1. **Azure Cosmos DB** (NoSQL, globally distributed)
   - Users, Observations, Comments, Classifications
   - Geospatial indexing for map queries
   - Multi-region writes for global users
   - Automatic scaling
   - **Cost**: ~$200-500/month (small scale), scales linearly

2. **Azure Blob Storage** (Media files)
   - Hot tier for recent media
   - Cool tier for older media (auto-lifecycle)
   - CDN integration for fast delivery
   - **Cost**: ~$50-150/month + bandwidth

3. **Azure Time Series Insights** (Sensor data)
   - Optimized for timestamped sensor readings
   - Fast querying and visualization
   - Data retention policies
   - **Cost**: ~$150-300/month

4. **Azure App Service** (Backend API)
   - Node.js/Express or Python/FastAPI
   - Auto-scaling
   - Easy deployment (GitHub Actions)
   - **Cost**: ~$100-200/month (Basic tier)

5. **Azure Static Web Apps** (Frontend)
   - Host React app
   - Free SSL
   - Global CDN
   - **Cost**: Free tier or ~$10/month (Standard)

6. **Azure AD B2C** (Authentication)
   - OAuth, social logins
   - MFA support
   - **Cost**: Free for first 50k users, then ~$0.05/user

7. **Azure Cognitive Services**
   - Computer Vision API (content moderation, object detection)
   - Content Moderator (auto-flag inappropriate content)
   - **Cost**: Pay-per-use, ~$1-5 per 1k images

**Total Estimated Monthly Cost (MVP):** $500-1,000/month
**Total Estimated Monthly Cost (10k users):** $1,500-3,000/month

---

### Alternative: Supabase (Fast MVP, Lower Initial Cost)

**Strengths:**
- ✅ **Rapid development**: Built-in auth, real-time, storage, database
- ✅ **PostgreSQL**: Reliable, SQL-based with PostGIS for geospatial
- ✅ **Open source**: Self-hostable if needed
- ✅ **Real-time subscriptions**: Built-in WebSocket support
- ✅ **Lower initial cost**: Free tier for MVP
- ✅ **Developer-friendly**: Great DX with SDKs
- ✅ **Edge functions**: Serverless compute

**Weaknesses:**
- ⚠️ Limited sensor data optimization (not time-series focused)
- ⚠️ Smaller scale ceiling (best for <100k users)
- ⚠️ Self-management if scaling beyond hosted limits
- ⚠️ Fewer AI/ML integrations (need third-party)

**Supabase Architecture:**
```
┌──────────────────────────────────────┐
│         Supabase Hosted              │
│  ┌────────────────────────────┐      │
│  │   PostgreSQL + PostGIS     │      │
│  │   (Users, Observations)    │      │
│  └────────────────────────────┘      │
│  ┌────────────────────────────┐      │
│  │   Supabase Storage         │      │
│  │   (Photos, Videos)         │      │
│  └────────────────────────────┘      │
│  ┌────────────────────────────┐      │
│  │   Supabase Auth            │      │
│  │   (OAuth, Email/Password)  │      │
│  └────────────────────────────┘      │
│  ┌────────────────────────────┐      │
│  │   Edge Functions           │      │
│  │   (API Routes, Webhooks)   │      │
│  └────────────────────────────┘      │
└──────────────────────────────────────┘
```

**Supabase Cost:**
- **Free Tier**: Up to 500MB database, 1GB storage, 2GB bandwidth
- **Pro Tier**: $25/month (8GB database, 100GB storage)
- **Team Tier**: $599/month (better performance, more storage)

**Recommendation:** Supabase for MVP (months 1-6), migrate to Azure if scaling beyond 10k users or need advanced AI features.

---

### Firebase (Not Recommended)

**Why NOT Firebase:**
- ❌ Poor geospatial query support (no PostGIS equivalent)
- ❌ NoSQL only (Firestore) - complex queries are difficult
- ❌ Expensive bandwidth costs at scale
- ❌ Limited sensor data handling
- ❌ Vendor lock-in (hard to migrate away)

---

### Self-Hosted (Not Recommended for MVP)

**Why NOT self-hosted initially:**
- ❌ Operational overhead (DevOps, scaling, monitoring)
- ❌ Compliance burden (GDPR, SOC 2 self-certification)
- ❌ Security responsibility (patches, updates, pen testing)
- ❌ Uptime guarantees (need 24/7 monitoring)

**When to consider:** If platform grows beyond $5k/month cloud costs and has dedicated DevOps team.

---

## App Store & Play Store Compliance Risks

### High-Risk Sensor Usage Compliance

#### Apple App Store Review Guidelines Concerns

**1. Location Data (2.5.3)**
- **Risk**: Continuous GPS tracking during observations
- **Mitigation**: 
  - Only request location when user initiates report
  - Clearly explain in permission dialog: "Location is used to map your observation"
  - Provide privacy policy link in app and metadata
  - Use `NSLocationWhenInUseUsageDescription` (never `Always`)
  - **Status**: ✅ Low risk if implemented correctly

**2. Camera & Microphone (2.5.13)**
- **Risk**: Background recording, unclear purpose
- **Mitigation**:
  - Only activate when user explicitly taps capture button
  - Visual indicator (red dot) when recording
  - Permission description: "Camera is used to capture photos/videos of phenomena"
  - Never record without explicit user action
  - **Status**: ✅ Low risk

**3. Motion & Fitness Sensors (5.1.3)**
- **Risk**: Accelerometer/gyroscope can infer health data
- **Mitigation**:
  - Clearly state: "Motion sensors measure device movement during observations, not your activity"
  - Do NOT use HealthKit APIs
  - Do NOT correlate sensor data with health/fitness
  - **Status**: ⚠️ Medium risk - emphasize non-health use case

**4. Bluetooth & Wi-Fi Scanning (5.1.2)**
- **Risk**: HIGH - Scanning for nearby devices can violate privacy
- **Apple Policy**: Apps may not scan for Bluetooth devices or Wi-Fi networks to track users
- **Mitigation**:
  - Make this feature opt-in with explicit warning
  - Hash all device identifiers immediately
  - Never persist raw MAC addresses or SSIDs
  - Provide clear scientific justification in App Review notes
  - Consider making this a "researcher mode" requiring application
  - **Status**: 🚨 HIGH RISK - May be rejected or require special approval
  - **Recommendation**: Remove from iOS v1.0, add in v2.0 after building trust with Apple

**5. NFC Scanning (2.5.7)**
- **Risk**: Low for passive detection, high if reading NFC tags
- **Mitigation**:
  - Only detect NFC presence (not read tag data)
  - Clearly label as experimental
  - **Status**: ⚠️ Medium risk

**6. Data Collection & Sharing (5.1.1)**
- **Risk**: Extensive sensor data collection looks like tracking
- **Mitigation**:
  - Prominent "what we collect" disclosure before first report
  - Privacy policy must detail all sensor data uses
  - Implement "Export My Data" and "Delete My Data" in-app
  - Never share data with third parties (except anonymized research)
  - **Status**: ⚠️ Medium risk - requires crystal-clear privacy policy

---

#### Google Play Store Policy Concerns

**1. Location Permissions**
- **Policy**: Must justify background location
- **Mitigation**:
  - Only request foreground location (`ACCESS_FINE_LOCATION`)
  - Never use `ACCESS_BACKGROUND_LOCATION` unless future feature requires it
  - Data Safety form: Clearly mark location as "collected" and "optional"
  - **Status**: ✅ Low risk

**2. Sensitive Permissions (Camera, Microphone, Sensors)**
- **Policy**: Must have prominent disclosure
- **Mitigation**:
  - Provide prominent in-app disclosure before requesting permissions
  - Google Play Data Safety form: Mark all sensors as collected
  - Explain data retention and deletion
  - **Status**: ✅ Low risk with proper disclosure

**3. Bluetooth & Wi-Fi Scanning**
- **Policy**: Requires `BLUETOOTH_SCAN` and `ACCESS_WIFI_STATE` permissions
- **Risk**: Moderate - seen as potentially invasive
- **Mitigation**:
  - Android 12+ requires runtime permission for Bluetooth scanning
  - Justify as "electromagnetic interference research"
  - Hash identifiers immediately
  - Make opt-in only
  - **Status**: ⚠️ Medium risk - reviewers may question necessity

**4. User Data Collection**
- **Policy**: Data Safety declaration required
- **Mitigation**:
  - Complete Data Safety questionnaire honestly
  - Mark sensor data as "optional" and "deletable"
  - Provide in-app privacy policy link
  - Implement data export/deletion
  - **Status**: ✅ Low risk with transparency

**5. Background Services**
- **Policy**: Restricted background execution
- **Mitigation**:
  - Only collect sensor data during active observation (foreground)
  - Use Foreground Service with notification if extended capture needed
  - **Status**: ✅ Low risk

---

### Compliance Checklist for App Submission

#### Pre-Submission Requirements

**iOS App Store:**
- [ ] Privacy Policy URL (required in App Store Connect)
- [ ] `Info.plist` usage descriptions for all permissions:
  - `NSLocationWhenInUseUsageDescription`
  - `NSCameraUsageDescription`
  - `NSMicrophoneUsageDescription`
  - `NSMotionUsageDescription`
  - `NSBluetoothPeripheralUsageDescription` (if using Bluetooth)
- [ ] App Privacy Details in App Store Connect (declare all data types)
- [ ] App Review Information: Explain sensor usage purpose
- [ ] Screenshots showing permission dialogs and sensor usage
- [ ] Test account for App Review (pre-populated with sample data)
- [ ] Privacy policy includes:
  - All sensor data collected
  - How data is used (research, mapping)
  - Data retention period
  - User rights (export, delete)
  - Third-party sharing (none for user data)

**Google Play Store:**
- [ ] Privacy Policy URL (required in Play Console)
- [ ] Data Safety declaration completed:
  - Location (precise, collected, optional, deletable)
  - Photos/Videos (collected, optional, deletable)
  - Audio (collected, optional, deletable)
  - Device or other IDs (sensor data - collected, optional, deletable)
- [ ] App permissions declaration (explain why each permission is needed)
- [ ] Target API 33+ (Android 13) for latest permission model
- [ ] Request permissions at runtime (not install-time)
- [ ] Content rating questionnaire (likely ESRB "Everyone")

#### App Store Rejection Risk Mitigation

**Phase 1 (MVP) - Remove high-risk sensors:**
- ❌ Wi-Fi scanning
- ❌ Bluetooth scanning
- ❌ NFC detection
- ✅ GPS, camera, microphone, accelerometer, gyroscope, magnetometer only

**Phase 2 (After establishing trust) - Re-introduce with justification:**
- Submit update with detailed explanation of scientific purpose
- Provide research partnership documentation
- Show community demand (user requests for features)
- Emphasize privacy protections (hashing, no tracking)
- Consider "Research Mode" requiring manual approval

---

### Legal & Privacy Compliance

**GDPR Requirements (EU users):**
- [ ] Privacy policy in all supported languages
- [ ] Cookie/tracking consent (if using analytics)
- [ ] Data export in machine-readable format (JSON)
- [ ] Data deletion within 30 days of request
- [ ] Clear legal basis for processing (user consent)
- [ ] Data Protection Impact Assessment (DPIA) for sensor collection
- [ ] DPO (Data Protection Officer) contact info if processing at scale

**CCPA Requirements (California users):**
- [ ] "Do Not Sell My Personal Information" link (even if you don't sell - for compliance)
- [ ] Disclosure of data categories collected
- [ ] Right to deletion and data portability

**Children's Privacy (COPPA / GDPR-K):**
- [ ] Age gate: Do NOT allow users under 13 (US) or 16 (EU) without parental consent
- [ ] Age verification at registration
- [ ] Stricter data collection limits for minors if allowed

---

### Recommendation: Launch Strategy

**Initial Launch (Low-Risk Approach):**
1. **Web App First** (months 1-3)
   - No app store approval needed
   - Test all features including experimental sensors
   - Build user base and content
   - Validate compliance and privacy UX

2. **Mobile PWA** (months 3-4)
   - Progressive Web App with "Add to Home Screen"
   - Most sensor APIs available via browser
   - No app store gatekeepers

3. **iOS & Android Apps** (months 6-9)
   - Submit with conservative sensor set (GPS, camera, mic, motion)
   - Omit Wi-Fi/Bluetooth scanning initially
   - Build trust with app stores
   - Update later with justification for advanced sensors

This staged approach minimizes rejection risk while allowing full feature testing on web platform first.

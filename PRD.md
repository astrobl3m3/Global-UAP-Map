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
- **Functionality**: Integrated photo, video, and audio recording with device camera/microphone access
- **Purpose**: Provides visual and auditory evidence to support textual descriptions
- **Trigger**: User taps media capture buttons within report form
- **Progression**: Request permission → Open capture interface → Record/capture → Preview → Attach to report → Continue or add more media
- **Success criteria**: All media types successfully upload, preview correctly, and associate with report metadata

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

**States**:
- Buttons: Distinct hover with cyan glow, active with scale reduction (0.98), disabled with reduced opacity
- Inputs: Focus with cyan ring and subtle lift effect, error state with red border pulse
- Cards: Hover elevation increase, selected state with accent border
- Switches: Smooth slide transition with color fade, haptic-style animation on toggle
- Map pins: Pulse animation on new reports, cluster expansion on interaction

**Icon Selection**:
- MapPin, MapTrifold - Location and mapping
- Camera, VideoCamera, Microphone - Media capture
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

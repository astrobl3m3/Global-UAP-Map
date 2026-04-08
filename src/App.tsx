import { useState, useMemo, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import type { Observation, Location } from '@/lib/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { MapView } from '@/components/MapView'
import { ObservationCard } from '@/components/ObservationCard'
import { ReportDialog } from '@/components/ReportDialog'
import { ObservationDetail } from '@/components/ObservationDetail'
import { LiveIRUVMonitor } from '@/components/LiveIRUVMonitor'
import { ObservationFilters, type ObservationFilterOptions } from '@/components/ObservationFilters'
import { ExportObservationsDialog } from '@/components/ExportObservationsDialog'
import { ExternalDataManager } from '@/components/ExternalDataManager'
import { filterObservations } from '@/lib/observation-filters'
import { MapTrifold, Stack, TestTube, Handshake, Gear, Plus, Download, Fire, Database } from '@phosphor-icons/react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useIsMobile } from '@/hooks/use-mobile'

function App() {
  const [observations, setObservations] = useKV<Observation[]>('observations', [])
  const [externalObservations, setExternalObservations] = useKV<Observation[]>('external-observations', [])
  const [activeTab, setActiveTab] = useState('map')
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [selectedObservation, setSelectedObservation] = useState<Observation | null>(null)
  const [mapCenter, setMapCenter] = useState<Location>({ lat: 20, lng: 0 })
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [showExternalData, setShowExternalData] = useState(true)
  const [filters, setFilters] = useState<ObservationFilterOptions>({
    dateRange: 'all',
    sortBy: 'newest',
  })
  const isMobile = useIsMobile()
  
  useEffect(() => {
    const loadInitialExternalData = async () => {
      const { fetchNUFORCData, fetchUFOstalkerData, convertExternalToObservation, getSourceById } = await import('@/lib/external-sources')
      
      const existingData = externalObservations || []
      if (existingData.length > 0) {
        return
      }
      
      try {
        const [nuforcData, stalkerData] = await Promise.all([
          fetchNUFORCData(100),
          fetchUFOstalkerData(50)
        ])
        
        const nuforcSource = getSourceById('nuforc-api')
        const stalkerSource = getSourceById('ufostalker')
        
        const allExternalObs = []
        
        if (nuforcSource && nuforcData.length > 0) {
          allExternalObs.push(...nuforcData.map(ext => convertExternalToObservation(ext, nuforcSource)))
        }
        
        if (stalkerSource && stalkerData.length > 0) {
          allExternalObs.push(...stalkerData.map(ext => convertExternalToObservation(ext, stalkerSource)))
        }
        
        if (allExternalObs.length > 0) {
          setExternalObservations(allExternalObs)
        }
      } catch (error) {
        console.error('Failed to load initial external data:', error)
      }
    }
    
    loadInitialExternalData()
  }, [])

  const safeObservations = observations || []
  const safeExternalObservations = externalObservations || []
  
  const allObservations = useMemo(() => {
    if (showExternalData) {
      return [...safeObservations, ...safeExternalObservations]
    }
    return safeObservations
  }, [safeObservations, safeExternalObservations, showExternalData])
  
  const filteredObservations = useMemo(() => {
    return filterObservations(allObservations, filters)
  }, [allObservations, filters])

  const handleNewReport = (report: Observation) => {
    setObservations((current) => [report, ...(current || [])])
    setIsReportOpen(false)
    setMapCenter({ lat: report.location.lat, lng: report.location.lng })
  }

  const handleExternalDataLoaded = (newObservations: Observation[], sourceId: string) => {
    setExternalObservations((current) => {
      const existing = current || []
      const filtered = existing.filter((obs) => !obs.id.startsWith(sourceId))
      return [...filtered, ...newObservations]
    })
  }

  const handleMarkerClick = (obs: Observation) => {
    setSelectedObservation(obs)
  }

  const handleCardClick = (obs: Observation) => {
    setSelectedObservation(obs)
    setActiveTab('map')
    setMapCenter({ lat: obs.location.lat, lng: obs.location.lng })
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      <header className="border-b border-border bg-card px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Global UAP MAP</h1>
          <p className="text-xs text-muted-foreground">Scientific Observation Platform</p>
        </div>
        <div className="flex items-center gap-2">
          {safeObservations.length > 0 && (
            <Button 
              onClick={() => setIsExportOpen(true)}
              variant="outline"
              size="sm"
              className="gap-2 hidden sm:flex"
            >
              <Download size={18} weight="bold" />
              Export
            </Button>
          )}
          <Button 
            onClick={() => setIsReportOpen(true)}
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
          >
            <Plus size={18} weight="bold" />
            <span className="hidden sm:inline">Report Sighting</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col h-full">
          {!isMobile && (
            <TabsList className="mx-4 mt-4 w-fit flex-shrink-0">
              <TabsTrigger value="map" className="gap-2">
                <MapTrifold size={18} weight="fill" />
                Map
              </TabsTrigger>
              <TabsTrigger value="gallery" className="gap-2">
                <Stack size={18} weight="fill" />
                Gallery
              </TabsTrigger>
              <TabsTrigger value="sensors" className="gap-2">
                <TestTube size={18} weight="fill" />
                Sensors
              </TabsTrigger>
              <TabsTrigger value="partners" className="gap-2">
                <Handshake size={18} weight="fill" />
                Partners
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Gear size={18} weight="fill" />
                Settings
              </TabsTrigger>
            </TabsList>
          )}

          <div className="flex-1 overflow-hidden relative">
            <TabsContent value="map" className="absolute inset-0 mt-0 p-4 data-[state=active]:flex data-[state=inactive]:hidden flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card border border-border rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Fire size={20} weight="fill" className="text-accent" />
                  <Label htmlFor="heatmap-toggle" className="text-sm font-medium cursor-pointer">
                    Show Heatmap
                  </Label>
                </div>
                <Switch
                  id="heatmap-toggle"
                  checked={showHeatmap}
                  onCheckedChange={setShowHeatmap}
                />
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card border border-border rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Database size={20} weight="fill" className="text-accent" />
                  <Label htmlFor="external-toggle" className="text-sm font-medium cursor-pointer">
                    Show External Data Sources
                  </Label>
                </div>
                <Switch
                  id="external-toggle"
                  checked={showExternalData}
                  onCheckedChange={setShowExternalData}
                />
              </div>
              <div className="flex-1 rounded-lg overflow-hidden border border-border shadow-lg">
                <MapView
                  observations={filteredObservations}
                  center={mapCenter}
                  zoom={3}
                  onMarkerClick={handleMarkerClick}
                  selectedObservation={selectedObservation?.id}
                  showHeatmap={showHeatmap}
                />
              </div>
            </TabsContent>

            <TabsContent value="gallery" className="absolute inset-0 mt-0 data-[state=active]:block data-[state=inactive]:hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Observation Gallery</h2>
                    {safeObservations.length > 0 && (
                      <Button 
                        onClick={() => setIsExportOpen(true)}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Download size={16} weight="bold" />
                        Export
                      </Button>
                    )}
                  </div>
                  
                  <ObservationFilters
                    filters={filters}
                    onChange={setFilters}
                    resultCount={filteredObservations.length}
                  />

                  {safeObservations.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">No observations yet</p>
                      <Button onClick={() => setIsReportOpen(true)} variant="outline">
                        <Plus size={18} weight="bold" className="mr-2" />
                        Report First Sighting
                      </Button>
                    </div>
                  ) : filteredObservations.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">No observations match your filters</p>
                      <Button onClick={() => setFilters({ dateRange: 'all', sortBy: 'newest' })} variant="outline">
                        Clear Filters
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredObservations.map((obs) => (
                        <ObservationCard
                          key={obs.id}
                          observation={obs}
                          onClick={() => handleCardClick(obs)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="sensors" className="absolute inset-0 mt-0 data-[state=active]:block data-[state=inactive]:hidden overflow-auto">
              <div className="p-4">
                <div className="max-w-6xl mx-auto space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">Device Sensor Tester</h2>
                    <p className="text-muted-foreground">
                      Test and visualize available device sensors without creating a report.
                    </p>
                  </div>
                  
                  <LiveIRUVMonitor />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 border border-border rounded-lg bg-card">
                      <h3 className="font-semibold mb-2">Motion Sensors</h3>
                      <p className="text-sm text-muted-foreground">Accelerometer, Gyroscope, Magnetometer</p>
                    </div>
                    <div className="p-6 border border-border rounded-lg bg-card">
                      <h3 className="font-semibold mb-2">Environmental</h3>
                      <p className="text-sm text-muted-foreground">GPS, Light, Pressure, Temperature</p>
                    </div>
                    <div className="p-6 border border-border rounded-lg bg-card">
                      <h3 className="font-semibold mb-2">Connectivity</h3>
                      <p className="text-sm text-muted-foreground">Wi-Fi, Bluetooth, NFC</p>
                    </div>
                    <div className="p-6 border border-border rounded-lg bg-card">
                      <h3 className="font-semibold mb-2">Multimedia</h3>
                      <p className="text-sm text-muted-foreground">Camera, Microphone, Audio Analysis</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Sensor testing requires browser permissions and device support
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="partners" className="absolute inset-0 mt-0 data-[state=active]:block data-[state=inactive]:hidden overflow-auto">
              <div className="p-4">
                <div className="max-w-4xl mx-auto space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">Partner Network</h2>
                    <p className="text-muted-foreground">
                      Trusted partners in scientific equipment, research, and education.
                    </p>
                  </div>
                  <div className="text-center py-12 text-muted-foreground">
                    Partner content coming soon
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="absolute inset-0 mt-0 data-[state=active]:block data-[state=inactive]:hidden overflow-auto">
              <div className="p-4">
                <div className="max-w-2xl mx-auto space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">Settings & Privacy</h2>
                    <p className="text-muted-foreground">
                      Manage your data, permissions, and preferences.
                    </p>
                  </div>
                  
                  <ExternalDataManager onDataLoaded={handleExternalDataLoaded} />
                  
                  <div className="space-y-4">
                    <div className="p-6 border border-border rounded-lg bg-card">
                      <h3 className="font-semibold mb-2">Sensor Permissions</h3>
                      <p className="text-sm text-muted-foreground">
                        Control which sensors can be accessed when creating reports
                      </p>
                    </div>
                    <div className="p-6 border border-border rounded-lg bg-card">
                      <h3 className="font-semibold mb-2">Privacy Controls</h3>
                      <p className="text-sm text-muted-foreground">
                        GDPR-compliant data export and deletion options
                      </p>
                    </div>
                    <div className="p-6 border border-border rounded-lg bg-card">
                      <h3 className="font-semibold mb-2">Language</h3>
                      <p className="text-sm text-muted-foreground">
                        English • Português • Español • Français • Deutsch
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>

          {isMobile && (
            <div className="border-t border-border bg-card flex-shrink-0">
              <TabsList className="w-full grid grid-cols-5 rounded-none h-auto">
                <TabsTrigger value="map" className="flex-col gap-1 py-2">
                  <MapTrifold size={20} weight="fill" />
                  <span className="text-xs">Map</span>
                </TabsTrigger>
                <TabsTrigger value="gallery" className="flex-col gap-1 py-2">
                  <Stack size={20} weight="fill" />
                  <span className="text-xs">Gallery</span>
                </TabsTrigger>
                <TabsTrigger value="sensors" className="flex-col gap-1 py-2">
                  <TestTube size={20} weight="fill" />
                  <span className="text-xs">Sensors</span>
                </TabsTrigger>
                <TabsTrigger value="partners" className="flex-col gap-1 py-2">
                  <Handshake size={20} weight="fill" />
                  <span className="text-xs">Partners</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex-col gap-1 py-2">
                  <Gear size={20} weight="fill" />
                  <span className="text-xs">Settings</span>
                </TabsTrigger>
              </TabsList>
            </div>
          )}
        </Tabs>
      </div>

      <ReportDialog
        open={isReportOpen}
        onOpenChange={setIsReportOpen}
        onSubmit={handleNewReport}
      />

      <ExportObservationsDialog
        open={isExportOpen}
        onOpenChange={setIsExportOpen}
        observations={filteredObservations}
        filteredCount={safeObservations.length}
      />

      {selectedObservation && (
        <ObservationDetail
          observation={selectedObservation}
          open={!!selectedObservation}
          onOpenChange={(open: boolean) => !open && setSelectedObservation(null)}
          onUpdate={(updated: Observation) => {
            setObservations((current) =>
              (current || []).map((obs) => (obs.id === updated.id ? updated : obs))
            )
            setSelectedObservation(updated)
          }}
        />
      )}
    </div>
  )
}

export default App

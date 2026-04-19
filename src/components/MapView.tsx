import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'
import type { Location, Observation } from '@/lib/types'
import { getSourceById } from '@/lib/external-sources'
import { MapLegend } from '@/components/MapLegend'
import type { TopoLayerType } from '@/components/TopographicLayerControl'

interface MapViewProps {
  observations: Observation[]
  center: Location
  zoom?: number
  onMapClick?: (location: Location) => void
  onMarkerClick?: (observation: Observation) => void
  showHeatmap?: boolean
  selectedObservation?: string | null
  showExternalData?: boolean
  topoLayer?: TopoLayerType
}

export function MapView({
  observations,
  center,
  zoom = 3,
  onMapClick,
  onMarkerClick,
  showHeatmap = false,
  selectedObservation,
  showExternalData = true,
  topoLayer = 'none',
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const heatLayerRef = useRef<any>(null)
  const baseTileLayerRef = useRef<L.TileLayer | null>(null)
  const topoTileLayerRef = useRef<L.TileLayer | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
    }).setView([center.lat, center.lng], zoom)

    const baseLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)
    
    baseTileLayerRef.current = baseLayer

    if (onMapClick) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        onMapClick({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        })
      })
    }

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      baseTileLayerRef.current = null
      topoTileLayerRef.current = null
    }
  }, [])
  
  useEffect(() => {
    if (!mapRef.current) return
    
    if (topoTileLayerRef.current) {
      mapRef.current.removeLayer(topoTileLayerRef.current)
      topoTileLayerRef.current = null
    }
    
    if (topoLayer !== 'none') {
      let tileUrl = ''
      let attribution = ''
      
      switch (topoLayer) {
        case 'terrain':
          tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
          attribution = '© OpenTopoMap contributors'
          break
        case 'contours':
          tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
          attribution = '© OpenTopoMap contributors'
          break
        case 'satellite':
          tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          attribution = '© Esri'
          break
      }
      
      if (tileUrl) {
        const topoLayer = L.tileLayer(tileUrl, {
          attribution,
          maxZoom: 17,
          opacity: 0.7,
        }).addTo(mapRef.current)
        
        topoTileLayerRef.current = topoLayer
      }
    }
  }, [topoLayer])

  useEffect(() => {
    if (!mapRef.current) return

    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current.clear()

    if (heatLayerRef.current) {
      mapRef.current.removeLayer(heatLayerRef.current)
      heatLayerRef.current = null
    }

    if (!observations || observations.length === 0) return

    if (showHeatmap) {
      const heatData = observations.map((obs) => [
        obs.location.lat,
        obs.location.lng,
        0.5,
      ])

      heatLayerRef.current = (L as any).heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 10,
        max: 1.0,
        gradient: {
          0.0: 'rgba(117, 211, 255, 0)',
          0.2: 'rgba(117, 211, 255, 0.5)',
          0.4: 'rgba(117, 211, 255, 0.8)',
          0.6: 'rgba(255, 186, 93, 0.9)',
          0.8: 'rgba(255, 138, 93, 1)',
          1.0: 'rgba(255, 93, 93, 1)',
        },
      }).addTo(mapRef.current)
    } else {
      observations.forEach((obs) => {
        const externalSource = (obs as any).externalSource
        const sourceId = externalSource?.sourceId
        const source = sourceId ? getSourceById(sourceId) : null
        
        const markerColor = source?.color || 'oklch(0.75 0.15 200)'
        const isExternal = !!externalSource
        
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div class="relative">
              <div class="absolute -translate-x-1/2 -translate-y-full">
                <div class="pulse-dot w-6 h-6 rounded-full border-2 shadow-lg" style="background-color: ${markerColor}; border-color: rgb(20, 25, 40);"></div>
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full" style="background-color: ${isExternal ? 'white' : 'rgb(20, 25, 40)'};"></div>
              </div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 24],
        })

        const marker = L.marker([obs.location.lat, obs.location.lng], {
          icon: customIcon,
        })

        marker.on('click', () => {
          if (onMarkerClick) onMarkerClick(obs)
        })

        if (obs.id === selectedObservation) {
          marker.setZIndexOffset(1000)
        }

        marker.addTo(mapRef.current!)
        markersRef.current.set(obs.id, marker)
      })
    }
  }, [observations, selectedObservation, onMarkerClick, showHeatmap])

  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.setView([center.lat, center.lng], zoom)
  }, [center, zoom])

  return (
    <div ref={mapContainerRef} className="w-full h-full map-container relative">
      <MapLegend showUserReports={true} showExternalData={showExternalData} />
    </div>
  )
}

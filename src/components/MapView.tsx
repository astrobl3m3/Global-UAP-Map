import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Location, Observation } from '@/lib/types'

interface MapViewProps {
  observations: Observation[]
  center: Location
  zoom?: number
  onMapClick?: (location: Location) => void
  onMarkerClick?: (observation: Observation) => void
  showHeatmap?: boolean
  selectedObservation?: string | null
}

export function MapView({
  observations,
  center,
  zoom = 3,
  onMapClick,
  onMarkerClick,
  showHeatmap = false,
  selectedObservation,
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
    }).setView([center.lat, center.lng], zoom)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

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
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return

    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current.clear()

    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="relative">
          <div class="absolute -translate-x-1/2 -translate-y-full">
            <div class="pulse-dot w-6 h-6 rounded-full bg-accent border-2 border-background shadow-lg"></div>
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent-foreground"></div>
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    })

    observations.forEach((obs) => {
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
  }, [observations, selectedObservation, onMarkerClick])

  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.setView([center.lat, center.lng], zoom)
  }, [center, zoom])

  return (
    <div ref={mapContainerRef} className="w-full h-full map-container" />
  )
}

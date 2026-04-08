import { useState, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import type { Location } from '@/lib/types'
import type { GeocodingResult } from '@/lib/geocoding'
import { searchLocation, getElevation } from '@/lib/geocoding'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MagnifyingGlass, MapPin, Star, Mountains } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface SavedLocation {
  id: string
  name: string
  location: Location
  elevation?: number
  savedAt: number
}

interface LocationSearchProps {
  onSelectLocation: (location: Location, elevation?: number, name?: string) => void
  className?: string
}

export function LocationSearch({ onSelectLocation, className }: LocationSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeocodingResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [favoriteLocations, setFavoriteLocations] = useKV<SavedLocation[]>('favorite-locations', [])
  const searchTimeoutRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (query.trim().length < 2) {
      setResults([])
      setShowResults(false)
      return
    }

    setIsSearching(true)
    searchTimeoutRef.current = window.setTimeout(async () => {
      const searchResults = await searchLocation(query)
      setResults(searchResults)
      setIsSearching(false)
      setShowResults(true)
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query])

  const handleSelectResult = async (result: GeocodingResult) => {
    const elevation = await getElevation(result.lat, result.lng)
    onSelectLocation({ lat: result.lat, lng: result.lng }, elevation || undefined, result.displayName)
    setQuery('')
    setShowResults(false)
    
    if (elevation !== null) {
      toast.success(`Location selected - Elevation: ${elevation}m`)
    } else {
      toast.success('Location selected')
    }
  }

  const handleSelectFavorite = async (favorite: SavedLocation) => {
    let elevation = favorite.elevation
    
    if (!elevation) {
      elevation = await getElevation(favorite.location.lat, favorite.location.lng) || undefined
    }
    
    onSelectLocation(favorite.location, elevation, favorite.name)
    setQuery('')
    setShowResults(false)
    
    if (elevation) {
      toast.success(`${favorite.name} - Elevation: ${elevation}m`)
    } else {
      toast.success(favorite.name)
    }
  }

  const handleSaveFavorite = async (result: GeocodingResult) => {
    const elevation = await getElevation(result.lat, result.lng)
    
    const newFavorite: SavedLocation = {
      id: `fav-${Date.now()}`,
      name: result.displayName,
      location: { lat: result.lat, lng: result.lng },
      elevation: elevation || undefined,
      savedAt: Date.now()
    }

    setFavoriteLocations((current) => [newFavorite, ...(current || [])])
    toast.success('Location saved to favorites')
  }

  const handleRemoveFavorite = (favoriteId: string) => {
    setFavoriteLocations((current) => (current || []).filter(fav => fav.id !== favoriteId))
    toast.success('Removed from favorites')
  }

  const isFavorite = (lat: number, lng: number) => {
    return (favoriteLocations || []).some(
      fav => Math.abs(fav.location.lat - lat) < 0.0001 && Math.abs(fav.location.lng - lng) < 0.0001
    )
  }

  const safeFavorites = favoriteLocations || []

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <MagnifyingGlass 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
          size={18}
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length >= 2 || safeFavorites.length > 0) {
              setShowResults(true)
            }
          }}
          placeholder="Search location by name or address..."
          className="pl-10 pr-4"
        />
      </div>

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          <ScrollArea className="max-h-96">
            {safeFavorites.length > 0 && (
              <div className="p-2 border-b border-border">
                <div className="text-xs font-semibold text-muted-foreground px-3 py-2">
                  FAVORITE LOCATIONS
                </div>
                {safeFavorites.map((favorite) => (
                  <button
                    key={favorite.id}
                    onClick={() => handleSelectFavorite(favorite)}
                    className="w-full flex items-start gap-3 px-3 py-2 hover:bg-accent rounded-md text-left group"
                  >
                    <Star size={16} weight="fill" className="text-accent shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {favorite.name}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {favorite.location.lat.toFixed(5)}, {favorite.location.lng.toFixed(5)}
                        {favorite.elevation && (
                          <span className="ml-2 inline-flex items-center gap-1">
                            <Mountains size={12} weight="fill" />
                            {favorite.elevation}m
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveFavorite(favorite.id)
                      }}
                    >
                      Remove
                    </Button>
                  </button>
                ))}
              </div>
            )}

            {isSearching && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            )}

            {!isSearching && results.length > 0 && (
              <div className="p-2">
                <div className="text-xs font-semibold text-muted-foreground px-3 py-2">
                  SEARCH RESULTS
                </div>
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 px-3 py-2 hover:bg-accent rounded-md group"
                  >
                    <button
                      onClick={() => handleSelectResult(result)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <div className="flex items-start gap-2">
                        <MapPin size={16} weight="fill" className="text-primary shrink-0 mt-1" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground line-clamp-2">
                            {result.displayName}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {result.lat.toFixed(5)}, {result.lng.toFixed(5)}
                          </div>
                        </div>
                      </div>
                    </button>
                    
                    {!isFavorite(result.lat, result.lng) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 shrink-0"
                        onClick={() => handleSaveFavorite(result)}
                      >
                        <Star size={16} weight="fill" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!isSearching && query.trim().length >= 2 && results.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No locations found
              </div>
            )}

            {!isSearching && query.trim().length < 2 && safeFavorites.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Type to search for locations
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  )
}

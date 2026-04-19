import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { Location } from '@/lib/types'
import { fetchWeather, windDirectionToCompass, type WeatherData } from '@/lib/elevation-service'
import { CloudRain, Wind, Thermometer, Drop, Eye, Gauge } from '@phosphor-icons/react'

interface WeatherDisplayProps {
  location: Location
  compact?: boolean
}

export function WeatherDisplay({ location, compact = false }: WeatherDisplayProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadWeather = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const data = await fetchWeather(location)
        setWeather(data)
      } catch (err) {
        setError('Failed to load weather data')
        console.error('Weather fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadWeather()
  }, [location.lat, location.lng])

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Weather Conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error || !weather) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Weather Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error || 'Weather data unavailable'}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="gap-1.5">
          <Thermometer size={14} weight="fill" />
          {weather.temperature.toFixed(1)}°C
        </Badge>
        <Badge variant="secondary" className="gap-1.5">
          <CloudRain size={14} weight="fill" />
          {weather.conditions}
        </Badge>
        <Badge variant="secondary" className="gap-1.5">
          <Wind size={14} weight="fill" />
          {weather.windSpeed.toFixed(0)} km/h {windDirectionToCompass(weather.windDirection)}
        </Badge>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          Weather Conditions
          <Badge variant="outline" className="text-xs font-normal">
            {weather.source}
          </Badge>
        </CardTitle>
        <CardDescription className="text-xs">
          Current conditions at observation location
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Thermometer size={18} weight="fill" className="text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Temperature</p>
              <p className="font-medium">{weather.temperature.toFixed(1)}°C</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Drop size={18} weight="fill" className="text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Humidity</p>
              <p className="font-medium">{weather.humidity.toFixed(0)}%</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Wind size={18} weight="fill" className="text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Wind</p>
              <p className="font-medium">
                {weather.windSpeed.toFixed(0)} km/h {windDirectionToCompass(weather.windDirection)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Gauge size={18} weight="fill" className="text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Pressure</p>
              <p className="font-medium">{weather.pressure.toFixed(0)} hPa</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <CloudRain size={18} weight="fill" className="text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Conditions</p>
              <p className="font-medium">{weather.conditions}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Eye size={18} weight="fill" className="text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Visibility</p>
              <p className="font-medium">{(weather.visibility / 1000).toFixed(1)} km</p>
            </div>
          </div>
        </div>
        
        {weather.cloudCover > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Cloud Cover</span>
              <span className="font-medium">{weather.cloudCover.toFixed(0)}%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { HistoricalWeatherData } from '@/lib/types'
import { windDirectionToCompass } from '@/lib/elevation-service'
import { CloudRain, Wind, Thermometer, Drop, Eye, Gauge, Clock } from '@phosphor-icons/react'

interface HistoricalWeatherDisplayProps {
  weather: HistoricalWeatherData
  compact?: boolean
  showTimestamp?: boolean
}

export function HistoricalWeatherDisplay({ weather, compact = false, showTimestamp = true }: HistoricalWeatherDisplayProps) {
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

  const observationDate = new Date(weather.timestamp)
  const fetchDate = new Date(weather.fetchedAt)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          Historical Weather
          <Badge variant="outline" className="text-xs font-normal">
            {weather.source === 'open-meteo-archive' ? 'Archive Data' : 'Live Data'}
          </Badge>
        </CardTitle>
        {showTimestamp && (
          <CardDescription className="text-xs flex items-center gap-1.5">
            <Clock size={12} weight="fill" />
            {observationDate.toLocaleString()}
          </CardDescription>
        )}
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

        {weather.precipitation > 0 && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Precipitation</span>
              <span className="font-medium">{weather.precipitation.toFixed(1)} mm</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

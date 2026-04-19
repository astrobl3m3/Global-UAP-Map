import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Funnel, CaretDown, CaretUp, X } from '@phosphor-icons/react'
import type { Observation } from '@/lib/types'
import type { ExternalDataSource } from '@/lib/external-sources'

export interface AdvancedFilterOptions {
  includeUserReports: boolean
  includeExternalData: boolean
  selectedSources: string[]
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year' | 'custom'
  sortBy: 'newest' | 'oldest' | 'closest'
  classifications: string[]
  hasMedia: 'all' | 'yes' | 'no'
  hasSensorData: 'all' | 'yes' | 'no'
  elevationRange?: 'all' | 'sea-level' | 'low' | 'moderate' | 'high' | 'mountain' | 'high-mountain' | 'very-high'
  location?: { lat: number; lng: number; radiusKm: number }
}

interface AdvancedFilterPanelProps {
  filters: AdvancedFilterOptions
  onChange: (filters: AdvancedFilterOptions) => void
  resultCount: number
  totalCount: number
  dataSources: ExternalDataSource[]
}

export function AdvancedFilterPanel({
  filters,
  onChange,
  resultCount,
  totalCount,
  dataSources
}: AdvancedFilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const updateFilter = (key: keyof AdvancedFilterOptions, value: any) => {
    onChange({ ...filters, [key]: value })
  }
  
  const toggleSource = (sourceId: string) => {
    const current = filters.selectedSources || []
    if (current.includes(sourceId)) {
      updateFilter('selectedSources', current.filter(id => id !== sourceId))
    } else {
      updateFilter('selectedSources', [...current, sourceId])
    }
  }
  
  const resetFilters = () => {
    onChange({
      includeUserReports: true,
      includeExternalData: true,
      selectedSources: dataSources.map(s => s.id),
      dateRange: 'all',
      sortBy: 'newest',
      classifications: [],
      hasMedia: 'all',
      hasSensorData: 'all',
      elevationRange: 'all',
    })
  }
  
  const activeFilterCount = [
    filters.dateRange !== 'all',
    filters.hasMedia !== 'all',
    filters.hasSensorData !== 'all',
    filters.classifications.length > 0,
    !filters.includeUserReports || !filters.includeExternalData,
    filters.selectedSources.length < dataSources.length,
    filters.elevationRange && filters.elevationRange !== 'all',
  ].filter(Boolean).length
  
  return (
    <Card className="border border-border bg-card">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <Funnel size={20} weight="fill" className="text-accent" />
              <div className="text-left">
                <div className="font-semibold">Advanced Filters</div>
                <div className="text-xs text-muted-foreground">
                  Showing {resultCount} of {totalCount}
                  {activeFilterCount > 0 && (
                    <Badge className="ml-2 text-xs">{activeFilterCount} active</Badge>
                  )}
                </div>
              </div>
            </div>
            {isExpanded ? <CaretUp size={20} /> : <CaretDown size={20} />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4">
            <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-3">
              <h4 className="font-medium text-sm">Data Sources</h4>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">User Reports</Label>
                <Switch
                  checked={filters.includeUserReports}
                  onCheckedChange={(checked) => updateFilter('includeUserReports', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">External Data</Label>
                <Switch
                  checked={filters.includeExternalData}
                  onCheckedChange={(checked) => updateFilter('includeExternalData', checked)}
                />
              </div>
              
              {filters.includeExternalData && (
                <div className="pt-2 border-t border-border space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    External Sources
                  </Label>
                  {dataSources.map((source) => (
                    <div key={source.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`source-filter-${source.id}`}
                        checked={filters.selectedSources.includes(source.id)}
                        onCheckedChange={() => toggleSource(source.id)}
                      />
                      <Label
                        htmlFor={`source-filter-${source.id}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {source.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-3">
              <h4 className="font-medium text-sm">Time Period</h4>
              <Select
                value={filters.dateRange}
                onValueChange={(value: any) => updateFilter('dateRange', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Past Week</SelectItem>
                  <SelectItem value="month">Past Month</SelectItem>
                  <SelectItem value="year">Past Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-3">
              <h4 className="font-medium text-sm">Sort Order</h4>
              <Select
                value={filters.sortBy}
                onValueChange={(value: any) => updateFilter('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-3">
              <h4 className="font-medium text-sm">Content Filters</h4>
              
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Has Media
                </Label>
                <Select
                  value={filters.hasMedia}
                  onValueChange={(value: any) => updateFilter('hasMedia', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="yes">With Media</SelectItem>
                    <SelectItem value="no">Without Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Has Sensor Data
                </Label>
                <Select
                  value={filters.hasSensorData}
                  onValueChange={(value: any) => updateFilter('hasSensorData', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="yes">With Sensors</SelectItem>
                    <SelectItem value="no">Without Sensors</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-3">
              <h4 className="font-medium text-sm">Elevation Range</h4>
              <Select
                value={filters.elevationRange || 'all'}
                onValueChange={(value: any) => updateFilter('elevationRange', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Elevations</SelectItem>
                  <SelectItem value="sea-level">Below Sea Level</SelectItem>
                  <SelectItem value="low">Low (0-200m)</SelectItem>
                  <SelectItem value="moderate">Moderate (200-500m)</SelectItem>
                  <SelectItem value="high">High (500-1000m)</SelectItem>
                  <SelectItem value="mountain">Mountain (1000-2000m)</SelectItem>
                  <SelectItem value="high-mountain">High Mountain (2000-3000m)</SelectItem>
                  <SelectItem value="very-high">Very High (3000m+)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Filter observations by terrain elevation
              </p>
            </div>
            
            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                onClick={resetFilters}
                className="w-full gap-2"
              >
                <X size={16} weight="bold" />
                Reset All Filters
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

export function applyAdvancedFilters(
  observations: Observation[],
  filters: AdvancedFilterOptions,
  userObservationIds: Set<string>
): Observation[] {
  let filtered = [...observations]
  
  if (!filters.includeUserReports) {
    filtered = filtered.filter(obs => !userObservationIds.has(obs.id))
  }
  
  if (!filters.includeExternalData) {
    filtered = filtered.filter(obs => userObservationIds.has(obs.id))
  }
  
  if (filters.includeExternalData && filters.selectedSources.length > 0) {
    filtered = filtered.filter(obs => {
      const externalSource = (obs as any).externalSource
      if (!externalSource) return userObservationIds.has(obs.id)
      return filters.selectedSources.includes(externalSource.sourceId)
    })
  }
  
  if (filters.dateRange !== 'all') {
    const now = Date.now()
    const ranges = {
      today: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000,
    }
    const range = ranges[filters.dateRange as keyof typeof ranges]
    if (range) {
      filtered = filtered.filter(obs => obs.observedAt >= now - range)
    }
  }
  
  if (filters.hasMedia === 'yes') {
    filtered = filtered.filter(obs =>
      obs.photos.length > 0 || obs.videos.length > 0 || obs.audio.length > 0
    )
  } else if (filters.hasMedia === 'no') {
    filtered = filtered.filter(obs =>
      obs.photos.length === 0 && obs.videos.length === 0 && obs.audio.length === 0
    )
  }
  
  if (filters.hasSensorData === 'yes') {
    filtered = filtered.filter(obs => !!obs.sensorData)
  } else if (filters.hasSensorData === 'no') {
    filtered = filtered.filter(obs => !obs.sensorData)
  }
  
  if (filters.elevationRange && filters.elevationRange !== 'all') {
    filtered = filtered.filter(obs => {
      const altitude = obs.altitude
      if (altitude === undefined) return false
      
      switch (filters.elevationRange) {
        case 'sea-level':
          return altitude < 0
        case 'low':
          return altitude >= 0 && altitude < 200
        case 'moderate':
          return altitude >= 200 && altitude < 500
        case 'high':
          return altitude >= 500 && altitude < 1000
        case 'mountain':
          return altitude >= 1000 && altitude < 2000
        case 'high-mountain':
          return altitude >= 2000 && altitude < 3000
        case 'very-high':
          return altitude >= 3000
        default:
          return true
      }
    })
  }
  
  if (filters.sortBy === 'newest') {
    filtered.sort((a, b) => b.observedAt - a.observedAt)
  } else if (filters.sortBy === 'oldest') {
    filtered.sort((a, b) => a.observedAt - b.observedAt)
  }
  
  return filtered
}

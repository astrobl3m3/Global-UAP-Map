import { useState } from 'react'
import type { Classification } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Funnel, X } from '@phosphor-icons/react'

export interface ObservationFilterOptions {
  classification?: Classification
  dateRange?: 'all' | 'today' | 'week' | 'month' | 'year'
  sortBy?: 'newest' | 'oldest' | 'mostViewed' | 'mostClassified'
  dataSource?: 'all' | 'user' | 'external'
}

interface ObservationFiltersProps {
  filters: ObservationFilterOptions
  onChange: (filters: ObservationFilterOptions) => void
  resultCount: number
}

const classificationLabels: Record<Classification, string> = {
  astronomical: 'Astronomical',
  atmospheric: 'Atmospheric',
  weather: 'Weather',
  physics: 'Physics',
  'human-made': 'Human-Made',
  unknown: 'Unknown',
}

export function ObservationFilters({ filters, onChange, resultCount }: ObservationFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleClassificationChange = (value: string) => {
    onChange({
      ...filters,
      classification: value === 'all' ? undefined : (value as Classification),
    })
  }

  const handleDateRangeChange = (value: string) => {
    onChange({
      ...filters,
      dateRange: value as ObservationFilterOptions['dateRange'],
    })
  }

  const handleSortChange = (value: string) => {
    onChange({
      ...filters,
      sortBy: value as ObservationFilterOptions['sortBy'],
    })
  }

  const handleDataSourceChange = (value: string) => {
    onChange({
      ...filters,
      dataSource: value as ObservationFilterOptions['dataSource'],
    })
  }

  const handleClearFilters = () => {
    onChange({
      dateRange: 'all',
      sortBy: 'newest',
      dataSource: 'all',
    })
  }

  const activeFiltersCount = [
    filters.classification,
    filters.dateRange && filters.dateRange !== 'all',
    filters.dataSource && filters.dataSource !== 'all',
  ].filter(Boolean).length

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Funnel size={20} weight="fill" className="text-muted-foreground" />
          <h3 className="font-semibold">Filters</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {resultCount} {resultCount === 1 ? 'result' : 'results'}
          </span>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-8 gap-1"
            >
              <X size={16} />
              Clear
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden"
          >
            {isExpanded ? 'Hide' : 'Show'}
          </Button>
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${isExpanded || 'max-lg:hidden'}`}>
        <div className="space-y-2">
          <Label htmlFor="classification">Classification</Label>
          <Select
            value={filters.classification || 'all'}
            onValueChange={handleClassificationChange}
          >
            <SelectTrigger id="classification">
              <SelectValue placeholder="All classifications" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All classifications</SelectItem>
              {Object.entries(classificationLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dataSource">Data Source</Label>
          <Select
            value={filters.dataSource || 'all'}
            onValueChange={handleDataSourceChange}
          >
            <SelectTrigger id="dataSource">
              <SelectValue placeholder="All sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              <SelectItem value="user">User Reports</SelectItem>
              <SelectItem value="external">External Sources</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateRange">Date Range</Label>
          <Select
            value={filters.dateRange || 'all'}
            onValueChange={handleDateRangeChange}
          >
            <SelectTrigger id="dateRange">
              <SelectValue placeholder="All time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Past week</SelectItem>
              <SelectItem value="month">Past month</SelectItem>
              <SelectItem value="year">Past year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sortBy">Sort By</Label>
          <Select
            value={filters.sortBy || 'newest'}
            onValueChange={handleSortChange}
          >
            <SelectTrigger id="sortBy">
              <SelectValue placeholder="Newest first" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="mostViewed">Most viewed</SelectItem>
              <SelectItem value="mostClassified">Most classified</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  )
}

import type { Observation } from '@/lib/types'
import type { ObservationFilterOptions } from '@/components/ObservationFilters'

export function filterObservations(
  observations: Observation[],
  filters: ObservationFilterOptions
): Observation[] {
  let filtered = [...observations]

  if (filters.classification) {
    filtered = filtered.filter((obs) => {
      return (
        obs.submittedClassification === filters.classification ||
        obs.topClassification === filters.classification
      )
    })
  }

  if (filters.dataSource && filters.dataSource !== 'all') {
    if (filters.dataSource === 'user') {
      filtered = filtered.filter((obs) => !obs.id.includes('-') || obs.userId)
    } else if (filters.dataSource === 'external') {
      filtered = filtered.filter((obs) => obs.id.includes('-') && !obs.userId)
    }
  }

  if (filters.dateRange && filters.dateRange !== 'all') {
    const now = Date.now()
    const ranges: Record<string, number> = {
      today: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000,
    }

    const cutoff = now - ranges[filters.dateRange]
    filtered = filtered.filter((obs) => obs.observedAt >= cutoff)
  }

  switch (filters.sortBy) {
    case 'oldest':
      filtered.sort((a, b) => a.observedAt - b.observedAt)
      break
    case 'mostViewed':
      filtered.sort((a, b) => b.viewCount - a.viewCount)
      break
    case 'mostClassified':
      filtered.sort((a, b) => b.classificationCount - a.classificationCount)
      break
    case 'newest':
    default:
      filtered.sort((a, b) => b.observedAt - a.observedAt)
      break
  }

  return filtered
}

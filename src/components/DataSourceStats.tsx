import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ChartBar, TrendUp, Database, Globe } from '@phosphor-icons/react'
import type { Observation } from '@/lib/types'
import type { ExternalDataSource } from '@/lib/external-sources'
import { getSourceById } from '@/lib/external-sources'

interface DataSourceStatsProps {
  observations: Observation[]
  dataSources: ExternalDataSource[]
}

interface SourceStats {
  sourceId: string
  sourceName: string
  count: number
  percentage: number
  color: string
  websiteUrl?: string
}

export function DataSourceStats({ observations, dataSources }: DataSourceStatsProps) {
  const stats = useMemo(() => {
    const sourceCountMap = new Map<string, number>()
    let userReportsCount = 0

    observations.forEach((obs) => {
      const externalSource = (obs as any).externalSource
      if (externalSource?.sourceId) {
        sourceCountMap.set(
          externalSource.sourceId,
          (sourceCountMap.get(externalSource.sourceId) || 0) + 1
        )
      } else {
        userReportsCount++
      }
    })

    const totalObservations = observations.length
    const sourceStats: SourceStats[] = []

    if (userReportsCount > 0) {
      sourceStats.push({
        sourceId: 'user-reports',
        sourceName: 'User Reports',
        count: userReportsCount,
        percentage: (userReportsCount / totalObservations) * 100,
        color: 'oklch(0.75 0.15 200)',
      })
    }

    sourceCountMap.forEach((count, sourceId) => {
      const source = getSourceById(sourceId)
      if (source) {
        sourceStats.push({
          sourceId,
          sourceName: source.name,
          count,
          percentage: (count / totalObservations) * 100,
          color: source.color,
          websiteUrl: source.websiteUrl,
        })
      }
    })

    sourceStats.sort((a, b) => b.count - a.count)

    return {
      totalObservations,
      sourceStats,
      totalSources: sourceStats.length,
    }
  }, [observations])

  return (
    <Card className="border border-border bg-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <ChartBar size={24} weight="fill" className="text-accent" />
        <div>
          <h3 className="text-lg font-semibold">Data Source Statistics</h3>
          <p className="text-sm text-muted-foreground">
            Observation counts per source
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <div className="text-2xl font-bold text-foreground">
            {stats.totalObservations.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Total Observations</div>
        </div>

        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <div className="text-2xl font-bold text-foreground">
            {stats.totalSources}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Active Sources</div>
        </div>

        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <div className="text-2xl font-bold text-accent">
            {stats.sourceStats.find(s => s.sourceId === 'user-reports')?.count.toLocaleString() || 0}
          </div>
          <div className="text-xs text-muted-foreground mt-1">User Reports</div>
        </div>

        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <div className="text-2xl font-bold text-success">
            {(stats.totalObservations - (stats.sourceStats.find(s => s.sourceId === 'user-reports')?.count || 0)).toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground mt-1">External Data</div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <TrendUp size={16} weight="bold" />
          Source Breakdown
        </h4>

        {stats.sourceStats.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Database size={32} weight="light" className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No observation data available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.sourceStats.map((source) => (
              <div key={source.sourceId} className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: source.color }}
                    />
                    <span className="text-sm font-medium truncate">
                      {source.sourceName}
                    </span>
                    {source.websiteUrl && (
                      <a
                        href={source.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:text-accent/80 flex-shrink-0"
                        title="Visit source website"
                      >
                        <Globe size={14} weight="fill" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline" className="text-xs font-mono">
                      {source.count.toLocaleString()}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono w-12 text-right">
                      {source.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <Progress
                  value={source.percentage}
                  className="h-2"
                  style={
                    {
                      '--progress-background': source.color,
                    } as React.CSSProperties
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

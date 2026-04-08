import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  EXTERNAL_DATA_SOURCES, 
  fetchNUFORCData, 
  convertExternalToObservation,
  getSourceById,
  type ExternalObservation,
  type ExternalDataSource 
} from '@/lib/external-sources'
import type { Observation } from '@/lib/types'
import { Database, Download, Link, ArrowsClockwise, CheckCircle, Warning } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ExternalDataManagerProps {
  onDataLoaded: (observations: Observation[], sourceId: string) => void
}

export function ExternalDataManager({ onDataLoaded }: ExternalDataManagerProps) {
  const [enabledSources, setEnabledSources] = useKV<string[]>('enabled-external-sources', ['nuforc-api'])
  const [loadingState, setLoadingState] = useState<Record<string, boolean>>({})
  const [dataCache, setDataCache] = useState<Record<string, ExternalObservation[]>>({})
  const [lastFetch, setLastFetch] = useState<Record<string, number>>({})

  const toggleSource = (sourceId: string) => {
    setEnabledSources((current) => {
      const sources = current || []
      const updated = sources.includes(sourceId)
        ? sources.filter((id) => id !== sourceId)
        : [...sources, sourceId]
      return updated
    })
  }

  const fetchSourceData = async (sourceId: string) => {
    const source = getSourceById(sourceId)
    if (!source || !source.endpoint) {
      toast.error(`Cannot fetch data: ${source?.name || sourceId} has no API endpoint`)
      return
    }

    setLoadingState((prev) => ({ ...prev, [sourceId]: true }))

    try {
      let externalObs: ExternalObservation[] = []

      if (sourceId === 'nuforc-api') {
        externalObs = await fetchNUFORCData(200)
      }

      if (externalObs.length > 0) {
        setDataCache((prev) => ({ ...prev, [sourceId]: externalObs }))
        setLastFetch((prev) => ({ ...prev, [sourceId]: Date.now() }))

        const observations = externalObs.map((ext) => convertExternalToObservation(ext, source))
        onDataLoaded(observations, sourceId)

        toast.success(`Loaded ${observations.length} observations from ${source.name}`)
      } else {
        toast.warning(`No data received from ${source.name}`)
      }
    } catch (error) {
      console.error(`Failed to fetch from ${sourceId}:`, error)
      toast.error(`Failed to load data from ${source.name}`)
    } finally {
      setLoadingState((prev) => ({ ...prev, [sourceId]: false }))
    }
  }

  useEffect(() => {
    const sources = enabledSources || []
    sources.forEach((sourceId) => {
      const source = getSourceById(sourceId)
      if (source && source.endpoint && !lastFetch[sourceId]) {
        fetchSourceData(sourceId)
      }
    })
  }, [enabledSources])

  const getSourceTypeColor = (type: string) => {
    switch (type) {
      case 'live_api': return 'bg-accent text-accent-foreground'
      case 'bulk_dataset': return 'bg-secondary text-secondary-foreground'
      case 'real_time_feed': return 'bg-success text-success-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getSourceTypeLabel = (type: string) => {
    switch (type) {
      case 'live_api': return 'Live API'
      case 'bulk_dataset': return 'Dataset'
      case 'real_time_feed': return 'Real-Time'
      case 'official_reporting': return 'Official'
      default: return type
    }
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <Database size={20} weight="fill" className="text-accent" />
            External Data Sources
          </h3>
          <p className="text-sm text-muted-foreground">
            Integrate observations from trusted UAP databases and APIs
          </p>
        </div>

        <Separator />

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {EXTERNAL_DATA_SOURCES.map((source) => {
              const isEnabled = (enabledSources || []).includes(source.id)
              const isLoading = loadingState[source.id]
              const cachedCount = dataCache[source.id]?.length || 0
              const lastFetchTime = lastFetch[source.id]
              const canFetch = source.type === 'live_api' && source.endpoint

              return (
                <Card key={source.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold">{source.name}</h4>
                          <Badge variant="secondary" className={getSourceTypeColor(source.type)}>
                            {getSourceTypeLabel(source.type)}
                          </Badge>
                          {isEnabled && cachedCount > 0 && (
                            <Badge variant="outline" className="gap-1">
                              <CheckCircle size={12} weight="fill" />
                              {cachedCount} loaded
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{source.description}</p>
                        {source.websiteUrl && (
                          <a
                            href={source.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-accent hover:underline flex items-center gap-1"
                          >
                            <Link size={12} />
                            {source.attribution}
                          </a>
                        )}
                        {lastFetchTime && (
                          <p className="text-xs text-muted-foreground">
                            Last fetched: {new Date(lastFetchTime).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`source-${source.id}`}
                          checked={isEnabled}
                          onCheckedChange={() => toggleSource(source.id)}
                          disabled={!canFetch && source.type !== 'live_api'}
                        />
                      </div>
                    </div>

                    {isEnabled && (
                      <div className="flex items-center gap-2">
                        {canFetch && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fetchSourceData(source.id)}
                            disabled={isLoading}
                            className="gap-2"
                          >
                            {isLoading ? (
                              <>
                                <ArrowsClockwise size={14} className="animate-spin" />
                                Loading...
                              </>
                            ) : (
                              <>
                                <Download size={14} weight="bold" />
                                Fetch Data
                              </>
                            )}
                          </Button>
                        )}
                        {!canFetch && source.type === 'bulk_dataset' && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Warning size={14} />
                            Manual download required
                          </div>
                        )}
                        {!canFetch && source.type === 'real_time_feed' && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Warning size={14} />
                            Coming soon
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </ScrollArea>

        <div className="text-xs text-muted-foreground pt-2 border-t border-border">
          <p>
            External data is cached locally and combined with user reports on the map.
            All sources are clearly attributed in observation details.
          </p>
        </div>
      </div>
    </Card>
  )
}

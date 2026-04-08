import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Database, CaretDown, CaretUp, Globe } from '@phosphor-icons/react'
import type { ExternalDataSource } from '@/lib/external-sources'

interface DataSourceTogglePanelProps {
  dataSources: ExternalDataSource[]
  activeSourceIds: string[]
  onToggleSource: (sourceId: string, enabled: boolean) => void
}

export function DataSourceTogglePanel({ dataSources, activeSourceIds, onToggleSource }: DataSourceTogglePanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'live_api': return 'bg-accent text-accent-foreground'
      case 'bulk_dataset': return 'bg-secondary text-secondary-foreground'
      case 'real_time_feed': return 'bg-success text-success-foreground'
      case 'official_reporting': return 'bg-primary text-primary-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'live_api': return 'Live API'
      case 'bulk_dataset': return 'Dataset'
      case 'real_time_feed': return 'Real-Time'
      case 'official_reporting': return 'Official'
      default: return type
    }
  }

  return (
    <Card className="border border-border bg-card">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <Database size={20} weight="fill" className="text-accent" />
              <div className="text-left">
                <div className="font-semibold">External Data Sources</div>
                <div className="text-xs text-muted-foreground">
                  {activeSourceIds.length} of {dataSources.length} active
                </div>
              </div>
            </div>
            {isExpanded ? <CaretUp size={20} /> : <CaretDown size={20} />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3">
            {dataSources.map((source) => {
              const isActive = activeSourceIds.includes(source.id)
              
              return (
                <div
                  key={source.id}
                  className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{source.name}</h4>
                      <Badge className={`text-xs ${getTypeColor(source.type)}`}>
                        {getTypeLabel(source.type)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{source.description}</p>
                    {source.websiteUrl && (
                      <a
                        href={source.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                      >
                        <Globe size={12} weight="fill" />
                        Visit source
                      </a>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Label htmlFor={`source-${source.id}`} className="sr-only">
                      Toggle {source.name}
                    </Label>
                    <Switch
                      id={`source-${source.id}`}
                      checked={isActive}
                      onCheckedChange={(enabled) => onToggleSource(source.id, enabled)}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

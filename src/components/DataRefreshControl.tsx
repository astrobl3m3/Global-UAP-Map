import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ArrowsClockwise, CaretDown, CaretUp, Clock } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { RefreshConfig } from '@/lib/real-api-connectors'
import { refreshAllSources } from '@/lib/real-api-connectors'
import { convertExternalToObservation, getSourceById } from '@/lib/external-sources'
import type { Observation } from '@/lib/types'

interface DataRefreshControlProps {
  activeSourceIds: string[]
  onRefreshComplete: (newObservations: Observation[]) => void
}

export function DataRefreshControl({ activeSourceIds, onRefreshComplete }: DataRefreshControlProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshConfig, setRefreshConfig] = useKV<RefreshConfig>('refresh-config', {
    autoRefresh: false,
    intervalMinutes: 30,
    lastRefresh: 0,
  })
  
  const [lastRefreshDisplay, setLastRefreshDisplay] = useState('')
  
  useEffect(() => {
    const updateDisplay = () => {
      if (!refreshConfig?.lastRefresh) {
        setLastRefreshDisplay('Never')
        return
      }
      
      const elapsed = Date.now() - refreshConfig.lastRefresh
      const minutes = Math.floor(elapsed / 60000)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)
      
      if (days > 0) {
        setLastRefreshDisplay(`${days}d ago`)
      } else if (hours > 0) {
        setLastRefreshDisplay(`${hours}h ago`)
      } else if (minutes > 0) {
        setLastRefreshDisplay(`${minutes}m ago`)
      } else {
        setLastRefreshDisplay('Just now')
      }
    }
    
    updateDisplay()
    const interval = setInterval(updateDisplay, 30000)
    return () => clearInterval(interval)
  }, [refreshConfig?.lastRefresh])
  
  useEffect(() => {
    if (!refreshConfig?.autoRefresh) return
    
    const intervalMs = (refreshConfig.intervalMinutes || 30) * 60 * 1000
    const timeSinceLastRefresh = Date.now() - (refreshConfig.lastRefresh || 0)
    
    if (timeSinceLastRefresh >= intervalMs) {
      handleRefresh()
    }
    
    const interval = setInterval(() => {
      handleRefresh()
    }, intervalMs)
    
    return () => clearInterval(interval)
  }, [refreshConfig?.autoRefresh, refreshConfig?.intervalMinutes])
  
  const handleRefresh = async () => {
    if (isRefreshing) return
    if (activeSourceIds.length === 0) {
      toast.info('No data sources enabled')
      return
    }
    
    setIsRefreshing(true)
    toast.info(`Refreshing data from ${activeSourceIds.length} source(s)...`)
    
    try {
      const results = await refreshAllSources(activeSourceIds)
      
      const allNewObs: Observation[] = []
      let totalFetched = 0
      
      results.forEach((result, sourceId) => {
        if (result.error) {
          console.warn(`${sourceId} error:`, result.error)
        }
        
        if (result.data.length > 0) {
          const source = getSourceById(sourceId)
          
          if (source) {
            const observations = result.data.map(ext => convertExternalToObservation(ext, source))
            allNewObs.push(...observations)
            totalFetched += result.count
          }
        }
      })
      
      onRefreshComplete(allNewObs)
      
      setRefreshConfig((current) => ({
        ...current!,
        lastRefresh: Date.now(),
      }))
      
      toast.success(`Refreshed ${totalFetched} observations from ${results.size} source(s)`)
    } catch (error) {
      console.error('Refresh failed:', error)
      toast.error('Failed to refresh data sources')
    } finally {
      setIsRefreshing(false)
    }
  }
  
  const handleAutoRefreshToggle = (enabled: boolean) => {
    setRefreshConfig((current) => ({
      ...current!,
      autoRefresh: enabled,
    }))
    
    if (enabled) {
      toast.success(`Auto-refresh enabled (${refreshConfig?.intervalMinutes || 30}min intervals)`)
    } else {
      toast.info('Auto-refresh disabled')
    }
  }
  
  const handleIntervalChange = (value: string) => {
    const minutes = parseInt(value)
    setRefreshConfig((current) => ({
      ...current!,
      intervalMinutes: minutes,
    }))
    toast.success(`Refresh interval set to ${minutes} minutes`)
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
              <ArrowsClockwise size={20} weight="bold" className="text-accent" />
              <div className="text-left">
                <div className="font-semibold">Data Refresh Controls</div>
                <div className="text-xs text-muted-foreground">
                  Last: {lastRefreshDisplay}
                  {refreshConfig?.autoRefresh && (
                    <Badge className="ml-2 text-xs bg-success text-success-foreground">Auto</Badge>
                  )}
                </div>
              </div>
            </div>
            {isExpanded ? <CaretUp size={20} /> : <CaretDown size={20} />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">Manual Refresh</h4>
                <p className="text-xs text-muted-foreground">
                  Fetch latest data from active sources
                </p>
              </div>
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing || activeSourceIds.length === 0}
                className="gap-2"
                size="sm"
              >
                <ArrowsClockwise size={16} weight="bold" className={isRefreshing ? 'animate-spin' : ''} />
                Refresh Now
              </Button>
            </div>
            
            <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={16} weight="fill" />
                    <h4 className="font-medium text-sm">Auto-Refresh</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Automatically refresh data at set intervals
                  </p>
                </div>
                <Switch
                  checked={refreshConfig?.autoRefresh || false}
                  onCheckedChange={handleAutoRefreshToggle}
                />
              </div>
              
              {refreshConfig?.autoRefresh && (
                <div className="pt-2 border-t border-border">
                  <Label className="text-xs font-medium mb-2 block">
                    Refresh Interval
                  </Label>
                  <Select
                    value={String(refreshConfig.intervalMinutes)}
                    onValueChange={handleIntervalChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="360">6 hours</SelectItem>
                      <SelectItem value="720">12 hours</SelectItem>
                      <SelectItem value="1440">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <div className="text-xs text-muted-foreground text-center">
              {activeSourceIds.length === 0 ? (
                'Enable at least one data source to refresh'
              ) : (
                `Ready to refresh ${activeSourceIds.length} active source(s)`
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

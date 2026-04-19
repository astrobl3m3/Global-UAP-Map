import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Mountains, CaretDown, CaretUp } from '@phosphor-icons/react'
import { useState } from 'react'

export type TopoLayerType = 'none' | 'contours' | 'terrain' | 'satellite'

interface TopographicLayerControlProps {
  activeLayer: TopoLayerType
  onLayerChange: (layer: TopoLayerType) => void
}

export function TopographicLayerControl({
  activeLayer,
  onLayerChange,
}: TopographicLayerControlProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="border border-border bg-card">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-3 hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <Mountains size={20} weight="fill" className="text-accent" />
              <span className="text-sm font-medium">Topographic Layer</span>
            </div>
            {isExpanded ? <CaretUp size={16} /> : <CaretDown size={16} />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-3 pb-3 space-y-3">
          <div className="flex flex-col gap-2 pt-2">
            <Label htmlFor="topo-layer-select" className="text-sm">
              Map Layer
            </Label>
            <Select value={activeLayer} onValueChange={(value) => onLayerChange(value as TopoLayerType)}>
              <SelectTrigger id="topo-layer-select">
                <SelectValue placeholder="Select layer type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Standard Map</SelectItem>
                <SelectItem value="terrain">Terrain Relief</SelectItem>
                <SelectItem value="contours">Topographic Contours</SelectItem>
                <SelectItem value="satellite">Satellite Imagery</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Terrain Relief:</strong> Shaded elevation visualization</p>
            <p><strong>Topographic Contours:</strong> Elevation contour lines</p>
            <p><strong>Satellite:</strong> Satellite imagery overlay</p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

import { useState } from 'react'
import type { Observation } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { exportObservations, type ObservationExportFormat } from '@/lib/observation-export'
import { Download, FileText, FileCsv } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ExportObservationsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  observations: Observation[]
  filteredCount?: number
}

export function ExportObservationsDialog({
  open,
  onOpenChange,
  observations,
  filteredCount,
}: ExportObservationsDialogProps) {
  const [format, setFormat] = useState<ObservationExportFormat>('csv')
  const [includeSensorData, setIncludeSensorData] = useState(false)
  const [includeElevationData, setIncludeElevationData] = useState(true)
  const [includeWeatherData, setIncludeWeatherData] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportObservations(observations, {
        format,
        includeSensorData,
        includeElevationData,
        includeWeatherData,
      })

      toast.success('Export complete', {
        description: `Downloaded ${observations.length} observation${observations.length === 1 ? '' : 's'} as ${format.toUpperCase()}`,
      })

      onOpenChange(false)
    } catch (error) {
      toast.error('Export failed', {
        description: 'Failed to export observations. Please try again.',
      })
    } finally {
      setIsExporting(false)
    }
  }

  const hasSensorData = observations.some((obs) => !!obs.sensorData)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Observations</DialogTitle>
          <DialogDescription>
            Export {observations.length} observation{observations.length === 1 ? '' : 's'}
            {filteredCount && filteredCount !== observations.length && ` (filtered from ${filteredCount} total)`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as ObservationExportFormat)}>
              <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="csv" id="format-csv" />
                <Label
                  htmlFor="format-csv"
                  className="flex-1 cursor-pointer flex items-center gap-2"
                >
                  <FileCsv size={20} weight="fill" className="text-accent" />
                  <div>
                    <div className="font-medium">CSV (Spreadsheet)</div>
                    <div className="text-xs text-muted-foreground">
                      Import into Excel, Google Sheets, or data analysis tools
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="json" id="format-json" />
                <Label
                  htmlFor="format-json"
                  className="flex-1 cursor-pointer flex items-center gap-2"
                >
                  <FileText size={20} weight="fill" className="text-accent" />
                  <div>
                    <div className="font-medium">JSON (Structured Data)</div>
                    <div className="text-xs text-muted-foreground">
                      Complete data structure for technical analysis
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {hasSensorData && (
            <div className="space-y-3">
              <Label>Options</Label>
              <div className="flex items-start space-x-2 p-3 rounded-lg border">
                <Checkbox
                  id="include-sensors"
                  checked={includeSensorData}
                  onCheckedChange={(checked) => setIncludeSensorData(checked === true)}
                />
                <div className="flex-1">
                  <Label
                    htmlFor="include-sensors"
                    className="cursor-pointer font-medium"
                  >
                    Include sensor data
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Include all device sensor readings (increases file size)
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Label>Environmental Data</Label>
            <div className="space-y-2">
              <div className="flex items-start space-x-2 p-3 rounded-lg border">
                <Checkbox
                  id="include-elevation"
                  checked={includeElevationData}
                  onCheckedChange={(checked) => setIncludeElevationData(checked === true)}
                />
                <div className="flex-1">
                  <Label
                    htmlFor="include-elevation"
                    className="cursor-pointer font-medium"
                  >
                    Include elevation data
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Fetch and include terrain elevation for each observation location
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2 p-3 rounded-lg border">
                <Checkbox
                  id="include-weather"
                  checked={includeWeatherData}
                  onCheckedChange={(checked) => setIncludeWeatherData(checked === true)}
                />
                <div className="flex-1">
                  <Label
                    htmlFor="include-weather"
                    className="cursor-pointer font-medium"
                  >
                    Include historical weather data
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Include weather conditions at the time of observation (historical data for past observations)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/50 border text-sm space-y-2">
            <p className="text-muted-foreground">
              <strong className="text-foreground">Privacy notice:</strong> Exported data includes all information from selected observations. Handle with care and respect user privacy.
            </p>
            {(includeElevationData || includeWeatherData) && (
              <p className="text-muted-foreground">
                <strong className="text-foreground">Note:</strong> Environmental data will be fetched in real-time during export. This may take a few moments for large datasets.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} className="gap-2" disabled={isExporting}>
            <Download size={18} weight="bold" />
            {isExporting ? 'Exporting...' : `Export ${format.toUpperCase()}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

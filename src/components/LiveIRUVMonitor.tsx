import { useState } from 'react'
import { IRSpectrumAnalyzer } from '@/components/IRSpectrumAnalyzer'
import { UVSpectrumAnalyzer } from '@/components/UVSpectrumAnalyzer'
import { useIRUVSensors } from '@/hooks/use-ir-uv-sensors'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, Trash, Info, DownloadSimple } from '@phosphor-icons/react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { exportIRReadings, exportUVReadings } from '@/lib/export'
import { toast } from 'sonner'

export function LiveIRUVMonitor() {
  const [isRecording, setIsRecording] = useState(false)
  const { irReadings, uvReadings, clearReadings } = useIRUVSensors({
    enabled: isRecording,
    samplingRate: 100,
  })

  const handleToggleRecording = () => {
    setIsRecording((prev) => !prev)
  }

  const handleClear = () => {
    clearReadings()
  }

  const handleExportIR = (format: 'csv' | 'json') => {
    if (irReadings.length === 0) {
      toast.error('No IR data to export')
      return
    }
    exportIRReadings(irReadings, { format, includeMetadata: true })
    toast.success(`IR spectrum exported as ${format.toUpperCase()}`)
  }

  const handleExportUV = (format: 'csv' | 'json') => {
    if (uvReadings.length === 0) {
      toast.error('No UV data to export')
      return
    }
    exportUVReadings(uvReadings, { format, includeMetadata: true })
    toast.success(`UV spectrum exported as ${format.toUpperCase()}`)
  }

  const handleExportAll = (format: 'csv' | 'json') => {
    if (irReadings.length === 0 && uvReadings.length === 0) {
      toast.error('No data to export')
      return
    }
    if (irReadings.length > 0) {
      exportIRReadings(irReadings, { 
        format, 
        filename: `ir-spectrum-${Date.now()}.${format}`,
        includeMetadata: true 
      })
    }
    if (uvReadings.length > 0) {
      exportUVReadings(uvReadings, { 
        format, 
        filename: `uv-spectrum-${Date.now()}.${format}`,
        includeMetadata: true 
      })
    }
    toast.success(`All sensor data exported as ${format.toUpperCase()}`)
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">IR & UV Spectrum Monitor</h3>
            <p className="text-sm text-muted-foreground">Real-time infrared and ultraviolet sensor visualization</p>
          </div>
          <div className="flex items-center gap-2">
            {isRecording && (
              <Badge variant="destructive" className="animate-pulse">
                Recording
              </Badge>
            )}
            <Button
              onClick={handleToggleRecording}
              variant={isRecording ? 'destructive' : 'default'}
              className="gap-2"
            >
              {isRecording ? (
                <>
                  <Pause size={18} weight="fill" />
                  Stop
                </>
              ) : (
                <>
                  <Play size={18} weight="fill" />
                  Start Monitoring
                </>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2"
                  disabled={irReadings.length === 0 && uvReadings.length === 0}
                >
                  <DownloadSimple size={18} weight="fill" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExportAll('json')}>
                  All Data (JSON)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportAll('csv')}>
                  All Data (CSV)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExportIR('json')} disabled={irReadings.length === 0}>
                  IR Only (JSON)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportIR('csv')} disabled={irReadings.length === 0}>
                  IR Only (CSV)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExportUV('json')} disabled={uvReadings.length === 0}>
                  UV Only (JSON)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportUV('csv')} disabled={uvReadings.length === 0}>
                  UV Only (CSV)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              onClick={handleClear}
              variant="outline"
              size="icon"
              disabled={irReadings.length === 0 && uvReadings.length === 0}
            >
              <Trash size={18} weight="fill" />
            </Button>
          </div>
        </div>

        <Alert className="mb-4">
          <Info size={18} weight="fill" />
          <AlertDescription className="text-xs">
            <strong>Experimental Feature:</strong> IR and UV sensors are simulated for demonstration purposes. 
            Real sensor data would require external hardware sensors connected via Bluetooth or USB.
            Anomaly detection identifies unusual spectral patterns that may indicate electromagnetic phenomena.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <IRSpectrumAnalyzer
            readings={irReadings}
            isRecording={isRecording}
          />
          <UVSpectrumAnalyzer
            readings={uvReadings}
            isRecording={isRecording}
          />
        </div>

        {(irReadings.length > 0 || uvReadings.length > 0) && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-muted-foreground text-xs">IR Samples</div>
                <div className="font-mono font-semibold text-lg">{irReadings.length}</div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground text-xs">UV Samples</div>
                <div className="font-mono font-semibold text-lg">{uvReadings.length}</div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground text-xs">IR Anomalies</div>
                <div className="font-mono font-semibold text-lg text-destructive">
                  {irReadings.filter((r) => r.anomalyDetected).length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground text-xs">UV Anomalies</div>
                <div className="font-mono font-semibold text-lg text-destructive">
                  {uvReadings.filter((r) => r.anomalyDetected).length}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-4 bg-muted/50 border-border">
        <h4 className="font-semibold text-sm mb-3">About IR & UV Sensors</h4>
        <div className="space-y-2 text-xs text-muted-foreground">
          <div>
            <strong className="text-foreground">Infrared (IR) Spectrum:</strong> Detects electromagnetic radiation with wavelengths from 700nm to 1mm. 
            Useful for detecting heat signatures, thermal anomalies, and night vision applications.
          </div>
          <div>
            <strong className="text-foreground">Ultraviolet (UV) Spectrum:</strong> Detects electromagnetic radiation with wavelengths from 10nm to 400nm. 
            Divided into UVA (315-400nm), UVB (280-315nm), and UVC (100-280nm). Can detect atmospheric phenomena and unusual light sources.
          </div>
          <div>
            <strong className="text-foreground">Anomaly Detection:</strong> The system flags spectral patterns that deviate significantly from baseline measurements,
            which could indicate electromagnetic disturbances or unusual phenomena.
          </div>
          <div className="pt-2 border-t border-border">
            <strong className="text-foreground">Hardware Integration:</strong> For production use, connect external IR/UV sensors via:
            <ul className="list-disc list-inside ml-2 mt-1">
              <li>Bluetooth Low Energy (BLE) sensors</li>
              <li>USB spectrometers</li>
              <li>Smartphone camera sensors (limited spectrum)</li>
              <li>Dedicated scientific instruments</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}

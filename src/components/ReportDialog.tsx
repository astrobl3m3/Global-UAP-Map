import { useState, useEffect } from 'react'
import type { Observation, Location } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { MapPin, Crosshair } from '@phosphor-icons/react'
import { generateId, formatCoordinates } from '@/lib/helpers'
import { toast } from 'sonner'

interface ReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (observation: Observation) => void
}

export function ReportDialog({ open, onOpenChange, onSubmit }: ReportDialogProps) {
  const [location, setLocation] = useState<Location | null>(null)
  const [description, setDescription] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported')
      return
    }

    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
        })
        setIsGettingLocation(false)
        toast.success('Location acquired')
      },
      (error) => {
        setIsGettingLocation(false)
        toast.error(`Location error: ${error.message}`)
      }
    )
  }

  const handleSubmit = () => {
    if (!location) {
      toast.error('Please set a location')
      return
    }

    if (!description.trim()) {
      toast.error('Please add a description')
      return
    }

    const observation: Observation = {
      id: generateId(),
      location,
      timestamp: Date.now(),
      description: description.trim(),
      isAnonymous,
      media: [],
      sensorData: {},
      classifications: [],
      comments: [],
      views: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    onSubmit(observation)
    toast.success('Observation reported')
    
    setLocation(null)
    setDescription('')
    setIsAnonymous(false)
  }

  useEffect(() => {
    if (!open) {
      setLocation(null)
      setDescription('')
      setIsAnonymous(false)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report UAP Sighting</DialogTitle>
          <DialogDescription>
            Document your observation with location and details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label>Location</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleGetLocation}
                disabled={isGettingLocation}
                variant="outline"
                className="gap-2"
              >
                <Crosshair size={18} weight="bold" />
                {isGettingLocation ? 'Getting location...' : 'Use My Location'}
              </Button>
            </div>
            {location && (
              <div className="p-3 bg-secondary rounded-lg flex items-start gap-2">
                <MapPin size={18} weight="fill" className="mt-0.5 text-accent" />
                <div className="flex-1">
                  <p className="font-mono text-sm">{formatCoordinates(location.lat, location.lng)}</p>
                  {location.altitude && (
                    <p className="text-xs text-muted-foreground">
                      Altitude: {location.altitude.toFixed(0)}m
                    </p>
                  )}
                  {location.accuracy && (
                    <p className="text-xs text-muted-foreground">
                      Accuracy: ±{location.accuracy.toFixed(0)}m
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you observed in detail... Include time of day, duration, movement patterns, size, color, sounds, etc."
              className="min-h-[150px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {description.length} characters
            </p>
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
            <div className="space-y-0.5">
              <Label htmlFor="anonymous">Anonymous Report</Label>
              <p className="text-sm text-muted-foreground">
                Post without identifying information
              </p>
            </div>
            <Switch
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Submit Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

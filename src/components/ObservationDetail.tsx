import { useState } from 'react'
import type { Observation, Classification, ClassificationVote, MediaFile } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MapPin, Eye, Calendar } from '@phosphor-icons/react'
import { formatTimestamp, formatCoordinates, getTopClassification, getClassificationLabel } from '@/lib/helpers'
import { toast } from 'sonner'

interface ObservationDetailProps {
  observation: Observation
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (observation: Observation) => void
}

export function ObservationDetail({ observation, open, onOpenChange, onUpdate }: ObservationDetailProps) {
  const [selectedClassification, setSelectedClassification] = useState<Classification | null>(null)
  
  const topClassification = getTopClassification(observation)
  
  const classificationOptions: Classification[] = [
    'astronomical',
    'atmospheric',
    'weather',
    'physics',
    'human-made',
    'unknown',
  ]
  
  const classificationColors: Record<Classification, string> = {
    astronomical: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    atmospheric: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
    weather: 'bg-sky-500/20 text-sky-300 border-sky-500/50',
    physics: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
    'human-made': 'bg-orange-500/20 text-orange-300 border-orange-500/50',
    unknown: 'bg-gray-500/20 text-gray-300 border-gray-500/50',
  }

  const handleClassify = () => {
    if (!selectedClassification) return

    const newVote: ClassificationVote = {
      userId: 'anonymous',
      classification: selectedClassification,
      confidence: 3,
      votedAt: Date.now(),
      upvotes: 0,
    }

    const updated = {
      ...observation,
      communityClassifications: [
        ...observation.communityClassifications,
        newVote,
      ],
      classificationCount: observation.classificationCount + 1,
      updatedAt: Date.now(),
    }

    onUpdate(updated)
    setSelectedClassification(null)
    toast.success('Classification added')
  }

  const allMedia: MediaFile[] = [
    ...(Array.isArray(observation.photos) ? observation.photos : []),
    ...(Array.isArray(observation.videos) ? observation.videos : []),
    ...(Array.isArray(observation.audio) ? observation.audio : [])
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Observation Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar size={16} weight="fill" />
                  <span>{formatTimestamp(observation.reportedAt)}</span>
                  <span>•</span>
                  <Eye size={16} weight="fill" />
                  <span>{observation.viewCount} views</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={16} weight="fill" className="text-accent" />
                  <span className="font-mono">{formatCoordinates(observation.location.lat, observation.location.lng)}</span>
                </div>

                {observation.isAnonymous ? (
                  <span className="text-sm text-muted-foreground">Anonymous Report</span>
                ) : (
                  <span className="text-sm text-muted-foreground">User Report</span>
                )}
              </div>

              {topClassification && (
                <Badge variant="outline" className={`${classificationColors[topClassification]}`}>
                  {getClassificationLabel(topClassification)}
                </Badge>
              )}
            </div>

            {observation.title && (
              <div>
                <h3 className="font-semibold text-lg mb-2">{observation.title}</h3>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{observation.description}</p>
            </div>

            {allMedia.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Media</h3>
                <div className="grid grid-cols-2 gap-2">
                  {allMedia.map((item) => (
                    <div key={item.id} className="aspect-video rounded-lg overflow-hidden bg-secondary">
                      <img src={item.url} alt="Observation media" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">Community Classification</h3>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {classificationOptions.map((category) => {
                    const count = observation.communityClassifications.filter((c) => c.classification === category).length
                    return (
                      <Button
                        key={category}
                        variant={selectedClassification === category ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedClassification(category)}
                        className={selectedClassification === category ? 'bg-accent text-accent-foreground' : ''}
                      >
                        {getClassificationLabel(category)}
                        {count > 0 && <Badge className="ml-2" variant="secondary">{count}</Badge>}
                      </Button>
                    )
                  })}
                </div>
                {selectedClassification && (
                  <Button
                    onClick={handleClassify}
                    size="sm"
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    Submit Classification
                  </Button>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

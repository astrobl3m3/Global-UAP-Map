import type { Observation, MediaFile } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AudioPlayer } from '@/components/AudioPlayer'
import { ClassificationVoting } from '@/components/ClassificationVoting'
import { MapPin, Eye, Calendar } from '@phosphor-icons/react'
import { formatTimestamp, formatCoordinates, getTopClassification, getClassificationLabel } from '@/lib/helpers'

interface ObservationDetailProps {
  observation: Observation
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (observation: Observation) => void
}

export function ObservationDetail({ observation, open, onOpenChange, onUpdate }: ObservationDetailProps) {
  const topClassification = getTopClassification(observation)
  
  const classificationColors = {
    astronomical: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    atmospheric: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
    weather: 'bg-sky-500/20 text-sky-300 border-sky-500/50',
    physics: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
    'human-made': 'bg-orange-500/20 text-orange-300 border-orange-500/50',
    unknown: 'bg-gray-500/20 text-gray-300 border-gray-500/50',
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
                <h3 className="font-semibold mb-2">Media ({allMedia.length})</h3>
                <div className="space-y-2">
                  {observation.photos && observation.photos.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Photos</p>
                      <div className="grid grid-cols-2 gap-2">
                        {observation.photos.map((photo) => (
                          <div key={photo.id} className="aspect-video rounded-lg overflow-hidden bg-secondary">
                            <img src={photo.url} alt="Observation photo" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {observation.videos && observation.videos.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Videos</p>
                      <div className="grid grid-cols-2 gap-2">
                        {observation.videos.map((video) => (
                          <div key={video.id} className="aspect-video rounded-lg overflow-hidden bg-secondary">
                            <video src={video.url} controls className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {observation.audio && observation.audio.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Audio Recordings</p>
                      <div className="space-y-2">
                        {observation.audio.map((audio) => (
                          <AudioPlayer
                            key={audio.id}
                            audio={audio}
                            compact={false}
                            showSpectrumAnalyzer={true}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Separator />

            <ClassificationVoting observation={observation} onUpdate={onUpdate} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

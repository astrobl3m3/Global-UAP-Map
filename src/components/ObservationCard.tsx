import type { Observation } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MapPin, Eye, ChatCircle, Camera, Microphone, ArrowUp, Database, Mountains } from '@phosphor-icons/react'
import { formatTimestamp, formatCoordinates, getTopClassification, getClassificationLabel } from '@/lib/helpers'
import { getSourceById } from '@/lib/external-sources'

interface ObservationCardProps {
  observation: Observation
  onClick?: () => void
}

export function ObservationCard({ observation, onClick }: ObservationCardProps) {
  const topClassification = getTopClassification(observation)
  const classificationColors = {
    astronomical: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    atmospheric: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
    weather: 'bg-sky-500/20 text-sky-300 border-sky-500/50',
    physics: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
    'human-made': 'bg-orange-500/20 text-orange-300 border-orange-500/50',
    unknown: 'bg-gray-500/20 text-gray-300 border-gray-500/50',
  }

  const isExternalSource = observation.id.includes('-')
  const sourceId = isExternalSource ? observation.id.split('-')[0] : null
  const externalSource = sourceId ? getSourceById(sourceId) : null

  const allMedia = [
    ...(Array.isArray(observation.photos) ? observation.photos : []),
    ...(Array.isArray(observation.videos) ? observation.videos : [])
  ]
  const mediaCount = allMedia.length
  const audioCount = Array.isArray(observation.audio) ? observation.audio.length : 0

  return (
    <Card 
      className="group cursor-pointer hover:border-accent transition-all hover:shadow-lg hover:shadow-accent/20"
      onClick={onClick}
    >
      <CardContent className="p-4">
        {mediaCount > 0 && (
          <div className="relative w-full h-40 mb-3 rounded-lg overflow-hidden bg-secondary">
            {allMedia[0].type === 'video' ? (
              <video 
                src={allMedia[0].url} 
                className="w-full h-full object-cover"
                muted
              />
            ) : (
              <img 
                src={allMedia[0].thumbnailUrl || allMedia[0].url} 
                alt="Observation media"
                className="w-full h-full object-cover"
              />
            )}
            {mediaCount > 1 && (
              <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
                <Camera size={14} weight="fill" />
                <span className="text-xs font-mono">{mediaCount}</span>
              </div>
            )}
          </div>
        )}
        
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-2 mb-1">
                {observation.title || observation.description?.slice(0, 100) || 'Untitled observation'}
                {!observation.title && observation.description && observation.description.length > 100 && '...'}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin size={14} weight="fill" />
                <span className="font-mono truncate">{formatCoordinates(observation.location.lat, observation.location.lng)}</span>
                {observation.altitude && (
                  <>
                    <span>•</span>
                    <Mountains size={14} weight="fill" className="text-accent" />
                    <span>{observation.altitude.toFixed(0)}m</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {externalSource ? (
                <>
                  <Database size={12} weight="fill" className="text-accent" />
                  <span className="text-xs text-accent font-medium">{externalSource.name}</span>
                </>
              ) : observation.isAnonymous ? (
                <span className="text-xs text-muted-foreground">Anonymous</span>
              ) : (
                <span className="text-xs text-muted-foreground">User</span>
              )}
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{formatTimestamp(observation.reportedAt)}</span>
            </div>
          </div>

          {topClassification && (
            <Badge 
              variant="outline" 
              className={`${classificationColors[topClassification]} text-xs`}
            >
              {getClassificationLabel(topClassification)}
            </Badge>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
            <div className="flex items-center gap-1">
              <Eye size={14} />
              <span>{observation.viewCount || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <ChatCircle size={14} />
              <span>{observation.commentCount || 0}</span>
            </div>
            {observation.classificationCount > 0 && (
              <div className="flex items-center gap-1 text-accent">
                <ArrowUp size={14} weight="fill" />
                <span>{observation.classificationCount}</span>
              </div>
            )}
            {audioCount > 0 && (
              <div className="flex items-center gap-1">
                <Microphone size={14} weight="fill" />
                <span>{audioCount}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

import { useState } from 'react'
import type { Observation, ClassificationCategory, Comment } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MapPin, Eye, Calendar, ChatCircle } from '@phosphor-icons/react'
import { formatTimestamp, formatCoordinates, getTopClassification, getClassificationLabel } from '@/lib/helpers'
import { generateId } from '@/lib/helpers'
import { toast } from 'sonner'

interface ObservationDetailProps {
  observation: Observation
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (observation: Observation) => void
}

export function ObservationDetail({ observation, open, onOpenChange, onUpdate }: ObservationDetailProps) {
  const [selectedClassification, setSelectedClassification] = useState<ClassificationCategory | null>(null)
  const [commentText, setCommentText] = useState('')
  
  const topClassification = getTopClassification(observation)
  
  const classificationOptions: ClassificationCategory[] = [
    'astronomical',
    'atmospheric',
    'weather',
    'physics',
    'human-made',
    'unknown',
  ]
  
  const classificationColors: Record<ClassificationCategory, string> = {
    astronomical: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    atmospheric: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
    weather: 'bg-sky-500/20 text-sky-300 border-sky-500/50',
    physics: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
    'human-made': 'bg-orange-500/20 text-orange-300 border-orange-500/50',
    unknown: 'bg-gray-500/20 text-gray-300 border-gray-500/50',
  }

  const handleClassify = () => {
    if (!selectedClassification) return

    const updated = {
      ...observation,
      classifications: [
        ...observation.classifications,
        {
          category: selectedClassification,
          timestamp: Date.now(),
        },
      ],
      updatedAt: Date.now(),
    }

    onUpdate(updated)
    setSelectedClassification(null)
    toast.success('Classification added')
  }

  const handleAddComment = () => {
    if (!commentText.trim()) return

    const newComment: Comment = {
      id: generateId(),
      text: commentText.trim(),
      isAnonymous: true,
      timestamp: Date.now(),
    }

    const updated = {
      ...observation,
      comments: [...observation.comments, newComment],
      updatedAt: Date.now(),
    }

    onUpdate(updated)
    setCommentText('')
    toast.success('Comment added')
  }

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
                  <span>{formatTimestamp(observation.timestamp)}</span>
                  <span>•</span>
                  <Eye size={16} weight="fill" />
                  <span>{observation.views} views</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={16} weight="fill" className="text-accent" />
                  <span className="font-mono">{formatCoordinates(observation.location.lat, observation.location.lng)}</span>
                </div>

                {!observation.isAnonymous && observation.username && (
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={observation.userAvatar} />
                      <AvatarFallback className="text-xs">
                        {observation.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{observation.username}</span>
                  </div>
                )}
                {observation.isAnonymous && (
                  <span className="text-sm text-muted-foreground">Anonymous Report</span>
                )}
              </div>

              {topClassification && (
                <Badge variant="outline" className={`${classificationColors[topClassification]}`}>
                  {getClassificationLabel(topClassification)}
                </Badge>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{observation.description}</p>
            </div>

            {observation.media.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Media</h3>
                <div className="grid grid-cols-2 gap-2">
                  {observation.media.map((item) => (
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
                    const count = observation.classifications.filter((c) => c.category === category).length
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

            <Separator />

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <ChatCircle size={18} weight="fill" />
                Comments ({observation.comments.length})
              </h3>

              <div className="space-y-4">
                {observation.comments.map((comment) => (
                  <div key={comment.id} className="bg-secondary rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {!comment.isAnonymous && comment.username ? (
                        <>
                          <Avatar className="w-4 h-4">
                            <AvatarFallback className="text-[8px]">
                              {comment.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{comment.username}</span>
                        </>
                      ) : (
                        <span>Anonymous</span>
                      )}
                      <span>•</span>
                      <span>{formatTimestamp(comment.timestamp)}</span>
                    </div>
                    <p className="text-sm">{comment.text}</p>
                  </div>
                ))}

                <div className="space-y-2">
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add your analysis or thoughts..."
                    className="min-h-[80px]"
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                    size="sm"
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

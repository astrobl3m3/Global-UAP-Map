import { useState, useEffect } from 'react'
import type { Observation, Classification, ClassificationVote } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ArrowUp, Check, Trophy, Users } from '@phosphor-icons/react'
import { getClassificationLabel } from '@/lib/helpers'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface ClassificationVotingProps {
  observation: Observation
  onUpdate: (observation: Observation) => void
}

export function ClassificationVoting({ observation, onUpdate }: ClassificationVotingProps) {
  const [selectedClassification, setSelectedClassification] = useState<Classification | null>(null)
  const [confidence, setConfidence] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [explanation, setExplanation] = useState('')
  const [showVoteForm, setShowVoteForm] = useState(false)
  const [userId] = useState(() => localStorage.getItem('voting-user-id') || `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
  const [hasVoted, setHasVoted] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('voting-user-id')) {
      localStorage.setItem('voting-user-id', userId)
    }
  }, [userId])

  useEffect(() => {
    const userHasVoted = (observation.communityClassifications || []).some(
      (vote) => vote.userId === userId
    )
    setHasVoted(userHasVoted)
  }, [observation.communityClassifications, userId])

  const classificationOptions: Classification[] = [
    'astronomical',
    'atmospheric',
    'weather',
    'physics',
    'human-made',
    'unknown',
  ]

  const classificationColors: Record<Classification, string> = {
    astronomical: 'bg-blue-500/20 text-blue-300 border-blue-500/50 hover:bg-blue-500/30',
    atmospheric: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 hover:bg-cyan-500/30',
    weather: 'bg-sky-500/20 text-sky-300 border-sky-500/50 hover:bg-sky-500/30',
    physics: 'bg-purple-500/20 text-purple-300 border-purple-500/50 hover:bg-purple-500/30',
    'human-made': 'bg-orange-500/20 text-orange-300 border-orange-500/50 hover:bg-orange-500/30',
    unknown: 'bg-gray-500/20 text-gray-300 border-gray-500/50 hover:bg-gray-500/30',
  }

  const getVotesByClassification = () => {
    const votes: Record<Classification, ClassificationVote[]> = {
      astronomical: [],
      atmospheric: [],
      weather: [],
      physics: [],
      'human-made': [],
      unknown: [],
    }

    ;(observation.communityClassifications || []).forEach((vote) => {
      votes[vote.classification].push(vote)
    })

    return votes
  }

  const getVoteStats = () => {
    const votesByClass = getVotesByClassification()
    const totalVotes = observation.communityClassifications?.length || 0
    
    return classificationOptions.map((classification) => {
      const votes = votesByClass[classification]
      const count = votes.length
      const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0
      const totalUpvotes = votes.reduce((sum, vote) => sum + vote.upvotes, 0)
      const avgConfidence = votes.length > 0
        ? votes.reduce((sum, vote) => sum + vote.confidence, 0) / votes.length
        : 0

      return {
        classification,
        count,
        percentage,
        totalUpvotes,
        avgConfidence,
        votes,
      }
    }).sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count
      return b.totalUpvotes - a.totalUpvotes
    })
  }

  const handleVote = () => {
    if (!selectedClassification) return

    const newVote: ClassificationVote = {
      userId,
      classification: selectedClassification,
      confidence,
      explanation: explanation.trim() || undefined,
      votedAt: Date.now(),
      upvotes: 0,
    }

    const updated = {
      ...observation,
      communityClassifications: [
        ...(observation.communityClassifications || []),
        newVote,
      ],
      classificationCount: (observation.classificationCount || 0) + 1,
      updatedAt: Date.now(),
    }

    onUpdate(updated)
    setShowVoteForm(false)
    setSelectedClassification(null)
    setExplanation('')
    setConfidence(3)
    toast.success('Your classification vote has been submitted!', {
      description: `Voted: ${getClassificationLabel(selectedClassification)}`,
    })
  }

  const handleUpvote = (voteIndex: number) => {
    const vote = observation.communityClassifications?.[voteIndex]
    if (!vote) return

    const userUpvoteKey = `upvote-${observation.id}-${voteIndex}`
    const hasUpvoted = localStorage.getItem(userUpvoteKey) === 'true'

    if (hasUpvoted) {
      toast.info('You already upvoted this classification')
      return
    }

    const updatedVotes = [...(observation.communityClassifications || [])]
    updatedVotes[voteIndex] = {
      ...vote,
      upvotes: vote.upvotes + 1,
    }

    const updated = {
      ...observation,
      communityClassifications: updatedVotes,
      updatedAt: Date.now(),
    }

    localStorage.setItem(userUpvoteKey, 'true')
    onUpdate(updated)
    toast.success('Upvote added!')
  }

  const stats = getVoteStats()
  const topVote = stats[0]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Users size={20} weight="fill" className="text-accent" />
            Community Classification
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {observation.classificationCount || 0} {observation.classificationCount === 1 ? 'vote' : 'votes'} from the community
          </p>
        </div>
        {!hasVoted && (
          <Button
            onClick={() => setShowVoteForm(!showVoteForm)}
            variant="outline"
            size="sm"
            className="border-accent text-accent hover:bg-accent/10"
          >
            {showVoteForm ? 'Cancel' : 'Cast Vote'}
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {showVoteForm && !hasVoted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 p-4 border border-border rounded-lg bg-card/50"
          >
            <div>
              <Label className="text-sm font-medium mb-3 block">Select Classification</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {classificationOptions.map((category) => (
                  <Button
                    key={category}
                    variant={selectedClassification === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedClassification(category)}
                    className={
                      selectedClassification === category
                        ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                        : classificationColors[category]
                    }
                  >
                    {getClassificationLabel(category)}
                  </Button>
                ))}
              </div>
            </div>

            {selectedClassification && (
              <>
                <div>
                  <Label htmlFor="confidence" className="text-sm font-medium mb-2 block">
                    Confidence Level: {confidence}/5
                  </Label>
                  <RadioGroup
                    value={confidence.toString()}
                    onValueChange={(val) => setConfidence(parseInt(val) as 1 | 2 | 3 | 4 | 5)}
                    className="flex gap-2"
                  >
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div key={level} className="flex items-center space-x-1">
                        <RadioGroupItem value={level.toString()} id={`conf-${level}`} />
                        <Label htmlFor={`conf-${level}`} className="text-sm cursor-pointer">
                          {level}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="explanation" className="text-sm font-medium mb-2 block">
                    Explanation (Optional)
                  </Label>
                  <Textarea
                    id="explanation"
                    placeholder="Share your reasoning for this classification..."
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                </div>

                <Button
                  onClick={handleVote}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <Check size={18} weight="bold" className="mr-2" />
                  Submit Vote
                </Button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {hasVoted && (
        <div className="p-3 border border-success/50 bg-success/10 rounded-lg text-sm flex items-center gap-2">
          <Check size={16} weight="bold" className="text-success" />
          <span className="text-success">You've already voted on this observation</span>
        </div>
      )}

      <Separator />

      <div className="space-y-3">
        {stats.length === 0 || topVote.count === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No classifications yet. Be the first to vote!</p>
          </div>
        ) : (
          <>
            {stats.filter((s) => s.count > 0).map((stat, index) => (
              <div
                key={stat.classification}
                className="space-y-2 p-3 rounded-lg border border-border bg-card/30 hover:bg-card/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {index === 0 && stat.count > 0 && (
                      <Trophy size={18} weight="fill" className="text-accent" />
                    )}
                    <Badge
                      variant="outline"
                      className={classificationColors[stat.classification]}
                    >
                      {getClassificationLabel(stat.classification)}
                    </Badge>
                    <span className="text-sm font-medium">
                      {stat.count} {stat.count === 1 ? 'vote' : 'votes'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({stat.percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Avg Confidence: {stat.avgConfidence.toFixed(1)}/5</span>
                    {stat.totalUpvotes > 0 && (
                      <span className="flex items-center gap-1">
                        <ArrowUp size={12} weight="fill" className="text-accent" />
                        {stat.totalUpvotes}
                      </span>
                    )}
                  </div>
                </div>
                <Progress value={stat.percentage} className="h-2" />

                {stat.votes.length > 0 && (
                  <div className="space-y-2 mt-3 pt-3 border-t border-border/50">
                    {stat.votes.slice(0, 3).map((vote, voteIdx) => {
                      const globalIndex = (observation.communityClassifications || []).indexOf(vote)
                      return (
                        <div
                          key={`${vote.votedAt}-${voteIdx}`}
                          className="text-xs space-y-1 p-2 rounded bg-background/50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">
                                Confidence: {vote.confidence}/5
                              </span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground">
                                {new Date(vote.votedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpvote(globalIndex)}
                              className="h-6 px-2 gap-1 text-xs hover:text-accent"
                            >
                              <ArrowUp size={14} weight="fill" />
                              {vote.upvotes}
                            </Button>
                          </div>
                          {vote.explanation && (
                            <p className="text-foreground/80 italic">"{vote.explanation}"</p>
                          )}
                        </div>
                      )
                    })}
                    {stat.votes.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center pt-1">
                        +{stat.votes.length - 3} more {stat.votes.length - 3 === 1 ? 'vote' : 'votes'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

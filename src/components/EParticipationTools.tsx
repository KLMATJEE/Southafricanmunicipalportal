import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Progress } from './ui/progress'
import {
  MessageSquare,
  ThumbsUp,
  Share2,
  Plus,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle2,
  Eye,
} from 'lucide-react'
import { api } from '../utils/api'
import { toast } from 'sonner@2.0.3'
import { Language, getTranslation } from '../utils/translations'

interface EParticipationToolsProps {
  user: any
  language: Language
}

export function EParticipationTools({ user, language }: EParticipationToolsProps) {
  const [forums, setForums] = useState<any[]>([])
  const [polls, setPolls] = useState<any[]>([])
  const [feedback, setFeedback] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewDiscussion, setShowNewDiscussion] = useState(false)
  const [showNewPoll, setShowNewPoll] = useState(false)
  const [showNewFeedback, setShowNewFeedback] = useState(false)

  const t = (key: string) => getTranslation(language, key)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [forumsData, pollsData, feedbackData] = await Promise.all([
        api.getForums(),
        api.getPolls(),
        api.getFeedback(),
      ])
      setForums(forumsData.forums || [])
      setPolls(pollsData.polls || [])
      setFeedback(feedbackData.feedback || [])
    } catch (error) {
      console.error('Error loading participation data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    try {
      await api.createDiscussion({
        title: formData.get('title'),
        content: formData.get('content'),
        category: formData.get('category'),
      })
      toast.success('Discussion created successfully!')
      setShowNewDiscussion(false)
      form.reset()
      loadData()
    } catch (error) {
      toast.error('Failed to create discussion')
    }
  }

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    try {
      await api.createPoll({
        question: formData.get('question'),
        options: [
          formData.get('option1'),
          formData.get('option2'),
          formData.get('option3'),
          formData.get('option4'),
        ].filter(Boolean),
        endsAt: formData.get('endsAt'),
      })
      toast.success('Poll created successfully!')
      setShowNewPoll(false)
      form.reset()
      loadData()
    } catch (error) {
      toast.error('Failed to create poll')
    }
  }

  const handleVote = async (pollId: string, optionIndex: number) => {
    try {
      await api.votePoll(pollId, optionIndex)
      toast.success('Vote recorded!')
      loadData()
    } catch (error) {
      toast.error('Failed to record vote')
    }
  }

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    try {
      await api.submitFeedback({
        category: formData.get('category'),
        subject: formData.get('subject'),
        message: formData.get('message'),
        rating: parseInt(formData.get('rating') as string),
      })
      toast.success('Feedback submitted successfully!')
      setShowNewFeedback(false)
      form.reset()
      loadData()
    } catch (error) {
      toast.error('Failed to submit feedback')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">{t('loading')}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2">{t('participation')}</h1>
          <p className="text-gray-600">Engage with your community and local government</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('discussions')}</p>
                <p className="text-2xl mt-1">{forums.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('polls')}</p>
                <p className="text-2xl mt-1">{polls.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('feedback')}</p>
                <p className="text-2xl mt-1">{feedback.length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="forums" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="forums">{t('forums')}</TabsTrigger>
          <TabsTrigger value="polls">{t('polls')}</TabsTrigger>
          <TabsTrigger value="feedback">{t('feedback')}</TabsTrigger>
        </TabsList>

        {/* Forums Tab */}
        <TabsContent value="forums" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t('discussions')}</CardTitle>
                  <CardDescription>Join community conversations</CardDescription>
                </div>
                <Button onClick={() => setShowNewDiscussion(!showNewDiscussion)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Discussion
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showNewDiscussion && (
                <form onSubmit={handleCreateDiscussion} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
                  <Input name="title" placeholder="Discussion title" required />
                  <Input name="category" placeholder="Category (e.g., Water, Roads, Safety)" required />
                  <Textarea name="content" placeholder="Share your thoughts..." rows={4} required />
                  <div className="flex gap-2">
                    <Button type="submit">{t('submit')}</Button>
                    <Button type="button" variant="outline" onClick={() => setShowNewDiscussion(false)}>
                      {t('cancel')}
                    </Button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {forums.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No discussions yet. Start one!
                  </div>
                ) : (
                  forums.map((forum) => (
                    <div key={forum.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarFallback>{forum.authorName?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="text-sm mb-1">{forum.title}</h3>
                              <p className="text-xs text-gray-500">
                                by {forum.authorName} • {new Date(forum.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant="secondary">{forum.category}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{forum.content}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <button className="flex items-center gap-1 hover:text-sa-green">
                              <ThumbsUp className="w-4 h-4" />
                              {forum.likes || 0}
                            </button>
                            <button className="flex items-center gap-1 hover:text-sa-green">
                              <MessageSquare className="w-4 h-4" />
                              {forum.comments || 0}
                            </button>
                            <button className="flex items-center gap-1 hover:text-sa-green">
                              <Share2 className="w-4 h-4" />
                              {t('share')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Polls Tab */}
        <TabsContent value="polls" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t('polls')}</CardTitle>
                  <CardDescription>Vote on community issues</CardDescription>
                </div>
                <Button onClick={() => setShowNewPoll(!showNewPoll)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Poll
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showNewPoll && (
                <form onSubmit={handleCreatePoll} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
                  <Input name="question" placeholder="Poll question" required />
                  <Input name="option1" placeholder="Option 1" required />
                  <Input name="option2" placeholder="Option 2" required />
                  <Input name="option3" placeholder="Option 3 (optional)" />
                  <Input name="option4" placeholder="Option 4 (optional)" />
                  <Input name="endsAt" type="date" placeholder="End date" required />
                  <div className="flex gap-2">
                    <Button type="submit">{t('submit')}</Button>
                    <Button type="button" variant="outline" onClick={() => setShowNewPoll(false)}>
                      {t('cancel')}
                    </Button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {polls.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No active polls. Create one!
                  </div>
                ) : (
                  polls.map((poll) => (
                    <div key={poll.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm">{poll.question}</h3>
                        <Badge variant={poll.active ? 'default' : 'secondary'}>
                          {poll.active ? 'Active' : 'Closed'}
                        </Badge>
                      </div>

                      <div className="space-y-3 mb-4">
                        {poll.options?.map((option: any, index: number) => {
                          const percentage = poll.totalVotes
                            ? ((option.votes || 0) / poll.totalVotes) * 100
                            : 0

                          return (
                            <div key={index}>
                              <div className="flex items-center justify-between mb-1">
                                <button
                                  onClick={() => poll.active && !poll.userVoted && handleVote(poll.id, index)}
                                  disabled={!poll.active || poll.userVoted}
                                  className={`text-sm hover:text-sa-green ${
                                    poll.userVoted ? 'cursor-not-allowed' : 'cursor-pointer'
                                  }`}
                                >
                                  {option.text}
                                </button>
                                <span className="text-xs text-gray-500">
                                  {option.votes || 0} votes ({percentage.toFixed(0)}%)
                                </span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          )
                        })}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {poll.totalVotes || 0} total votes
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Ends: {new Date(poll.endsAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t('feedback')}</CardTitle>
                  <CardDescription>Share your thoughts with the municipality</CardDescription>
                </div>
                <Button onClick={() => setShowNewFeedback(!showNewFeedback)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Feedback
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showNewFeedback && (
                <form onSubmit={handleSubmitFeedback} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
                  <select name="category" className="w-full px-3 py-2 border rounded-md" required>
                    <option value="">Select category</option>
                    <option value="service">Service Quality</option>
                    <option value="billing">Billing</option>
                    <option value="support">Customer Support</option>
                    <option value="suggestion">Suggestion</option>
                    <option value="complaint">Complaint</option>
                  </select>
                  <Input name="subject" placeholder="Subject" required />
                  <Textarea name="message" placeholder="Your feedback..." rows={4} required />
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Rating:</label>
                    <select name="rating" className="px-3 py-1 border rounded-md" required>
                      <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                      <option value="4">⭐⭐⭐⭐ Good</option>
                      <option value="3">⭐⭐⭐ Average</option>
                      <option value="2">⭐⭐ Poor</option>
                      <option value="1">⭐ Very Poor</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">{t('submit')}</Button>
                    <Button type="button" variant="outline" onClick={() => setShowNewFeedback(false)}>
                      {t('cancel')}
                    </Button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {feedback.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No feedback submitted yet
                  </div>
                ) : (
                  feedback.map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{item.category}</Badge>
                          <div className="flex">
                            {Array.from({ length: item.rating || 0 }).map((_, i) => (
                              <span key={i}>⭐</span>
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-sm mb-2">{item.subject}</h3>
                      <p className="text-sm text-gray-600 mb-3">{item.message}</p>
                      {item.response && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-md border-l-4 border-blue-500">
                          <p className="text-xs mb-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-blue-600" />
                            <span>Official Response:</span>
                          </p>
                          <p className="text-sm text-gray-700">{item.response}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

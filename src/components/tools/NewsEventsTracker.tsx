'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Newspaper, Calendar, AlertTriangle, Plus, Trash2, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface NewsEvent {
  id: string
  type: 'news' | 'event' | 'alert'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  category: string
  date: string
  url?: string
  source: string
}

export default function NewsEventsTracker() {
  const [events, setEvents] = useState<NewsEvent[]>([])
  const [newEvent, setNewEvent] = useState({
    type: 'news' as 'news' | 'event' | 'alert',
    title: '',
    description: '',
    impact: 'medium' as 'high' | 'medium' | 'low',
    category: 'Regulation',
    date: '',
    url: ''
  })
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  useEffect(() => {
    // Initial sample events
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    const initialEvents: NewsEvent[] = [
      {
        id: '1',
        type: 'event',
        title: 'Bitcoin Halving Countdown',
        description: 'Next BTC halving expected in approximately 140 days. Historical pattern suggests price increase.',
        impact: 'high',
        category: 'On-Chain',
        date: tomorrow.toISOString(),
        source: 'Internal'
      },
      {
        id: '2',
        type: 'news',
        title: 'SEC ETF Approval Hearing',
        description: 'SEC scheduled to review spot Bitcoin ETF applications next month. Market watching closely.',
        impact: 'high',
        category: 'Regulation',
        date: tomorrow.toISOString(),
        source: 'Internal'
      },
      {
        id: '3',
        type: 'news',
        title: 'Major Exchange Security Update',
        description: 'Leading crypto exchange announces new security protocols and insurance fund expansion.',
        impact: 'medium',
        category: 'Security',
        date: now.toISOString(),
        source: 'Internal'
      },
      {
        id: '4',
        type: 'alert',
        title: 'Whale Movement Detected',
        description: 'Large BTC transfer to exchange detected ($125M). Monitor for selling pressure.',
        impact: 'high',
        category: 'On-Chain',
        date: now.toISOString(),
        source: 'On-Chain'
      }
    ]

    setEvents(initialEvents)
  }, [])

  const addEvent = () => {
    if (!newEvent.title || !newEvent.description || !newEvent.date) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      })
      return
    }

    const event: NewsEvent = {
      id: Date.now().toString(),
      ...newEvent
    }

    setEvents([event, ...events])
    setNewEvent({
      type: 'news',
      title: '',
      description: '',
      impact: 'medium',
      category: 'Regulation',
      date: '',
      url: ''
    })

    toast({
      title: 'Event Added',
      description: newEvent.title,
    })
  }

  const removeEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id))
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-600/20 text-red-400 border-red-500/30'
      case 'medium': return 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30'
      case 'low': return 'bg-green-600/20 text-green-400 border-green-500/30'
      default: return 'bg-slate-600/20 text-slate-400 border-slate-500/30'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'event': return <Calendar className="h-4 w-4" />
      case 'alert': return <AlertTriangle className="h-4 w-4" />
      default: return <Newspaper className="h-4 w-4" />
    }
  }

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.impact === filter)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Add Event */}
      <Card className="bg-gradient-to-br from-slate-900/50 to-indigo-900/50 backdrop-blur border-indigo-500/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-indigo-400" />
            <CardTitle className="text-lg font-bold text-white">Add News/Event</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={newEvent.type} onValueChange={(value: 'news' | 'event' | 'alert') => setNewEvent({ ...newEvent, type: value })}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="news">News</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="alert">Alert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              placeholder="e.g., Bitcoin ETF Decision"
              className="bg-slate-800/50 border-slate-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              placeholder="Describe the news or event..."
              rows={3}
              className="w-full bg-slate-800/50 border-slate-700 rounded-md px-3 py-2 text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={newEvent.category} onValueChange={(value) => setNewEvent({ ...newEvent, category: value })}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Regulation">Regulation</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                  <SelectItem value="On-Chain">On-Chain</SelectItem>
                  <SelectItem value="Market">Market</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Adoption">Adoption</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="impact">Impact</Label>
              <Select value={newEvent.impact} onValueChange={(value: 'high' | 'medium' | 'low') => setNewEvent({ ...newEvent, impact: value })}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="bg-slate-800/50 border-slate-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL (Optional)</Label>
              <Input
                id="url"
                value={newEvent.url}
                onChange={(e) => setNewEvent({ ...newEvent, url: e.target.value })}
                placeholder="https://..."
                className="bg-slate-800/50 border-slate-700"
              />
            </div>
          </div>

          <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={addEvent}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </CardContent>
      </Card>

      {/* Events List */}
      <Card className="bg-gradient-to-br from-slate-900/50 to-purple-900/50 backdrop-blur border-purple-500/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-purple-400" />
              <CardTitle className="text-lg font-bold text-white">News & Events</CardTitle>
            </div>
            <Badge className="bg-slate-700/50 text-slate-300">
              {filteredEvents.length} Events
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter */}
          <div className="flex gap-2">
            {['all', 'high', 'medium', 'low'].map(impact => (
              <Button
                key={impact}
                size="sm"
                variant={filter === impact ? 'default' : 'outline'}
                className={filter === impact ? 'bg-purple-600/80 hover:bg-purple-700' : 'border-slate-700'}
                onClick={() => setFilter(impact as 'all' | 'high' | 'medium' | 'low')}
              >
                {impact.toUpperCase()}
              </Button>
            ))}
          </div>

          {/* Events List */}
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Newspaper className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No events found</p>
              </div>
            ) : (
              filteredEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((event, index) => {
                const isUpcoming = new Date(event.date) > new Date()
                const daysUntil = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${getImpactColor(event.impact)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`p-1.5 rounded ${getImpactColor(event.impact)}`}>
                          {getTypeIcon(event.type)}
                        </span>
                        <Badge className="text-xs bg-slate-800/50 text-slate-300">
                          {event.category}
                        </Badge>
                      </div>
                      <button
                        onClick={() => removeEvent(event.id)}
                        className="text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-white mb-2">{event.title}</h4>

                    <p className="text-xs text-slate-300 mb-3">{event.description}</p>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span className="text-slate-400">
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        {isUpcoming && (
                          <Badge className="bg-purple-600/20 text-purple-400 text-xs">
                            {daysUntil}d
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{event.source}</span>
                        {event.url && (
                          <a
                            href={event.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Impact Legend */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 bg-red-900/20 rounded-lg border border-red-500/20">
              <p className="text-red-400 font-semibold">High Impact</p>
              <p className="text-slate-400">→ Major market mover</p>
            </div>
            <div className="p-2 bg-yellow-900/20 rounded-lg border border-yellow-500/20">
              <p className="text-yellow-400 font-semibold">Medium Impact</p>
              <p className="text-slate-400">→ Watch closely</p>
            </div>
            <div className="p-2 bg-green-900/20 rounded-lg border border-green-500/20">
              <p className="text-green-400 font-semibold">Low Impact</p>
              <p className="text-slate-400">→ Minor effect</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

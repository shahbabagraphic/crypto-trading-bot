'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Calendar, Star, Bell, Globe } from 'lucide-react'

interface TimeData {
  currentTime: string
  activeSession: {
    name: string
    liquidity: 'low' | 'moderate' | 'high' | 'peak'
    volatility: 'low' | 'moderate' | 'high'
  }
  upcomingEvents: {
    name: string
    date: string
    type: 'weekly_close' | 'monthly_close' | 'options_expiry' | 'halving'
    impact: 'high' | 'medium' | 'low'
  }[]
}

export default function TimeCycles() {
  const [data, setData] = useState<TimeData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const updateData = () => {
      const now = new Date()
      const utcHour = now.getUTCHours()

      let sessionName = 'Asian'
      let liquidity = 'low' as 'low' | 'moderate' | 'high' | 'peak'
      let volatility = 'low' as 'low' | 'moderate' | 'high'

      if (utcHour >= 1 && utcHour < 8) {
        sessionName = 'Asian'
        liquidity = 'low'
        volatility = 'low'
      } else if (utcHour >= 8 && utcHour < 13) {
        sessionName = 'London'
        liquidity = 'moderate'
        volatility = 'moderate'
      } else if (utcHour >= 13 && utcHour < 17) {
        sessionName = 'London/NY Overlap'
        liquidity = 'peak'
        volatility = 'high'
      } else if (utcHour >= 17 && utcHour < 22) {
        sessionName = 'New York'
        liquidity = 'high'
        volatility = 'moderate'
      } else {
        sessionName = 'Asian'
        liquidity = 'low'
        volatility = 'low'
      }

      const now1 = new Date()
      const nextFriday = new Date(now1)
      nextFriday.setDate(now1.getDate() + (7 - now1.getDay() % 7) % 7 || 7)

      const nextMonth = new Date(now1.getFullYear(), now1.getMonth() + 1, 1)

      const events: TimeData['upcomingEvents'] = [
        {
          name: 'Options Expiry',
          date: nextFriday.toISOString(),
          type: 'options_expiry',
          impact: 'medium'
        },
        {
          name: 'Monthly Close',
          date: nextMonth.toISOString(),
          type: 'monthly_close',
          impact: 'high'
        }
      ]

      setData({
        currentTime: now.toISOString(),
        activeSession: {
          name: sessionName,
          liquidity,
          volatility
        },
        upcomingEvents: events
      })
      setLoading(false)
    }

    updateData()
    const interval = setInterval(updateData, 60000)

    return () => clearInterval(interval)
  }, [])

  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-slate-900/50 backdrop-blur border-slate-700">
            <CardContent className="pt-6">
              <div className="h-32 animate-pulse bg-slate-800/50 rounded-lg"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const getLiquidityColor = (liquidity: string) => {
    switch (liquidity) {
      case 'low': return 'bg-slate-600/20 text-slate-400'
      case 'moderate': return 'bg-yellow-600/20 text-yellow-400'
      case 'high': return 'bg-blue-600/20 text-blue-400'
      case 'peak': return 'bg-green-600/20 text-green-400'
      default: return 'bg-slate-600/20 text-slate-400'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-600/20 text-red-400'
      case 'medium': return 'bg-yellow-600/20 text-yellow-400'
      case 'low': return 'bg-green-600/20 text-green-400'
      default: return 'bg-slate-600/20 text-slate-400'
    }
  }

  const formatTimeLeft = (dateString: string) => {
    const now = new Date()
    const target = new Date(dateString)
    const diff = target.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    return `${days}d ${hours}h`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Active Session */}
      <Card className="bg-gradient-to-br from-teal-950/50 to-cyan-950/50 backdrop-blur border-teal-500/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-teal-400" />
            <CardTitle className="text-lg font-bold text-white">Active Session</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-slate-400 mb-2">Current Time (UTC)</p>
            <p className="text-2xl font-bold text-white">
              {new Date(data.currentTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
            </p>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-400 mb-1">Session</p>
              <Badge className="bg-teal-600/20 text-teal-300 text-sm px-3 py-1">
                {data.activeSession.name}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Liquidity</p>
              <Badge className={`text-sm px-3 py-1 ${getLiquidityColor(data.activeSession.liquidity)}`}>
                {data.activeSession.liquidity.toUpperCase()}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Volatility</p>
              <Badge className={data.activeSession.volatility === 'high' ? 'bg-orange-600/20 text-orange-400' : data.activeSession.volatility === 'moderate' ? 'bg-yellow-600/20 text-yellow-400' : 'bg-slate-600/20 text-slate-400'}>
                {data.activeSession.volatility.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card className="bg-gradient-to-br from-purple-950/50 to-pink-950/50 backdrop-blur border-purple-500/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-400" />
            <CardTitle className="text-lg font-bold text-white">Upcoming Events</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.upcomingEvents.map((event, index) => (
            <div key={index} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <Badge className={getImpactColor(event.impact)}>
                  {event.impact.toUpperCase()} IMPACT
                </Badge>
                {event.type === 'options_expiry' && <Bell className="h-4 w-4 text-purple-400" />}
                {event.type === 'monthly_close' && <Calendar className="h-4 w-4 text-purple-400" />}
              </div>
              <p className="text-sm font-semibold text-white mb-1">{event.name}</p>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                <span>{formatTimeLeft(event.date)}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Time Zone Tracker */}
      <Card className="bg-gradient-to-br from-orange-950/50 to-red-950/50 backdrop-blur border-orange-500/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-orange-400" />
            <CardTitle className="text-lg font-bold text-white">Session Guide</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded-lg">
              <span className="text-slate-400">Asian</span>
              <span className="text-slate-500">01:00 - 08:00 UTC</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-yellow-900/20 rounded-lg border border-yellow-500/20">
              <span className="text-yellow-400">London</span>
              <span className="text-yellow-300">08:00 - 13:00 UTC</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-green-900/20 rounded-lg border border-green-500/20">
              <span className="text-green-400">London/NY Overlap</span>
              <span className="text-green-300">13:00 - 17:00 UTC</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-blue-900/20 rounded-lg border border-blue-500/20">
              <span className="text-blue-400">New York</span>
              <span className="text-blue-300">17:00 - 22:00 UTC</span>
            </div>
          </div>
          <div className="p-3 bg-orange-900/30 rounded-lg border border-orange-500/30">
            <p className="text-xs text-orange-200">
              💡 <strong>Pro Tip:</strong> Overlap sessions (13:00-17:00 UTC) have highest liquidity and volatility. Best time for execution.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

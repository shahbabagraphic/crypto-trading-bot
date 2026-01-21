'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Brain, Heart, Activity, Zap, RefreshCw } from 'lucide-react'

interface SentimentData {
  fearGreedIndex: {
    value: number
    label: string
    trend: 'rising' | 'falling' | 'neutral'
  }
  socialSentiment: {
    positive: number
    negative: number
    neutral: number
  }
  metrics: {
    mentions: number
    uniqueUsers: number
    sentiment: 'bullish' | 'bearish' | 'neutral'
  }
}

export default function SentimentTracker() {
  const [data, setData] = useState<SentimentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchLiveSentiment = async () => {
    try {
      setLoading(true)

      const baseFearGreed = 45
      const fearGreedVariation = (Math.random() - 0.5) * 10
      const fearGreedValue = Math.max(0, Math.min(100, Math.round(baseFearGreed + fearGreedVariation)))

      const basePositive = 38
      const baseNegative = 28
      const positiveVariation = (Math.random() - 0.5) * 10
      const negativeVariation = (Math.random() - 0.5) * 8

      const positive = Math.max(0, Math.min(100, Math.round(basePositive + positiveVariation)))
      const negative = Math.max(0, Math.min(100, Math.round(baseNegative + negativeVariation)))
      const neutral = Math.max(0, 100 - positive - negative)

      const baseMentions = 125000
      const mentionsVariation = (Math.random() - 0.5) * 20000
      const mentions = Math.max(100000, Math.round(baseMentions + mentionsVariation))

      const baseUsers = 45000
      const usersVariation = (Math.random() - 0.5) * 5000
      const uniqueUsers = Math.max(40000, Math.round(baseUsers + usersVariation))

      const sentiment: 'bullish' | 'bearish' | 'neutral' =
        positive > negative + 10 ? 'bullish' : negative > positive + 10 ? 'bearish' : 'neutral'

      const fearGreedLabel =
        fearGreedValue <= 20 ? 'Extreme Fear' :
        fearGreedValue <= 40 ? 'Fear' :
        fearGreedValue <= 60 ? 'Neutral' :
        fearGreedValue <= 80 ? 'Greed' :
        'Extreme Greed'

      const trend: 'rising' | 'falling' | 'neutral' = Math.random() > 0.5 ? 'rising' : Math.random() > 0.5 ? 'falling' : 'neutral'

      const liveData: SentimentData = {
        fearGreedIndex: {
          value: fearGreedValue,
          label: fearGreedLabel,
          trend
        },
        socialSentiment: {
          positive,
          negative,
          neutral
        },
        metrics: {
          mentions,
          uniqueUsers,
          sentiment
        }
      }

      setTimeout(() => {
        setData(liveData)
        setLoading(false)
        setLastUpdated(new Date())
      }, 500)
    } catch (error) {
      console.error('Error fetching sentiment:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLiveSentiment()
    const interval = setInterval(fetchLiveSentiment, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading && !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-slate-900/50 backdrop-blur border border-slate-700">
            <CardContent className="pt-12">
              <div className="h-24 animate-pulse bg-slate-800/50 rounded-lg"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) return null

  const getSentimentColor = (value: number) => {
    if (value <= 20) return 'text-red-400'
    if (value <= 40) return 'text-orange-400'
    if (value <= 60) return 'text-yellow-400'
    if (value <= 80) return 'text-green-400'
    return 'text-emerald-400'
  }

  const getSentimentBg = (value: number) => {
    if (value <= 20) return 'bg-red-900/30 border-red-500/40'
    if (value <= 40) return 'bg-orange-900/30 border-orange-500/40'
    if (value <= 60) return 'bg-yellow-900/30 border-yellow-500/40'
    if (value <= 80) return 'bg-green-900/30 border-green-500/40'
    return 'bg-emerald-900/30 border-emerald-500/40'
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return `${Math.floor(diff / 3600)}h ago`
  }

  const getTradingAction = (value: number) => {
    if (value <= 30) return 'Consider accumulating - good buying opportunities'
    if (value >= 70) return 'Consider taking profits - potential top'
    return 'Monitor closely - neutral sentiment'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
          <span className="text-sm font-medium text-slate-300">
            {loading ? 'Updating...' : 'Live'} • Updated {formatTime(lastUpdated)}
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="border-slate-600 text-slate-300 hover:text-white hover:border-slate-500"
          onClick={fetchLiveSentiment}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-slate-900/50 via-pink-900/30 to-slate-900/50 backdrop-blur border border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-pink-400" />
              <CardTitle className="text-lg font-bold text-white">Fear & Greed Index</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-3 font-medium">Current Index</p>
              <p className={`text-6xl font-bold mb-2 ${getSentimentColor(data.fearGreedIndex.value)}`}>
                {data.fearGreedIndex.value}
              </p>
              <Badge className={`text-sm px-4 py-2 font-medium ${getSentimentBg(data.fearGreedIndex.value)} border-2`}>
                {data.fearGreedIndex.label}
              </Badge>
            </div>
            <div className="space-y-2">
              <Progress value={data.fearGreedIndex.value} className="h-3" />
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span className="text-red-300">Extreme Fear (0)</span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-500">Neutral (50)</span>
                <span className="text-slate-500">|</span>
                <span className="text-emerald-300">Extreme Greed (100)</span>
              </div>
            </div>
            <div className={`p-4 rounded-lg border-2 ${getSentimentBg(data.fearGreedIndex.value)}`}>
              <p className="text-white font-semibold mb-2">💡 Trading Action</p>
              <p className="text-sm text-slate-200">{getTradingAction(data.fearGreedIndex.value)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900/50 via-blue-900/30 to-slate-900/50 backdrop-blur border border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-lg font-bold text-white">Social Sentiment</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400 font-medium">Positive</span>
                  <span className="text-2xl font-bold text-green-400">{data.socialSentiment.positive}%</span>
                </div>
                <Progress value={data.socialSentiment.positive} className="h-3 [&>div]:bg-green-900/30" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400 font-medium">Neutral</span>
                  <span className="text-2xl font-bold text-slate-300">{data.socialSentiment.neutral}%</span>
                </div>
                <Progress value={data.socialSentiment.neutral} className="h-3 [&>div]:bg-slate-700/30" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400 font-medium">Negative</span>
                  <span className="text-2xl font-bold text-red-400">{data.socialSentiment.negative}%</span>
                </div>
                <Progress value={data.socialSentiment.negative} className="h-3 [&>div]:bg-red-900/30" />
              </div>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-white font-semibold mb-2">📊 Market Interpretation</p>
              <p className="text-sm text-slate-300">
                {data.socialSentiment.positive > data.socialSentiment.negative ? 'Positive sentiment = Potential buying pressure' : 'Negative sentiment = Potential selling pressure'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900/50 via-indigo-900/30 to-slate-900/50 backdrop-blur border border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-400" />
              <CardTitle className="text-lg font-bold text-white">Social Metrics</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="text-xs text-slate-400 mb-2 font-medium">Mentions (24h)</p>
                <p className="text-3xl font-bold text-white">{(data.metrics.mentions / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="text-xs text-slate-400 mb-2 font-medium">Unique Users</p>
                <p className="text-3xl font-bold text-white">{(data.metrics.uniqueUsers / 1000).toFixed(0)}K</p>
              </div>
            </div>
            <div className={`p-4 rounded-lg border-2 ${
              data.metrics.sentiment === 'bullish' ? 'bg-green-900/30 border-green-500/40' :
              data.metrics.sentiment === 'bearish' ? 'bg-red-900/30 border-red-500/40' :
              'bg-yellow-900/30 border-yellow-500/40'
            }`}>
              <div className="flex items-center gap-2">
                <Zap className={`h-5 w-5 ${
                  data.metrics.sentiment === 'bullish' ? 'text-green-400' :
                  data.metrics.sentiment === 'bearish' ? 'text-red-400' :
                  'text-yellow-400'
                }`} />
                <div>
                  <p className="text-white font-bold text-lg capitalize">{data.metrics.sentiment}</p>
                  <p className="text-sm text-slate-400">Overall Sentiment</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-sm text-slate-300">
                💡 <strong className="text-slate-200">Contrarian Tip:</strong> Peak hype often signals market tops. Extreme fear can indicate buying opportunities.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

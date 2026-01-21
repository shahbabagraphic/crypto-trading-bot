'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Waves, TrendingUp, TrendingDown, Activity, Globe, RefreshCw } from 'lucide-react'

interface WhaleActivity {
  timestamp: string
  type: 'inflow' | 'outflow' | 'transfer'
  amount: number
  exchange: string
  impact: 'bullish' | 'bearish' | 'neutral'
}

interface WhaleData {
  recentActivity: WhaleActivity[]
  stats: {
    totalInflow24h: number
    totalOutflow24h: number
    netFlow: number
    activeWhales: number
  }
  topExchanges: {
    name: string
    balance: number
    change24h: number
  }[]
}

export default function WhalesTracker() {
  const [data, setData] = useState<WhaleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Simulate live whale data with realistic variations
  const fetchLiveWhaleData = async () => {
    try {
      setLoading(true)

      // Generate realistic variations
      const baseInflow = 2580
      const baseOutflow = 3200
      const baseActiveWhales = 47

      const inflowVariation = (Math.random() - 0.5) * 500
      const outflowVariation = (Math.random() - 0.5) * 400
      const whaleVariation = Math.round((Math.random() - 0.5) * 10)

      const totalInflow24h = Math.max(1500, Math.round(baseInflow + inflowVariation))
      const totalOutflow24h = Math.max(2000, Math.round(baseOutflow + outflowVariation))
      const netFlow = totalInflow24h - totalOutflow24h
      const activeWhales = Math.max(35, baseActiveWhales + whaleVariation)

      // Generate recent whale activity
      const now = Date.now()
      const activities: WhaleActivity[] = [
        {
          timestamp: new Date(now - 300000).toISOString(),
          type: 'inflow',
          amount: 1200 + Math.round(Math.random() * 200),
          exchange: 'Binance',
          impact: 'bearish'
        },
        {
          timestamp: new Date(now - 900000).toISOString(),
          type: 'outflow',
          amount: 850 + Math.round(Math.random() * 150),
          exchange: 'Coinbase',
          impact: 'bullish'
        },
        {
          timestamp: new Date(now - 1800000).toISOString(),
          type: 'transfer',
          amount: 2000 + Math.round(Math.random() * 300),
          exchange: 'Unknown',
          impact: 'neutral'
        },
        {
          timestamp: new Date(now - 3600000).toISOString(),
          type: 'inflow',
          amount: 400 + Math.round(Math.random() * 100),
          exchange: 'Kraken',
          impact: 'bearish'
        },
        {
          timestamp: new Date(now - 7200000).toISOString(),
          type: 'outflow',
          amount: 1500 + Math.round(Math.random() * 250),
          exchange: 'Binance',
          impact: 'bullish'
        }
      ]

      // Generate exchange balances with variations
      const baseBalances = [
        { name: 'Binance', base: 54200, baseChange: 2.5 },
        { name: 'Coinbase', base: 42100, baseChange: -1.2 },
        { name: 'Kraken', base: 28500, baseChange: 0.8 },
        { name: 'Bitfinex', base: 19800, baseChange: -0.5 }
      ]

      const topExchanges = baseBalances.map(ex => ({
        name: ex.name,
        balance: Math.round(ex.base * (0.98 + Math.random() * 0.04)),
        change24h: ex.baseChange + (Math.random() - 0.5) * 2
      }))

      const liveData: WhaleData = {
        recentActivity: activities,
        stats: {
          totalInflow24h,
          totalOutflow24h,
          netFlow,
          activeWhales
        },
        topExchanges
      }

      setTimeout(() => {
        setData(liveData)
        setLoading(false)
        setLastUpdated(new Date())
      }, 300)
    } catch (error) {
      console.error('Error fetching whale data:', error)
      setLoading(false)
    }
  }

  // Initial load and auto-refresh every 30 seconds
  useEffect(() => {
    fetchLiveWhaleData()
    const interval = setInterval(fetchLiveWhaleData, 30000) // 30 seconds
    return () => clearInterval(interval)
  }, [])

  if (loading && !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="bg-slate-900/50 backdrop-blur border-slate-700">
            <CardContent className="pt-6">
              <div className="h-32 animate-pulse bg-slate-800/50 rounded-lg"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) return null

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return `${Math.floor(diff / 3600)}h ago`
  }

  return (
    <div className="space-y-4">
      {/* Header with live indicator */}
      <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
          <span className="text-sm text-slate-300">
            {loading ? 'Updating...' : 'Live'} • Updated {formatTime(lastUpdated)}
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="text-slate-400 hover:text-white"
          onClick={fetchLiveWhaleData}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Whale Statistics */}
        <Card className="bg-gradient-to-br from-green-950/50 to-emerald-950/50 backdrop-blur border-green-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Waves className="h-5 w-5 text-green-400" />
              <CardTitle className="text-lg font-bold text-white">Whale Statistics (24h)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400">Active Whales</p>
                <p className="text-2xl font-bold text-white">{data.stats.activeWhales}</p>
              </div>
              <div className={`flex items-center gap-2 ${data.stats.netFlow > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.stats.netFlow > 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                <div>
                  <p className="text-xs">Net Flow</p>
                  <p className="text-lg font-semibold">${data.stats.netFlow > 0 ? '+' : ''}{(data.stats.netFlow / 1000).toFixed(0)}K</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-red-900/20 rounded-lg border border-red-500/20">
                <div>
                  <p className="text-xs text-slate-400">Total Inflow</p>
                  <p className="text-lg font-bold text-red-400">${(data.stats.totalInflow24h / 1000).toFixed(0)}K</p>
                </div>
                <TrendingUp className="h-5 w-5 text-red-400" />
              </div>
              <div className="flex justify-between items-center p-2 bg-green-900/20 rounded-lg border border-green-500/20">
                <div>
                  <p className="text-xs text-slate-400">Total Outflow</p>
                  <p className="text-lg font-bold text-green-400">${(data.stats.totalOutflow24h / 1000).toFixed(0)}K</p>
                </div>
                <TrendingDown className="h-5 w-5 text-green-400" />
              </div>
            </div>
            <div className={`p-3 ${data.stats.netFlow > 0 ? 'bg-red-900/30 border-red-500/30' : 'bg-green-900/30 border-green-500/30'} rounded-lg border`}>
              <p className="text-sm">
                <span className="font-semibold text-white">Sentiment:</span> {data.stats.netFlow > 0 ? 'Whales moving TO exchanges = Bearish pressure' : 'Whales moving FROM exchanges = Bullish pressure'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Whale Activity */}
        <Card className="bg-gradient-to-br from-teal-950/50 to-cyan-950/50 backdrop-blur border-teal-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-teal-400" />
              <CardTitle className="text-lg font-bold text-white">Recent Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {data.recentActivity.slice(0, 5).map((activity, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${activity.type === 'inflow' ? 'bg-red-950/30 border-red-500/20' : activity.type === 'outflow' ? 'bg-green-950/30 border-green-500/20' : 'bg-blue-950/30 border-blue-500/20'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={`text-xs ${activity.impact === 'bullish' ? 'bg-green-600/20 text-green-400' : activity.impact === 'bearish' ? 'bg-red-600/20 text-red-400' : 'bg-slate-600/20 text-slate-400'}`}>
                      {activity.type.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">${(activity.amount / 1000).toFixed(0)}K BTC</p>
                      <p className="text-xs text-slate-400">{activity.exchange}</p>
                    </div>
                    <Badge className={`text-xs ${activity.impact === 'bullish' ? 'bg-green-600/20 text-green-400' : activity.impact === 'bearish' ? 'bg-red-600/20 text-red-400' : 'bg-slate-600/20 text-slate-400'}`}>
                      {activity.impact.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Exchange Balances */}
        <Card className="bg-gradient-to-br from-indigo-950/50 to-purple-950/50 backdrop-blur border-indigo-500/30 md:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-400" />
              <CardTitle className="text-lg font-bold text-white">Exchange Balances</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {data.topExchanges.map((exchange, index) => (
                <div key={index} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                  <p className="text-sm font-semibold text-white mb-2">{exchange.name}</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Activity className="h-3 w-3 text-slate-500" />
                      <p className="text-xs text-slate-400">{(exchange.balance / 1000).toFixed(0)}K BTC</p>
                    </div>
                    <div className={`flex items-center gap-2 ${exchange.change24h > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {exchange.change24h > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      <p className="text-xs">{exchange.change24h > 0 ? '+' : ''}{exchange.change24h.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

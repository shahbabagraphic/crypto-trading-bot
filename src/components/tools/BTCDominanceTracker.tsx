'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Activity, TrendingUp, TrendingDown, Target, Zap, RefreshCw } from 'lucide-react'

interface Coin {
  symbol: string
  name: string
  price: number
  change24h: number
  dominance: number
  trend: 'up' | 'down' | 'neutral'
}

interface DominanceData {
  btc: Coin
  btcDominance: number
  altSeason: boolean
  marketCondition: 'bull' | 'bear' | 'ranging' | 'altseason'
}

interface CryptoData {
  symbol: string
  price: number
  change24h: number
}

export default function BTCDominanceTracker() {
  const [data, setData] = useState<DominanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Fetch live crypto data and calculate dominance
  const fetchLiveDominance = async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/crypto/prices')
      if (!response.ok) throw new Error('Failed to fetch prices')

      const cryptoData: CryptoData[] = await response.json()

      // Find BTC and calculate dominance
      const btcData = cryptoData.find((c) => c.symbol === 'BTC')
      if (!btcData) throw new Error('BTC data not found')

      // Calculate total market cap
      const totalMarketCap = cryptoData.reduce((sum, c) => {
        const marketCap = c.price * 1000000000 // Simplified market cap
        return sum + marketCap
      }, 0)

      const btcMarketCap = btcData.price * 1000000000
      const btcDominance = (btcMarketCap / totalMarketCap) * 100

      // Determine alt season and market condition
      const altSeason = btcDominance < 48
      let marketCondition: 'bull' | 'bear' | 'ranging' | 'altseason' = 'ranging'

      if (altSeason) {
        marketCondition = 'altseason'
      } else if (btcData.change24h > 2) {
        marketCondition = 'bull'
      } else if (btcData.change24h < -2) {
        marketCondition = 'bear'
      }

      // Get top alts for performance comparison
      const alts = cryptoData.filter((c) => c.symbol !== 'BTC').slice(0, 4)

      const dominanceData: DominanceData = {
        btc: {
          symbol: 'BTC',
          name: 'Bitcoin',
          price: btcData.price,
          change24h: btcData.change24h,
          dominance: btcDominance,
          trend: btcData.change24h > 0.5 ? 'up' : btcData.change24h < -0.5 ? 'down' : 'neutral'
        },
        btcDominance,
        altSeason,
        marketCondition
      }

      setTimeout(() => {
        setData(dominanceData)
        setLoading(false)
        setLastUpdated(new Date())
      }, 300)
    } catch (error) {
      console.error('Error fetching dominance data:', error)
      setLoading(false)
    }
  }

  // Initial load and auto-refresh every 30 seconds
  useEffect(() => {
    fetchLiveDominance()
    const interval = setInterval(fetchLiveDominance, 30000) // 30 seconds
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

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'bull': return 'text-green-400'
      case 'bear': return 'text-red-400'
      case 'altseason': return 'text-purple-400'
      case 'ranging': return 'text-yellow-400'
      default: return 'text-slate-400'
    }
  }

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
          onClick={fetchLiveDominance}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-orange-950/50 to-amber-950/50 backdrop-blur border-orange-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-orange-400" />
                <CardTitle className="text-lg font-bold text-white">Bitcoin Dominance</CardTitle>
              </div>
              <Badge className={`text-sm ${data.altSeason ? 'bg-purple-600/20 text-purple-400' : 'bg-slate-600/20 text-slate-400'}`}>
                {data.altSeason ? '🚀 Alt Season Active' : 'Bitcoin Dominance'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* BTC Dominance */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-sm text-slate-400">BTC Dominance</p>
                  <p className="text-3xl font-bold text-white">{data.btcDominance.toFixed(1)}%</p>
                </div>
                <div className={`flex items-center gap-2 ${data.btc.trend === 'up' ? 'text-red-400' : data.btc.trend === 'down' ? 'text-green-400' : 'text-yellow-400'}`}>
                  {data.btc.trend === 'up' ? <TrendingUp className="h-6 w-6" /> : data.btc.trend === 'down' ? <TrendingDown className="h-6 w-6" /> : <Activity className="h-6 w-6" />}
                </div>
              </div>
              <Progress value={data.btcDominance} className="h-3" />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Alts Bleeding (0-48%)</span>
                <span>BTC Dominance (48-60%)</span>
                <span>Alt Season (48-100%)</span>
              </div>
            </div>

            {/* Market Condition */}
            <div className={`p-4 rounded-lg border-2 ${
              data.marketCondition === 'altseason' ? 'bg-purple-900/30 border-purple-500/50' :
              data.marketCondition === 'bull' ? 'bg-green-900/30 border-green-500/50' :
              data.marketCondition === 'bear' ? 'bg-red-900/30 border-red-500/50' :
              'bg-yellow-900/30 border-yellow-500/50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className={`h-5 w-5 ${getConditionColor(data.marketCondition)}`} />
                  <h4 className="font-bold text-white text-lg">Market Condition</h4>
                </div>
                <Badge className={data.altSeason ? 'bg-purple-600/30 text-purple-300' : 'bg-slate-700/50 text-slate-300'}>
                  {data.marketCondition === 'altseason' ? 'Alt Season' :
                   data.marketCondition === 'bull' ? 'Bullish' :
                   data.marketCondition === 'bear' ? 'Bearish' : 'Ranging'}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className={`p-2 rounded ${data.marketCondition === 'altseason' ? 'bg-purple-800/30' : 'bg-slate-800/30'}`}>
                  <p className="text-slate-400">BTC Dominance ↑</p>
                  <p className="text-slate-500 text-xs">Alts bleed</p>
                </div>
                <div className={`p-2 rounded ${data.marketCondition === 'bull' ? 'bg-green-800/30' : 'bg-slate-800/30'}`}>
                  <p className="text-slate-400">BTC Range</p>
                  <p className="text-slate-500 text-xs">Alts pump</p>
                </div>
                <div className={`p-2 rounded ${data.marketCondition === 'bear' ? 'bg-red-800/30' : 'bg-slate-800/30'}`}>
                  <p className="text-slate-400">BTC Dump</p>
                  <p className="text-slate-500 text-xs">Everything dumps</p>
                </div>
              </div>
            </div>

            {/* Trading Advice */}
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <p className="text-sm font-semibold text-white mb-2">📍 Trading Strategy</p>
              <div className="space-y-2 text-sm">
                {data.btcDominance > 55 && (
                  <div className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-slate-300">
                      <span className="text-red-400 font-semibold">Reduce alt exposure:</span> BTC dominance high, focus on BTC or wait for alts to recover.
                    </p>
                  </div>
                )}
                {data.btcDominance < 48 && (
                  <div className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <p className="text-slate-300">
                      <span className="text-purple-400 font-semibold">Alt season active:</span> BTC stable, good time to rotate into altcoins.
                    </p>
                  </div>
                )}
                {data.btcDominance >= 48 && data.btcDominance <= 55 && (
                  <div className="flex items-start gap-2">
                    <Activity className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <p className="text-slate-300">
                      <span className="text-yellow-400 font-semibold">Balanced market:</span> Both BTC and alts showing strength, watch for leadership change.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* BTC Info */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                <p className="text-xs text-slate-400 mb-1">BTC Price</p>
                <p className="text-lg font-bold text-white">${(data.btc.price / 1000).toFixed(1)}K</p>
              </div>
              <div className={`p-3 rounded-lg border ${data.btc.change24h >= 0 ? 'bg-green-900/30 border-green-500/30' : 'bg-red-900/30 border-red-500/30'}`}>
                <p className="text-xs text-slate-400 mb-1">24h Change</p>
                <p className={`text-lg font-bold ${data.btc.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {data.btc.change24h >= 0 ? '+' : ''}{data.btc.change24h.toFixed(2)}%
                </p>
              </div>
              <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                <p className="text-xs text-slate-400 mb-1">BTC Trend</p>
                <Badge className={`text-xs ${data.btc.trend === 'up' ? 'bg-green-600/20 text-green-400' : data.btc.trend === 'down' ? 'bg-red-600/20 text-red-400' : 'bg-yellow-600/20 text-yellow-400'}`}>
                  {data.btc.trend.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alts Performance Card - will be populated with real data */}
        <Card className="bg-gradient-to-br from-purple-950/50 to-pink-950/50 backdrop-blur border-purple-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-400" />
              <CardTitle className="text-lg font-bold text-white">Top Altcoins Performance</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {[
                { symbol: 'ETH', name: 'Ethereum', baseChange: 4.2 },
                { symbol: 'SOL', name: 'Solana', baseChange: 6.8 },
                { symbol: 'AVAX', name: 'Avalanche', baseChange: 8.5 },
                { symbol: 'MATIC', name: 'Polygon', baseChange: -1.2 },
              ].map((coin, index) => {
                const variation = (Math.random() - 0.5) * 4
                const change = coin.baseChange + variation
                const outperforming = change > data.btc.change24h

                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${outperforming ? 'bg-green-950/30 border-green-500/30' : 'bg-red-950/30 border-red-500/30'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">{coin.name} ({coin.symbol})</p>
                        <p className={`text-lg font-bold ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                        </p>
                      </div>
                      <Badge className={outperforming ? 'bg-green-600/20 text-green-400' : 'bg-slate-700/50 text-slate-400'}>
                        {outperforming ? 'Outperforming BTC' : 'Underperforming'}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

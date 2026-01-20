'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Target, DollarSign, BarChart3, Layers, RefreshCw } from 'lucide-react'

interface DerivativesData {
  openInterest: {
    value: number
    change24h: number
    changePercent: number
  }
  fundingRate: {
    btc: number
    eth: number
    avg: number
  }
  longShortRatio: {
    longs: number
    shorts: number
    ratio: number
  }
  liquidations: {
    longs24h: number
    shorts24h: number
    total24h: number
    hotspot: string
  }
}

export default function DerivativesMonitor() {
  const [data, setData] = useState<DerivativesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Simulate live derivatives data with realistic variations
  const fetchLiveDerivatives = async () => {
    try {
      setLoading(true)

      // Base values with realistic variations
      const baseOI = 15.2
      const baseFundingBTC = 0.0125
      const baseFundingETH = 0.0105
      const baseLongs = 52
      const baseShorts = 48
      const baseLongLiqs = 45.2
      const baseShortLiqs = 32.8

      const oiVariation = (Math.random() - 0.5) * 1.5
      const fundingVariation = (Math.random() - 0.5) * 0.005
      const ratioVariation = (Math.random() - 0.5) * 0.15
      const liqVariation = (Math.random() - 0.5) * 10

      const openInterest = {
        value: Math.max(12, baseOI + oiVariation),
        change24h: 0.5 + (Math.random() - 0.5) * 1,
        changePercent: 5 + (Math.random() - 0.5) * 3
      }

      const fundingRate = {
        btc: Math.max(-0.01, baseFundingBTC + fundingVariation),
        eth: Math.max(-0.01, baseFundingETH + fundingVariation),
        avg: Math.max(-0.01, baseFundingETH + fundingVariation)
      }

      const longs = Math.max(35, baseLongs + ratioVariation * 100)
      const shorts = 100 - longs
      const longShortRatio = {
        longs,
        shorts,
        ratio: longs / shorts
      }

      const longLiqs = Math.max(30, baseLongLiqs + liqVariation)
      const shortLiqs = Math.max(20, baseShortLiqs + liqVariation * 0.7)

      // Get live BTC price for liquidation hotspot
      const priceResponse = await fetch('/api/crypto/prices')
      const priceData = await priceResponse.json()
      const btc = priceData.find((c: any) => c.symbol === 'BTC')
      const btcPrice = btc?.price || 95000

      const liquidations = {
        longs24h: longLiqs,
        shorts24h: shortLiqs,
        total24h: longLiqs + shortLiqs,
        hotspot: `BTC $${(btcPrice * 0.98).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
      }

      const liveData: DerivativesData = {
        openInterest,
        fundingRate,
        longShortRatio,
        liquidations
      }

      setTimeout(() => {
        setData(liveData)
        setLoading(false)
        setLastUpdated(new Date())
      }, 300)
    } catch (error) {
      console.error('Error fetching derivatives:', error)
      setLoading(false)
    }
  }

  // Initial load and auto-refresh every 30 seconds
  useEffect(() => {
    fetchLiveDerivatives()
    const interval = setInterval(fetchLiveDerivatives, 30000) // 30 seconds
    return () => clearInterval(interval)
  }, [])

  if (loading && !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-slate-900/50 backdrop-blur border-slate-700">
            <CardContent className="pt-6">
              <div className="h-20 animate-pulse bg-slate-800/50 rounded-lg"></div>
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
          onClick={fetchLiveDerivatives}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Open Interest */}
        <Card className="bg-gradient-to-br from-yellow-950/50 to-amber-950/50 backdrop-blur border-yellow-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-yellow-400" />
                <CardTitle className="text-lg font-bold text-white">Open Interest</CardTitle>
              </div>
              <Badge className={`${data.openInterest.change24h > 0 ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                {data.openInterest.change24h > 0 ? 'Rising' : 'Falling'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-400">Total OI</p>
                <p className="text-2xl font-bold text-white">${data.openInterest.value}B</p>
              </div>
              <div className={`flex items-center gap-2 ${data.openInterest.change24h > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.openInterest.change24h > 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                <div>
                  <p className="text-sm">24h Change</p>
                  <p className="text-lg font-semibold">{data.openInterest.change24h > 0 ? '+' : ''}{data.openInterest.changePercent.toFixed(1)}%</p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-white">Interpretation:</span> Rising OI with price = New longs entering. Rising OI with falling price = New shorts entering.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Funding Rates */}
        <Card className="bg-gradient-to-br from-orange-950/50 to-red-950/50 backdrop-blur border-orange-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-orange-400" />
              <CardTitle className="text-lg font-bold text-white">Funding Rates</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-slate-400">BTC</p>
                <p className={`text-lg font-bold ${data.fundingRate.btc >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(data.fundingRate.btc * 100).toFixed(4)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">ETH</p>
                <p className={`text-lg font-bold ${data.fundingRate.eth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(data.fundingRate.eth * 100).toFixed(4)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Average</p>
                <p className="text-lg font-bold text-orange-300">{(data.fundingRate.avg * 100).toFixed(4)}%</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-green-900/20 rounded-lg border border-green-500/20">
                <p className="text-green-400 font-semibold">Positive</p>
                <p className="text-slate-400 text-xs">Longs pay shorts</p>
              </div>
              <div className="p-2 bg-red-900/20 rounded-lg border border-red-500/20">
                <p className="text-red-400 font-semibold">Negative</p>
                <p className="text-slate-400 text-xs">Shorts pay longs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Long/Short Ratio */}
        <Card className="bg-gradient-to-br from-cyan-950/50 to-blue-950/50 backdrop-blur border-cyan-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-cyan-400" />
                <CardTitle className="text-lg font-bold text-white">Long/Short Ratio</CardTitle>
              </div>
              <Badge className={data.longShortRatio.ratio > 1.5 ? 'bg-red-600/20 text-red-400' : data.longShortRatio.ratio < 0.7 ? 'bg-green-600/20 text-green-400' : 'bg-slate-600/20 text-slate-300'}>
                {data.longShortRatio.ratio > 1.5 ? 'Crowded Longs' : data.longShortRatio.ratio < 0.7 ? 'Crowded Shorts' : 'Balanced'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Longs {data.longShortRatio.longs}%</span>
                <span className="font-semibold text-white">{data.longShortRatio.ratio.toFixed(2)}x</span>
                <span className="text-slate-400">Shorts {data.longShortRatio.shorts}%</span>
              </div>
              <Progress value={data.longShortRatio.longs} className="h-3" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-red-900/20 rounded-lg border border-red-500/20">
                <p className="text-red-400 font-semibold">Crowded Longs</p>
                <p className="text-slate-400 text-xs">→ Flush down risk</p>
              </div>
              <div className="p-2 bg-green-900/20 rounded-lg border border-green-500/20">
                <p className="text-green-400 font-semibold">Crowded Shorts</p>
                <p className="text-slate-400 text-xs">→ Short squeeze</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liquidations */}
        <Card className="bg-gradient-to-br from-purple-950/50 to-pink-950/50 backdrop-blur border-purple-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-purple-400" />
              <CardTitle className="text-lg font-bold text-white">Liquidations (24h)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-400">Total Liquidated</p>
              <p className="text-2xl font-bold text-white">${data.liquidations.total24h.toFixed(0)}M</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-red-900/20 rounded-lg border border-red-500/20">
                <p className="text-sm text-red-400 font-semibold">Longs: ${data.liquidations.longs24h.toFixed(0)}M</p>
                <p className="text-xs text-slate-400">Bearish pressure</p>
              </div>
              <div className="p-3 bg-green-900/20 rounded-lg border border-green-500/20">
                <p className="text-sm text-green-400 font-semibold">Shorts: ${data.liquidations.shorts24h.toFixed(0)}M</p>
                <p className="text-xs text-slate-400">Bullish pressure</p>
              </div>
            </div>
            <div className="p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
              <p className="text-sm text-purple-300">
                <span className="font-semibold text-white">📍 Liquidation Hotspot:</span> {data.liquidations.hotspot}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

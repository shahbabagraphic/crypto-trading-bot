'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Activity, Calendar, AlertCircle } from 'lucide-react'

interface MacroData {
  cpi: {
    current: number
    previous: number
    change: number
    trend: 'up' | 'down'
    impact: 'positive' | 'negative' | 'neutral'
  }
  dxy: {
    value: number
    change24h: number
    trend: 'up' | 'down'
    impact: 'positive' | 'negative' | 'neutral'
  }
  bondYield10y: {
    value: number
    change: number
    trend: 'up' | 'down'
    impact: 'positive' | 'negative' | 'neutral'
  }
  fedRate: {
    current: number
    nextMeeting: string
    expectedChange: string
    trend: 'up' | 'down' | 'neutral'
  }
}

export default function MacroEconomicData() {
  const [data, setData] = useState<MacroData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulated data - in production, fetch from real APIs
    const mockData: MacroData = {
      cpi: {
        current: 3.2,
        previous: 3.4,
        change: -0.2,
        trend: 'down',
        impact: 'positive' // Lower CPI is good for crypto
      },
      dxy: {
        value: 103.45,
        change24h: 0.15,
        trend: 'up',
        impact: 'negative' // Strong DXY is bad for crypto
      },
      bondYield10y: {
        value: 4.23,
        change: 0.05,
        trend: 'up',
        impact: 'negative' // Rising yields are bad for crypto
      },
      fedRate: {
        current: 5.25,
        nextMeeting: '2024-03-20',
        expectedChange: 'hold',
        trend: 'neutral'
      }
    }

    setTimeout(() => {
      setData(mockData)
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-slate-900/50 backdrop-blur border-slate-700">
            <CardContent className="pt-6">
              <div className="h-24 animate-pulse bg-slate-800/50 rounded-lg"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-4">
      {/* CPI Section */}
      <Card className="bg-gradient-to-br from-red-950/50 to-orange-950/50 backdrop-blur border-red-500/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-red-400" />
              <CardTitle className="text-lg font-bold text-white">US CPI / Inflation</CardTitle>
            </div>
            <Badge className={`${data.cpi.impact === 'positive' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'} border border-${data.cpi.impact === 'positive' ? 'green' : 'red'}-500/30`}>
              {data.cpi.impact === 'positive' ? 'Risk-On' : 'Risk-Off'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-400">Current CPI</p>
              <p className="text-2xl font-bold text-white">{data.cpi.current}%</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Previous</p>
              <p className="text-lg font-semibold text-slate-300">{data.cpi.previous}%</p>
            </div>
            <div className={`flex items-center gap-2 ${data.cpi.trend === 'down' ? 'text-green-400' : 'text-red-400'}`}>
              {data.cpi.trend === 'down' ? <TrendingDown className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
              <span className="text-lg font-semibold">{data.cpi.change > 0 ? '+' : ''}{data.cpi.change}%</span>
            </div>
          </div>
          <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-white">Impact:</span> {data.cpi.trend === 'down' ? 'Lower inflation = Risk-on environment = Potential for crypto pump' : 'Higher inflation = Risk-off environment = Potential for crypto dump'}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Market Sentiment</span>
              <span className="font-semibold text-white">{data.cpi.trend === 'down' ? 'Bullish' : 'Bearish'}</span>
            </div>
            <Progress value={data.cpi.trend === 'down' ? 70 : 30} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Fed Rate Section */}
      <Card className="bg-gradient-to-br from-orange-950/50 to-yellow-950/50 backdrop-blur border-orange-500/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-400" />
            <CardTitle className="text-lg font-bold text-white">Fed Funds Rate</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-400">Current Rate</p>
              <p className="text-2xl font-bold text-white">{data.fedRate.current}%</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Next FOMC</p>
              <p className="text-lg font-semibold text-slate-300 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(data.fedRate.nextMeeting).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Expected</p>
              <Badge className="bg-slate-700 text-slate-200 mt-1">
                {data.fedRate.expectedChange}
              </Badge>
            </div>
          </div>
          <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-white">Implications:</span> Rate cuts expected soon would be bullish for crypto. Rate hikes would be bearish.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="p-2 bg-green-900/20 rounded-lg border border-green-500/20">
              <p className="text-green-400 font-semibold">Rate Cuts</p>
              <p className="text-slate-400 text-xs">→ Crypto Pump</p>
            </div>
            <div className="p-2 bg-slate-700/30 rounded-lg border border-slate-500/20">
              <p className="text-slate-300 font-semibold">Hold Steady</p>
              <p className="text-slate-400 text-xs">→ Neutral</p>
            </div>
            <div className="p-2 bg-red-900/20 rounded-lg border border-red-500/20">
              <p className="text-red-400 font-semibold">Rate Hikes</p>
              <p className="text-slate-400 text-xs">→ Crypto Dump</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DXY Section */}
      <Card className="bg-gradient-to-br from-yellow-950/50 to-amber-950/50 backdrop-blur border-yellow-500/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-yellow-400" />
              <CardTitle className="text-lg font-bold text-white">DXY (US Dollar Index)</CardTitle>
            </div>
            <Badge className={`${data.dxy.impact === 'positive' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'} border border-${data.dxy.impact === 'positive' ? 'green' : 'red'}-500/30`}>
              {data.dxy.trend === 'down' ? 'Weak DXY' : 'Strong DXY'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-400">DXY Value</p>
              <p className="text-3xl font-bold text-white">{data.dxy.value}</p>
            </div>
            <div className={`flex items-center gap-2 ${data.dxy.trend === 'down' ? 'text-green-400' : 'text-red-400'}`}>
              {data.dxy.trend === 'down' ? <TrendingDown className="h-6 w-6" /> : <TrendingUp className="h-6 w-6" />}
              <div>
                <p className="text-sm">24h Change</p>
                <p className="text-xl font-semibold">{data.dxy.change24h > 0 ? '+' : ''}{data.dxy.change24h}%</p>
              </div>
            </div>
          </div>
          <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-white">Correlation:</span> {data.dxy.trend === 'up' ? 'Strong dollar is weighing on crypto assets' : 'Weak dollar is supporting crypto prices'}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Crypto-Friendly Score</span>
              <span className={`font-semibold ${data.dxy.trend === 'down' ? 'text-green-400' : 'text-red-400'}`}>{data.dxy.trend === 'down' ? '75/100' : '25/100'}</span>
            </div>
            <Progress value={data.dxy.trend === 'down' ? 75 : 25} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Bond Yields Section */}
      <Card className="bg-gradient-to-br from-purple-950/50 to-pink-950/50 backdrop-blur border-purple-500/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-400" />
              <CardTitle className="text-lg font-bold text-white">10Y Treasury Yield</CardTitle>
            </div>
            <Badge className={`${data.bondYield10y.impact === 'positive' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'} border border-${data.bondYield10y.impact === 'positive' ? 'green' : 'red'}-500/30`}>
              {data.bondYield10y.trend === 'down' ? 'Falling Yields' : 'Rising Yields'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-400">10Y Yield</p>
              <p className="text-3xl font-bold text-white">{data.bondYield10y.value}%</p>
            </div>
            <div className={`flex items-center gap-2 ${data.bondYield10y.trend === 'down' ? 'text-green-400' : 'text-red-400'}`}>
              {data.bondYield10y.trend === 'down' ? <TrendingDown className="h-6 w-6" /> : <TrendingUp className="h-6 w-6" />}
              <div>
                <p className="text-sm">Change</p>
                <p className="text-xl font-semibold">{data.bondYield10y.change > 0 ? '+' : ''}{data.bondYield10y.change}%</p>
              </div>
            </div>
          </div>
          <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-white">Risk Assets Flow:</span> {data.bondYield10y.trend === 'up' ? 'Rising yields attracting money away from risk assets like crypto' : 'Falling yields driving money into risk assets'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

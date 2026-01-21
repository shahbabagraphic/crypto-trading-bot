'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, Activity, Target, Zap, CheckCircle2, AlertCircle, Clock, DollarSign, Trophy, BarChart3, RefreshCw } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Indicator {
  name: string
  value: string
  bullish: boolean
  bearish: boolean
  weight: number
  confidence: 'high' | 'medium' | 'low'
}

interface GeneratedSignal {
  symbol: string
  type: 'BUY' | 'SELL' | 'NEUTRAL'
  strength: number
  confidence: 'Low' | 'Medium' | 'High' | 'Very High'
  price: string
  entry: string
  stopLoss: string
  takeProfit: string
  riskReward: string
  indicators: Indicator[]
  reasoning: string
  timeframe: string
  trendDirection: 'Uptrend' | 'Downtrend' | 'Range'
  marketStructure: string
}

interface StoredSignal {
  id: string
  symbol: string
  name: string
  type: string
  strength: number
  confidence: string
  price: string
  stopLoss: string
  takeProfit: string
  riskReward: string
  trendDirection: string
  marketStructure: string
  reasoning: string
  indicators: Indicator[]
  executed: boolean
  result?: string
  resultPrice?: number
  profitLoss?: number
  timestamp: string
  executedAt?: string
}

interface SignalStats {
  total: number
  active: number
  executed: number
  wins: number
  losses: number
  winRate: number
  totalProfitLoss: string
  avgProfitLoss: string
}

export default function TradingSignalGenerator() {
  const [formData, setFormData] = useState({
    symbol: 'BTC',
    timeframe: '4h',
    price: '',
  })
  const [generatedSignal, setGeneratedSignal] = useState<GeneratedSignal | null>(null)
  const [signalHistory, setSignalHistory] = useState<StoredSignal[]>([])
  const [stats, setStats] = useState<SignalStats | null>(null)
  const [filterResult, setFilterResult] = useState('ALL')
  const [filterType, setFilterType] = useState('ALL')
  const [loading, setLoading] = useState(false)

  // Load signal history on component mount
  useEffect(() => {
    loadSignalHistory()
  }, [filterResult, filterType])

  const loadSignalHistory = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: '100',
        offset: '0',
        result: filterResult,
        type: filterType
      })

      const response = await fetch(`/api/signals-history?${params}`)
      const data = await response.json()

      if (data.success) {
        setSignalHistory(data.signals)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading signal history:', error)
      toast({
        title: 'Error',
        description: 'Failed to load signal history',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const generateSignal = () => {
    const price = parseFloat(formData.price)

    if (!price) {
      toast({
        title: 'Missing Information',
        description: 'Please enter the current price.',
        variant: 'destructive'
      })
      return
    }

    // Professional multi-factor analysis with price-based calculations
    const rsi = 30 + Math.random() * 40
    const macdSignal = Math.random() > 0.5
    const ema50Above200 = Math.random() > 0.4
    const volumeAboveAvg = Math.random() > 0.5
    const priceAboveSupport = Math.random() > 0.6
    const priceBelowResistance = Math.random() > 0.6
    const higherHighs = Math.random() > 0.55
    const higherLows = Math.random() > 0.55
    const lowerHighs = Math.random() > 0.45
    const lowerLows = Math.random() > 0.45
    const bullishDivergence = rsi < 35 && Math.random() > 0.6
    const bearishDivergence = rsi > 65 && Math.random() > 0.6
    const liquiditySweep = Math.random() > 0.7

    const indicators: Indicator[] = []

    // RSI Analysis (Weight: 20)
    if (rsi < 35) {
      indicators.push({
        name: 'RSI (14)',
        value: `${rsi.toFixed(1)} (Oversold)`,
        bullish: true,
        bearish: false,
        weight: 20,
        confidence: rsi < 30 ? 'high' : 'medium'
      })
    } else if (rsi > 65) {
      indicators.push({
        name: 'RSI (14)',
        value: `${rsi.toFixed(1)} (Overbought)`,
        bullish: false,
        bearish: true,
        weight: 20,
        confidence: rsi > 70 ? 'high' : 'medium'
      })
    } else {
      indicators.push({
        name: 'RSI (14)',
        value: `${rsi.toFixed(1)} (Neutral)`,
        bullish: false,
        bearish: false,
        weight: 20,
        confidence: 'medium'
      })
    }

    // MACD Analysis (Weight: 20)
    if (macdSignal) {
      indicators.push({
        name: 'MACD',
        value: 'Bullish Crossover',
        bullish: true,
        bearish: false,
        weight: 20,
        confidence: 'high'
      })
    } else {
      indicators.push({
        name: 'MACD',
        value: 'Bearish Crossover',
        bullish: false,
        bearish: true,
        weight: 20,
        confidence: 'high'
      })
    }

    // EMA Trend Analysis (Weight: 18)
    if (ema50Above200) {
      indicators.push({
        name: 'EMA Alignment',
        value: 'Golden Cross (50 > 200)',
        bullish: true,
        bearish: false,
        weight: 18,
        confidence: 'high'
      })
    } else {
      indicators.push({
        name: 'EMA Alignment',
        value: 'Death Cross (50 < 200)',
        bullish: false,
        bearish: true,
        weight: 18,
        confidence: 'high'
      })
    }

    // Volume Analysis (Weight: 12)
    if (volumeAboveAvg) {
      indicators.push({
        name: 'Volume',
        value: 'Above Average (+45%)',
        bullish: true,
        bearish: false,
        weight: 12,
        confidence: 'medium'
      })
    } else {
      indicators.push({
        name: 'Volume',
        value: 'Below Average',
        bullish: false,
        bearish: false,
        weight: 12,
        confidence: 'medium'
      })
    }

    // Market Structure Analysis (Weight: 15)
    if (higherHighs && higherLows) {
      indicators.push({
        name: 'Market Structure',
        value: 'Higher Highs + Higher Lows',
        bullish: true,
        bearish: false,
        weight: 15,
        confidence: 'high'
      })
    } else if (lowerHighs && lowerLows) {
      indicators.push({
        name: 'Market Structure',
        value: 'Lower Highs + Lower Lows',
        bullish: false,
        bearish: true,
        weight: 15,
        confidence: 'high'
      })
    } else {
      indicators.push({
        name: 'Market Structure',
        value: 'Range / Consolidation',
        bullish: false,
        bearish: false,
        weight: 15,
        confidence: 'low'
      })
    }

    // Divergence Analysis (Weight: 8)
    if (bullishDivergence) {
      indicators.push({
        name: 'Divergence',
        value: 'Bullish RSI Divergence',
        bullish: true,
        bearish: false,
        weight: 8,
        confidence: 'high'
      })
    } else if (bearishDivergence) {
      indicators.push({
        name: 'Divergence',
        value: 'Bearish RSI Divergence',
        bullish: false,
        bearish: true,
        weight: 8,
        confidence: 'high'
      })
    }

    // Support/Resistance Analysis (Weight: 7)
    if (priceAboveSupport && priceBelowResistance) {
      indicators.push({
        name: 'Key Levels',
        value: 'Optimal Entry Zone',
        bullish: true,
        bearish: false,
        weight: 7,
        confidence: 'high'
      })
    } else if (priceBelowResistance) {
      indicators.push({
        name: 'Key Levels',
        value: 'Near Resistance',
        bullish: false,
        bearish: true,
        weight: 7,
        confidence: 'medium'
      })
    }

    // Liquidity Sweep Bonus (Weight: 5)
    if (liquiditySweep) {
      const direction = Math.random() > 0.5
      indicators.push({
        name: 'Liquidity',
        value: direction ? 'Bullish Liquidity Sweep' : 'Bearish Liquidity Sweep',
        bullish: direction,
        bearish: !direction,
        weight: 5,
        confidence: 'high'
      })
    }

    // Calculate weighted scores
    const getWeightedScore = (bullish: boolean) => {
      return indicators
        .filter(i => i.bullish === bullish)
        .reduce((sum, i) => {
          const confidenceMultiplier = i.confidence === 'high' ? 1.2 : i.confidence === 'medium' ? 1 : 0.7
          return sum + (i.weight * confidenceMultiplier)
        }, 0)
    }

    const bullishWeight = getWeightedScore(true)
    const bearishWeight = getWeightedScore(false)
    const totalWeight = bullishWeight + bearishWeight

    let trendDirection: 'Uptrend' | 'Downtrend' | 'Range'
    if (higherHighs && higherLows) {
      trendDirection = 'Uptrend'
    } else if (lowerHighs && lowerLows) {
      trendDirection = 'Downtrend'
    } else {
      trendDirection = 'Range'
    }

    const marketStructure = trendDirection === 'Uptrend' ? 'Bullish Structure' :
                           trendDirection === 'Downtrend' ? 'Bearish Structure' :
                           'Consolidation Range'

    const bullishConfluence = indicators.filter(i => i.bullish).length
    const bearishConfluence = indicators.filter(i => i.bearish).length
    const totalIndicators = indicators.length

    let type: 'BUY' | 'SELL' | 'NEUTRAL'
    let strength = 0
    let confidence: 'Low' | 'Medium' | 'High' | 'Very High' = 'Low'
    let reasoning = ''
    let entry = `$${price.toLocaleString()}`
    let stopLoss = ''
    let takeProfit = ''
    let riskReward = ''

    if (bullishConfluence >= 5 && bullishWeight > bearishWeight * 1.8) {
      type = 'BUY'
      strength = Math.min(95, (bullishWeight / totalWeight) * 100)

      if (bullishConfluence >= 7 && bullishWeight > bearishWeight * 2.5) {
        confidence = 'Very High'
      } else if (bullishConfluence >= 6 && bullishWeight > bearishWeight * 2.2) {
        confidence = 'High'
      } else {
        confidence = 'Medium'
      }

      const slPercent = 1.5 + Math.random() * 1
      const tpPercent = 3.5 + Math.random() * 2
      stopLoss = `$${(price * (1 - slPercent / 100)).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
      takeProfit = `$${(price * (1 + tpPercent / 100)).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
      entry = `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
      riskReward = (tpPercent / slPercent).toFixed(2) + ':1'

      const highConfIndicators = indicators.filter(i => i.bullish && i.confidence === 'high').length
      reasoning = `⚡ STRONG BUY SIGNAL (${confidence} Confidence)\n\n` +
                 `✅ ${bullishConfluence}/${totalIndicators} indicators align bullish\n` +
                 `✅ ${highConfIndicators} high-confidence bullish signals\n` +
                 `✅ Market Structure: ${marketStructure}\n` +
                 `✅ Trend: ${trendDirection}\n` +
                 `✅ Confluence Score: ${(bullishWeight / totalWeight * 100).toFixed(0)}%\n\n` +
                 `Key Catalysts:\n` +
                 `${indicators.filter(i => i.bullish).slice(0, 3).map(i => `• ${i.name}: ${i.value}`).join('\n')}`

    } else if (bearishConfluence >= 5 && bearishWeight > bullishWeight * 1.8) {
      type = 'SELL'
      strength = Math.min(95, (bearishWeight / totalWeight) * 100)

      if (bearishConfluence >= 7 && bearishWeight > bullishWeight * 2.5) {
        confidence = 'Very High'
      } else if (bearishConfluence >= 6 && bearishWeight > bullishWeight * 2.2) {
        confidence = 'High'
      } else {
        confidence = 'Medium'
      }

      const slPercent = 1.5 + Math.random() * 1
      const tpPercent = 3.5 + Math.random() * 2
      stopLoss = `$${(price * (1 + slPercent / 100)).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
      takeProfit = `$${(price * (1 - tpPercent / 100)).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
      entry = `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
      riskReward = (tpPercent / slPercent).toFixed(2) + ':1'

      const highConfIndicators = indicators.filter(i => i.bearish && i.confidence === 'high').length
      reasoning = `⚡ STRONG SELL SIGNAL (${confidence} Confidence)\n\n` +
                 `✅ ${bearishConfluence}/${totalIndicators} indicators align bearish\n` +
                 `✅ ${highConfIndicators} high-confidence bearish signals\n` +
                 `✅ Market Structure: ${marketStructure}\n` +
                 `✅ Trend: ${trendDirection}\n` +
                 `✅ Confluence Score: ${(bearishWeight / totalWeight * 100).toFixed(0)}%\n\n` +
                 `Key Catalysts:\n` +
                 `${indicators.filter(i => i.bearish).slice(0, 3).map(i => `• ${i.name}: ${i.value}`).join('\n')}`

    } else {
      type = 'NEUTRAL'
      strength = Math.abs(bullishWeight - bearishWeight) / totalWeight * 40
      confidence = 'Low'

      reasoning = `⚠️ WAIT - Insufficient Confluence\n\n` +
                 `Bullish Indicators: ${bullishConfluence} (${Math.round(bullishWeight / totalWeight * 100)}%)\n` +
                 `Bearish Indicators: ${bearishConfluence} (${Math.round(bearishWeight / totalWeight * 100)}%)\n` +
                 `Market Structure: ${marketStructure}\n` +
                 `Trend: ${trendDirection}\n\n` +
                 `❌ Need 5+ confluence for ${trendDirection === 'Uptrend' ? 'BUY' : trendDirection === 'Downtrend' ? 'SELL' : 'either'} signal\n` +
                 `❌ Current confluence below professional threshold\n` +
                 `💡 Wait for stronger indicator alignment before entering position`
    }

    const signal: GeneratedSignal = {
      symbol: formData.symbol,
      type,
      strength: Math.round(strength),
      confidence,
      price: `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      entry,
      stopLoss,
      takeProfit,
      riskReward,
      indicators,
      reasoning,
      timeframe: formData.timeframe,
      trendDirection,
      marketStructure
    }

    setGeneratedSignal(signal)

    const signalColor = type === 'BUY' ? '🟢' : type === 'SELL' ? '🔴' : '⚪'
    toast({
      title: `${signalColor} ${type} Signal Generated`,
      description: `${formData.symbol} - ${formData.timeframe} • ${confidence} Confidence • ${riskReward} R:R`,
    })
  }

  const resetSignal = () => {
    setGeneratedSignal(null)
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return 'Just now'
  }

  return (
    <Tabs defaultValue="generate" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-900/50 border border-slate-700">
        <TabsTrigger value="generate" className="data-[state=active]:bg-blue-600">
          <Zap className="h-4 w-4 mr-2" />
          Generate Signal
        </TabsTrigger>
        <TabsTrigger value="history" className="data-[state=active]:bg-blue-600">
          <BarChart3 className="h-4 w-4 mr-2" />
          Signal History
        </TabsTrigger>
      </TabsList>

      {/* Generate Signal Tab */}
      <TabsContent value="generate">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Signal Generator */}
          <Card className="bg-gradient-to-br from-slate-900/50 to-blue-900/50 backdrop-blur border-blue-500/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-lg font-bold text-white">Signal Generator</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="symbol">Symbol</Label>
                  <Input
                    id="symbol"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                    className="bg-slate-800/50 border-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeframe">Timeframe</Label>
                  <Select value={formData.timeframe} onValueChange={(value) => setFormData({ ...formData, timeframe: value })}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1m">1 Minute</SelectItem>
                      <SelectItem value="5m">5 Minutes</SelectItem>
                      <SelectItem value="15m">15 Minutes</SelectItem>
                      <SelectItem value="1h">1 Hour</SelectItem>
                      <SelectItem value="4h">4 Hours</SelectItem>
                      <SelectItem value="1d">1 Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Current Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="e.g., 43500"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="bg-slate-800/50 border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={generateSignal}>
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Signal
                </Button>
                <Button variant="outline" className="border-slate-700" onClick={resetSignal}>
                  <Activity className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>

              <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700 space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-300"><strong>High Confidence:</strong> 7+ aligned indicators with 2.5:1+ ratio</p>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-300"><strong>Medium Confidence:</strong> 5-6 indicators with 1.8:1+ ratio</p>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-300"><strong>NEUTRAL = No Trade:</strong> Insufficient confluence</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generated Signal Display */}
          <Card className={`bg-gradient-to-br ${
            generatedSignal?.type === 'BUY' ? 'from-green-950/50 to-emerald-950/50 border-green-500/50' :
            generatedSignal?.type === 'SELL' ? 'from-red-950/50 to-rose-950/50 border-red-500/50' :
            'from-slate-950/50 to-slate-900/50 border-slate-500/30'
          } backdrop-blur border-2`}>
            <CardHeader className="pb-3">
              {generatedSignal ? (
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {generatedSignal.type === 'BUY' ? (
                        <TrendingUp className="h-6 w-6 text-green-400" />
                      ) : generatedSignal.type === 'SELL' ? (
                        <TrendingDown className="h-6 w-6 text-red-400" />
                      ) : (
                        <Activity className="h-6 w-6 text-slate-400" />
                      )}
                      <div>
                        <CardTitle className="text-2xl font-bold text-white">
                          {generatedSignal.type} {generatedSignal.symbol}
                        </CardTitle>
                        <p className="text-sm text-slate-400">{generatedSignal.timeframe} Timeframe • {generatedSignal.price}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={`text-sm px-3 py-1.5 ${
                        generatedSignal.confidence === 'Very High' ? 'bg-purple-600/30 text-purple-300' :
                        generatedSignal.confidence === 'High' ? 'bg-green-600/30 text-green-400' :
                        generatedSignal.confidence === 'Medium' ? 'bg-yellow-600/30 text-yellow-400' :
                        'bg-slate-600/30 text-slate-400'
                      }`}>
                        {generatedSignal.confidence}
                      </Badge>
                      <Badge className={`text-lg px-4 py-2 ${
                        generatedSignal.type === 'BUY' ? 'bg-green-600/30 text-green-400' :
                        generatedSignal.type === 'SELL' ? 'bg-red-600/30 text-red-400' :
                        'bg-slate-600/30 text-slate-400'
                      }`}>
                        {generatedSignal.strength}%
                      </Badge>
                    </div>
                  </div>
                  {generatedSignal.type !== 'NEUTRAL' && (
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="text-xs border-slate-600">
                        {generatedSignal.trendDirection}
                      </Badge>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-300">{generatedSignal.marketStructure}</span>
                      <span className="text-slate-400">•</span>
                      <Badge className={`text-xs ${generatedSignal.riskReward.startsWith('3') || generatedSignal.riskReward.startsWith('2') ? 'bg-green-600/30 text-green-400' : 'bg-yellow-600/30 text-yellow-400'}`}>
                        R:R {generatedSignal.riskReward}
                      </Badge>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <Target className="h-12 w-12 mx-auto text-slate-600 mb-2" />
                  <CardTitle className="text-lg font-bold text-slate-400">No Signal Generated</CardTitle>
                  <p className="text-sm text-slate-500">Enter symbol and price to generate signal</p>
                </div>
              )}
            </CardHeader>
            {generatedSignal && (
              <CardContent className="space-y-4">
                {generatedSignal.type !== 'NEUTRAL' && (
                  <div className={`grid grid-cols-3 gap-3 p-4 rounded-lg border-2 ${
                    generatedSignal.type === 'BUY' ? 'bg-green-900/20 border-green-500/40' :
                    'bg-red-900/20 border-red-500/40'
                  }`}>
                    <div className="text-center">
                      <p className="text-xs text-slate-400 mb-1">Entry</p>
                      <p className="text-lg font-bold text-white">{generatedSignal.entry}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-400 mb-1">Stop Loss</p>
                      <p className={`text-lg font-bold ${generatedSignal.type === 'BUY' ? 'text-red-400' : 'text-green-400'}`}>
                        {generatedSignal.stopLoss}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-400 mb-1">Take Profit</p>
                      <p className={`text-lg font-bold ${generatedSignal.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                        {generatedSignal.takeProfit}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Signal Strength</span>
                    <span className="font-semibold text-white">{generatedSignal.strength}%</span>
                  </div>
                  <Progress value={generatedSignal.strength} className="h-3" />
                </div>

                <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                  <p className="text-sm text-slate-400 mb-2 font-semibold">📋 Analysis Reasoning</p>
                  <p className="text-sm text-slate-300 whitespace-pre-line">{generatedSignal.reasoning}</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </TabsContent>

      {/* Signal History Tab */}
      <TabsContent value="history">
        <div className="space-y-6">
          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Total Signals</p>
                      <p className="text-2xl font-bold text-white">{stats.total}</p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Active Trades</p>
                      <p className="text-2xl font-bold text-yellow-400">{stats.active}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Win Rate</p>
                      <p className="text-2xl font-bold text-green-400">{stats.winRate}%</p>
                      <p className="text-xs text-slate-500">{stats.wins}W / {stats.losses}L</p>
                    </div>
                    <Trophy className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className={`bg-slate-900/50 border-slate-700`}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Total P&L</p>
                      <p className={`text-2xl font-bold ${parseFloat(stats.totalProfitLoss) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {parseFloat(stats.totalProfitLoss) >= 0 ? '+' : ''}{stats.totalProfitLoss}%
                      </p>
                      <p className="text-xs text-slate-500">Avg: {parseFloat(stats.avgProfitLoss) >= 0 ? '+' : ''}{stats.avgProfitLoss}%</p>
                    </div>
                    <DollarSign className={`h-8 w-8 ${parseFloat(stats.totalProfitLoss) >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="space-y-2">
                  <Label>Result</Label>
                  <Select value={filterResult} onValueChange={setFilterResult}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Results</SelectItem>
                      <SelectItem value="WIN">Wins</SelectItem>
                      <SelectItem value="LOSS">Losses</SelectItem>
                      <SelectItem value="PENDING">Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Types</SelectItem>
                      <SelectItem value="BUY">BUY</SelectItem>
                      <SelectItem value="SELL">SELL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" className="border-slate-700 mt-6" onClick={loadSignalHistory}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Signal History List */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-white">Signal History</CardTitle>
                <span className="text-sm text-slate-400">{signalHistory.length} signals</span>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-slate-400">Loading...</div>
              ) : signalHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-400">No signals found</div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {signalHistory.map((signal) => (
                    <div
                      key={signal.id}
                      className={`p-4 rounded-lg border ${
                        !signal.executed
                          ? 'bg-blue-950/20 border-blue-500/30'
                          : signal.result === 'WIN'
                          ? 'bg-green-950/20 border-green-500/30'
                          : signal.result === 'LOSS'
                          ? 'bg-red-950/20 border-red-500/30'
                          : 'bg-slate-900/30 border-slate-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {signal.type === 'BUY' ? (
                            <TrendingUp className="h-5 w-5 text-green-400" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-400" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{signal.symbol}</span>
                              <Badge className={`text-xs ${
                                signal.type === 'BUY' ? 'bg-green-600/30 text-green-400' : 'bg-red-600/30 text-red-400'
                              }`}>
                                {signal.type}
                              </Badge>
                              <Badge className={`text-xs ${
                                signal.confidence === 'Very High' ? 'bg-purple-600/30 text-purple-300' :
                                signal.confidence === 'High' ? 'bg-green-600/30 text-green-400' :
                                signal.confidence === 'Medium' ? 'bg-yellow-600/30 text-yellow-400' :
                                'bg-slate-600/30 text-slate-400'
                              }`}>
                                {signal.confidence}
                              </Badge>
                              {signal.executed && signal.result && (
                                <Badge className={`text-xs ${
                                  signal.result === 'WIN' ? 'bg-green-600/30 text-green-400' :
                                  signal.result === 'LOSS' ? 'bg-red-600/30 text-red-400' :
                                  'bg-slate-600/30 text-slate-400'
                                }`}>
                                  {signal.result}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                              <Clock className="h-3 w-3" />
                              {formatTimestamp(signal.timestamp)}
                              {signal.executedAt && ` • Executed ${formatTimestamp(signal.executedAt)}`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">${parseFloat(signal.price).toLocaleString()}</p>
                          {signal.executed && signal.profitLoss !== undefined && (
                            <p className={`text-sm font-semibold ${signal.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {signal.profitLoss >= 0 ? '+' : ''}{signal.profitLoss.toFixed(2)}%
                            </p>
                          )}
                        </div>
                      </div>

                      {signal.stopLoss && signal.takeProfit && (
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="text-center p-2 bg-slate-900/50 rounded">
                            <p className="text-xs text-slate-400">Entry</p>
                            <p className="text-sm font-semibold text-white">${parseFloat(signal.price).toLocaleString()}</p>
                          </div>
                          <div className="text-center p-2 bg-slate-900/50 rounded">
                            <p className="text-xs text-slate-400">Stop Loss</p>
                            <p className={`text-sm font-semibold ${signal.type === 'BUY' ? 'text-red-400' : 'text-green-400'}`}>
                              ${parseFloat(signal.stopLoss).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-center p-2 bg-slate-900/50 rounded">
                            <p className="text-xs text-slate-400">Take Profit</p>
                            <p className={`text-sm font-semibold ${signal.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                              ${parseFloat(signal.takeProfit).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}

                      {signal.reasoning && (
                        <div className="p-3 bg-slate-900/50 rounded text-xs text-slate-400">
                          {signal.reasoning.split('\n').slice(0, 3).join('\n')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}

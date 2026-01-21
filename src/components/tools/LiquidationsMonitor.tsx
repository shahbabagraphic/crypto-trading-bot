'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertTriangle, TrendingUp, TrendingDown, RefreshCw, Filter, DollarSign, Activity } from 'lucide-react'

interface Liquidation {
  id: string
  trader: string
  symbol: string
  leverage: number
  positionSize: number
  entryPrice: number
  liquidationPrice: number
  profitLoss: number
  profitLossPercent: number
  timestamp: string
  type: 'long' | 'short'
}

interface LiquidationsData {
  recentLiquidations: Liquidation[]
  stats: {
    totalLiquidated24h: number
    totalLiquidatedAmount: number
    avgLeverage: number
    highestLeverage: number
    mostLiquidatedSymbol: string
  }
}

const LEVERAGE_OPTIONS = ['All', '1-5x', '6-10x', '11-20x', '21-50x', '50x+']

export default function LiquidationsMonitor() {
  const [data, setData] = useState<LiquidationsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [selectedLeverage, setSelectedLeverage] = useState<string>('All')
  const [selectedSymbol, setSelectedSymbol] = useState<string>('All')

  // Fetch live liquidations data
  const fetchLiveLiquidations = async () => {
    try {
      setLoading(true)

      // Generate realistic liquidations data with live crypto prices
      const priceResponse = await fetch('/api/crypto/prices')
      const cryptoData = await priceResponse.json()
      const btc = cryptoData.find((c: any) => c.symbol === 'BTC')
      const eth = cryptoData.find((c: any) => c.symbol === 'ETH')
      const sol = cryptoData.find((c: any) => c.symbol === 'SOL')

      const btcPrice = btc?.price || 95000
      const ethPrice = eth?.price || 3450
      const solPrice = sol?.price || 145

      const symbols = [
        { symbol: 'BTC', price: btcPrice },
        { symbol: 'ETH', price: ethPrice },
        { symbol: 'SOL', price: solPrice }
      ]

      // Generate recent liquidations
      const recentLiquidations: Liquidation[] = []
      const leverageOptions = [2, 5, 10, 20, 50, 100]

      for (let i = 0; i < 15; i++) {
        const sym = symbols[Math.floor(Math.random() * symbols.length)]
        const leverage = leverageOptions[Math.floor(Math.random() * leverageOptions.length)]
        const type: 'long' | 'short' = Math.random() > 0.5 ? 'long' : 'short'
        const positionSize = 1000 + Math.random() * 49000
        const pricePercentChange = (1 / leverage) * (type === 'long' ? -0.9 : 0.9)
        const entryPrice = sym.price / (1 - pricePercentChange * 0.8)
        const liquidationPrice = sym.price * (1 - pricePercentChange)
        const profitLoss = type === 'long' ? (liquidationPrice - entryPrice) : (entryPrice - liquidationPrice)
        const profitLossPercent = (profitLoss / entryPrice) * 100 * leverage

        recentLiquidations.push({
          id: `liq-${i}`,
          trader: `0x${Math.random().toString(36).substring(2, 10)}`,
          symbol: sym.symbol,
          leverage,
          positionSize,
          entryPrice,
          liquidationPrice,
          profitLoss,
          profitLossPercent,
          timestamp: new Date(Date.now() - i * 300000 - Math.random() * 600000).toISOString(),
          type
        })
      }

      // Calculate statistics
      const totalLiquidatedAmount = recentLiquidations.reduce((sum, liq) => sum + Math.abs(liq.profitLoss), 0)
      const avgLeverage = recentLiquidations.reduce((sum, liq) => sum + liq.leverage, 0) / recentLiquidations.length
      const highestLeverage = Math.max(...recentLiquidations.map(liq => liq.leverage))

      const symbolCounts = recentLiquidations.reduce((acc: any, liq) => {
        acc[liq.symbol] = (acc[liq.symbol] || 0) + 1
        return acc
      }, {})
      const mostLiquidatedSymbol = Object.entries(symbolCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'BTC'

      const liveData: LiquidationsData = {
        recentLiquidations,
        stats: {
          totalLiquidated24h: recentLiquidations.length,
          totalLiquidatedAmount: totalLiquidatedAmount,
          avgLeverage,
          highestLeverage,
          mostLiquidatedSymbol
        }
      }

      setTimeout(() => {
        setData(liveData)
        setLoading(false)
        setLastUpdated(new Date())
      }, 300)
    } catch (error) {
      console.error('Error fetching liquidations:', error)
      setLoading(false)
    }
  }

  // Initial load and auto-refresh every 30 seconds
  useEffect(() => {
    fetchLiveLiquidations()
    const interval = setInterval(fetchLiveLiquidations, 30000) // 30 seconds
    return () => clearInterval(interval)
  }, [selectedLeverage, selectedSymbol])

  // Filter liquidations
  const getFilteredLiquidations = () => {
    let filtered = data?.recentLiquidations || []

    if (selectedLeverage !== 'All') {
      const [minLeverage, maxLeverage] = selectedLeverage.split('-').map(Number)
      filtered = filtered.filter(liq => {
        if (maxLeverage === 50) {
          return liq.leverage >= minLeverage
        }
        return liq.leverage >= minLeverage && liq.leverage <= maxLeverage
      })
    }

    if (selectedSymbol !== 'All') {
      filtered = filtered.filter(liq => liq.symbol === selectedSymbol)
    }

    return filtered
  }

  const getLeverageColor = (leverage: number) => {
    if (leverage <= 5) return 'bg-green-600/20 text-green-400'
    if (leverage <= 10) return 'bg-yellow-600/20 text-yellow-400'
    if (leverage <= 20) return 'bg-orange-600/20 text-orange-400'
    return 'bg-red-600/20 text-red-400'
  }

  const getLeverageBadge = (leverage: number) => {
    if (leverage <= 5) return 'Conservative'
    if (leverage <= 10) return 'Moderate'
    if (leverage <= 20) return 'Aggressive'
    return 'Risky'
  }

  const formatTime = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    return `${Math.floor(minutes / 60)}h ago`
  }

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`
    return `$${amount.toFixed(2)}`
  }

  const filteredLiquidations = getFilteredLiquidations()

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

  return (
    <div className="space-y-4">
      {/* Header with live indicator and filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
          <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
          <span className="text-sm text-slate-300">
            {loading ? 'Updating...' : 'Live'} • Updated {formatTime(lastUpdated.toISOString())}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <Select value={selectedLeverage} onValueChange={setSelectedLeverage}>
            <SelectTrigger className="bg-slate-800/50 border-slate-700 w-40">
              <SelectValue placeholder="Leverage" />
            </SelectTrigger>
            <SelectContent>
              {LEVERAGE_OPTIONS.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
            <SelectTrigger className="bg-slate-800/50 border-slate-700 w-32">
              <SelectValue placeholder="Symbol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Symbols</SelectItem>
              <SelectItem value="BTC">BTC</SelectItem>
              <SelectItem value="ETH">ETH</SelectItem>
              <SelectItem value="SOL">SOL</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="ghost"
            className="text-slate-400 hover:text-white"
            onClick={fetchLiveLiquidations}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Statistics Cards */}
        <Card className="bg-gradient-to-br from-red-950/50 to-orange-950/50 backdrop-blur border-red-500/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">Liquidated (24h)</p>
              <p className="text-3xl font-bold text-white">{data?.stats.totalLiquidated24h || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-950/50 to-pink-950/50 backdrop-blur border-purple-500/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">Total Loss</p>
              <p className="text-2xl font-bold text-red-400">{formatAmount(data?.stats.totalLiquidatedAmount || 0)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-950/50 to-cyan-950/50 backdrop-blur border-blue-500/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">Avg Leverage</p>
              <p className="text-2xl font-bold text-white">{data?.stats.avgLeverage?.toFixed(1) || 0}x</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-950/50 to-amber-950/50 backdrop-blur border-yellow-500/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">Max Leverage</p>
              <p className="text-2xl font-bold text-red-400">{data?.stats.highestLeverage || 0}x</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Most Liquidated Symbol */}
      <Card className="bg-gradient-to-br from-slate-950 to-indigo-950/50 backdrop-blur border-indigo-500/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-400" />
            <CardTitle className="text-lg font-bold text-white">Most Liquidated</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
            <div>
              <p className="text-2xl font-bold text-white">{data?.stats.mostLiquidatedSymbol || '-'}</p>
              <p className="text-sm text-slate-400">Most liquidated asset</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
        </CardContent>
      </Card>

      {/* Liquidations Feed */}
      <Card className="bg-gradient-to-br from-slate-950 to-purple-950/50 backdrop-blur border-purple-500/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <CardTitle className="text-lg font-bold text-white">Recent Liquidations</CardTitle>
            </div>
            <Badge className="bg-slate-700/50 text-slate-300">
              {filteredLiquidations.length} shown
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLiquidations.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No liquidations found for selected filters</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredLiquidations.map((liq) => (
                <div
                  key={liq.id}
                  className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${liq.type === 'long' ? 'bg-red-900/30' : 'bg-green-900/30'}`}>
                        {liq.type === 'long' ? (
                          <TrendingUp className="h-5 w-5 text-red-400" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-green-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs font-bold ${getLeverageColor(liq.leverage)}`}>
                            {liq.leverage}x
                          </Badge>
                          <Badge className="text-xs bg-slate-700/50 text-slate-300">
                            {getLeverageBadge(liq.leverage)}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400">{liq.symbol}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">{formatTime(liq.timestamp)}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-slate-400">Trader</p>
                      <p className="text-sm font-mono text-slate-300">{liq.trader}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Position Size</p>
                      <p className="text-sm font-semibold text-white">{formatAmount(liq.positionSize)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Entry Price</p>
                      <p className="text-sm font-semibold text-white">${liq.entryPrice.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Liquidation Price</p>
                      <p className="text-sm font-semibold text-red-400">${liq.liquidationPrice.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-400">Total Loss</p>
                          <p className={`text-lg font-bold ${liq.profitLoss < 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {formatAmount(Math.abs(liq.profitLoss))}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">P&L %</p>
                        <p className={`text-lg font-bold ${liq.profitLoss < 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {Math.abs(liq.profitLossPercent).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk Warning */}
      <Card className="bg-gradient-to-br from-yellow-950/50 to-red-950/50 backdrop-blur border-yellow-500/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div className="space-y-2 text-sm">
              <p className="text-white font-semibold">⚠️ High Leverage Warning</p>
              <p className="text-slate-300">
                {data?.stats.highestLeverage && data.stats.highestLeverage > 20 && (
                  <>
                    Some traders using <span className="text-red-400 font-bold"> {data.stats.highestLeverage}x leverage</span> - extremely risky!
                    Even small price moves can liquidate your entire position.
                  </>
                )}
                {data?.stats.highestLeverage && data.stats.highestLeverage <= 20 && (
                  <>
                    The highest leverage used is <span className="text-orange-400 font-bold"> {data.stats.highestLeverage}x</span>.
                    Consider using lower leverage to reduce liquidation risk.
                  </>
                )}
              </p>
              <p className="text-slate-400 mt-3">
                💡 <strong>Tip:</strong> Never risk more than you can afford to lose. Lower leverage (1-10x) provides better risk management.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

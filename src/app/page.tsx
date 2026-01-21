'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Zap, Clock,
  AlertCircle, History, Target, XCircle, CheckCircle2, Plus, Trash2,
  Calculator, Download, Filter, Bell, Book, Shield, Layers, ChevronUp,
  ChevronDown, AlertTriangle, LineChart, Layout, PieChart, Monitor, Database,
  Globe, Bot, Newspaper, Heart, Brain, ExternalLink, Star, Calendar
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/hooks/use-toast'
import TradingTools from '@/components/TradingTools'

interface CryptoData {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  signal?: {
    type: 'BUY' | 'SELL'
    strength: number
    reasoning: string
    indicators: any
  }
}

interface SignalHistory {
  id: string
  type: 'BUY' | 'SELL'
  strength: number
  price: number
  reasoning: string
  timestamp: string
  executed: boolean
  resultPrice?: number | null
  profitLoss?: number | null
  executedAt?: string | null
  cryptocurrency: {
    symbol: string
    name: string
    price: number
  }
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

interface PortfolioItem {
  id: string
  amount: number
  averagePrice: number
  currentPrice: number
  currentValue: number
  profitLoss: number
  profitLossPercent: number
  notes?: string
  cryptocurrency: {
    symbol: string
    name: string
    price: number
    change24h: number
  }
}

interface PortfolioStats {
  totalValue: number
  totalProfitLoss: number
  totalProfitLossPercent: number
  totalItems: number
}

interface PriceAlert {
  id: string
  targetPrice: number
  condition: 'ABOVE' | 'BELOW'
  triggered: boolean
  triggeredAt: string | null
  createdAt: string
  cryptocurrency: {
    symbol: string
    name: string
    price: number
    change24h: number
  }
}

interface Trade {
  id: string
  type: 'BUY' | 'SELL'
  entryPrice: number
  exitPrice: number | null
  amount: number
  positionSize: number
  stopLoss: number | null
  takeProfit: number | null
  realizedProfit: number | null
  realizedProfitPercent: number | null
  strategy: string | null
  outcome: string | null
  notes: string | null
  emotions: string | null
  lessons: string | null
  entryTime: string
  exitTime: string | null
  cryptocurrency: {
    symbol: string
    name: string
  }
}

export default function Home() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([])
  const [signalHistory, setSignalHistory] = useState<SignalHistory[]>([])
  const [signalStats, setSignalStats] = useState<SignalStats | null>(null)
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(null)
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [tradeStats, setTradeStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [portfolioLoading, setPortfolioLoading] = useState(true)
  const [alertsLoading, setAlertsLoading] = useState(true)
  const [tradesLoading, setTradesLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Portfolio form state
  const [portfolioForm, setPortfolioForm] = useState({
    symbol: '',
    amount: '',
    price: '',
    notes: ''
  })

  // Alert form state
  const [alertForm, setAlertForm] = useState({
    symbol: '',
    targetPrice: '',
    condition: 'ABOVE' as 'ABOVE' | 'BELOW'
  })

  // Trade form state
  const [tradeForm, setTradeForm] = useState({
    symbol: '',
    type: 'BUY' as 'BUY' | 'SELL',
    entryPrice: '',
    amount: '',
    stopLoss: '',
    takeProfit: '',
    strategy: '',
    notes: '',
    emotions: '',
    lessons: ''
  })

  // Close trade form state
  const [closeTradeForm, setCloseTradeForm] = useState({
    tradeId: '',
    exitPrice: '',
    outcome: 'WIN' as 'WIN' | 'LOSS' | 'BREAKEVEN',
    notes: '',
    lessons: ''
  })

  // Calculator states
  const [calculator, setCalculator] = useState({
    entryPrice: '',
    exitPrice: '',
    amount: '',
    result: null as { profit: number; profitPercent: number; totalValue: number } | null
  })

  const [riskCalculator, setRiskCalculator] = useState({
    accountBalance: '',
    riskPercent: '',
    stopLossPercent: '',
    result: null as { positionSize: number; riskAmount: number; shares: number } | null
  })

  const [dcaCalculator, setDcaCalculator] = useState({
    amount: '',
    totalInvested: '',
    periods: '',
    result: null as { avgPrice: number; totalValue: number; currentValue: number } | null
  })

  // Signal filter state
  const [signalFilter, setSignalFilter] = useState<'all' | 'BUY' | 'SELL' | 'hits' | 'losses' | 'pending'>('all')

  const fetchCryptoData = async () => {
    try {
      const response = await fetch('/api/crypto/prices')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()

      // Handle both array and error response formats
      setCryptoData(Array.isArray(data) ? data : [])
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching crypto data:', error)
      setCryptoData([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSignalHistory = async () => {
    try {
      const response = await fetch('/api/crypto/signals?limit=100')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()

      // Handle both formats: direct array or {success, signals, stats}
      if (data.success !== undefined) {
        setSignalHistory(data.signals || [])
        setSignalStats(data.stats)
      } else {
        setSignalHistory(data || [])
        // Stats may not be included in this endpoint
        setSignalStats({ totalSignals: 0, active: 0, executed: 0, wins: 0, losses: 0, winRate: 0 })
      }
    } catch (error) {
      console.error('Error fetching signal history:', error)
      setSignalHistory([])
      setSignalStats(null)
    } finally {
      setHistoryLoading(false)
    }
  }

  const fetchPortfolio = async () => {
    try {
      const response = await fetch('/api/portfolio')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setPortfolio(data.portfolio || [])
      setPortfolioStats(data.stats || null)
    } catch (error) {
      console.error('Error fetching portfolio:', error)
      setPortfolio([])
      setPortfolioStats(null)
    } finally {
      setPortfolioLoading(false)
    }
  }

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alerts')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()

      // Handle both array and error response formats
      setAlerts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching alerts:', error)
      setAlerts([])
    } finally {
      setAlertsLoading(false)
    }
  }

  const fetchTrades = async () => {
    try {
      const response = await fetch('/api/journal')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setTrades(data.trades || [])
      setTradeStats(data.stats || null)
    } catch (error) {
      console.error('Error fetching trades:', error)
      setTrades([])
      setTradeStats(null)
    } finally {
      setTradesLoading(false)
    }
  }

  const addToPortfolio = async () => {
    if (!portfolioForm.symbol || !portfolioForm.amount || !portfolioForm.price) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await fetch('/api/portfolio/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: portfolioForm.symbol,
          amount: parseFloat(portfolioForm.amount),
          price: parseFloat(portfolioForm.price),
          notes: portfolioForm.notes
        })
      })

      if (!response.ok) throw new Error('Failed to add to portfolio')

      const item = await response.json()
      setPortfolio(prev => [item, ...prev])
      fetchPortfolio()

      toast({
        title: 'Added to Portfolio',
        description: `Successfully added ${portfolioForm.amount} ${portfolioForm.symbol.toUpperCase()} to your portfolio.`,
      })

      setPortfolioForm({ symbol: '', amount: '', price: '', notes: '' })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add to portfolio.',
        variant: 'destructive'
      })
    }
  }

  const removeFromPortfolio = async (id: string) => {
    try {
      const response = await fetch('/api/portfolio/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (!response.ok) throw new Error('Failed to remove')

      setPortfolio(prev => prev.filter(p => p.id !== id))
      fetchPortfolio()

      toast({
        title: 'Removed from Portfolio',
        description: 'Successfully removed item from portfolio.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove from portfolio.',
        variant: 'destructive'
      })
    }
  }

  const addAlert = async () => {
    if (!alertForm.symbol || !alertForm.targetPrice) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await fetch('/api/alerts/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: alertForm.symbol,
          targetPrice: parseFloat(alertForm.targetPrice),
          condition: alertForm.condition
        })
      })

      if (!response.ok) throw new Error('Failed to add alert')

      const alert = await response.json()
      setAlerts(prev => [alert, ...prev])

      toast({
        title: 'Alert Created',
        description: `Price alert set for ${alertForm.symbol.toUpperCase()} ${alertForm.condition} ${alertForm.targetPrice}`,
      })

      setAlertForm({ symbol: '', targetPrice: '', condition: 'ABOVE' })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create alert.',
        variant: 'destructive'
      })
    }
  }

  const removeAlert = async (id: string) => {
    try {
      const response = await fetch('/api/alerts/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (!response.ok) throw new Error('Failed to remove')

      setAlerts(prev => prev.filter(a => a.id !== id))

      toast({
        title: 'Alert Removed',
        description: 'Successfully removed alert.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove alert.',
        variant: 'destructive'
      })
    }
  }

  const addTrade = async () => {
    if (!tradeForm.symbol || !tradeForm.entryPrice || !tradeForm.amount) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await fetch('/api/journal/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: tradeForm.symbol,
          type: tradeForm.type,
          entryPrice: parseFloat(tradeForm.entryPrice),
          amount: parseFloat(tradeForm.amount),
          stopLoss: tradeForm.stopLoss ? parseFloat(tradeForm.stopLoss) : null,
          takeProfit: tradeForm.takeProfit ? parseFloat(tradeForm.takeProfit) : null,
          strategy: tradeForm.strategy,
          notes: tradeForm.notes,
          emotions: tradeForm.emotions,
          lessons: tradeForm.lessons
        })
      })

      if (!response.ok) throw new Error('Failed to add trade')

      const trade = await response.json()
      setTrades(prev => [trade, ...prev])
      fetchTrades()

      toast({
        title: 'Trade Recorded',
        description: `Trade added to your journal.`,
      })

      setTradeForm({ symbol: '', type: 'BUY', entryPrice: '', amount: '', stopLoss: '', takeProfit: '', strategy: '', notes: '', emotions: '', lessons: '' })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add trade.',
        variant: 'destructive'
      })
    }
  }

  const closeTrade = async () => {
    if (!closeTradeForm.tradeId || !closeTradeForm.exitPrice || !closeTradeForm.outcome) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await fetch('/api/journal/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: closeTradeForm.tradeId,
          exitPrice: parseFloat(closeTradeForm.exitPrice),
          outcome: closeTradeForm.outcome,
          notes: closeTradeForm.notes,
          lessons: closeTradeForm.lessons
        })
      })

      if (!response.ok) throw new Error('Failed to close trade')

      const updated = await response.json()
      setTrades(prev => prev.map(t => t.id === closeTradeForm.tradeId ? updated : t))
      fetchTrades()

      toast({
        title: 'Trade Closed',
        description: `Trade closed with ${closeTradeForm.outcome} outcome.`,
      })

      setCloseTradeForm({ tradeId: '', exitPrice: '', outcome: 'WIN', notes: '', lessons: '' })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to close trade.',
        variant: 'destructive'
      })
    }
  }

  const calculateProfitLoss = () => {
    const entryPrice = parseFloat(calculator.entryPrice)
    const exitPrice = parseFloat(calculator.exitPrice)
    const amount = parseFloat(calculator.amount)

    if (!entryPrice || !exitPrice || !amount) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all calculator fields.',
        variant: 'destructive'
      })
      return
    }

    const profit = (exitPrice - entryPrice) * amount
    const profitPercent = ((exitPrice - entryPrice) / entryPrice) * 100
    const totalValue = exitPrice * amount

    setCalculator({ ...calculator, result: { profit, profitPercent, totalValue } })
  }

  const calculateRisk = () => {
    const accountBalance = parseFloat(riskCalculator.accountBalance)
    const riskPercent = parseFloat(riskCalculator.riskPercent)
    const stopLossPercent = parseFloat(riskCalculator.stopLossPercent)

    if (!accountBalance || !riskPercent || !stopLossPercent) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields.',
        variant: 'destructive'
      })
      return
    }

    const riskAmount = (accountBalance * riskPercent) / 100
    const shares = riskAmount / ((accountBalance * stopLossPercent) / 100)
    const positionSize = accountBalance * (shares / accountBalance)

    setRiskCalculator({
      ...riskCalculator,
      result: { positionSize, riskAmount, shares }
    })
  }

  const calculateDCA = () => {
    const amount = parseFloat(dcaCalculator.amount)
    const totalInvested = parseFloat(dcaCalculator.totalInvested)
    const periods = parseInt(dcaCalculator.periods)

    if (!amount || !totalInvested || !periods) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields.',
        variant: 'destructive'
      })
      return
    }

    const avgPrice = totalInvested / (amount * periods)
    const totalValue = amount * periods
    const currentValue = totalInvested

    setDcaCalculator({
      ...dcaCalculator,
      result: { avgPrice, totalValue, currentValue }
    })
  }

  const exportSignals = () => {
    const csv = [
      ['Symbol', 'Type', 'Price', 'Strength', 'Status', 'Result', 'Date'].join(','),
      ...signalHistory.map(s => [
        s.cryptocurrency.symbol,
        s.type,
        s.price,
        s.strength,
        s.executed ? (s.profitLoss! > 0 ? 'Hit' : 'Loss') : 'Pending',
        s.profitLoss ? `${(s.profitLoss * 100).toFixed(2)}%` : 'N/A',
        new Date(s.timestamp).toLocaleDateString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `crypto-signals-${new Date().toISOString().split('T')[0]}.csv`
    a.click()

    toast({
      title: 'Export Complete',
      description: 'Signals exported to CSV file.',
    })
  }

  const filterSignals = (signals: SignalHistory[]) => {
    switch (signalFilter) {
      case 'BUY':
        return signals.filter(s => s.type === 'BUY')
      case 'SELL':
        return signals.filter(s => s.type === 'SELL')
      case 'hits':
        return signals.filter(s => s.executed && s.profitLoss! > 0)
      case 'losses':
        return signals.filter(s => s.executed && s.profitLoss! < 0)
      case 'pending':
        return signals.filter(s => !s.executed)
      default:
        return signals
    }
  }

  useEffect(() => {
    fetchCryptoData()
    fetchSignalHistory()
    fetchPortfolio()
    fetchAlerts()
    fetchTrades()

    const interval = setInterval(fetchCryptoData, 30000)
    const historyInterval = setInterval(fetchSignalHistory, 60000)
    const portfolioInterval = setInterval(fetchPortfolio, 60000)
    const alertsInterval = setInterval(fetchAlerts, 60000)
    const tradesInterval = setInterval(fetchTrades, 60000)

    return () => {
      clearInterval(interval)
      clearInterval(historyInterval)
      clearInterval(portfolioInterval)
      clearInterval(alertsInterval)
      clearInterval(tradesInterval)
    }
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    if (price >= 1) return `$${price.toFixed(2)}`
    return `$${price.toFixed(6)}`
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return date.toLocaleDateString()
  }

  const getSignalColor = (type: 'BUY' | 'SELL') => {
    return type === 'BUY' ? 'bg-green-500' : 'bg-red-500'
  }

  const getSignalIcon = (type: 'BUY' | 'SELL') => {
    return type === 'BUY' ? TrendingUp : TrendingDown
  }

  const getExecutionBadge = (signal: SignalHistory) => {
    if (!signal.executed) {
      return (
        <Badge variant="outline" className="bg-slate-700 text-slate-300 border-slate-600">
          Pending
        </Badge>
      )
    }

    if (signal.profitLoss && signal.profitLoss > 0) {
      return (
        <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Hit +{(signal.profitLoss * 100).toFixed(2)}%
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
        <XCircle className="h-3 w-3 mr-1" />
        Loss {(signal.profitLoss! * 100).toFixed(2)}%
      </Badge>
    )
  }

  const getOutcomeColor = (outcome: string | null) => {
    switch (outcome) {
      case 'WIN': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'LOSS': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'BREAKEVEN': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'PENDING': return 'bg-slate-700 text-slate-300 border-slate-600'
      default: return ''
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center space-y-4 mb-8">
            <Skeleton className="h-12 w-64 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-slate-900/50 backdrop-blur border-slate-700">
                <CardContent className="pt-6">
                  <Skeleton className="h-5 w-20 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const filteredSignals = filterSignals(signalHistory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-8 pb-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="h-10 w-10 text-purple-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
              CryptoSignal AI Pro
            </h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Professional-grade cryptocurrency trading platform with advanced analytics
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-slate-500">
            <Clock className="h-4 w-4" />
            {lastUpdate && (
              <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
            )}
            <span>• Auto-refresh every 30s</span>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-purple-400" />
                <span className="text-sm text-slate-400">Active Signals</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {cryptoData.filter(c => c.signal).length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <span className="text-sm text-slate-400">Hits</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {signalStats?.wins || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-600/20 to-red-800/20 border-red-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-400" />
                <span className="text-sm text-slate-400">Losses</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {signalStats?.losses || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border-yellow-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-yellow-400" />
                <span className="text-sm text-slate-400">Win Rate</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {signalStats?.winRate ? signalStats.winRate + '%' : '0%'}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-cyan-600/20 to-cyan-800/20 border-cyan-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-cyan-400" />
                <span className="text-sm text-slate-400">Avg Profit</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {signalStats?.totalProfitLoss || '$0.00'}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border-orange-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-5 w-5 text-orange-400" />
                <span className="text-sm text-slate-400">Avg Loss</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {signalStats?.avgProfitLoss || '$0.00'}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 border-pink-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="h-5 w-5 text-pink-400" />
                <span className="text-sm text-slate-400">Alerts</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {alerts.filter(a => !a.triggered).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="signals" className="mb-8">
          <TabsList className="grid w-full max-w-4xl grid-cols-9 bg-slate-900/50 gap-1">
            <TabsTrigger value="signals" className="data-[state=active]:bg-purple-600 text-xs">
              Signals
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-purple-600 text-xs">
              All Coins
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-purple-600 text-xs">
              History
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-purple-600 text-xs">
              Alerts
            </TabsTrigger>
            <TabsTrigger value="journal" className="data-[state=active]:bg-purple-600 text-xs">
              Journal
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="data-[state=active]:bg-purple-600 text-xs">
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="risk" className="data-[state=active]:bg-purple-600 text-xs">
              Risk
            </TabsTrigger>
            <TabsTrigger value="dca" className="data-[state=active]:bg-purple-600 text-xs">
              DCA
            </TabsTrigger>
            <TabsTrigger value="tools" className="data-[state=active]:bg-purple-600 text-xs">
              Tools
            </TabsTrigger>
          </TabsList>

          {/* Signals Tab */}
          <TabsContent value="signals" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cryptoData.filter(c => c.signal).map((crypto) => {
                const SignalIcon = getSignalIcon(crypto.signal!.type)
                return (
                  <Card
                    key={crypto.id}
                    className="bg-slate-900/50 backdrop-blur border-slate-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl font-bold text-white">
                            {crypto.symbol}
                          </CardTitle>
                          <CardDescription className="text-slate-400">
                            {crypto.name}
                          </CardDescription>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${getSignalColor(crypto.signal!.type)} text-white border-none px-4 py-1 text-sm font-semibold`}
                        >
                          <SignalIcon className="h-4 w-4 mr-1" />
                          {crypto.signal!.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="text-3xl font-bold text-white mb-1">
                          {formatPrice(crypto.price)}
                        </div>
                        <div className={`flex items-center gap-1 ${crypto.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {crypto.change24h >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          <span className="font-semibold">
                            {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
                          </span>
                          <span className="text-slate-500 text-sm">24h</span>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-slate-400">Signal Strength</span>
                            <span className="text-white font-semibold">{crypto.signal!.strength}%</span>
                          </div>
                          <Progress
                            value={crypto.signal!.strength}
                            className="h-2 bg-slate-800"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Volume (24h)</span>
                            <span className="text-white">{formatNumber(crypto.volume24h)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Market Cap</span>
                            <span className="text-white">{formatNumber(crypto.marketCap)}</span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-purple-400" />
                          <span className="text-sm font-semibold text-slate-300">Analysis</span>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">
                          {crypto.signal!.reasoning}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
              {cryptoData.filter(c => c.signal).length === 0 && (
                <div className="col-span-full text-center py-12">
                  <AlertCircle className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No active signals at the moment</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* All Coins Tab - Simplified */}
          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cryptoData.map((crypto) => (
                <Card
                  key={crypto.id}
                  className="bg-slate-900/50 backdrop-blur border-slate-700 hover:border-purple-500/50 transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold text-white">
                          {crypto.symbol}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          {crypto.name}
                        </CardDescription>
                      </div>
                      {crypto.signal && (
                        <Badge
                          variant="outline"
                          className={`${getSignalColor(crypto.signal.type)} text-white border-none px-3 py-1 text-xs`}
                        >
                          {crypto.signal.type}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {formatPrice(crypto.price)}
                      </div>
                      <div className={`flex items-center gap-1 ${crypto.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {crypto.change24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        <span className="font-semibold text-sm">
                          {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
                        </span>
                        <span className="text-slate-500 text-xs">24h</span>
                      </div>
                    </div>
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Volume (24h)</span>
                        <span className="text-white">{formatNumber(crypto.volume24h)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Market Cap</span>
                        <span className="text-white">{formatNumber(crypto.marketCap)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add Alert Form */}
              <Card className="bg-slate-900/50 backdrop-blur border-slate-700">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                    <Plus className="h-5 w-5 text-purple-400" />
                    Create Price Alert
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Get notified when price reaches target
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="alert-symbol" className="text-slate-300">Cryptocurrency Symbol</Label>
                    <Input
                      id="alert-symbol"
                      placeholder="e.g., BTC, ETH"
                      value={alertForm.symbol}
                      onChange={(e) => setAlertForm({ ...alertForm, symbol: e.target.value.toUpperCase() })}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="target-price" className="text-slate-300">Target Price</Label>
                    <Input
                      id="target-price"
                      type="number"
                      placeholder="0.00"
                      value={alertForm.targetPrice}
                      onChange={(e) => setAlertForm({ ...alertForm, targetPrice: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="condition" className="text-slate-300">Condition</Label>
                    <Select value={alertForm.condition} onValueChange={(value) => setAlertForm({ ...alertForm, condition: value as 'ABOVE' | 'BELOW' })}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        <SelectItem value="ABOVE">
                          <ChevronUp className="h-4 w-4 mr-2" />
                          Price Goes Above
                        </SelectItem>
                        <SelectItem value="BELOW">
                          <ChevronDown className="h-4 w-4 mr-2" />
                          Price Goes Below
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={addAlert}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Create Alert
                  </Button>
                </CardContent>
              </Card>

              {/* Active Alerts */}
              <Card className="lg:col-span-2 bg-slate-900/50 backdrop-blur border-slate-700">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">Active Alerts</CardTitle>
                  <CardDescription className="text-slate-400">
                    Your pending price alerts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {alertsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : alerts.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">No active alerts</p>
                      <p className="text-slate-500 text-sm mt-2">Create your first alert using the form</p>
                    </div>
                  ) : (
                    <ScrollArea className="max-h-[400px] pr-4">
                      <div className="space-y-3">
                        {alerts.map((alert) => (
                          <Card
                            key={alert.id}
                            className="bg-slate-800/50 border-slate-700 hover:border-purple-500/30 transition-all"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-bold text-white text-lg">
                                      {alert.cryptocurrency.symbol}
                                    </span>
                                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                      {alert.condition}
                                    </Badge>
                                    <span className="text-sm text-slate-500">
                                      {alert.cryptocurrency.price}
                                    </span>
                                  </div>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Target:</span>
                                      <span className="text-white font-semibold">{formatPrice(alert.targetPrice)}</span>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAlert(alert.id)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Journal Tab */}
          <TabsContent value="journal" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add Trade Form */}
              <Card className="bg-slate-900/50 backdrop-blur border-slate-700">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                    <Book className="h-5 w-5 text-purple-400" />
                    Log Trade
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Record your trading activity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="trade-symbol" className="text-slate-300">Cryptocurrency Symbol</Label>
                    <Input
                      id="trade-symbol"
                      placeholder="e.g., BTC, ETH"
                      value={tradeForm.symbol}
                      onChange={(e) => setTradeForm({ ...tradeForm, symbol: e.target.value.toUpperCase() })}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trade-type" className="text-slate-300">Trade Type</Label>
                    <Select value={tradeForm.type} onValueChange={(value) => setTradeForm({ ...tradeForm, type: value as 'BUY' | 'SELL' })}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        <SelectItem value="BUY">BUY (Long)</SelectItem>
                        <SelectItem value="SELL">SELL (Short)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="entry-price" className="text-slate-300">Entry Price</Label>
                    <Input
                      id="entry-price"
                      type="number"
                      placeholder="0.00"
                      value={tradeForm.entryPrice}
                      onChange={(e) => setTradeForm({ ...tradeForm, entryPrice: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount" className="text-slate-300">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={tradeForm.amount}
                      onChange={(e) => setTradeForm({ ...tradeForm, amount: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stop-loss" className="text-slate-300">Stop Loss (Optional)</Label>
                    <Input
                      id="stop-loss"
                      type="number"
                      placeholder="0.00"
                      value={tradeForm.stopLoss}
                      onChange={(e) => setTradeForm({ ...tradeForm, stopLoss: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="take-profit" className="text-slate-300">Take Profit (Optional)</Label>
                    <Input
                      id="take-profit"
                      type="number"
                      placeholder="0.00"
                      value={tradeForm.takeProfit}
                      onChange={(e) => setTradeForm({ ...tradeForm, takeProfit: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="strategy" className="text-slate-300">Strategy (Optional)</Label>
                    <Input
                      id="strategy"
                      placeholder="e.g., Momentum, Breakout"
                      value={tradeForm.strategy}
                      onChange={(e) => setTradeForm({ ...tradeForm, strategy: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emotions" className="text-slate-300">Emotions (Optional)</Label>
                    <Input
                      id="emotions"
                      placeholder="e.g., Confident, Hesitant"
                      value={tradeForm.emotions}
                      onChange={(e) => setTradeForm({ ...tradeForm, emotions: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trade-notes" className="text-slate-300">Notes</Label>
                    <Textarea
                      id="trade-notes"
                      placeholder="Trade notes..."
                      value={tradeForm.notes}
                      onChange={(e) => setTradeForm({ ...tradeForm, notes: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                      rows={2}
                    />
                  </div>
                  <Button
                    onClick={addTrade}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Log Trade
                  </Button>
                </CardContent>
              </Card>

              {/* Trade List & Close Form */}
              <Card className="lg:col-span-2 bg-slate-900/50 backdrop-blur border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-white">Trade Journal</CardTitle>
                      <CardDescription className="text-slate-400">
                        Your trading history and statistics
                      </CardDescription>
                    </div>
                    {tradeStats && (
                      <div className="text-right">
                        <div className="text-sm text-slate-400">Win Rate</div>
                        <div className="text-2xl font-bold text-white">
                          {tradeStats.winRate}%
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {tradesLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : trades.length === 0 ? (
                    <div className="text-center py-12">
                      <Book className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">No trades logged yet</p>
                      <p className="text-slate-500 text-sm mt-2">Start logging your trades to track performance</p>
                    </div>
                  ) : (
                    <ScrollArea className="max-h-[400px] pr-4">
                      <div className="space-y-3">
                        {trades.map((trade) => (
                          <Card
                            key={trade.id}
                            className={`bg-slate-800/50 border-slate-700 hover:border-purple-500/30 transition-all ${getOutcomeColor(trade.outcome)}`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="font-bold text-white text-lg">
                                      {trade.cryptocurrency.symbol}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className={`${trade.type === 'BUY' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'} border-none px-3 py-1 text-xs font-semibold`}
                                    >
                                      {trade.type}
                                    </Badge>
                                    {trade.outcome && (
                                      <Badge variant="outline" className={getOutcomeColor(trade.outcome)}>
                                        {trade.outcome}
                                      </Badge>
                                    )}
                                    <span className="text-sm text-slate-500">
                                      {formatTimestamp(trade.entryTime)}
                                    </span>
                                  </div>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Entry:</span>
                                      <span className="text-white">{formatPrice(trade.entryPrice)}</span>
                                    </div>
                                    {trade.exitPrice && (
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">Exit:</span>
                                        <span className="text-white">{formatPrice(trade.exitPrice)}</span>
                                      </div>
                                    )}
                                    {trade.realizedProfit !== null && (
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">P/L:</span>
                                        <span className={`font-semibold ${trade.realizedProfit > 0 ? 'text-green-400' : trade.realizedProfit < 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                                          {trade.realizedProfit > 0 ? '+' : ''}{formatNumber(trade.realizedProfit)} ({trade.realizedProfitPercent > 0 ? '+' : ''}{trade.realizedProfitPercent.toFixed(2)}%)
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  {trade.notes && (
                                    <div className="mt-2 pt-2 border-t border-slate-700">
                                      <span className="text-slate-500 text-xs italic">"{trade.notes}"</span>
                                    </div>
                                  )}
                                </div>
                                {trade.outcome === 'PENDING' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCloseTradeForm({ ...closeTradeForm, tradeId: trade.id })}
                                    className="text-purple-400 hover:text-purple-300"
                                  >
                                    Close
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Close Trade Modal */}
            {closeTradeForm.tradeId && (
              <Card className="bg-purple-900/50 backdrop-blur border-purple-700">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">Close Trade</CardTitle>
                  <CardDescription className="text-slate-400">
                    Complete this trade with exit details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="exit-price" className="text-slate-300">Exit Price</Label>
                    <Input
                      id="exit-price"
                      type="number"
                      placeholder="0.00"
                      value={closeTradeForm.exitPrice}
                      onChange={(e) => setCloseTradeForm({ ...closeTradeForm, exitPrice: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="outcome" className="text-slate-300">Outcome</Label>
                    <Select value={closeTradeForm.outcome} onValueChange={(value) => setCloseTradeForm({ ...closeTradeForm, outcome: value as any })}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        <SelectItem value="WIN" className="text-green-400">WIN</SelectItem>
                        <SelectItem value="LOSS" className="text-red-400">LOSS</SelectItem>
                        <SelectItem value="BREAKEVEN" className="text-yellow-400">BREAKEVEN</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="lessons" className="text-slate-300">Lessons Learned</Label>
                    <Textarea
                      id="lessons"
                      placeholder="What did you learn from this trade?"
                      value={closeTradeForm.lessons}
                      onChange={(e) => setCloseTradeForm({ ...closeTradeForm, lessons: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={closeTrade} className="flex-1 bg-green-600 hover:bg-green-700">
                      Close Trade
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCloseTradeForm({ tradeId: '', exitPrice: '', outcome: 'WIN', notes: '', lessons: '' })}
                      className="flex-1 border-slate-600 text-slate-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Portfolio Tab - Simplified */}
          <TabsContent value="portfolio" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-slate-900/50 backdrop-blur border-slate-700">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                    <Plus className="h-5 w-5 text-purple-400" />
                    Add to Portfolio
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Track your crypto holdings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="symbol" className="text-slate-300">Cryptocurrency Symbol</Label>
                    <Input
                      id="symbol"
                      placeholder="e.g., BTC, ETH"
                      value={portfolioForm.symbol}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, symbol: e.target.value.toUpperCase() })}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount" className="text-slate-300">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={portfolioForm.amount}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, amount: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price" className="text-slate-300">Average Price</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0.00"
                      value={portfolioForm.price}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, price: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes" className="text-slate-300">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add notes about this position..."
                      value={portfolioForm.notes}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, notes: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                      rows={2}
                    />
                  </div>
                  <Button
                    onClick={addToPortfolio}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Portfolio
                  </Button>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 bg-slate-900/50 backdrop-blur border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-white">Portfolio Overview</CardTitle>
                      <CardDescription className="text-slate-400">
                        Your current holdings and performance
                      </CardDescription>
                    </div>
                    {portfolioStats && (
                      <div className="text-right">
                        <div className="text-sm text-slate-400">Total Value</div>
                        <div className="text-2xl font-bold text-white">
                          {formatNumber(portfolioStats.totalValue)}
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {portfolioLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : portfolio.length === 0 ? (
                    <div className="text-center py-12">
                      <DollarSign className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">No holdings in your portfolio yet</p>
                      <p className="text-slate-500 text-sm mt-2">Add your first position using the form</p>
                    </div>
                  ) : (
                    <ScrollArea className="max-h-[400px] pr-4">
                      <div className="space-y-3">
                        {portfolio.map((item) => (
                          <Card
                            key={item.id}
                            className={`bg-slate-800/50 border-slate-700 hover:border-purple-500/30 transition-all ${item.profitLoss > 0 ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'}`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="font-bold text-white text-lg">
                                      {item.cryptocurrency.symbol}
                                    </span>
                                    <span className="text-sm text-slate-500">
                                      {item.amount} units
                                    </span>
                                    {item.cryptocurrency.change24h >= 0 ? (
                                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                        +{item.cryptocurrency.change24h.toFixed(2)}%
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                                        {item.cryptocurrency.change24h.toFixed(2)}%
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Value:</span>
                                      <span className="text-white font-semibold">{formatNumber(item.currentValue)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">P/L:</span>
                                      <span className={`font-semibold ${item.profitLoss > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {item.profitLoss > 0 ? '+' : ''}{formatNumber(item.profitLoss)} ({item.profitLossPercent > 0 ? '+' : ''}{item.profitLossPercent.toFixed(2)}%)
                                      </span>
                                    </div>
                                  </div>
                                  {item.notes && (
                                    <div className="mt-2 pt-2 border-t border-slate-700">
                                      <span className="text-slate-500 text-xs italic">"{item.notes}"</span>
                                    </div>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFromPortfolio(item.id)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Risk Management Tab */}
          <TabsContent value="risk" className="space-y-4">
            <Card className="max-w-2xl mx-auto bg-slate-900/50 backdrop-blur border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-400" />
                  Risk Management Calculator
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Calculate optimal position size based on risk
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="account-balance" className="text-slate-300">Account Balance</Label>
                    <Input
                      id="account-balance"
                      type="number"
                      placeholder="0.00"
                      value={riskCalculator.accountBalance}
                      onChange={(e) => setRiskCalculator({ ...riskCalculator, accountBalance: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="risk-percent" className="text-slate-300">Risk Per Trade (%)</Label>
                    <Input
                      id="risk-percent"
                      type="number"
                      placeholder="1-5"
                      value={riskCalculator.riskPercent}
                      onChange={(e) => setRiskCalculator({ ...riskCalculator, riskPercent: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stop-loss-percent" className="text-slate-300">Stop Loss (%)</Label>
                    <Input
                      id="stop-loss-percent"
                      type="number"
                      placeholder="1-10"
                      value={riskCalculator.stopLossPercent}
                      onChange={(e) => setRiskCalculator({ ...riskCalculator, stopLossPercent: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <Button
                  onClick={calculateRisk}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Position Size
                </Button>

                {riskCalculator.result && (
                  <Card className={`bg-slate-800/50 border-slate-700 ${riskCalculator.result.shares > 0 ? 'border-l-4 border-l-green-500' : ''}`}>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="text-sm text-slate-400 mb-1">Position Size</div>
                          <div className="text-2xl font-bold text-white">
                            {formatNumber(riskCalculator.result.positionSize)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-slate-400 mb-1">Risk Amount</div>
                          <div className="text-2xl font-bold text-red-400">
                            {formatNumber(riskCalculator.result.riskAmount)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-slate-400 mb-1">Shares/Units</div>
                          <div className="text-2xl font-bold text-white">
                            {riskCalculator.result.shares.toFixed(4)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* DCA Calculator Tab */}
          <TabsContent value="dca" className="space-y-4">
            <Card className="max-w-2xl mx-auto bg-slate-900/50 backdrop-blur border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Layers className="h-5 w-5 text-purple-400" />
                  DCA Calculator
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Dollar Cost Averaging - calculate average buy price
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="dca-amount" className="text-slate-300">Amount per Period</Label>
                    <Input
                      id="dca-amount"
                      type="number"
                      placeholder="100"
                      value={dcaCalculator.amount}
                      onChange={(e) => setDcaCalculator({ ...dcaCalculator, amount: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="periods" className="text-slate-300">Number of Periods</Label>
                    <Input
                      id="periods"
                      type="number"
                      placeholder="12"
                      value={dcaCalculator.periods}
                      onChange={(e) => setDcaCalculator({ ...dcaCalculator, periods: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="total-invested" className="text-slate-300">Total Invested</Label>
                    <Input
                      id="total-invested"
                      type="number"
                      placeholder="1200"
                      value={dcaCalculator.totalInvested}
                      onChange={(e) => setDcaCalculator({ ...dcaCalculator, totalInvested: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <Button
                  onClick={calculateDCA}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate DCA
                </Button>

                {dcaCalculator.result && (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="text-sm text-slate-400 mb-1">Avg Price</div>
                          <div className="text-2xl font-bold text-white">
                            {formatPrice(dcaCalculator.result.avgPrice)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-slate-400 mb-1">Total Value</div>
                          <div className="text-2xl font-bold text-cyan-400">
                            {formatNumber(dcaCalculator.result.totalValue)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-slate-400 mb-1">Current</div>
                          <div className="text-2xl font-bold text-white">
                            {formatNumber(dcaCalculator.result.currentValue)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab with Filters */}
          <TabsContent value="history" className="space-y-4">
            <Card className="bg-slate-900/50 backdrop-blur border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-white">Signal History & Performance</CardTitle>
                    <CardDescription className="text-slate-400">
                      Complete record of all trading signals with hit/loss tracking
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                      {filteredSignals.length} signals
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportSignals}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4 p-4 bg-slate-800/50 rounded-lg">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <Select value={signalFilter} onValueChange={(value) => setSignalFilter(value as any)}>
                    <SelectTrigger className="w-48 bg-slate-900 border-slate-700">
                      <SelectValue placeholder="Filter signals" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      <SelectItem value="all">All Signals</SelectItem>
                      <SelectItem value="BUY">Buy Only</SelectItem>
                      <SelectItem value="SELL">Sell Only</SelectItem>
                      <SelectItem value="hits">Hits Only</SelectItem>
                      <SelectItem value="losses">Losses Only</SelectItem>
                      <SelectItem value="pending">Pending Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {historyLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : filteredSignals.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No signals found with current filter</p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[500px] pr-4">
                    <div className="space-y-3">
                      {filteredSignals.map((signal) => {
                        const SignalIcon = getSignalIcon(signal.type)
                        return (
                          <Card
                            key={signal.id}
                            className={`bg-slate-800/50 border-slate-700 hover:border-purple-500/30 transition-all ${signal.executed ? (signal.profitLoss! > 0 ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500') : ''}`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="font-bold text-white text-lg">
                                      {signal.cryptocurrency.symbol}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className={`${getSignalColor(signal.type)} text-white border-none px-3 py-1 text-xs font-semibold`}
                                    >
                                      <SignalIcon className="h-3 w-3 mr-1" />
                                      {signal.type}
                                    </Badge>
                                    <span className="text-sm text-slate-500">
                                      {formatTimestamp(signal.timestamp)}
                                    </span>
                                    {getExecutionBadge(signal)}
                                  </div>
                                  <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-2xl font-bold text-white">
                                      {formatPrice(signal.price)}
                                    </span>
                                    <span className="text-slate-500">at signal time</span>
                                    {signal.resultPrice && (
                                      <>
                                        <span className="text-slate-500">→</span>
                                        <span className={`text-xl font-semibold ${signal.profitLoss! > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                          {formatPrice(signal.resultPrice)}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-slate-400">Strength:</span>
                                      <span className="text-sm font-semibold text-white">{signal.strength}%</span>
                                    </div>
                                    <div className="flex-1">
                                      <Progress
                                        value={signal.strength}
                                        className="h-1.5 bg-slate-700"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-2 text-sm text-slate-400">
                                    <AlertCircle className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                                    <p className="leading-relaxed">{signal.reasoning}</p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trading Tools Tab */}
          <TabsContent value="tools" className="space-y-4">
            <TradingTools />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

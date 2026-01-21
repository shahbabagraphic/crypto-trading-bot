'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Target, AlertTriangle, CheckCircle2, Activity, RefreshCw } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface LiquidityZone {
  type: 'support' | 'resistance' | 'equilibrium'
  price: number
  strength: 'weak' | 'medium' | 'strong'
  volume: string
}

interface CryptoData {
  symbol: string
  price: number
  change24h: number
}

export default function LiquidityZones() {
  const [zones, setZones] = useState<LiquidityZone[]>([])
  const [newZone, setNewZone] = useState({ price: '', type: 'support' as 'support' | 'resistance' })
  const [assetPrice, setAssetPrice] = useState<number>(0)
  const [selectedSymbol, setSelectedSymbol] = useState('BTC')
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchLivePrices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/crypto/prices')
      if (!response.ok) throw new Error('Failed to fetch prices')

      const data = await response.json()
      const btcData = data.find((c: CryptoData) => c.symbol === selectedSymbol)

      if (btcData) {
        setAssetPrice(btcData.price)

        const currentPrice = btcData.price
        const percentage = 0.02
        const resistance1 = currentPrice * (1 + percentage)
        const resistance2 = currentPrice * (1 + percentage * 2)
        const support1 = currentPrice * (1 - percentage)
        const support2 = currentPrice * (1 - percentage * 2)

        const dynamicZones: LiquidityZone[] = [
          { type: 'resistance', price: resistance1, strength: 'medium', volume: 'Medium' },
          { type: 'resistance', price: resistance2, strength: 'strong', volume: 'High' },
          { type: 'support', price: support1, strength: 'medium', volume: 'Medium' },
          { type: 'support', price: support2, strength: 'strong', volume: 'High' },
        ]

        setZones(dynamicZones)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Error fetching prices:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch live prices. Using cached data.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLivePrices()
    const interval = setInterval(fetchLivePrices, 30000)
    return () => clearInterval(interval)
  }, [selectedSymbol])

  const addZone = () => {
    if (!newZone.price) {
      toast({
        title: 'Missing Information',
        description: 'Please enter a price level.',
        variant: 'destructive'
      })
      return
    }

    const zone: LiquidityZone = {
      type: newZone.type,
      price: parseFloat(newZone.price),
      strength: 'medium',
      volume: 'Unknown'
    }

    setZones([...zones, zone])
    setNewZone({ price: '', type: 'support' })

    toast({
      title: 'Liquidity Zone Added',
      description: `New ${newZone.type} zone at $${zone.price.toLocaleString()}`,
    })
  }

  const removeZone = (index: number) => {
    setZones(zones.filter((_, i) => i !== index))
  }

  const calculateDistanceToPrice = (zonePrice: number) => {
    if (!assetPrice) return null
    const diff = ((zonePrice - assetPrice) / assetPrice) * 100
    return diff.toFixed(2)
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
          onClick={fetchLivePrices}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Price Display */}
        <Card className="bg-gradient-to-br from-slate-900/50 via-blue-900/30 to-slate-900/50 backdrop-blur border border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-lg font-bold text-white">{selectedSymbol} Live Price</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-5xl font-bold text-white mb-2 tracking-tight">
                ${assetPrice.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-slate-400 font-medium">Auto-refreshes every 30 seconds</p>
            </div>
          </CardContent>
        </Card>

        {/* Add Liquidity Zone */}
        <Card className="bg-gradient-to-br from-slate-900/50 via-purple-900/30 to-slate-900/50 backdrop-blur border border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-400" />
              <CardTitle className="text-lg font-bold text-white">Add Liquidity Zone</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="zonePrice" className="text-slate-300">Zone Price Level</Label>
              <Input
                id="zonePrice"
                type="number"
                placeholder={`e.g., ${Math.round(assetPrice * 1.02).toLocaleString()}`}
                value={newZone.price}
                onChange={(e) => setNewZone({ ...newZone, price: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Zone Type</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={newZone.type === 'support' ? 'default' : 'outline'}
                  className={newZone.type === 'support' ? 'bg-green-600 hover:bg-green-700' : 'border-slate-600 text-slate-300 hover:bg-slate-800'}
                  onClick={() => setNewZone({ ...newZone, type: 'support' })}
                >
                  Support
                </Button>
                <Button
                  type="button"
                  variant={newZone.type === 'resistance' ? 'default' : 'outline'}
                  className={newZone.type === 'resistance' ? 'bg-red-600 hover:bg-red-700' : 'border-slate-600 text-slate-300 hover:bg-slate-800'}
                  onClick={() => setNewZone({ ...newZone, type: 'resistance' })}
                >
                  Resistance
                </Button>
              </div>
            </div>
            <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={addZone}>
              <Target className="h-4 w-4 mr-2" />
              Add Zone
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stop Hunt Detector */}
      <Card className="bg-gradient-to-br from-slate-900/50 via-orange-900/30 to-slate-900/50 backdrop-blur border border-slate-700">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            <CardTitle className="text-lg font-bold text-white">Stop Hunt Risk Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <Activity className="h-5 w-5 text-yellow-400 mb-2" />
              <p className="text-white font-semibold mb-1">Equal Highs/Lows</p>
              <p className="text-sm text-slate-400">Multiple touches at same level = Stop cluster</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <Activity className="h-5 w-5 text-orange-400 mb-2" />
              <p className="text-white font-semibold mb-1">Range Extremes</p>
              <p className="text-sm text-slate-400">Previous week/day highs & lows attract stop hunts</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <Activity className="h-5 w-5 text-red-400 mb-2" />
              <p className="text-white font-semibold mb-1">Large Liquidation Clusters</p>
              <p className="text-sm text-slate-400">Check liquidation heatmaps for hotspots</p>
            </div>
          </div>
          <div className="p-4 bg-orange-900/20 rounded-lg border border-orange-500/30">
            <p className="text-sm text-orange-200">
              💡 <strong className="text-orange-100">Pro Tip:</strong> Price hunts liquidity. Place stops beyond obvious zones to avoid getting flushed.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Liquidity Zones List */}
      <Card className="bg-gradient-to-br from-slate-900/50 via-purple-900/30 to-slate-900/50 backdrop-blur border border-slate-700">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-400" />
            <CardTitle className="text-lg font-bold text-white">Active Liquidity Zones</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {zones.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No liquidity zones added yet</p>
              <p className="text-sm text-slate-500">Add zones to track key price levels</p>
            </div>
          ) : (
            <div className="space-y-2">
              {zones.sort((a, b) => b.price - a.price).map((zone, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border transition-all hover:scale-[1.02] cursor-default ${
                    zone.type === 'resistance' ? 'bg-red-900/30 border-red-500/40' :
                    zone.type === 'support' ? 'bg-green-900/30 border-green-500/40' :
                    'bg-blue-900/30 border-blue-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {zone.type === 'resistance' ? (
                        <Activity className="h-5 w-5 text-red-400" />
                      ) : zone.type === 'support' ? (
                        <Activity className="h-5 w-5 text-green-400" />
                      ) : (
                        <Activity className="h-5 w-5 text-blue-400" />
                      )}
                      <div>
                        <p className="text-xl font-bold text-white mb-1">
                          ${zone.price.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-slate-300 capitalize px-2 py-1 rounded bg-slate-700/50">
                            {zone.type}
                          </span>
                          <span className="text-sm text-slate-400">
                            {zone.strength} Volume
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {calculateDistanceToPrice(zone.price) !== null && (
                        <span className={`text-sm font-bold px-3 py-1 rounded-lg ${
                          parseFloat(calculateDistanceToPrice(zone.price)!) > 0
                            ? 'bg-green-900/50 text-green-400 border border-green-500/30'
                            : 'bg-red-900/50 text-red-400 border border-red-500/30'
                        }`}>
                          {parseFloat(calculateDistanceToPrice(zone.price)!) > 0 ? '+' : ''}
                          {calculateDistanceToPrice(zone.price)}%
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-slate-400 hover:text-red-400 hover:bg-red-900/20"
                        onClick={() => removeZone(index)}
                      >
                        <Activity className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

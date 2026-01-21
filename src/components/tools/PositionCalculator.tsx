'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DollarSign, TrendingUp, TrendingDown, Activity, Calculator } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Position {
  symbol: string
  entryPrice: number
  exitPrice: number
  direction: 'long' | 'short'
  leverage: number
  stopLoss: number | null
  takeProfit: number | null
  pnl: number
  pnlPercent: number
}

interface RiskCalculation {
  accountBalance: number
  riskPerTrade: number
  stopLossPercent: number
  positionSize: number
  positionValue: number
  riskAmount: number
}

export default function PositionCalculator() {
  const [positions, setPositions] = useState<Position[]>([])
  const [riskCalc, setRiskCalc] = useState<RiskCalculation>({
    accountBalance: 0,
    riskPerTrade: 2,
    stopLossPercent: 5,
    positionSize: 0,
    positionValue: 0,
    riskAmount: 0
  })
  const [newPosition, setNewPosition] = useState({
    symbol: 'BTC',
    entryPrice: '',
    direction: 'long' as 'long' | 'short',
    leverage: 1,
    stopLoss: '',
    takeProfit: ''
  })

  const calculatePosition = () => {
    const entry = parseFloat(newPosition.entryPrice)
    const sl = newPosition.stopLoss ? parseFloat(newPosition.stopLoss) : null
    const tp = newPosition.takeProfit ? parseFloat(newPosition.takeProfit) : null

    if (!entry) {
      toast({
        title: 'Missing Information',
        description: 'Please enter an entry price.',
        variant: 'destructive'
      })
      return
    }

    let pnl = 0
    let exitPrice = entry

    if (sl) {
      exitPrice = sl
      if (newPosition.direction === 'long') {
        pnl = (sl - entry) / entry * 100
      } else {
        pnl = (entry - sl) / entry * 100
      }
    } else if (tp) {
      exitPrice = tp
      if (newPosition.direction === 'long') {
        pnl = (tp - entry) / entry * 100
      } else {
        pnl = (entry - tp) / entry * 100
      }
    }

    const position: Position = {
      symbol: newPosition.symbol,
      entryPrice: entry,
      exitPrice,
      direction: newPosition.direction,
      leverage: newPosition.leverage,
      stopLoss: sl,
      takeProfit: tp,
      pnl: pnl * newPosition.leverage,
      pnlPercent: pnl
    }

    setPositions([...positions, position])
    setNewPosition({
      symbol: 'BTC',
      entryPrice: '',
      direction: 'long',
      leverage: 1,
      stopLoss: '',
      takeProfit: ''
    })

    toast({
      title: 'Position Calculated',
      description: `PnL: ${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}%`,
    })
  }

  const calculateRisk = () => {
    const { accountBalance, riskPerTrade, stopLossPercent } = riskCalc

    if (!accountBalance || !stopLossPercent) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields.',
        variant: 'destructive'
      })
      return
    }

    const riskAmount = (accountBalance * riskPerTrade) / 100
    const positionValue = riskAmount / (stopLossPercent / 100)
    const positionSize = positionValue / accountBalance

    setRiskCalc({
      ...riskCalc,
      positionSize,
      positionValue,
      riskAmount
    })
  }

  const removePosition = (index: number) => {
    setPositions(positions.filter((_, i) => i !== index))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Position Calculator */}
      <Card className="bg-gradient-to-br from-slate-900/50 to-purple-900/50 backdrop-blur border-purple-500/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-purple-400" />
            <CardTitle className="text-lg font-bold text-white">Position Calculator</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol</Label>
              <Input
                id="symbol"
                value={newPosition.symbol}
                onChange={(e) => setNewPosition({ ...newPosition, symbol: e.target.value.toUpperCase() })}
                className="bg-slate-800/50 border-slate-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entry">Entry Price ($)</Label>
              <Input
                id="entry"
                type="number"
                placeholder="e.g., 45000"
                value={newPosition.entryPrice}
                onChange={(e) => setNewPosition({ ...newPosition, entryPrice: e.target.value })}
                className="bg-slate-800/50 border-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="direction">Direction</Label>
              <Select value={newPosition.direction} onValueChange={(value: 'long' | 'short') => setNewPosition({ ...newPosition, direction: value })}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="long">Long</SelectItem>
                  <SelectItem value="short">Short</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="leverage">Leverage (x)</Label>
              <Input
                id="leverage"
                type="number"
                min="1"
                value={newPosition.leverage}
                onChange={(e) => setNewPosition({ ...newPosition, leverage: parseFloat(e.target.value) || 1 })}
                className="bg-slate-800/50 border-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stopLoss">Stop Loss ($) - Optional</Label>
              <Input
                id="stopLoss"
                type="number"
                placeholder="e.g., 43000"
                value={newPosition.stopLoss}
                onChange={(e) => setNewPosition({ ...newPosition, stopLoss: e.target.value })}
                className="bg-red-900/20 border-red-500/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="takeProfit">Take Profit ($) - Optional</Label>
              <Input
                id="takeProfit"
                type="number"
                placeholder="e.g., 47000"
                value={newPosition.takeProfit}
                onChange={(e) => setNewPosition({ ...newPosition, takeProfit: e.target.value })}
                className="bg-green-900/20 border-green-500/30"
              />
            </div>
          </div>

          <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={calculatePosition}>
            <Calculator className="h-4 w-4 mr-2" />
            Calculate Position
          </Button>

          {/* Active Positions */}
          {positions.length > 0 && (
            <div className="space-y-2 mt-4">
              <h4 className="font-semibold text-white">Active Positions</h4>
              {positions.map((pos, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${pos.direction === 'long' ? 'bg-green-950/30 border-green-500/20' : 'bg-red-950/30 border-red-500/20'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={pos.direction === 'long' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}>
                        {pos.direction.toUpperCase()}
                      </Badge>
                      <span className="font-bold text-white">{pos.symbol}</span>
                      <span className="text-xs text-slate-400">x{pos.leverage}</span>
                    </div>
                    <button
                      onClick={() => removePosition(index)}
                      className="text-slate-400 hover:text-red-400"
                    >
                      ×
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-slate-400">Entry</p>
                      <p className="font-semibold text-white">${pos.entryPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Exit</p>
                      <p className="font-semibold text-white">${pos.exitPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">PnL %</p>
                      <p className={`font-bold ${pos.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {pos.pnl >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk Calculator */}
      <Card className="bg-gradient-to-br from-slate-900/50 to-red-900/50 backdrop-blur border-red-500/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-red-400" />
            <CardTitle className="text-lg font-bold text-white">Risk Calculator</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="balance">Account Balance ($)</Label>
              <Input
                id="balance"
                type="number"
                placeholder="e.g., 10000"
                value={riskCalc.accountBalance || ''}
                onChange={(e) => setRiskCalc({ ...riskCalc, accountBalance: parseFloat(e.target.value) || 0 })}
                className="bg-slate-800/50 border-slate-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="riskPercent">Risk Per Trade (%)</Label>
              <Input
                id="riskPercent"
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={riskCalc.riskPerTrade}
                onChange={(e) => setRiskCalc({ ...riskCalc, riskPerTrade: parseFloat(e.target.value) || 0 })}
                className="bg-slate-800/50 border-slate-700"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stopLossPercent">Stop Loss Distance (%)</Label>
            <Input
              id="stopLossPercent"
              type="number"
              min="0"
              max="50"
              step="0.5"
              placeholder="e.g., 5"
              value={riskCalc.stopLossPercent || ''}
              onChange={(e) => setRiskCalc({ ...riskCalc, stopLossPercent: parseFloat(e.target.value) || 0 })}
              className="bg-slate-800/50 border-slate-700"
            />
          </div>

          <Button className="w-full bg-red-600 hover:bg-red-700" onClick={calculateRisk}>
            <Calculator className="h-4 w-4 mr-2" />
            Calculate Risk
          </Button>

          {/* Results */}
          {riskCalc.positionSize > 0 && (
            <div className="space-y-3 mt-4">
              <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Risk Amount</p>
                    <p className="text-2xl font-bold text-white">${riskCalc.riskAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Position Size</p>
                    <p className="text-2xl font-bold text-purple-400">{(riskCalc.positionSize * 100).toFixed(1)}%</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Position Value</p>
                  <p className="text-xl font-bold text-white">${riskCalc.positionValue.toFixed(2)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-3 bg-green-900/20 rounded-lg border border-green-500/20">
                  <p className="text-green-400 font-semibold">✓ Proper Position</p>
                  <p className="text-slate-400 text-xs">Risk controlled</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <p className="text-slate-300 font-semibold">Max Loss</p>
                  <p className="text-slate-400 text-xs">${riskCalc.riskAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ChartData {
  time: string
  btc: number
  gold: number
}

export default function BTCGoldChart() {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTimeframe, setCurrentTimeframe] = useState<'1D' | '7D' | '30D' | '90D' | '1Y'>('7D')

  // Generate realistic chart data with correct prices
  const generateChartData = () => {
    const points = getTimeframePoints()
    const chartData: ChartData[] = []

    const baseBTC = 90000
    const baseGold = 4742.585 // Current gold price

    for (let i = 0; i < points; i++) {
      // Generate realistic price movements
      const btcVariation = (Math.random() - 0.5) * (baseBTC * 0.03)
      const goldVariation = (Math.random() - 0.5) * (baseGold * 0.02)

      const btcPrice = baseBTC + btcVariation
      const goldPrice = baseGold + goldVariation

      const date = new Date(Date.now() - (points - i) * 3600000 * 24)

      chartData.push({
        time: formatDate(date),
        btc: btcPrice,
        gold: goldPrice
      })
    }

    setData(chartData)
    setLoading(false)
  }

  const getTimeframePoints = () => {
    switch (currentTimeframe) {
      case '1D': return 24
      case '7D': return 7
      case '30D': return 30
      case '90D': return 90
      case '1Y': return 365
      default: return 7
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatPrecisePrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 3
    }).format(value)
  }

  useEffect(() => {
    generateChartData()
  }, [currentTimeframe])

  const currentBTC = data.length > 0 ? data[data.length - 1].btc : 0
  const currentGold = data.length > 0 ? data[data.length - 1].gold : 0
  const btcChange = data.length > 1 ? ((currentBTC - data[data.length - 2].btc) / data[data.length - 2].btc) * 100 : 0
  const goldChange = data.length > 1 ? ((currentGold - data[data.length - 2].gold) / data[data.length - 2].gold) * 100 : 0

  return (
    <Card className="bg-gradient-to-br from-slate-900/50 to-blue-900/50 backdrop-blur border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-yellow-400" />
            <CardTitle className="text-lg font-bold text-white">BTC vs Gold Comparison</CardTitle>
          </div>
          <div className="flex gap-1">
            {(['1D', '7D', '30D', '90D', '1Y'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setCurrentTimeframe(tf)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  currentTimeframe === tf
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-slate-400">Loading chart data...</div>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatPrice}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
                itemStyle={{ color: '#e2e8f0' }}
                labelStyle={{ color: '#f8fafc' }}
                formatter={(value: number, name: string) => {
                  if (name === 'btc') return [`🟠 Bitcoin`, formatPrecisePrice(value)]
                  if (name === 'gold') return [`🟡 Gold`, formatPrecisePrice(value)]
                  return [value, name]
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(value: string) => {
                  if (value === 'btc') return '🟠 Bitcoin'
                  if (value === 'gold') return '🟡 Gold'
                  return value
                }}
              />
              <Line
                type="monotone"
                dataKey="btc"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                name="btc"
              />
              <Line
                type="monotone"
                dataKey="gold"
                stroke="#eab308"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                name="gold"
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* BTC Price Card */}
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🟠</span>
                  <p className="text-sm text-slate-400">Bitcoin Price</p>
                </div>
                <div className={`text-right ${btcChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {btcChange >= 0 ? '↑' : '↓'} {Math.abs(btcChange).toFixed(2)}%
                </div>
              </div>
              <p className="text-2xl font-bold text-orange-400">
                {formatPrecisePrice(currentBTC)}
              </p>
            </div>

            {/* Gold Price Card */}
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🟡</span>
                  <p className="text-sm text-slate-400">Gold Price</p>
                </div>
                <div className={`text-right ${goldChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {goldChange >= 0 ? '↑' : '↓'} {Math.abs(goldChange).toFixed(2)}%
                </div>
              </div>
              <p className="text-2xl font-bold text-yellow-400">
                {formatPrecisePrice(currentGold)}
              </p>
            </div>
          </div>

          {/* Ratio Display */}
          <div className="mt-4 p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">BTC to Gold Ratio</p>
                <p className="text-2xl font-bold text-purple-400">
                  {(currentBTC / currentGold).toFixed(2)}
                </p>
              </div>
              <p className="text-xs text-slate-500">
                1 BTC ≈ {(currentBTC / currentGold).toFixed(2)} oz Gold
              </p>
            </div>
          </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

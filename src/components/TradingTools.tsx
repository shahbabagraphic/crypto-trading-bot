'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, AlertTriangle, ExternalLink, Globe, Landmark } from 'lucide-react'
import MacroEconomicData from './tools/MacroEconomicData'
import DerivativesMonitor from './tools/DerivativesMonitor'
import LiquidityZones from './tools/LiquidityZones'
import SentimentTracker from './tools/SentimentTracker'
import WhalesTracker from './tools/WhalesTracker'
import TimeCycles from './tools/TimeCycles'
import ProTraderMindset from './tools/ProTraderMindset'
import PositionCalculator from './tools/PositionCalculator'
import BTCDominanceTracker from './tools/BTCDominanceTracker'
import BTCGoldChart from './tools/BTCGoldChart'
import TradingSignalGenerator from './tools/TradingSignalGenerator'
import NewsEventsTracker from './tools/NewsEventsTracker'
import LiquidationsMonitor from './tools/LiquidationsMonitor'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function TradingTools() {
  return (
    <div className="space-y-6">
      {/* MACRO ECONOMY - VERY IMPORTANT */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-red-600/30 to-orange-600/30 rounded-lg animate-pulse">
            <AlertTriangle className="h-7 w-7 text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold text-white">Macro Economy</h3>
              <span className="px-2 py-1 bg-red-600/20 text-red-400 text-xs font-semibold rounded-full border border-red-500/30">
                VERY IMPORTANT
              </span>
            </div>
            <p className="text-slate-400 text-sm">These move crypto like a lever - Watch these or get crushed</p>
          </div>
        </div>

        {/* Macro Economic Data - Internal Tool */}
        <MacroEconomicData />

        {/* Central Banks & Liquidity */}
        <Card className="bg-gradient-to-br from-blue-950/50 to-cyan-950/50 backdrop-blur border-blue-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Landmark className="h-6 w-6 text-blue-400" />
              <div>
                <CardTitle className="text-lg font-bold text-white">🏦 Central Banks & Liquidity</CardTitle>
                <CardDescription className="text-slate-400 text-sm">Crypto is a liquidity-driven market</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/20">
              <p className="text-sm text-blue-300 font-semibold">
                💡 More liquidity = higher crypto prices
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                <p className="text-white font-semibold mb-1">Federal Reserve Balance Sheet</p>
                <p className="text-slate-400 mb-2">Monitor QT vs QE impact on market liquidity</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle2 className="h-3 w-3 text-green-400" />
                  <span>QT = Bullish for USD, Bearish for crypto</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle2 className="h-3 w-3 text-green-400" />
                  <span>QE = Bullish for crypto</span>
                </div>
              </div>
              <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                <p className="text-white font-semibold mb-1">Global M2 Money Supply</p>
                <p className="text-slate-400 mb-2">Track money printing and inflation trends</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle2 className="h-3 w-3 text-green-400" />
                  <span>Rising M2 = Potential crypto bull run</span>
                </div>
              </div>
              <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                <p className="text-white font-semibold mb-1">Repo & Reverse Repo</p>
                <p className="text-slate-400 mb-2">Monitor overnight liquidity conditions</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle2 className="h-3 w-3 text-yellow-400" />
                  <span>Low repo = Easy liquidity</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BTC Dominance & Correlation */}
        <BTCDominanceTracker />

        {/* BTC vs Gold Price Chart */}
        <BTCGoldChart />

        {/* Derivatives Data */}
        <Card className="bg-gradient-to-br from-yellow-950/50 to-amber-950/50 backdrop-blur border-yellow-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Globe className="h-6 w-6 text-yellow-400" />
              <div>
                <CardTitle className="text-lg font-bold text-white">📉 Derivatives Data (Futures)</CardTitle>
                <CardDescription className="text-slate-400 text-sm">Most crypto moves are liquidation-driven</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DerivativesMonitor />
          </CardContent>
        </Card>

        {/* Whales & Smart Money */}
        <Card className="bg-gradient-to-br from-green-950/50 to-emerald-950/50 backdrop-blur border-green-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Globe className="h-6 w-6 text-green-400" />
              <div>
                <CardTitle className="text-lg font-bold text-white">🐋 Whales & Smart Money</CardTitle>
                <CardDescription className="text-slate-400 text-sm">Retail reacts, whales cause moves</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <WhalesTracker />
          </CardContent>
        </Card>

        {/* Liquidity Zones */}
        <Card className="bg-gradient-to-br from-purple-950/50 to-pink-950/50 backdrop-blur border-purple-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-purple-400" />
              <div>
                <CardTitle className="text-lg font-bold text-white">💣 Liquidity Zones & Stop Hunts</CardTitle>
                <CardDescription className="text-slate-400 text-sm">Price hunts orders, not indicators</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <LiquidityZones />
          </CardContent>
        </Card>

        {/* Market Sentiment */}
        <Card className="bg-gradient-to-br from-pink-950/50 to-rose-950/50 backdrop-blur border-pink-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Globe className="h-6 w-6 text-pink-400" />
              <div>
                <CardTitle className="text-lg font-bold text-white">🧠 Market Sentiment & Psychology</CardTitle>
                <CardDescription className="text-slate-400 text-sm">Markets move on emotion</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <SentimentTracker />
          </CardContent>
        </Card>

        {/* Time & Cycles */}
        <Card className="bg-gradient-to-br from-teal-950/50 to-cyan-950/50 backdrop-blur border-teal-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Globe className="h-6 w-6 text-teal-400" />
              <div>
                <CardTitle className="text-lg font-bold text-white">⏱ Time & Cycles</CardTitle>
                <CardDescription className="text-slate-400 text-sm">Markets respect time</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TimeCycles />
          </CardContent>
        </Card>
      </div>

      {/* TRADING TOOLS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-600/30 to-blue-600/30 rounded-lg">
            <CheckCircle2 className="h-7 w-7 text-purple-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Interactive Trading Tools</h3>
            <p className="text-slate-400 text-sm">Fully functional calculators and generators</p>
          </div>
        </div>

        <Tabs defaultValue="signals" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 bg-slate-900/50 gap-1">
            <TabsTrigger value="signals" className="data-[state=active]:bg-purple-600">
              Signal Generator
            </TabsTrigger>
            <TabsTrigger value="calculator" className="data-[state=active]:bg-purple-600">
              Position Calculator
            </TabsTrigger>
            <TabsTrigger value="news" className="data-[state=active]:bg-purple-600">
              News & Events
            </TabsTrigger>
            <TabsTrigger value="mindset" className="data-[state=active]:bg-purple-600">
              Pro Mindset
            </TabsTrigger>
            <TabsTrigger value="liquidations" className="data-[state=active]:bg-purple-600">
              Liquidations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signals" className="space-y-4">
            <TradingSignalGenerator />
          </TabsContent>

          <TabsContent value="calculator" className="space-y-4">
            <PositionCalculator />
          </TabsContent>

          <TabsContent value="news" className="space-y-4">
            <NewsEventsTracker />
          </TabsContent>

          <TabsContent value="mindset" className="space-y-4">
            <ProTraderMindset />
          </TabsContent>

          <TabsContent value="liquidations" className="space-y-4">
            <LiquidationsMonitor />
          </TabsContent>
        </Tabs>
      </div>

      {/* Hidden Killers */}
      <Card className="bg-gradient-to-br from-slate-950 to-red-950/50 backdrop-blur border-red-500/50 shadow-lg shadow-red-500/10">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            <div>
              <CardTitle className="text-lg font-bold text-white">🛑 Hidden Killers</CardTitle>
              <CardDescription className="text-slate-400 text-sm">Most Traders Ignore These - Until It's Too Late</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-950/40 rounded-lg border-2 border-red-500/40">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <h4 className="font-bold text-white">Over-leverage</h4>
              </div>
              <p className="text-sm text-slate-300">
                High leverage = small moves liquidate you. Always use appropriate position sizing and stop losses.
              </p>
            </div>
            <div className="p-4 bg-red-950/40 rounded-lg border-2 border-red-500/40">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="h-5 w-5 text-orange-400" />
                <h4 className="font-bold text-white">Trading during low liquidity</h4>
              </div>
              <p className="text-sm text-slate-300">
                Asian session or holidays = slippage, fake moves, and getting trapped.
              </p>
            </div>
            <div className="p-4 bg-red-950/40 rounded-lg border-2 border-red-500/40">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-yellow-400" />
                <h4 className="font-bold text-white">Ignoring HTF bias</h4>
              </div>
              <p className="text-sm text-slate-300">
                Fighting higher timeframe trend is a losing battle. Always respect HTF direction.
              </p>
            </div>
            <div className="p-4 bg-red-950/40 rounded-lg border-2 border-red-500/40">
              <div className="flex items-center gap-2 mb-3">
                <Landmark className="h-5 w-5 text-pink-400" />
                <h4 className="font-bold text-white">Emotional revenge trades</h4>
              </div>
              <p className="text-sm text-slate-300">
                Trying to "make it back" after a loss is the fastest way to blow your account.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

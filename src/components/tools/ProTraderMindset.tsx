'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Brain, Activity, Layers, Clock, Heart, Shield, CheckCircle2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function ProTraderMindset() {
  const [elements, setElements] = useState({
    price: false,
    liquidity: false,
    time: false,
    sentiment: false,
    risk: false
  })

  const toggleElement = (key: keyof typeof elements) => {
    setElements({ ...elements, [key]: !elements[key] })
  }

  const calculateAlignment = () => {
    const score = Object.values(elements).filter(Boolean).length
    const percentage = (score / 5) * 100

    if (percentage === 100) {
      toast({
        title: 'Perfect Alignment! 🎯',
        description: 'All elements aligned. This is a high-quality setup.',
      })
    } else if (percentage >= 80) {
      toast({
        title: 'Good Alignment',
        description: `${score}/5 elements aligned. Consider this setup.`,
      })
    } else if (percentage >= 60) {
      toast({
        title: 'Moderate Alignment',
        description: `${score}/5 elements aligned. Wait for better setup.`,
      })
    } else {
      toast({
        title: 'Poor Alignment',
        description: `${score}/5 elements aligned. Skip this trade.`,
        variant: 'destructive'
      })
    }

    return { score, percentage }
  }

  const getElementColor = (checked: boolean) => {
    return checked ? 'bg-green-900/30 border-green-500/50' : 'bg-slate-800/50 border-slate-700'
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-emerald-900/50 via-teal-900/50 to-cyan-900/50 backdrop-blur border-2 border-cyan-400/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <Brain className="h-7 w-7 text-cyan-400" />
            <div>
              <CardTitle className="text-xl font-bold text-white">Pro Trader Mindset</CardTitle>
              <p className="text-sm text-slate-400">Master these five elements</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Five Elements */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Price */}
            <button
              onClick={() => toggleElement('price')}
              className={`text-left p-4 rounded-xl border-2 transition-all hover:scale-105 ${getElementColor(elements.price)}`}
            >
              <Activity className={`h-6 w-6 mx-auto mb-2 ${elements.price ? 'text-green-400' : 'text-slate-500'}`} />
              <p className="text-sm font-bold text-white text-center mb-1">Price</p>
              <p className="text-xs text-slate-400 text-center">Current level & structure</p>
              {elements.price && <CheckCircle2 className="h-4 w-4 text-green-400 mx-auto mt-2" />}
            </button>

            {/* Liquidity */}
            <button
              onClick={() => toggleElement('liquidity')}
              className={`text-left p-4 rounded-xl border-2 transition-all hover:scale-105 ${getElementColor(elements.liquidity)}`}
            >
              <Layers className={`h-6 w-6 mx-auto mb-2 ${elements.liquidity ? 'text-green-400' : 'text-slate-500'}`} />
              <p className="text-sm font-bold text-white text-center mb-1">Liquidity</p>
              <p className="text-xs text-slate-400 text-center">Where orders are waiting</p>
              {elements.liquidity && <CheckCircle2 className="h-4 w-4 text-green-400 mx-auto mt-2" />}
            </button>

            {/* Time */}
            <button
              onClick={() => toggleElement('time')}
              className={`text-left p-4 rounded-xl border-2 transition-all hover:scale-105 ${getElementColor(elements.time)}`}
            >
              <Clock className={`h-6 w-6 mx-auto mb-2 ${elements.time ? 'text-green-400' : 'text-slate-500'}`} />
              <p className="text-sm font-bold text-white text-center mb-1">Time</p>
              <p className="text-xs text-slate-400 text-center">Session & cycle timing</p>
              {elements.time && <CheckCircle2 className="h-4 w-4 text-green-400 mx-auto mt-2" />}
            </button>

            {/* Sentiment */}
            <button
              onClick={() => toggleElement('sentiment')}
              className={`text-left p-4 rounded-xl border-2 transition-all hover:scale-105 ${getElementColor(elements.sentiment)}`}
            >
              <Heart className={`h-6 w-6 mx-auto mb-2 ${elements.sentiment ? 'text-green-400' : 'text-slate-500'}`} />
              <p className="text-sm font-bold text-white text-center mb-1">Sentiment</p>
              <p className="text-xs text-slate-400 text-center">Fear & greed context</p>
              {elements.sentiment && <CheckCircle2 className="h-4 w-4 text-green-400 mx-auto mt-2" />}
            </button>

            {/* Risk */}
            <button
              onClick={() => toggleElement('risk')}
              className={`text-left p-4 rounded-xl border-2 transition-all hover:scale-105 ${getElementColor(elements.risk)}`}
            >
              <Shield className={`h-6 w-6 mx-auto mb-2 ${elements.risk ? 'text-green-400' : 'text-slate-500'}`} />
              <p className="text-sm font-bold text-white text-center mb-1">Risk</p>
              <p className="text-xs text-slate-400 text-center">Position size & stops</p>
              {elements.risk && <CheckCircle2 className="h-4 w-4 text-green-400 mx-auto mt-2" />}
            </button>
          </div>

          {/* Formula Display */}
          <div className="p-4 bg-cyan-900/30 rounded-xl border border-cyan-500/30">
            <p className="text-center text-lg font-bold text-white mb-4">
              Price + Liquidity + Time + Sentiment + Risk
            </p>
            <Button
              className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700"
              onClick={() => {
                const { score, percentage } = calculateAlignment()
                // You can do something with the score here
              }}
            >
              Check Trade Alignment
            </Button>
          </div>

          {/* Guidance */}
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
            <p className="text-sm text-cyan-200 text-center font-medium mb-3">
              ⚡ <strong>Pro Rule:</strong> Successful trades align ALL five elements. If any is missing, wait for better setup.
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2 bg-green-900/20 rounded-lg border border-green-500/20">
                <p className="text-green-400 font-semibold">5/5 Elements</p>
                <p className="text-slate-400">→ Perfect setup</p>
              </div>
              <div className="p-2 bg-yellow-900/20 rounded-lg border border-yellow-500/20">
                <p className="text-yellow-400 font-semibold">4/5 Elements</p>
                <p className="text-slate-400">→ Good setup</p>
              </div>
              <div className="p-2 bg-orange-900/20 rounded-lg border border-orange-500/20">
                <p className="text-orange-400 font-semibold">3/5 Elements</p>
                <p className="text-slate-400">→ Moderate</p>
              </div>
              <div className="p-2 bg-red-900/20 rounded-lg border border-red-500/20">
                <p className="text-red-400 font-semibold">≤2/5 Elements</p>
                <p className="text-slate-400">→ Skip trade</p>
              </div>
            </div>
          </div>

          {/* Hidden Killers Checklist */}
          <div className="p-4 bg-red-950/50 rounded-xl border border-red-500/30">
            <p className="text-sm font-bold text-red-300 mb-3 text-center">🛑 Hidden Killers - Check Before Trading</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-start gap-2 p-2 bg-slate-900/50 rounded-lg">
                <input type="checkbox" className="mt-1" />
                <span className="text-slate-300">No over-leverage</span>
              </div>
              <div className="flex items-start gap-2 p-2 bg-slate-900/50 rounded-lg">
                <input type="checkbox" className="mt-1" />
                <span className="text-slate-300">High liquidity session</span>
              </div>
              <div className="flex items-start gap-2 p-2 bg-slate-900/50 rounded-lg">
                <input type="checkbox" className="mt-1" />
                <span className="text-slate-300">Respecting HTF bias</span>
              </div>
              <div className="flex items-start gap-2 p-2 bg-slate-900/50 rounded-lg">
                <input type="checkbox" className="mt-1" />
                <span className="text-slate-300">Emotionally stable</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const symbol = searchParams.get('symbol')
    const result = searchParams.get('result')
    const type = searchParams.get('type')

    // Build where clause
    const where: any = {}

    if (symbol) {
      where.cryptocurrency = { symbol }
    }

    if (result && result !== 'ALL') {
      where.result = result
    }

    if (type && type !== 'ALL') {
      where.type = type
    }

    // Fetch signals with cryptocurrency data
    const signals = await db.signal.findMany({
      where,
      include: {
        cryptocurrency: true
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: limit,
      skip: offset
    })

    // Calculate statistics
    const allSignals = await db.signal.findMany({
      where: {
        type: { in: ['BUY', 'SELL'] }
      }
    })

    const executedSignals = allSignals.filter(s => s.executed)
    const winningSignals = executedSignals.filter(s => s.result === 'WIN')
    const losingSignals = executedSignals.filter(s => s.result === 'LOSS')
    const totalProfitLoss = executedSignals.reduce((sum, s) => sum + (s.profitLoss || 0), 0)

    const stats = {
      total: allSignals.length,
      active: allSignals.filter(s => !s.executed).length,
      executed: executedSignals.length,
      wins: winningSignals.length,
      losses: losingSignals.length,
      winRate: executedSignals.length > 0 ? Math.round((winningSignals.length / executedSignals.length) * 100) : 0,
      totalProfitLoss: totalProfitLoss.toFixed(2),
      avgProfitLoss: executedSignals.length > 0 ? (totalProfitLoss / executedSignals.length).toFixed(2) : 0
    }

    return NextResponse.json({
      success: true,
      signals: signals.map(signal => ({
        id: signal.id,
        symbol: signal.cryptocurrency.symbol,
        name: signal.cryptocurrency.name,
        type: signal.type,
        strength: signal.strength,
        confidence: signal.confidence,
        price: signal.price,
        stopLoss: signal.stopLoss,
        takeProfit: signal.takeProfit,
        riskReward: signal.riskReward,
        trendDirection: signal.trendDirection,
        marketStructure: signal.marketStructure,
        reasoning: signal.reasoning,
        indicators: signal.indicators ? JSON.parse(signal.indicators) : [],
        executed: signal.executed,
        result: signal.result,
        resultPrice: signal.resultPrice,
        profitLoss: signal.profitLoss,
        timestamp: signal.timestamp,
        executedAt: signal.executedAt
      })),
      stats
    })
  } catch (error) {
    console.error('Error fetching signal history:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch signal history' },
      { status: 500 }
    )
  }
}

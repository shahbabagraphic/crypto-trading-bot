import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const type = searchParams.get('type') // 'BUY' or 'SELL' or undefined for all

    const where = type ? { type: type as 'BUY' | 'SELL' } : {}

    const signals = await db.signal.findMany({
      where,
      include: {
        cryptocurrency: {
          select: {
            symbol: true,
            name: true,
            price: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: limit
    })

    // Calculate performance statistics
    const executedSignals = signals.filter(s => s.executed)
    const totalExecuted = executedSignals.length
    const totalHits = executedSignals.filter(s => s.profitLoss && s.profitLoss > 0).length
    const totalLosses = executedSignals.filter(s => s.profitLoss && s.profitLoss < 0).length
    const winRate = totalExecuted > 0 ? (totalHits / totalExecuted) * 100 : 0

    // Get overall statistics from database
    const allExecutedSignals = await db.signal.findMany({
      where: { executed: true }
    })

    const overallHits = allExecutedSignals.filter(s => s.profitLoss && s.profitLoss > 0).length
    const overallLosses = allExecutedSignals.filter(s => s.profitLoss && s.profitLoss < 0).length
    const overallWinRate = allExecutedSignals.length > 0
      ? (overallHits / allExecutedSignals.length) * 100
      : 0

    const avgProfit = allExecutedSignals
      .filter(s => s.profitLoss && s.profitLoss > 0)
      .reduce((sum, s) => sum + (s.profitLoss || 0), 0) / (overallHits || 1)

    const avgLoss = allExecutedSignals
      .filter(s => s.profitLoss && s.profitLoss < 0)
      .reduce((sum, s) => sum + (s.profitLoss || 0), 0) / (overallLosses || 1)

    return NextResponse.json({
      signals,
      stats: {
        totalSignals: signals.length,
        totalExecuted,
        totalHits,
        totalLosses,
        winRate: winRate.toFixed(2),
        overall: {
          totalExecuted: allExecutedSignals.length,
          totalHits: overallHits,
          totalLosses: overallLosses,
          winRate: overallWinRate.toFixed(2),
          avgProfit: (avgProfit * 100).toFixed(2),
          avgLoss: (avgLoss * 100).toFixed(2)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching signal history:', error)
    // Return empty data on error
    return NextResponse.json({
      signals: [],
      stats: {
        totalSignals: 0,
        totalExecuted: 0,
        totalHits: 0,
        totalLosses: 0,
        winRate: '0.00',
        overall: {
          totalExecuted: 0,
          totalHits: 0,
          totalLosses: 0,
          winRate: '0.00',
          avgProfit: '0.00',
          avgLoss: '0.00'
        }
      }
    })
  }
}

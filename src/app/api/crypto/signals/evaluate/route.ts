import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Target percentages for signals
const BUY_TARGET_PERCENTAGE = 0.05 // 5% gain for buy signals
const SELL_TARGET_PERCENTAGE = 0.05 // 5% gain for sell signals (by buying back lower)
const LOSS_THRESHOLD = -0.03 // 3% loss threshold

export async function POST(request: NextRequest) {
  try {
    // Get all unexecuted signals that are at least 1 hour old
    const oneHourAgo = new Date(Date.now() - 3600000)

    const unexecutedSignals = await db.signal.findMany({
      where: {
        executed: false,
        timestamp: { lte: oneHourAgo }
      },
      include: {
        cryptocurrency: {
          select: {
            symbol: true,
            price: true
          }
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    })

    let hitCount = 0
    let lossCount = 0
    const updatedSignals = []

    for (const signal of unexecutedSignals) {
      const currentPrice = signal.cryptocurrency.price
      const signalPrice = signal.price
      const priceChange = (currentPrice - signalPrice) / signalPrice

      // Determine if signal hit target or loss
      let executed = false
      let resultPrice: number | null = null
      let profitLoss: number | null = null

      if (signal.type === 'BUY') {
        // For BUY signals: profit if price goes up
        if (priceChange >= BUY_TARGET_PERCENTAGE) {
          executed = true
          resultPrice = currentPrice
          profitLoss = priceChange
          hitCount++
        } else if (priceChange <= LOSS_THRESHOLD) {
          executed = true
          resultPrice = currentPrice
          profitLoss = priceChange
          lossCount++
        }
      } else if (signal.type === 'SELL') {
        // For SELL signals: profit if price goes down
        if (priceChange <= -SELL_TARGET_PERCENTAGE) {
          executed = true
          resultPrice = currentPrice
          profitLoss = Math.abs(priceChange)
          hitCount++
        } else if (priceChange >= Math.abs(LOSS_THRESHOLD)) {
          executed = true
          resultPrice = currentPrice
          profitLoss = -Math.abs(priceChange)
          lossCount++
        }
      }

      // Update signal if executed
      if (executed) {
        const updated = await db.signal.update({
          where: { id: signal.id },
          data: {
            executed: true,
            resultPrice,
            profitLoss,
            executedAt: new Date()
          }
        })
        updatedSignals.push(updated)
      }
    }

    // Calculate overall statistics
    const allSignals = await db.signal.findMany({
      where: { executed: true }
    })

    const totalExecuted = allSignals.length
    const totalHits = allSignals.filter(s => s.profitLoss && s.profitLoss > 0).length
    const totalLosses = allSignals.filter(s => s.profitLoss && s.profitLoss < 0).length
    const winRate = totalExecuted > 0 ? (totalHits / totalExecuted) * 100 : 0

    return NextResponse.json({
      updated: updatedSignals.length,
      hitCount,
      lossCount,
      stats: {
        totalExecuted,
        totalHits,
        totalLosses,
        winRate: winRate.toFixed(2)
      }
    })
  } catch (error) {
    console.error('Error updating signal performance:', error)
    return NextResponse.json(
      { error: 'Failed to update signal performance' },
      { status: 500 }
    )
  }
}

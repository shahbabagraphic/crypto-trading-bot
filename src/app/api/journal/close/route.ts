import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, exitPrice, outcome, notes, lessons } = body

    if (!id || !exitPrice || !outcome) {
      return NextResponse.json(
        { error: 'Trade ID, exit price, and outcome are required' },
        { status: 400 }
      )
    }

    const trade = await db.tradeJournal.findUnique({
      where: { id }
    })

    if (!trade) {
      return NextResponse.json(
        { error: 'Trade not found' },
        { status: 404 }
      )
    }

    // Calculate realized profit
    const realizedProfit = trade.type === 'BUY'
      ? (exitPrice - trade.entryPrice) * trade.amount
      : (trade.entryPrice - exitPrice) * trade.amount

    const realizedProfitPercent = trade.type === 'BUY'
      ? ((exitPrice - trade.entryPrice) / trade.entryPrice) * 100
      : ((trade.entryPrice - exitPrice) / trade.entryPrice) * 100

    const updated = await db.tradeJournal.update({
      where: { id },
      data: {
        exitPrice,
        outcome: outcome.toUpperCase(),
        realizedProfit,
        realizedProfitPercent,
        exitTime: new Date(),
        notes: notes || trade.notes,
        lessons: lessons || trade.lessons,
        updatedAt: new Date()
      },
      include: {
        cryptocurrency: {
          select: {
            symbol: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error closing trade:', error)
    return NextResponse.json(
      { error: 'Failed to close trade' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      symbol, type, entryPrice, amount, stopLoss, takeProfit,
      strategy, notes, emotions, lessons
    } = body

    if (!symbol || !type || !entryPrice || !amount) {
      return NextResponse.json(
        { error: 'Symbol, type, entry price, and amount are required' },
        { status: 400 }
      )
    }

    // Find or create cryptocurrency
    const crypto = await db.cryptocurrency.upsert({
      where: { symbol: symbol.toUpperCase() },
      update: {},
      create: {
        symbol: symbol.toUpperCase(),
        name: symbol.toUpperCase(),
        price: entryPrice,
        change24h: 0,
        volume24h: 0,
        marketCap: 0
      }
    })

    // Calculate position size
    const positionSize = entryPrice * amount

    const trade = await db.tradeJournal.create({
      data: {
        cryptocurrencyId: crypto.id,
        type: type.toUpperCase(),
        entryPrice,
        amount,
        positionSize,
        stopLoss,
        takeProfit,
        strategy,
        notes,
        emotions,
        lessons,
        outcome: 'PENDING',
        entryTime: new Date()
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

    return NextResponse.json(trade)
  } catch (error) {
    console.error('Error adding trade:', error)
    return NextResponse.json(
      { error: 'Failed to add trade' },
      { status: 500 }
    )
  }
}

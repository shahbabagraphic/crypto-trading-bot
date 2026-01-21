import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { symbol, targetPrice, condition } = body

    if (!symbol || !targetPrice || !condition) {
      return NextResponse.json(
        { error: 'Symbol, target price, and condition are required' },
        { status: 400 }
      )
    }

    if (condition !== 'ABOVE' && condition !== 'BELOW') {
      return NextResponse.json(
        { error: 'Condition must be ABOVE or BELOW' },
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
        price: targetPrice,
        change24h: 0,
        volume24h: 0,
        marketCap: 0
      }
    })

    // Check if alert is already triggered
    const priceChange = crypto.price - targetPrice
    const isTriggered = (condition === 'ABOVE' && crypto.price >= targetPrice) ||
                     (condition === 'BELOW' && crypto.price <= targetPrice)

    const alert = await db.priceAlert.create({
      data: {
        cryptocurrencyId: crypto.id,
        targetPrice,
        condition,
        triggered: isTriggered,
        triggeredAt: isTriggered ? new Date() : null
      },
      include: {
        cryptocurrency: {
          select: {
            symbol: true,
            name: true,
            price: true
          }
        }
      }
    })

    return NextResponse.json(alert)
  } catch (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}

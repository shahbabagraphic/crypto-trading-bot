import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { symbol, amount, price, notes } = body

    if (!symbol || !amount || !price) {
      return NextResponse.json(
        { error: 'Symbol, amount, and price are required' },
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
        price: price,
        change24h: 0,
        volume24h: 0,
        marketCap: 0
      }
    })

    // Check if portfolio item already exists
    const existing = await db.portfolio.findFirst({
      where: {
        cryptocurrencyId: crypto.id
      }
    })

    if (existing) {
      // Update existing item (average the price)
      const totalAmount = existing.amount + amount
      const averagePrice = ((existing.amount * existing.averagePrice) + (amount * price)) / totalAmount
      const currentPrice = crypto.price
      const currentValue = totalAmount * currentPrice
      const profitLoss = currentValue - (totalAmount * averagePrice)
      const profitLossPercent = ((currentValue - (totalAmount * averagePrice)) / (totalAmount * averagePrice)) * 100

      const updated = await db.portfolio.update({
        where: { id: existing.id },
        data: {
          amount: totalAmount,
          averagePrice,
          currentPrice,
          currentValue,
          profitLoss,
          profitLossPercent,
          notes: notes || existing.notes,
          updatedAt: new Date()
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

      return NextResponse.json(updated)
    } else {
      // Create new portfolio item
      const currentPrice = crypto.price
      const currentValue = amount * currentPrice
      const profitLoss = currentValue - (amount * price)
      const profitLossPercent = ((currentValue - (amount * price)) / (amount * price)) * 100

      const created = await db.portfolio.create({
        data: {
          cryptocurrencyId: crypto.id,
          amount,
          averagePrice,
          currentPrice,
          currentValue,
          profitLoss,
          profitLossPercent,
          notes
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

      return NextResponse.json(created)
    }
  } catch (error) {
    console.error('Error adding to portfolio:', error)
    return NextResponse.json(
      { error: 'Failed to add to portfolio' },
      { status: 500 }
    )
  }
}

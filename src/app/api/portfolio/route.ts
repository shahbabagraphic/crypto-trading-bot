import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const portfolio = await db.portfolio.findMany({
      include: {
        cryptocurrency: {
          select: {
            symbol: true,
            name: true,
            price: true,
            change24h: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate portfolio statistics
    let totalValue = 0
    let totalProfitLoss = 0

    for (const item of portfolio) {
      // Update current values
      const currentPrice = item.cryptocurrency.price
      const currentValue = item.amount * currentPrice
      const profitLoss = currentValue - (item.amount * item.averagePrice)
      const profitLossPercent = ((currentValue - (item.amount * item.averagePrice)) / (item.amount * item.averagePrice)) * 100

      await db.portfolio.update({
        where: { id: item.id },
        data: {
          currentPrice,
          currentValue,
          profitLoss,
          profitLossPercent,
          updatedAt: new Date()
        }
      })

      totalValue += currentValue
      totalProfitLoss += profitLoss
    }

    // Refresh to get updated values
    const updatedPortfolio = await db.portfolio.findMany({
      include: {
        cryptocurrency: {
          select: {
            symbol: true,
            name: true,
            price: true,
            change24h: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      portfolio: updatedPortfolio,
      stats: {
        totalValue,
        totalProfitLoss,
        totalProfitLossPercent: totalValue > 0 ? (totalProfitLoss / (totalValue - totalProfitLoss)) * 100 : 0,
        totalItems: portfolio.length
      }
    })
  } catch (error) {
    console.error('Error fetching portfolio:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    )
  }
}

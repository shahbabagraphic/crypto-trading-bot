import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const outcome = searchParams.get('outcome') // 'WIN', 'LOSS', 'BREAKEVEN', 'PENDING' or undefined for all

    const where = outcome ? { outcome: outcome as any } : {}

    const trades = await db.tradeJournal.findMany({
      where,
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
        entryTime: 'desc'
      },
      take: limit
    })

    // Calculate statistics
    const allTrades = await db.tradeJournal.findMany({
      where: { outcome: { not: 'PENDING' } }
    })

    const wins = allTrades.filter(t => t.outcome === 'WIN').length
    const losses = allTrades.filter(t => t.outcome === 'LOSS').length
    const breakevens = allTrades.filter(t => t.outcome === 'BREAKEVEN').length
    const winRate = allTrades.length > 0 ? (wins / allTrades.length) * 100 : 0

    return NextResponse.json({
      trades,
      stats: {
        totalTrades: allTrades.length,
        wins,
        losses,
        breakevens,
        winRate: winRate.toFixed(2),
        pending: allTrades.filter(t => t.outcome === 'PENDING').length
      }
    })
  } catch (error) {
    console.error('Error fetching journal:', error)
    return NextResponse.json(
      { error: 'Failed to fetch journal' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const alerts = await db.priceAlert.findMany({
      where: {
        triggered: false
      },
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

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

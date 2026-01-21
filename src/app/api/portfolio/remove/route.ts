import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Portfolio item ID is required' },
        { status: 400 }
      )
    }

    await db.portfolio.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing from portfolio:', error)
    return NextResponse.json(
      { error: 'Failed to remove from portfolio' },
      { status: 500 }
    )
  }
}

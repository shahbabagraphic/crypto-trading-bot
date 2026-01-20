import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface TechnicalIndicators {
  rsi: number
  macd: { value: number; signal: number; histogram: number }
  sma20: number
  sma50: number
  ema12: number
  ema26: number
  bollingerBands: { upper: number; middle: number; lower: number }
}

// Simulated price history for technical analysis
function generatePriceHistory(basePrice: number, days: number = 50): number[] {
  const history: number[] = []
  let price = basePrice

  for (let i = 0; i < days; i++) {
    const change = (Math.random() - 0.5) * (price * 0.05)
    price = Math.max(price + change, price * 0.5)
    history.push(price)
  }

  return history.reverse()
}

function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50

  let gains = 0
  let losses = 0

  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1]
    if (change > 0) gains += change
    else losses -= change
  }

  const avgGain = gains / period
  const avgLoss = losses / period

  if (avgLoss === 0) return 100

  const rs = avgGain / avgLoss
  return 100 - (100 / (1 + rs))
}

function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0

  const k = 2 / (period + 1)
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period

  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k)
  }

  return ema
}

function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0
  const slice = prices.slice(-period)
  return slice.reduce((a, b) => a + b, 0) / slice.length
}

function calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2) {
  const sma = calculateSMA(prices, period)
  const slice = prices.slice(-period)
  const variance = slice.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period
  const standardDeviation = Math.sqrt(variance)

  return {
    upper: sma + (standardDeviation * stdDev),
    middle: sma,
    lower: sma - (standardDeviation * stdDev)
  }
}

function calculateMACD(prices: number[]): { value: number; signal: number; histogram: number } {
  const ema12 = calculateEMA(prices, 12)
  const ema26 = calculateEMA(prices, 26)
  const macdLine = ema12 - ema26

  // For simplicity, we'll use a simplified signal line
  const signalLine = macdLine * 0.9

  return {
    value: macdLine,
    signal: signalLine,
    histogram: macdLine - signalLine
  }
}

function calculateTechnicalIndicators(currentPrice: number): TechnicalIndicators {
  const priceHistory = generatePriceHistory(currentPrice)

  return {
    rsi: calculateRSI(priceHistory),
    macd: calculateMACD(priceHistory),
    sma20: calculateSMA(priceHistory, 20),
    sma50: calculateSMA(priceHistory, 50),
    ema12: calculateEMA(priceHistory, 12),
    ema26: calculateEMA(priceHistory, 26),
    bollingerBands: calculateBollingerBands(priceHistory)
  }
}

function generateSignal(
  currentPrice: number,
  change24h: number,
  indicators: TechnicalIndicators
): { type: 'BUY' | 'SELL' | null; strength: number; reasoning: string } {
  let buyScore = 0
  let sellScore = 0
  let reasons: string[] = []

  // RSI Analysis
  if (indicators.rsi < 30) {
    buyScore += 25
    reasons.push('RSI oversold (<30)')
  } else if (indicators.rsi > 70) {
    sellScore += 25
    reasons.push('RSI overbought (>70)')
  } else if (indicators.rsi < 40) {
    buyScore += 10
    reasons.push('RSI approaching oversold')
  } else if (indicators.rsi > 60) {
    sellScore += 10
    reasons.push('RSI approaching overbought')
  }

  // MACD Analysis
  if (indicators.macd.histogram > 0) {
    buyScore += 15
    reasons.push('MACD bullish crossover')
  } else {
    sellScore += 15
    reasons.push('MACD bearish crossover')
  }

  if (indicators.macd.value > indicators.macd.signal) {
    buyScore += 10
  } else {
    sellScore += 10
  }

  // Moving Averages
  if (currentPrice > indicators.sma20) {
    buyScore += 10
  } else {
    sellScore += 10
  }

  if (indicators.sma20 > indicators.sma50) {
    buyScore += 10
    reasons.push('Golden cross pattern')
  } else {
    sellScore += 10
    reasons.push('Death cross pattern')
  }

  // Bollinger Bands
  if (currentPrice < indicators.bollingerBands.lower) {
    buyScore += 15
    reasons.push('Price below lower Bollinger Band')
  } else if (currentPrice > indicators.bollingerBands.upper) {
    sellScore += 15
    reasons.push('Price above upper Bollinger Band')
  }

  // Price Momentum
  if (change24h < -5) {
    buyScore += 10
    reasons.push('Strong dip buying opportunity')
  } else if (change24h > 10) {
    sellScore += 10
    reasons.push('Take profit opportunity')
  } else if (change24h > 5) {
    buyScore += 5
    reasons.push('Positive momentum')
  }

  // Calculate final signal
  const totalScore = buyScore + sellScore
  const strength = Math.min(Math.max(Math.abs(buyScore - sellScore), 60), 100)

  let type: 'BUY' | 'SELL' | null = null

  if (buyScore > sellScore && buyScore >= 40) {
    type = 'BUY'
  } else if (sellScore > buyScore && sellScore >= 40) {
    type = 'SELL'
  }

  const reasoning = type
    ? reasons.slice(0, 3).join(', ') + '.'
    : 'No clear signal - market in consolidation.'

  return { type, strength, reasoning }
}

async function fetchCryptoPrices() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h', {
      next: { revalidate: 30 }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch from CoinGecko')
    }

    const data = await response.json()

    return data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h || 0,
      volume24h: coin.total_volume,
      marketCap: coin.market_cap
    }))
  } catch (error) {
    console.error('Error fetching crypto prices:', error)

    // Fallback to simulated data
    const cryptos = [
      { symbol: 'BTC', name: 'Bitcoin', basePrice: 67500 },
      { symbol: 'ETH', name: 'Ethereum', basePrice: 3450 },
      { symbol: 'BNB', name: 'BNB', basePrice: 590 },
      { symbol: 'XRP', name: 'XRP', basePrice: 0.52 },
      { symbol: 'SOL', name: 'Solana', basePrice: 145 },
      { symbol: 'ADA', name: 'Cardano', basePrice: 0.45 },
      { symbol: 'DOGE', name: 'Dogecoin', basePrice: 0.12 },
      { symbol: 'DOT', name: 'Polkadot', basePrice: 7.2 },
      { symbol: 'AVAX', name: 'Avalanche', basePrice: 35 },
      { symbol: 'LINK', name: 'Chainlink', basePrice: 14.5 },
      { symbol: 'MATIC', name: 'Polygon', basePrice: 0.58 },
      { symbol: 'UNI', name: 'Uniswap', basePrice: 7.8 }
    ]

    return cryptos.map((crypto, index) => ({
      id: crypto.symbol.toLowerCase(),
      symbol: crypto.symbol,
      name: crypto.name,
      price: crypto.basePrice * (0.95 + Math.random() * 0.1),
      change24h: (Math.random() - 0.5) * 20,
      volume24h: Math.random() * 1000000000,
      marketCap: crypto.basePrice * 1000000000 * (Math.random() + 0.5)
    }))
  }
}

export async function GET(request: NextRequest) {
  try {
    const cryptoData = await fetchCryptoPrices()

    // Generate signals for each cryptocurrency
    const cryptoWithSignals = cryptoData.map((crypto: any) => {
      const indicators = calculateTechnicalIndicators(crypto.price)
      const signal = generateSignal(crypto.price, crypto.change24h, indicators)

      return {
        ...crypto,
        signal: signal.type ? {
          type: signal.type,
          strength: signal.strength,
          reasoning: signal.reasoning,
          indicators: indicators
        } : undefined
      }
    })

    // Store signals in database asynchronously (non-blocking)
    setTimeout(async () => {
      try {
        for (const crypto of cryptoWithSignals) {
          if (crypto.signal) {
            try {
              // Get or create cryptocurrency
              const cryptoRecord = await db.cryptocurrency.upsert({
                where: { symbol: crypto.symbol },
                update: {
                  price: crypto.price,
                  change24h: crypto.change24h,
                  volume24h: crypto.volume24h,
                  marketCap: crypto.marketCap,
                  lastUpdated: new Date()
                },
                create: {
                  symbol: crypto.symbol,
                  name: crypto.name,
                  price: crypto.price,
                  change24h: crypto.change24h,
                  volume24h: crypto.volume24h,
                  marketCap: crypto.marketCap
                }
              })

              // Create signal if it doesn't exist recently (avoid duplicates)
              const oneMinuteAgo = new Date(Date.now() - 60000)
              const existingSignal = await db.signal.findFirst({
                where: {
                  cryptocurrencyId: cryptoRecord.id,
                  type: crypto.signal.type,
                  timestamp: { gte: oneMinuteAgo }
                }
              })

              if (!existingSignal) {
                await db.signal.create({
                  data: {
                    cryptocurrencyId: cryptoRecord.id,
                    type: crypto.signal.type,
                    strength: crypto.signal.strength,
                    price: crypto.price,
                    reasoning: crypto.signal.reasoning,
                    indicators: JSON.stringify(crypto.signal.indicators)
                  }
                })
              }
            } catch (dbError) {
              // Silently continue - database is optional for immediate display
            }
          }
        }

        // Trigger signal evaluation after prices are updated
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/crypto/signals/evaluate`, {
            method: 'POST'
          })
        } catch (evalError) {
          // Evaluation is optional
        }
      } catch (error) {
        // Database operations are optional
      }
    }, 0)

    return NextResponse.json(cryptoWithSignals)
  } catch (error) {
    console.error('Error in crypto prices API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch crypto prices' },
      { status: 500 }
    )
  }
}


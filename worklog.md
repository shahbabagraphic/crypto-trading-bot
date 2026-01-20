---
Task ID: 14-17
Agent: Z.ai Code
Task: Add Price Alerts, Trading Journal, Risk Calculator, and DCA tools for professional traders

Work Log:
- Added PriceAlert model to Prisma schema with fields: targetPrice, condition (ABOVE/BELOW), triggered, triggeredAt
- Added TradeJournal model to Prisma schema with fields: type, entryPrice, exitPrice, amount, positionSize, stopLoss, takeProfit, realizedProfit, realizedProfitPercent, strategy, outcome, notes, emotions, lessons, entryTime, exitTime
- Updated Cryptocurrency model to include relations for priceAlerts and tradeJournals
- Created `/api/alerts` GET endpoint to fetch active price alerts
- Created `/api/alerts/add` POST endpoint to create new price alerts with condition detection
- Created `/api/alerts/remove` POST endpoint to remove alerts
- Created `/api/journal` GET endpoint to fetch trade journal with statistics (wins, losses, breakevens, win rate, pending)
- Created `/api/journal/add` POST endpoint to log new trades with full details
- Created `/api/journal/close` POST endpoint to close pending trades with exit details and outcomes
- Risk Management Calculator: calculates position size based on account balance, risk %, and stop loss % - Shows position size, risk amount, shares/units to trade
- DCA Calculator: calculates average buy price for Dollar Cost Averaging strategy - Shows avg price, total value, current investment
- Trading Journal features: log trades (BUY/SELL), set stop loss/take profit, record emotions, track strategies, add notes, close trades with WIN/LOSS/BREAKEVEN outcomes
- Enhanced stats dashboard to show total alerts count alongside other metrics
- 8 Professional tabs: Signals, All Coins, History, Alerts, Journal, Portfolio, Risk Calculator, DCA Calculator
- Trade journal shows visual indicators: green for WIN, red for LOSS, yellow for BREAKEVEN, gray for PENDING
- Alerts feature supports both ABOVE and BELOW conditions
- All tools integrate with toast notifications for user feedback

Stage Summary:
- Complete professional trading platform
- Price Alerts system for monitoring market movements
- Trading Journal with psychology tracking
- Risk Management Calculator for position sizing
- DCA Calculator for investment planning
- 8 comprehensive trading tools in one platform
- Real-time data updates across all features
- Professional-grade UI with visual indicators

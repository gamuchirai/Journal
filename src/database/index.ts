import * as SQLite from 'expo-sqlite';
import { Trade, UserPreferences, TradeOutcomes } from '../types';
import { FOREX_PAIRS, TIMEFRAMES, DEFAULT_CONTEXTS } from '../constants';

let db: SQLite.Database;

export const initializeDatabase = async () => {
  db = await SQLite.openDatabaseAsync('tradeflow.db');
  await createTables();
  await seedDefaultData();
};

const createTables = async () => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS trades (
      id TEXT PRIMARY KEY,
      date INTEGER NOT NULL,
      market TEXT NOT NULL,
      timeframe TEXT NOT NULL,
      bias TEXT NOT NULL,
      narrative TEXT NOT NULL,
      context TEXT NOT NULL,
      entry TEXT NOT NULL,
      stop TEXT NOT NULL,
      target TEXT NOT NULL,
      riskReward TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      biasPlayedOut INTEGER,
      narrativePlayedOut INTEGER,
      contextHeld INTEGER,
      entryExecuted INTEGER,
      riskManaged INTEGER,
      screenshotUri TEXT,
      thumbnailUri TEXT,
      pnl TEXT,
      whatWentRight TEXT,
      whatWentWrong TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_preferences (
      id INTEGER PRIMARY KEY,
      defaultTimeframe TEXT,
      recentMarkets TEXT,
      recentContexts TEXT,
      updatedAt INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_trades_date ON trades(date);
    CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
    CREATE INDEX IF NOT EXISTS idx_trades_market ON trades(market);
  `);
};

const seedDefaultData = async () => {
  try {
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM user_preferences'
    );

    if (!result || result.count === 0) {
      await db.runAsync(
        `INSERT INTO user_preferences (defaultTimeframe, recentMarkets, recentContexts, updatedAt)
         VALUES (?, ?, ?, ?)`,
        [
          TIMEFRAMES[4], // 1h default
          JSON.stringify(FOREX_PAIRS.slice(0, 5)),
          JSON.stringify(DEFAULT_CONTEXTS.slice(0, 5)),
          Date.now(),
        ]
      );
    }
  } catch (error) {
    console.error('Error seeding preferences:', error);
  }
};

export const createTrade = async (trade: Trade) => {
  const now = Date.now();
  const id = trade.id || `trade_${now}_${Math.random().toString(36).substr(2, 9)}`;

  await db.runAsync(
    `INSERT INTO trades (
      id, date, market, timeframe, bias, narrative, context, entry,
      stop, target, riskReward, status, screenshotUri, thumbnailUri,
      pnl, whatWentRight, whatWentWrong, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      trade.date,
      trade.market,
      trade.timeframe,
      trade.bias,
      trade.narrative,
      trade.context,
      trade.entry,
      trade.risk.stop,
      trade.risk.target,
      trade.risk.riskReward,
      trade.status,
      trade.screenshotUri,
      trade.thumbnailUri,
      trade.pnl,
      trade.notes.whatWentRight,
      trade.notes.whatWentWrong,
      now,
      now,
    ]
  );

  // Update recent markets
  await updateRecentMarket(trade.market);
  await updateRecentContext(trade.context);

  return id;
};

export const updateTrade = async (trade: Trade) => {
  const now = Date.now();

  await db.runAsync(
    `UPDATE trades SET
      date = ?, market = ?, timeframe = ?, bias = ?, narrative = ?,
      context = ?, entry = ?, stop = ?, target = ?, riskReward = ?,
      status = ?, biasPlayedOut = ?, narrativePlayedOut = ?,
      contextHeld = ?, entryExecuted = ?, riskManaged = ?,
      screenshotUri = ?, thumbnailUri = ?, pnl = ?,
      whatWentRight = ?, whatWentWrong = ?, updatedAt = ?
     WHERE id = ?`,
    [
      trade.date,
      trade.market,
      trade.timeframe,
      trade.bias,
      trade.narrative,
      trade.context,
      trade.entry,
      trade.risk.stop,
      trade.risk.target,
      trade.risk.riskReward,
      trade.status,
      trade.outcomes.biasPlayedOut ? 1 : trade.outcomes.biasPlayedOut === false ? 0 : null,
      trade.outcomes.narrativePlayedOut ? 1 : trade.outcomes.narrativePlayedOut === false ? 0 : null,
      trade.outcomes.contextHeld ? 1 : trade.outcomes.contextHeld === false ? 0 : null,
      trade.outcomes.entryExecuted ? 1 : trade.outcomes.entryExecuted === false ? 0 : null,
      trade.outcomes.riskManaged ? 1 : trade.outcomes.riskManaged === false ? 0 : null,
      trade.screenshotUri,
      trade.thumbnailUri,
      trade.pnl,
      trade.notes.whatWentRight,
      trade.notes.whatWentWrong,
      now,
      trade.id,
    ]
  );

  await updateRecentMarket(trade.market);
  await updateRecentContext(trade.context);
};

export const getTrade = async (id: string): Promise<Trade | null> => {
  const row = await db.getFirstAsync(
    'SELECT * FROM trades WHERE id = ?',
    [id]
  );

  if (!row) return null;

  return rowToTrade(row as any);
};

export const getAllTrades = async (status?: string): Promise<Trade[]> => {
  const query = status
    ? 'SELECT * FROM trades WHERE status = ? ORDER BY date DESC'
    : 'SELECT * FROM trades ORDER BY date DESC';

  const rows = await db.getAllAsync(query, status ? [status] : []);

  return rows.map(row => rowToTrade(row as any));
};

export const getTradesByMarket = async (market: string): Promise<Trade[]> => {
  const rows = await db.getAllAsync(
    'SELECT * FROM trades WHERE market = ? ORDER BY date DESC',
    [market]
  );

  return rows.map(row => rowToTrade(row as any));
};

export const getRecentTrades = async (limit: number = 10): Promise<Trade[]> => {
  const rows = await db.getAllAsync(
    'SELECT * FROM trades WHERE status IN (?, ?, ?) ORDER BY date DESC LIMIT ?',
    ['active', 'closed', 'reviewed', limit]
  );

  return rows.map(row => rowToTrade(row as any));
};

export const deleteTrade = async (id: string) => {
  await db.runAsync('DELETE FROM trades WHERE id = ?', [id]);
};

export const getUserPreferences = async (): Promise<UserPreferences> => {
  const row = await db.getFirstAsync(
    'SELECT * FROM user_preferences LIMIT 1'
  );

  if (!row) {
    return {
      defaultTimeframe: TIMEFRAMES[4],
      recentMarkets: FOREX_PAIRS.slice(0, 5),
      recentContexts: DEFAULT_CONTEXTS.slice(0, 5),
    };
  }

  return {
    defaultTimeframe: (row as any).defaultTimeframe,
    recentMarkets: JSON.parse((row as any).recentMarkets),
    recentContexts: JSON.parse((row as any).recentContexts),
  };
};

const updateRecentMarket = async (market: string) => {
  const prefs = await getUserPreferences();
  const markets = prefs.recentMarkets.filter(m => m !== market);
  markets.unshift(market);
  if (markets.length > 5) markets.pop();

  await db.runAsync(
    'UPDATE user_preferences SET recentMarkets = ?, updatedAt = ?',
    [JSON.stringify(markets), Date.now()]
  );
};

const updateRecentContext = async (context: string) => {
  const prefs = await getUserPreferences();
  const contexts = prefs.recentContexts.filter(c => c !== context);
  contexts.unshift(context);
  if (contexts.length > 5) contexts.pop();

  await db.runAsync(
    'UPDATE user_preferences SET recentContexts = ?, updatedAt = ?',
    [JSON.stringify(contexts), Date.now()]
  );
};

// Analytics queries
export const getWinRate = async (): Promise<number> => {
  const result = await db.getFirstAsync(
    `SELECT
      COUNT(CASE WHEN pnl IS NOT NULL AND pnl != '' THEN 1 END) as total,
      COUNT(CASE WHEN pnl IS NOT NULL AND pnl != '' AND CAST(pnl AS REAL) > 0 THEN 1 END) as wins
     FROM trades WHERE status IN ('closed', 'reviewed')`
  ) as any;

  if (!result || result.total === 0) return 0;
  return (result.wins / result.total) * 100;
};

export const getBlockSuccessRates = async () => {
  const result = await db.getFirstAsync(`
    SELECT
      COUNT(CASE WHEN biasPlayedOut = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN biasPlayedOut IS NOT NULL THEN 1 END), 0) as biasRate,
      COUNT(CASE WHEN narrativePlayedOut = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN narrativePlayedOut IS NOT NULL THEN 1 END), 0) as narrativeRate,
      COUNT(CASE WHEN contextHeld = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN contextHeld IS NOT NULL THEN 1 END), 0) as contextRate,
      COUNT(CASE WHEN entryExecuted = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN entryExecuted IS NOT NULL THEN 1 END), 0) as entryRate,
      COUNT(CASE WHEN riskManaged = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN riskManaged IS NOT NULL THEN 1 END), 0) as riskRate
     FROM trades WHERE status IN ('closed', 'reviewed')
  `) as any;

  return {
    bias: Math.round(result?.biasRate || 0),
    narrative: Math.round(result?.narrativeRate || 0),
    context: Math.round(result?.contextRate || 0),
    entry: Math.round(result?.entryRate || 0),
    risk: Math.round(result?.riskRate || 0),
  };
};

const rowToTrade = (row: any): Trade => {
  return {
    id: row.id,
    date: row.date,
    market: row.market,
    timeframe: row.timeframe,
    bias: row.bias,
    narrative: row.narrative,
    context: row.context,
    entry: row.entry,
    risk: {
      stop: row.stop,
      target: row.target,
      riskReward: row.riskReward,
    },
    status: row.status,
    outcomes: {
      biasPlayedOut: row.biasPlayedOut === null ? null : row.biasPlayedOut === 1,
      narrativePlayedOut: row.narrativePlayedOut === null ? null : row.narrativePlayedOut === 1,
      contextHeld: row.contextHeld === null ? null : row.contextHeld === 1,
      entryExecuted: row.entryExecuted === null ? null : row.entryExecuted === 1,
      riskManaged: row.riskManaged === null ? null : row.riskManaged === 1,
    },
    screenshotUri: row.screenshotUri,
    thumbnailUri: row.thumbnailUri,
    pnl: row.pnl,
    notes: {
      whatWentRight: row.whatWentRight,
      whatWentWrong: row.whatWentWrong,
    },
  };
};

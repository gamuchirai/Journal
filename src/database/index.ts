import { Platform } from 'react-native';
import { openDatabaseAsync } from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';
import { Trade, UserPreferences, TradeOutcomes, BiasData, NarrativeData, EntryData } from '../types';
import { FOREX_PAIRS, TIMEFRAMES, DEFAULT_CONTEXTS } from '../constants';

const isWeb = Platform.OS === 'web';
const WEB_STORE_KEY = 'tradeflow_web_store';

type WebStore = {
  trades: Trade[];
  preferences: UserPreferences;
};

let webStoreMemory: WebStore | null = null;
let db: SQLiteDatabase | null = null;
let dbInitialized = false;
let initializationPromise: Promise<void> | null = null;

const getDefaultPreferences = (): UserPreferences => ({
  defaultTimeframe: TIMEFRAMES[4],
  recentMarkets: FOREX_PAIRS.slice(0, 5),
  recentContexts: DEFAULT_CONTEXTS.slice(0, 5),
});

const getWebStore = (): WebStore => {
  if (typeof window === 'undefined' || !window.localStorage) {
    if (!webStoreMemory) {
      webStoreMemory = { trades: [], preferences: getDefaultPreferences() };
    }
    return webStoreMemory;
  }

  const raw = window.localStorage.getItem(WEB_STORE_KEY);
  if (!raw) {
    const initial = { trades: [], preferences: getDefaultPreferences() };
    window.localStorage.setItem(WEB_STORE_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    const parsed = JSON.parse(raw) as WebStore;
    return {
      trades: parsed.trades || [],
      preferences: parsed.preferences || getDefaultPreferences(),
    };
  } catch {
    const initial = { trades: [], preferences: getDefaultPreferences() };
    window.localStorage.setItem(WEB_STORE_KEY, JSON.stringify(initial));
    return initial;
  }
};

const saveWebStore = (store: WebStore) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    webStoreMemory = store;
    return;
  }

  window.localStorage.setItem(WEB_STORE_KEY, JSON.stringify(store));
};

export const initializeDatabase = async () => {
  console.log('[DB INIT] initializeDatabase called');
  console.log('[DB INIT] isWeb:', isWeb);
  
  // If already initialized or initializing, wait for it
  if (dbInitialized) {
    console.log('[DB INIT] Database already initialized, returning');
    return;
  }
  if (initializationPromise) {
    console.log('[DB INIT] Database initialization in progress, waiting...');
    return initializationPromise;
  }

  if (isWeb) {
    console.log('[DB INIT] Platform is WEB, initializing web store');
    try {
      const store = getWebStore();
      console.log('[DB INIT] Web store loaded, trades count:', store.trades.length);
      dbInitialized = true;
      console.log('[DB INIT] Web database ready');
      return;
    } catch (error) {
      console.error('[DB INIT] Error loading web store:', error);
      throw error;
    }
  }

  console.log('[DB INIT] Platform is NATIVE, initializing SQLite');
  
  initializationPromise = (async () => {
    try {
      console.log('[DB INIT] Starting SQLite initialization...');

      db = await openDatabaseAsync('tradeflow.db');

      if (!db) {
        throw new Error('Failed to open database - returned null');
      }

      console.log('[DB INIT] Calling createTables...');
      await createTables();
      console.log('[DB INIT] Tables created successfully');
      
      console.log('[DB INIT] Calling seedDefaultData...');
      await seedDefaultData();
      console.log('[DB INIT] Default data seeded successfully');
      
      dbInitialized = true;
      console.log('[DB INIT] Database initialized successfully');
    } catch (error) {
      console.error('[DB INIT] Failed to initialize database:', error);
      console.error('[DB INIT] Error stack:', error instanceof Error ? error.stack : 'No stack');
      db = null;
      dbInitialized = false;
      throw error;
    } finally {
      initializationPromise = null;
    }
  })();

  return initializationPromise;
};

const ensureDbReady = async () => {
  if (isWeb) return;
  
  if (!dbInitialized) {
    await initializeDatabase();
  }
  
  if (!db) {
    throw new Error('Database not initialized');
  }
};

const createTables = async () => {
  if (!db) return;
  
  console.log('Creating/updating database tables...');
  
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
      stop TEXT,
      target TEXT,
      riskReward TEXT,
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
  if (!db) return;
  try {
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM user_preferences'
    );

    if (!result || result.count === 0) {
      await db.runAsync(
        `INSERT INTO user_preferences (defaultTimeframe, recentMarkets, recentContexts, updatedAt)
         VALUES (?, ?, ?, ?)`,
        TIMEFRAMES[4],
        JSON.stringify(FOREX_PAIRS.slice(0, 5)),
        JSON.stringify(DEFAULT_CONTEXTS.slice(0, 5)),
        Date.now()
      );
    }
  } catch (error) {
    console.error('Error seeding preferences:', error);
    // Try to insert anyway if the error was from querying
    try {
      await db.runAsync(
        `INSERT OR IGNORE INTO user_preferences (id, defaultTimeframe, recentMarkets, recentContexts, updatedAt)
         VALUES (1, ?, ?, ?, ?)`,
        TIMEFRAMES[4],
        JSON.stringify(FOREX_PAIRS.slice(0, 5)),
        JSON.stringify(DEFAULT_CONTEXTS.slice(0, 5)),
        Date.now()
      );
    } catch (insertError) {
      console.error('Error inserting default preferences:', insertError);
    }
  }
};

export const createTrade = async (trade: Trade) => {
  console.log('=== DB: createTrade called ===');
  const now = Date.now();
  const id = trade.id || `trade_${now}_${Math.random().toString(36).substr(2, 9)}`;
  console.log('Trade ID:', id);
  console.log('[DB] createTrade image fields', {
    screenshotUri: trade.screenshotUri,
    thumbnailUri: trade.thumbnailUri,
  });

  // Serialize structured data to JSON strings
  const biasJson = typeof trade.bias === 'object' ? JSON.stringify(trade.bias) : trade.bias;
  const narrativeJson = typeof trade.narrative === 'object' ? JSON.stringify(trade.narrative) : trade.narrative;
  const entryJson = typeof trade.entry === 'object' ? JSON.stringify(trade.entry) : trade.entry;
  const contextStr = trade.context || '';

  if (isWeb) {
    console.log('Using web storage');
    const store = getWebStore();
    const newTrade: Trade = {
      ...trade,
      id,
    };
    store.trades = [newTrade, ...store.trades.filter(t => t.id !== id)];
    saveWebStore(store);
    await updateRecentMarket(trade.market);
    console.log('=== DB: createTrade completed (web) ===');
    return id;
  }

  console.log('Using SQLite database');
  await ensureDbReady();
  console.log('Database ready, inserting trade...');

  await db!.runAsync(
    `INSERT INTO trades (
      id, date, market, timeframe, bias, narrative, context, entry,
      stop, target, riskReward, status, biasPlayedOut, narrativePlayedOut,
      contextHeld, entryExecuted, riskManaged, screenshotUri, thumbnailUri,
      pnl, whatWentRight, whatWentWrong, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    trade.date,
    trade.market,
    trade.timeframe,
    biasJson,
    narrativeJson,
    contextStr,
    entryJson,
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
    now
  );

  console.log('Trade inserted into database');
  
  // Update recent markets
  await updateRecentMarket(trade.market);

  console.log('=== DB: createTrade completed ===');
  return id;
};

export const updateTrade = async (trade: Trade) => {
  console.log('=== DB: updateTrade called ===');
  console.log('Trade ID:', trade.id);
  console.log('[DB] updateTrade image fields', {
    screenshotUri: trade.screenshotUri,
    thumbnailUri: trade.thumbnailUri,
  });
  const now = Date.now();

  // Serialize structured data to JSON strings
  const biasJson = typeof trade.bias === 'object' ? JSON.stringify(trade.bias) : trade.bias;
  const narrativeJson = typeof trade.narrative === 'object' ? JSON.stringify(trade.narrative) : trade.narrative;
  const entryJson = typeof trade.entry === 'object' ? JSON.stringify(trade.entry) : trade.entry;
  const contextStr = trade.context || '';

  if (isWeb) {
    console.log('Using web storage');
    const store = getWebStore();
    store.trades = store.trades.map(t => (t.id === trade.id ? { ...trade } : t));
    saveWebStore(store);
    await updateRecentMarket(trade.market);
    console.log('=== DB: updateTrade completed (web) ===');
    return;
  }

  console.log('Using SQLite database');
  await ensureDbReady();
  console.log('Database ready, updating trade...');

  await db!.runAsync(
    `UPDATE trades SET
      date = ?, market = ?, timeframe = ?, bias = ?, narrative = ?,
      context = ?, entry = ?, stop = ?, target = ?, riskReward = ?,
      status = ?, biasPlayedOut = ?, narrativePlayedOut = ?,
      contextHeld = ?, entryExecuted = ?, riskManaged = ?,
      screenshotUri = ?, thumbnailUri = ?, pnl = ?,
      whatWentRight = ?, whatWentWrong = ?, updatedAt = ?
     WHERE id = ?`,
    trade.date,
    trade.market,
    trade.timeframe,
    biasJson,
    narrativeJson,
    contextStr,
    entryJson,
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
    trade.id
  );

  console.log('Trade updated in database');
  await updateRecentMarket(trade.market);
  console.log('=== DB: updateTrade completed ===');
};

export const getTrade = async (id: string): Promise<Trade | null> => {
  console.log('[DB] getTrade called with id:', id);
  if (isWeb) {
    console.log('[DB] getTrade using web store');
    const store = getWebStore();
    const found = store.trades.find(t => t.id === id) || null;
    console.log('[DB] getTrade web result:', found ? 'Found' : 'Not found');
    return found;
  }

  await ensureDbReady();

  try {
    console.log('[DB] getTrade querying SQLite');
    const row = await db!.getFirstAsync(
      'SELECT * FROM trades WHERE id = ?',
      id
    );

    if (!row) {
      console.log('[DB] getTrade no result from query');
      return null;
    }

    console.log('[DB] getTrade found result, converting to Trade');
    return rowToTrade(row as any);
  } catch (error) {
    console.error('[DB] getTrade error:', error);
    return null;
  }
};

export const getAllTrades = async (status?: string): Promise<Trade[]> => {
  console.log('[DB] getAllTrades called with status:', status);
  if (isWeb) {
    console.log('[DB] getAllTrades using web store');
    const store = getWebStore();
    const trades = status ? store.trades.filter(t => t.status === status) : store.trades;
    console.log('[DB] getAllTrades web found:', trades.length, 'trades');
    return [...trades].sort((a, b) => b.date - a.date);
  }

  await ensureDbReady();

  try {
    console.log('[DB] getAllTrades querying SQLite');
    const query = status
      ? 'SELECT * FROM trades WHERE status = ? ORDER BY date DESC'
      : 'SELECT * FROM trades ORDER BY date DESC';

    const rows = status
      ? await db!.getAllAsync(query, status)
      : await db!.getAllAsync(query);

    console.log('[DB] getAllTrades query returned:', rows.length, 'rows');
    return rows.map((row: any) => rowToTrade(row as any));
  } catch (error) {
    console.error('[DB] getAllTrades error:', error);
    return [];
  }
};

export const getTradesByMarket = async (market: string): Promise<Trade[]> => {
  if (isWeb) {
    const store = getWebStore();
    return store.trades
      .filter(t => t.market === market)
      .sort((a, b) => b.date - a.date);
  }

  await ensureDbReady();

  const rows = await db!.getAllAsync(
    'SELECT * FROM trades WHERE market = ? ORDER BY date DESC',
    market
  );

  return rows.map((row: any) => rowToTrade(row as any));
};

export const getRecentTrades = async (limit: number = 10): Promise<Trade[]> => {
  if (isWeb) {
    const store = getWebStore();
    return store.trades
      .filter(t => ['active', 'closed', 'reviewed'].includes(t.status))
      .sort((a, b) => b.date - a.date)
      .slice(0, limit);
  }

  await ensureDbReady();

  const rows = await db!.getAllAsync(
    'SELECT * FROM trades WHERE status IN (?, ?, ?) ORDER BY date DESC LIMIT ?',
    'active',
    'closed',
    'reviewed',
    limit as any
  );

  return rows.map((row: any) => rowToTrade(row as any));
};

export const deleteTrade = async (id: string) => {
  if (isWeb) {
    const store = getWebStore();
    store.trades = store.trades.filter(t => t.id !== id);
    saveWebStore(store);
    return;
  }

  await ensureDbReady();
  await db!.runAsync('DELETE FROM trades WHERE id = ?', id);
};

export const getUserPreferences = async (): Promise<UserPreferences> => {
  if (isWeb) {
    const store = getWebStore();
    return store.preferences || getDefaultPreferences();
  }

  await ensureDbReady();

  try {
    const row = await db!.getFirstAsync(
      'SELECT * FROM user_preferences LIMIT 1'
    );

    if (!row) {
      return getDefaultPreferences();
    }

    return {
      defaultTimeframe: (row as any).defaultTimeframe,
      recentMarkets: JSON.parse((row as any).recentMarkets),
      recentContexts: JSON.parse((row as any).recentContexts),
    };
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return getDefaultPreferences();
  }
};

const updateRecentMarket = async (market: string) => {
  const prefs = await getUserPreferences();
  const markets = prefs.recentMarkets.filter(m => m !== market);
  markets.unshift(market);
  if (markets.length > 5) markets.pop();

  if (isWeb) {
    const store = getWebStore();
    store.preferences = { ...prefs, recentMarkets: markets };
    saveWebStore(store);
    return;
  }

  await ensureDbReady();

  await db!.runAsync(
    'UPDATE user_preferences SET recentMarkets = ?, updatedAt = ?',
    JSON.stringify(markets),
    Date.now()
  );
};

const updateRecentContext = async (context: string) => {
  const prefs = await getUserPreferences();
  const contexts = prefs.recentContexts.filter(c => c !== context);
  contexts.unshift(context);
  if (contexts.length > 5) contexts.pop();

  if (isWeb) {
    const store = getWebStore();
    store.preferences = { ...prefs, recentContexts: contexts };
    saveWebStore(store);
    return;
  }

  await ensureDbReady();

  await db!.runAsync(
    'UPDATE user_preferences SET recentContexts = ?, updatedAt = ?',
    JSON.stringify(contexts),
    Date.now()
  );
};

// Analytics queries
export const getWinRate = async (): Promise<number> => {
  console.log('[DB] getWinRate called');
  if (isWeb) {
    console.log('[DB] getWinRate using web store');
    const store = getWebStore();
    const closedTrades = store.trades.filter(t => ['closed', 'reviewed'].includes(t.status));
    console.log('[DB] getWinRate closed trades:', closedTrades.length);
    if (closedTrades.length === 0) {
      console.log('[DB] getWinRate returning 0 (no closed trades)');
      return 0;
    }
    const wins = closedTrades.filter(
      t =>
        t.outcomes.biasPlayedOut === true &&
        t.outcomes.narrativePlayedOut === true &&
        t.outcomes.contextHeld === true &&
        t.outcomes.entryExecuted === true &&
        t.outcomes.riskManaged === true
    ).length;
    const rate = (wins / closedTrades.length) * 100;
    console.log('[DB] getWinRate computed web rate:', rate);
    return rate;
  }

  await ensureDbReady();

  try {
    console.log('[DB] getWinRate querying SQLite');
    const result = await db!.getFirstAsync(
      `SELECT
        COUNT(*) as total,
        COUNT(
          CASE
            WHEN biasPlayedOut = 1
              AND narrativePlayedOut = 1
              AND contextHeld = 1
              AND entryExecuted = 1
              AND riskManaged = 1
            THEN 1
          END
        ) as wins
       FROM trades WHERE status IN ('closed', 'reviewed')`
    ) as any;

    console.log('[DB] getWinRate query result:', result);
    if (!result || result.total === 0) {
      console.log('[DB] getWinRate returning 0 (no results)');
      return 0;
    }
    const rate = (result.wins / result.total) * 100;
    console.log('[DB] getWinRate computed SQLite rate:', rate);
    return rate;
  } catch (error) {
    console.error('[DB] getWinRate error:', error);
    return 0;
  }
};

export const getBlockSuccessRates = async () => {
  if (isWeb) {
    const store = getWebStore();
    const rate = (items: (boolean | null)[]) => {
      const defined = items.filter(v => v !== null) as boolean[];
      if (defined.length === 0) return 0;
      const wins = defined.filter(Boolean).length;
      return Math.round((wins / defined.length) * 100);
    };

    return {
      bias: rate(store.trades.map(t => t.outcomes.biasPlayedOut ?? null)),
      narrative: rate(store.trades.map(t => t.outcomes.narrativePlayedOut ?? null)),
      context: rate(store.trades.map(t => t.outcomes.contextHeld ?? null)),
      entry: rate(store.trades.map(t => t.outcomes.entryExecuted ?? null)),
      risk: rate(store.trades.map(t => t.outcomes.riskManaged ?? null)),
    };
  }

  await ensureDbReady();

  const result = await db!.getFirstAsync(`
    SELECT
      COUNT(CASE WHEN biasPlayedOut = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN biasPlayedOut IS NOT NULL THEN 1 END), 0) as biasRate,
      COUNT(CASE WHEN narrativePlayedOut = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN narrativePlayedOut IS NOT NULL THEN 1 END), 0) as narrativeRate,
      COUNT(CASE WHEN contextHeld = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN contextHeld IS NOT NULL THEN 1 END), 0) as contextRate,
      COUNT(CASE WHEN entryExecuted = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN entryExecuted IS NOT NULL THEN 1 END), 0) as entryRate,
      COUNT(CASE WHEN riskManaged = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN riskManaged IS NOT NULL THEN 1 END), 0) as riskRate
     FROM trades
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
  // Helper function to parse JSON or return original string
  const parseJsonField = (value: string) => {
    if (!value) return value;
    try {
      return JSON.parse(value);
    } catch {
      return value; // Return original string if not valid JSON (legacy data)
    }
  };

  const mappedTrade: Trade = {
    id: row.id,
    date: row.date,
    market: row.market,
    timeframe: row.timeframe,
    bias: parseJsonField(row.bias),
    narrative: parseJsonField(row.narrative),
    context: row.context,
    entry: parseJsonField(row.entry),
    risk: {
      stop: row.stop || '',
      target: row.target || '',
      riskReward: row.riskReward || '',
    },
    status: row.status,
    outcomes: {
      biasPlayedOut: row.biasPlayedOut === null ? null : row.biasPlayedOut === 1,
      narrativePlayedOut: row.narrativePlayedOut === null ? null : row.narrativePlayedOut === 1,
      contextHeld: row.contextHeld === null ? null : row.contextHeld === 1,
      entryExecuted: row.entryExecuted === null ? null : row.entryExecuted === 1,
      riskManaged: row.riskManaged === null ? null : row.riskManaged === 1,
    },
    screenshotUri: row.screenshotUri || null,
    thumbnailUri: row.thumbnailUri || null,
    pnl: row.pnl || null,
    notes: {
      whatWentRight: row.whatWentRight || null,
      whatWentWrong: row.whatWentWrong || null,
    },
  };

  if (mappedTrade.screenshotUri || mappedTrade.thumbnailUri) {
    console.log('[DB] rowToTrade image fields', {
      id: mappedTrade.id,
      screenshotUri: mappedTrade.screenshotUri,
      thumbnailUri: mappedTrade.thumbnailUri,
    });
  }

  return mappedTrade;
};

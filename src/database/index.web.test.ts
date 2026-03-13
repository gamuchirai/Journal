// Mock expo-sqlite so the static import in database/index.ts does not attempt
// to load native modules when running the web-mode tests in jsdom.
jest.mock('expo-sqlite', () => ({
  __esModule: true,
  openDatabaseAsync: jest.fn(),
}));

import { Trade } from '../types';

const makeTrade = (overrides: Partial<Trade> = {}): Trade => ({
  id: overrides.id ?? `trade-${Math.random().toString(36).slice(2, 7)}`,
  date: overrides.date ?? Date.now(),
  market: overrides.market ?? 'EUR/USD',
  timeframe: overrides.timeframe ?? '1h',
  bias:
    overrides.bias ?? { direction: 'Long', pdArray: 'FVG', timeframe: '1h', playedOut: null },
  narrative:
    overrides.narrative ?? {
      contextArea: 'Discount',
      pdArray: 'OB',
      timeframe: '4h',
      playedOut: null,
    },
  entry: overrides.entry ?? { entryPattern: 'OTE', timeframe: '15m', playedOut: null },
  context: overrides.context ?? 'HTF Trend',
  risk: overrides.risk ?? { stop: '1.1000', target: '1.1200', riskReward: '1:2' },
  status: overrides.status ?? 'draft',
  outcomes: overrides.outcomes ?? {
    biasPlayedOut: null,
    narrativePlayedOut: null,
    contextHeld: null,
    entryExecuted: null,
    riskManaged: null,
  },
  screenshotUri: overrides.screenshotUri ?? null,
  thumbnailUri: overrides.thumbnailUri ?? null,
  pnl: overrides.pnl ?? null,
  notes: overrides.notes ?? { whatWentRight: null, whatWentWrong: null },
});

const loadDbModule = () => {
  jest.resetModules();
  jest.doMock('react-native', () => ({ Platform: { OS: 'web' } }));
  return require('./index');
};

describe('database web mode', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('initializes preferences and creates/reads trades', async () => {
    const db = loadDbModule();
    await db.initializeDatabase();

    const prefs = await db.getUserPreferences();
    expect(prefs.defaultTimeframe).toBe('1h');
    expect(prefs.recentMarkets.length).toBe(5);

    const t1 = makeTrade({ id: 'a', date: 1000, market: 'EUR/USD' });
    const t2 = makeTrade({ id: 'b', date: 2000, market: 'GBP/USD' });

    await db.createTrade(t1);
    await db.createTrade(t2);

    const all = await db.getAllTrades();
    expect(all.map((t: Trade) => t.id)).toEqual(['b', 'a']);

    const one = await db.getTrade('a');
    expect(one?.market).toBe('EUR/USD');
  });

  it('updates and deletes trades in web store', async () => {
    const db = loadDbModule();

    const trade = makeTrade({ id: 'to-update', market: 'AUD/USD' });
    await db.createTrade(trade);

    await db.updateTrade({ ...trade, market: 'USD/JPY', status: 'active' });
    const updated = await db.getTrade('to-update');
    expect(updated?.market).toBe('USD/JPY');
    expect(updated?.status).toBe('active');

    await db.deleteTrade('to-update');
    const deleted = await db.getTrade('to-update');
    expect(deleted).toBeNull();
  });

  it('computes analytics in web mode', async () => {
    const db = loadDbModule();

    await db.createTrade(
      makeTrade({
        id: 'w1',
        status: 'closed',
        pnl: '25',
        outcomes: {
          biasPlayedOut: true,
          narrativePlayedOut: true,
          contextHeld: true,
          entryExecuted: true,
          riskManaged: true,
        },
      })
    );

    await db.createTrade(
      makeTrade({
        id: 'l1',
        status: 'reviewed',
        pnl: '-10',
        outcomes: {
          biasPlayedOut: false,
          narrativePlayedOut: null,
          contextHeld: true,
          entryExecuted: false,
          riskManaged: true,
        },
      })
    );

    const winRate = await db.getWinRate();
    expect(winRate).toBe(50);

    const rates = await db.getBlockSuccessRates();
    expect(rates).toEqual({
      bias: 50,
      narrative: 100,
      context: 100,
      entry: 50,
      risk: 100,
    });
  });
});

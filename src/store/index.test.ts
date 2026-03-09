import { Trade } from '../types';

jest.mock('../database', () => ({
  __esModule: true,
  getAllTrades: jest.fn(),
  getTrade: jest.fn(),
  createTrade: jest.fn(),
  updateTrade: jest.fn(),
  deleteTrade: jest.fn(),
  getUserPreferences: jest.fn(),
}));

import * as db from '../database';
import { useTradeStore } from './index';

const mockDb = db as jest.Mocked<typeof db>;

const makeTrade = (id: string, status: Trade['status'] = 'draft'): Trade => ({
  id,
  date: Date.now(),
  market: 'EUR/USD',
  timeframe: '1h',
  bias: { direction: 'Long', pdArray: 'FVG', timeframe: '1h', playedOut: null },
  narrative: { contextArea: 'Discount', pdArray: 'OB', timeframe: '4h', playedOut: null },
  entry: { entryPattern: 'OTE', timeframe: '15m', playedOut: null },
  context: 'HTF Trend',
  risk: { stop: '1.1000', target: '1.1200', riskReward: '1:2' },
  status,
  outcomes: {
    biasPlayedOut: null,
    narrativePlayedOut: null,
    contextHeld: null,
    entryExecuted: null,
    riskManaged: null,
  },
  screenshotUri: null,
  thumbnailUri: null,
  pnl: null,
  notes: { whatWentRight: null, whatWentWrong: null },
});

beforeEach(() => {
  jest.clearAllMocks();
  useTradeStore.setState({
    trades: [],
    preferences: null,
    selectedTrade: null,
    loading: false,
    error: null,
  });
});

describe('useTradeStore', () => {
  it('loads trades successfully', async () => {
    const trades = [makeTrade('t1'), makeTrade('t2')];
    mockDb.getAllTrades.mockResolvedValue(trades);

    await useTradeStore.getState().loadTrades();

    expect(mockDb.getAllTrades).toHaveBeenCalledWith(undefined);
    expect(useTradeStore.getState().trades).toEqual(trades);
    expect(useTradeStore.getState().loading).toBe(false);
    expect(useTradeStore.getState().error).toBeNull();
  });

  it('sets error when load trade misses', async () => {
    mockDb.getTrade.mockResolvedValue(null);

    await useTradeStore.getState().loadTrade('missing');

    expect(useTradeStore.getState().selectedTrade).toBeNull();
    expect(useTradeStore.getState().error).toBe('Trade not found');
    expect(useTradeStore.getState().loading).toBe(false);
  });

  it('creates a new trade when it does not exist', async () => {
    const trade = makeTrade('new-id');
    mockDb.getTrade.mockResolvedValue(null);
    mockDb.createTrade.mockResolvedValue('new-id');
    mockDb.getAllTrades.mockResolvedValue([trade]);

    await useTradeStore.getState().saveTrade(trade);

    expect(mockDb.getTrade).toHaveBeenCalledWith('new-id');
    expect(mockDb.createTrade).toHaveBeenCalledWith(trade);
    expect(mockDb.updateTrade).not.toHaveBeenCalled();
    expect(useTradeStore.getState().selectedTrade).toEqual(trade);
    expect(useTradeStore.getState().trades).toEqual([trade]);
  });

  it('updates an existing trade', async () => {
    const trade = makeTrade('existing-id', 'active');
    mockDb.getTrade.mockResolvedValue(trade);
    mockDb.updateTrade.mockResolvedValue(undefined);
    mockDb.getAllTrades.mockResolvedValue([trade]);

    await useTradeStore.getState().saveTrade(trade);

    expect(mockDb.updateTrade).toHaveBeenCalledWith(trade);
    expect(mockDb.createTrade).not.toHaveBeenCalled();
    expect(useTradeStore.getState().loading).toBe(false);
  });

  it('deletes a trade and clears selected trade if needed', async () => {
    const trade = makeTrade('delete-me');
    useTradeStore.setState({
      trades: [trade, makeTrade('keep-me')],
      selectedTrade: trade,
    });
    mockDb.deleteTrade.mockResolvedValue(undefined);

    await useTradeStore.getState().deleteTrade('delete-me');

    expect(mockDb.deleteTrade).toHaveBeenCalledWith('delete-me');
    expect(useTradeStore.getState().trades.map((t) => t.id)).toEqual(['keep-me']);
    expect(useTradeStore.getState().selectedTrade).toBeNull();
    expect(useTradeStore.getState().loading).toBe(false);
  });
});

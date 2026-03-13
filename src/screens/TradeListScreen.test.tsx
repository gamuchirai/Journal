import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import TradeListScreen from './TradeListScreen';
import { Trade } from '../types';

jest.mock('lucide-react-native', () => ({
  Check: () => null,
  X: () => null,
  ChevronDown: () => null,
  BarChart3: () => null,
  BookOpen: () => null,
  Camera: () => null,
  LocateFixed: () => null,
}));

const mockUseTradeStore = jest.fn();

jest.mock('../store', () => ({
  __esModule: true,
  useTradeStore: () => mockUseTradeStore(),
}));

jest.mock('../database', () => ({
  __esModule: true,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

const makeTrade = (): Trade => ({
  id: 'trade-1',
  date: 1700000000000,
  market: 'EUR/USD',
  timeframe: '1h',
  bias: { direction: 'Long', pdArray: 'FVG', timeframe: '1h', playedOut: null },
  narrative: { contextArea: 'Discount', pdArray: 'OB', timeframe: '4h', playedOut: null },
  entry: { entryPattern: 'OTE', timeframe: '15m', playedOut: null },
  context: 'HTF Trend',
  risk: { stop: '1.1', target: '1.2', riskReward: '1:2' },
  status: 'active',
  outcomes: {
    biasPlayedOut: null,
    narrativePlayedOut: null,
    contextHeld: null,
    entryExecuted: null,
    riskManaged: null,
  },
  screenshotUri: null,
  thumbnailUri: null,
  pnl: '12',
  notes: { whatWentRight: null, whatWentWrong: null },
});

const makeNavigation = () => {
  const navigate = jest.fn();
  const unsubscribe = jest.fn();
  return {
    navigate,
    addListener: jest.fn((_event: string, cb: () => void) => {
      cb();
      return unsubscribe;
    }),
  };
};

describe('TradeListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows empty state and loads trades on mount/focus', () => {
    const loadTrades = jest.fn();
    mockUseTradeStore.mockReturnValue({
      trades: [],
      loadTrades,
      loading: false,
    });

    const navigation = makeNavigation();
    const screen = render(<TradeListScreen navigation={navigation as any} route={{} as any} />);

    expect(screen.getByText('No trades yet')).toBeTruthy();
    expect(loadTrades).toHaveBeenCalledWith(undefined);
    expect(navigation.addListener).toHaveBeenCalledWith('focus', expect.any(Function));
  });

  it('applies active filter and navigates to detail on trade tap', async () => {
    const loadTrades = jest.fn();
    mockUseTradeStore.mockReturnValue({
      trades: [makeTrade()],
      loadTrades,
      loading: false,
    });

    const navigation = makeNavigation();
    const screen = render(<TradeListScreen navigation={navigation as any} route={{} as any} />);

    fireEvent.press(screen.getByText('Active'));

    await waitFor(() => {
      expect(loadTrades).toHaveBeenCalledWith('active');
    });

    fireEvent.press(screen.getByText('EUR/USD'));
    expect(navigation.navigate).toHaveBeenCalledWith('TradeDetail', { tradeId: 'trade-1' });
  });
});

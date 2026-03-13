import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import DashboardScreen from './DashboardScreen';
import { Animated } from 'react-native';

jest.mock('../database', () => ({
  __esModule: true,
  getAllTrades: jest.fn(),
  getWinRate: jest.fn(),
  getBlockSuccessRates: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => {
  const ReactActual = require('react');
  return {
    SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

jest.mock('lucide-react-native', () => {
  const ReactActual = require('react');
  const { Text } = require('react-native');
  const Icon = () => ReactActual.createElement(Text, null, 'icon');
  return {
    Check: Icon,
    CheckCircle2: Icon,
    X: Icon,
    XCircle: Icon,
  };
});

import * as db from '../database';

const mockDb = db as jest.Mocked<typeof db>;

const makeNavigation = () => ({
  addListener: jest.fn((_event: string, callback: () => void) => {
    callback();
    return jest.fn();
  }),
});

describe('DashboardScreen', () => {
  let timingSpy: jest.SpyInstance;
  let staggerSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    timingSpy = jest.spyOn(Animated, 'timing').mockReturnValue({
      start: (cb?: () => void) => cb?.(),
      stop: jest.fn(),
      reset: jest.fn(),
    } as any);
    staggerSpy = jest.spyOn(Animated, 'stagger').mockReturnValue({
      start: (cb?: () => void) => cb?.(),
      stop: jest.fn(),
      reset: jest.fn(),
    } as any);
  });

  afterEach(() => {
    timingSpy.mockRestore();
    staggerSpy.mockRestore();
  });

  it('loads analytics and renders overview cards', async () => {
    mockDb.getAllTrades.mockResolvedValue([{ id: 't1' } as any, { id: 't2' } as any]);
    mockDb.getWinRate.mockResolvedValue(62.4 as any);
    mockDb.getBlockSuccessRates.mockResolvedValue({
      bias: 80,
      narrative: 50,
      context: 40,
      entry: 35,
      risk: 90,
    } as any);

    const screen = render(
      <DashboardScreen navigation={makeNavigation() as any} route={{} as any} />
    );

    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeTruthy();
      expect(screen.getByText('Total Trades')).toBeTruthy();
      expect(screen.getByText('62%')).toBeTruthy();
      expect(screen.getByText('↑ Above 50%')).toBeTruthy();
      expect(screen.getByText('Your risk management is your strongest block.')).toBeTruthy();
      expect(screen.getByText('Refine your entry execution.')).toBeTruthy();
    });

    expect(mockDb.getAllTrades).toHaveBeenCalled();
    expect(mockDb.getWinRate).toHaveBeenCalled();
    expect(mockDb.getBlockSuccessRates).toHaveBeenCalled();
  });

  it('shows below-50 insight when win rate is low', async () => {
    mockDb.getAllTrades.mockResolvedValue([{ id: 't1' } as any]);
    mockDb.getWinRate.mockResolvedValue(42 as any);
    mockDb.getBlockSuccessRates.mockResolvedValue({
      bias: 40,
      narrative: 55,
      context: 45,
      entry: 50,
      risk: 48,
    } as any);

    const screen = render(
      <DashboardScreen navigation={makeNavigation() as any} route={{} as any} />
    );

    await waitFor(() => {
      expect(
        screen.getByText('Work on identifying what is holding back your win rate.')
      ).toBeTruthy();
    });
  });

  it('shows combination pattern insight for system failure trades', async () => {
    const systemFailureTrade = {
      id: 't1',
      status: 'reviewed',
      outcomes: {
        biasPlayedOut: false,
        narrativePlayedOut: false,
        contextHeld: false,
        entryExecuted: false,
        riskManaged: false,
      },
    };
    mockDb.getAllTrades.mockResolvedValue([systemFailureTrade] as any);
    mockDb.getWinRate.mockResolvedValue(0 as any);
    mockDb.getBlockSuccessRates.mockResolvedValue({
      bias: 10, narrative: 10, context: 10, entry: 10, risk: 10,
    } as any);

    const screen = render(
      <DashboardScreen navigation={makeNavigation() as any} route={{} as any} />
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          '100% of trades — All blocks failed. Step back to Monthly/Weekly. You are likely lost in lower-timeframe noise.'
        )
      ).toBeTruthy();
    });
  });

  it('shows force-fed pattern insight when entries are taken without context', async () => {
    const forceFedTrade = {
      id: 't1',
      status: 'reviewed',
      outcomes: {
        biasPlayedOut: true,
        narrativePlayedOut: true,
        contextHeld: false,
        entryExecuted: true,
        riskManaged: true,
      },
    };
    mockDb.getAllTrades.mockResolvedValue([forceFedTrade] as any);
    mockDb.getWinRate.mockResolvedValue(0 as any);
    mockDb.getBlockSuccessRates.mockResolvedValue({
      bias: 100, narrative: 100, context: 0, entry: 100, risk: 100,
    } as any);

    const screen = render(
      <DashboardScreen navigation={makeNavigation() as any} route={{} as any} />
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          '100% of trades — Entries taken without the context area being reached or respected. Discipline check: wait for the boundary.'
        )
      ).toBeTruthy();
    });
  });
});
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import TradeDetailScreen from './TradeDetailScreen';
import { Trade } from '../types';

const mockUseTradeStore = jest.fn();

jest.mock('../store', () => ({
  __esModule: true,
  useTradeStore: () => mockUseTradeStore(),
}));

jest.mock('../database', () => ({
  __esModule: true,
  getTrade: jest.fn(),
}));

jest.mock('../utils/imageUtils', () => ({
  __esModule: true,
  deleteTradeImages: jest.fn(),
  logImageUriDebug: jest.fn(),
  resolveExistingImageUri: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

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
import * as imageUtils from '../utils/imageUtils';

const mockDb = db as jest.Mocked<typeof db>;
const mockImageUtils = imageUtils as jest.Mocked<typeof imageUtils>;

const makeTrade = (): Trade => ({
  id: 'trade-1',
  date: 1700000000000,
  market: 'EUR/USD',
  timeframe: '1h',
  bias: { direction: 'Long', pdArray: 'FVG', timeframe: '1h', playedOut: true },
  narrative: { contextArea: 'Discount', pdArray: 'OB', timeframe: '4h', playedOut: false },
  entry: { entryPattern: 'OTE', timeframe: '15m', playedOut: true },
  risk: { stop: '10', target: '30', riskReward: '' },
  status: 'closed',
  outcomes: {
    biasPlayedOut: true,
    narrativePlayedOut: false,
    contextHeld: true,
    entryExecuted: true,
    riskManaged: true,
  },
  screenshotUri: 'file:///image.jpg',
  thumbnailUri: 'file:///thumb.jpg',
  pnl: '25',
  notes: {
    whatWentRight: 'Good patience',
    whatWentWrong: 'Late confirmation',
  },
});

describe('TradeDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads and renders trade details', async () => {
    mockDb.getTrade.mockResolvedValue(makeTrade() as any);
    mockImageUtils.resolveExistingImageUri.mockResolvedValue('file:///image.jpg' as any);
    mockUseTradeStore.mockReturnValue({
      deleteTrade: jest.fn(),
    });

    const navigation = { navigate: jest.fn(), goBack: jest.fn() };

    const screen = render(
      <TradeDetailScreen
        navigation={navigation as any}
        route={{ params: { tradeId: 'trade-1' } } as any}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Trading Building Blocks')).toBeTruthy();
      expect(screen.getByText('EUR/USD')).toBeTruthy();
      expect(screen.getByText('Delete Trade')).toBeTruthy();
    });

    expect(mockDb.getTrade).toHaveBeenCalledWith('trade-1');
  });

  it('confirms delete and removes trade', async () => {
    const deleteTrade = jest.fn().mockResolvedValue(undefined);

    mockDb.getTrade.mockResolvedValue(makeTrade() as any);
    mockImageUtils.resolveExistingImageUri.mockResolvedValue('file:///image.jpg' as any);
    mockImageUtils.deleteTradeImages.mockResolvedValue(undefined as any);
    mockUseTradeStore.mockReturnValue({ deleteTrade });

    const navigation = { navigate: jest.fn(), goBack: jest.fn() };
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    const screen = render(
      <TradeDetailScreen
        navigation={navigation as any}
        route={{ params: { tradeId: 'trade-1' } } as any}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Delete Trade')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Delete Trade'));

    const alertArgs = alertSpy.mock.calls[0];
    const buttons = (alertArgs?.[2] || []) as Array<{ text: string; onPress?: () => void }>;
    const confirm = buttons.find((button) => button.text === 'Delete');
    await confirm?.onPress?.();

    await waitFor(() => {
      expect(mockImageUtils.deleteTradeImages).toHaveBeenCalledWith(
        'file:///image.jpg',
        'file:///thumb.jpg'
      );
      expect(deleteTrade).toHaveBeenCalledWith('trade-1');
      expect(navigation.goBack).toHaveBeenCalledTimes(1);
    });

    alertSpy.mockRestore();
  });
});
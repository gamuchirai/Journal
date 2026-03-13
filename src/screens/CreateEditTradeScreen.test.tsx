import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreateEditTradeScreen from './CreateEditTradeScreen';

const mockUseTradeStore = jest.fn();

jest.mock('../store', () => ({
  __esModule: true,
  useTradeStore: () => mockUseTradeStore(),
}));

jest.mock('../database', () => ({
  __esModule: true,
  getUserPreferences: jest.fn(),
  getTrade: jest.fn(),
}));

jest.mock('../utils/imageUtils', () => ({
  __esModule: true,
  processAndSaveImage: jest.fn(),
  deleteTradeImages: jest.fn(),
  logImageUriDebug: jest.fn(),
  normalizeImageUri: jest.fn((uri: string | null | undefined) => uri ?? null),
}));

jest.mock('expo-image-picker', () => ({
  __esModule: true,
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
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
    BarChart3: Icon,
    BookOpen: Icon,
    Camera: Icon,
    Check: Icon,
    ChevronDown: Icon,
    LocateFixed: Icon,
    X: Icon,
  };
});

import * as db from '../database';

const mockDb = db as jest.Mocked<typeof db>;

describe('CreateEditTradeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads preferences for new trade and renders save button', async () => {
    mockDb.getUserPreferences.mockResolvedValue({
      defaultTimeframe: '1h',
      recentMarkets: ['EUR/USD'],
      recentContexts: ['London Open'],
    } as any);

    mockUseTradeStore.mockReturnValue({
      saveTrade: jest.fn(),
      loading: false,
    });

    const navigation = { goBack: jest.fn(), navigate: jest.fn() };

    const screen = render(
      <CreateEditTradeScreen navigation={navigation as any} route={{ params: {} } as any} />
    );

    await waitFor(() => {
      expect(screen.getByText('Save Trade')).toBeTruthy();
    });

    expect(mockDb.getUserPreferences).toHaveBeenCalledTimes(1);
  });

  it('submits trade and navigates back', async () => {
    const saveTrade = jest.fn().mockResolvedValue(undefined);

    mockDb.getUserPreferences.mockResolvedValue({
      defaultTimeframe: '1h',
      recentMarkets: ['EUR/USD'],
      recentContexts: ['London Open'],
    } as any);

    mockUseTradeStore.mockReturnValue({
      saveTrade,
      loading: false,
    });

    const navigation = { goBack: jest.fn(), navigate: jest.fn() };

    const screen = render(
      <CreateEditTradeScreen navigation={navigation as any} route={{ params: {} } as any} />
    );

    await waitFor(() => {
      expect(screen.getByText('Save Trade')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Save Trade'));

    await waitFor(() => {
      expect(saveTrade).toHaveBeenCalledTimes(1);
      expect(navigation.goBack).toHaveBeenCalledTimes(1);
    });

    const savedTrade = saveTrade.mock.calls[0][0];
    expect(savedTrade.market).toBe('EUR/USD');
    expect(savedTrade.timeframe).toBe('1h');
    expect(savedTrade.status).toBe('closed');
    expect(savedTrade.bias.direction).toBe('Long');
  });
});
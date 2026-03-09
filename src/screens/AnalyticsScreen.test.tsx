import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AnalyticsScreen from './AnalyticsScreen';

const mockGetAllTrades = jest.fn();
const mockGetWinRate = jest.fn();
const mockGetBlockSuccessRates = jest.fn();

jest.mock('../database', () => ({
  __esModule: true,
  getAllTrades: () => mockGetAllTrades(),
  getWinRate: () => mockGetWinRate(),
  getBlockSuccessRates: () => mockGetBlockSuccessRates(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

const makeNavigation = () => {
  const unsubscribe = jest.fn();
  return {
    addListener: jest.fn((_event: string, cb: () => void) => {
      cb();
      return unsubscribe;
    }),
  };
};

describe('AnalyticsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllTrades.mockResolvedValue([{ id: 'a' }, { id: 'b' }]);
    mockGetWinRate.mockResolvedValue(58.6);
    mockGetBlockSuccessRates.mockResolvedValue({
      bias: 70,
      narrative: 65,
      context: 50,
      entry: 45,
      risk: 60,
    });
  });

  it('loads analytics and renders overview plus insights', async () => {
    const navigation = makeNavigation();
    const screen = render(<AnalyticsScreen navigation={navigation as any} route={{} as any} />);

    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeTruthy();
      expect(screen.getByText('Total Trades')).toBeTruthy();
      expect(screen.getByText('Win Rate')).toBeTruthy();
      expect(screen.getByText('Building Blocks Success Rate')).toBeTruthy();
    });

    expect(mockGetAllTrades).toHaveBeenCalled();
    expect(mockGetWinRate).toHaveBeenCalled();
    expect(mockGetBlockSuccessRates).toHaveBeenCalled();
    expect(navigation.addListener).toHaveBeenCalledWith('focus', expect.any(Function));
  });
});

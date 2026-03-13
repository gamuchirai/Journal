import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

jest.mock('./src/database', () => ({
  __esModule: true,
  initializeDatabase: jest.fn(),
}));

jest.mock('./src/navigation/RootNavigator', () => ({
  __esModule: true,
  RootNavigator: () => {
    const ReactActual = require('react');
    const { Text } = require('react-native');
    return ReactActual.createElement(Text, null, 'RootNavigator Ready');
  },
}));

jest.mock('react-native-safe-area-context', () => {
  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { initializeDatabase } from './src/database';
import App from './App';

const mockInitializeDatabase = initializeDatabase as jest.MockedFunction<
  typeof initializeDatabase
>;

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInitializeDatabase.mockResolvedValue(undefined);
  });

  it('initializes database and renders navigator', async () => {
    const screen = render(<App />);

    await waitFor(() => {
      expect(mockInitializeDatabase).toHaveBeenCalledTimes(1);
      expect(screen.getByText('RootNavigator Ready')).toBeTruthy();
    });
  });
});

export type TradeStatus = 'draft' | 'active' | 'closed' | 'reviewed';

export interface TradeOutcomes {
  biasPlayedOut: boolean | null;
  narrativePlayedOut: boolean | null;
  contextHeld: boolean | null;
  entryExecuted: boolean | null;
  riskManaged: boolean | null;
}

export interface Trade {
  id: string;
  date: number; // timestamp
  market: string;
  timeframe: string;
  bias: string;
  narrative: string;
  context: string;
  entry: string;
  risk: {
    stop: string;
    target: string;
    riskReward: string;
  };
  status: TradeStatus;
  outcomes: TradeOutcomes;
  screenshotUri: string | null;
  thumbnailUri: string | null;
  pnl: string | null;
  notes: {
    whatWentRight: string | null;
    whatWentWrong: string | null;
  };
}

export interface UserPreferences {
  defaultTimeframe: string;
  recentMarkets: string[];
  recentContexts: string[];
}

export type RootStackParamList = {
  TradeList: undefined;
  CreateEditTrade: { tradeId?: string };
  TradeDetail: { tradeId: string };
  Analytics: undefined;
};

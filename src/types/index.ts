export type TradeStatus = 'draft' | 'active' | 'closed' | 'reviewed';
export type Direction = 'Long' | 'Short' | 'Neutral';

// Structured Bias: Direction + PD Array + Timeframe
export interface BiasData {
  direction: Direction;
  pdArray: string;
  timeframe: string;
  playedOut: boolean | null;
}

// Structured Narrative: Context Area + PD Array + Timeframe
export interface NarrativeData {
  contextArea: string;
  pdArray: string;
  timeframe: string;
  playedOut: boolean | null;
}

// Structured Entry: Entry Pattern + Timeframe
export interface EntryData {
  entryPattern: string;
  timeframe: string;
  playedOut: boolean | null;
}

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
  timeframe: string; // Main/chart timeframe
  
  // Structured Trading Building Blocks
  bias: BiasData;
  narrative: NarrativeData;
  entry: EntryData;
  
  // Legacy string fields for backwards compatibility
  biasLegacy?: string;
  narrativeLegacy?: string;
  entryLegacy?: string;
  context?: string;
  
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

export type TabParamList = {
  Dashboard: undefined;
  Trades: undefined;
};

export type RootStackParamList = {
  Tabs: undefined;
  CreateEditTrade: { tradeId?: string };
  TradeDetail: { tradeId: string };
};

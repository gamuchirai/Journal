// Color Theme from PRD
export const COLORS = {
  primary: '#16476a', // deep blue
  secondary: '#a9d0fb', // soft light blue
  accent: '#e29e21', // warm amber
  background: '#f1f1e6', // neutral background
  text: '#1a1a1a', // dark text
  textLight: '#666666', // light text
  white: '#ffffff',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  border: '#d0d0d0',
};

// Common Forex Pairs
export const FOREX_PAIRS = [
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'AUD/USD',
  'USD/CAD',
  'NZD/USD',
  'EUR/GBP',
  'EUR/JPY',
  'GBP/JPY',
  'EUR/AUD',
  'USD/CHF',
  'AUD/JPY',
];

// Timeframes
export const TIMEFRAMES = [
  '1m',
  '5m',
  '15m',
  '30m',
  '1h',
  '4h',
  'D',
  'W',
  'M',
];

// Directions for Bias
export const DIRECTIONS = ['Long', 'Short', 'Neutral'] as const;

// PD Arrays (Price Delivery Arrays) - ICT Concepts
export const PD_ARRAYS = [
  'FVG',           // Fair Value Gap
  'Swing Point',   // Swing High/Low
  'OB',            // Order Block
  'BB',            // Breaker Block
  'MB',            // Mitigation Block
  'IFVG',          // Inverse Fair Value Gap
  'VI',            // Volume Imbalance
  'Liquidity',     // Liquidity Pool
  'EQH',           // Equal Highs
  'EQL',           // Equal Lows
];

// Context Areas for Narrative
export const CONTEXT_AREAS = [
  'Premium',
  'Discount',
  'Equilibrium',
  'HTF POI',
  'Daily Range',
  'Weekly Range',
  'Asia Range',
  'London Open',
  'NY Open',
  'Session High/Low',
];

// Entry Patterns
export const ENTRY_PATTERNS = [
  'FVG Entry',
  'OTE',              // Optimal Trade Entry (Fib)
  'BOS Confirmation', // Break of Structure
  'CHOCH',            // Change of Character
  'MSS',              // Market Structure Shift
  'Breaker Retest',
  'OB Tap',
  'Liquidity Sweep',
  'Turtle Soup',
  'Silver Bullet',
];

// Default Contexts/Tags (legacy - kept for backwards compatibility)
export const DEFAULT_CONTEXTS = [
  'HTF Trend',
  'Liquidity Sweep',
  'Support/Resistance',
  'Fibonacci',
  'Volume Profile',
  'Divergence',
  'Consolidation',
  'Breakout',
  'Pullback',
  'Reversal',
];

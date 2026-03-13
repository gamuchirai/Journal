import { Trade } from '../types';

export type InsightType = 'positive' | 'neutral' | 'warning' | 'negative';

export interface DashboardInsight {
  icon: string;
  text: string;
  type: InsightType;
}

interface BlockRates {
  bias: number;
  narrative: number;
  context: number;
  entry: number;
  risk: number;
}

const STRONGEST_LABELS: Record<string, string> = {
  bias: 'Your bias analysis is your strongest block.',
  narrative: 'Your narrative setup is your strongest block.',
  context: 'Your context reading is your strongest block.',
  entry: 'Your entry execution is your strongest block.',
  risk: 'Your risk management is your strongest block.',
};

const WEAKEST_LABELS: Record<string, string> = {
  bias: 'Focus on improving your bias analysis.',
  narrative: 'Your narrative setups need refinement.',
  context: 'Work on better context evaluation.',
  entry: 'Refine your entry execution.',
  risk: 'Review your risk management process.',
};

export const getStrongestBlockInsight = (blockRates: BlockRates): string => {
  const strongestBlock = Object.entries(blockRates).reduce((best, entry) =>
    entry[1] > best[1] ? entry : best
  );
  return STRONGEST_LABELS[strongestBlock[0]] ?? '';
};

export const getWeakestBlockInsight = (blockRates: BlockRates): string => {
  const weakestBlock = Object.entries(blockRates).reduce((worst, entry) =>
    entry[1] < worst[1] ? entry : worst
  );
  return WEAKEST_LABELS[weakestBlock[0]] ?? '';
};

// ─── Combination Pattern Analysis (SUCCESS CRITERIA logic) ───────────────────

type PatternKey =
  | 'perfect'
  | 'left_without_me'
  | 'missed_signal'
  | 'vague_analysis'
  | 'lucky'
  | 'force_fed'
  | 'system_failure'
  | 'execution_issue'
  | 'good_loss';

// Concern weight determines which patterns surface first (higher = more urgent)
const CONCERN_WEIGHT: Record<PatternKey, number> = {
  system_failure:   9,
  lucky:            8,
  force_fed:        7,
  execution_issue:  6,
  vague_analysis:   5,
  left_without_me:  3,
  missed_signal:    2,
  good_loss:        1,
  perfect:          0,
};

const PATTERN_INFO: Record<PatternKey, { icon: string; message: string; type: InsightType }> = {
  perfect: {
    icon: '◈',
    message: 'All blocks aligned. Review these trades for R:R efficiency — they are your ideal template.',
    type: 'positive',
  },
  left_without_me: {
    icon: '▷',
    message: 'Right direction and path, but price didn\'t reach your zone. Look for closer PD arrays or smaller-TF context areas.',
    type: 'neutral',
  },
  missed_signal: {
    icon: '◎',
    message: 'Analysis was perfect but entry pattern didn\'t form. Good miss — never force an entry next time.',
    type: 'neutral',
  },
  vague_analysis: {
    icon: '◇',
    message: 'Direction right, but path and zone were wrong. Stack objective arguments from Monthly/Weekly, not intuition.',
    type: 'warning',
  },
  lucky: {
    icon: '⚠',
    message: 'Zone held despite poor HTF analysis. Review why your bias was wrong — luck-based habits will cost you.',
    type: 'warning',
  },
  force_fed: {
    icon: '▲',
    message: 'Entries taken without the context area being reached or respected. Discipline check: wait for the boundary.',
    type: 'warning',
  },
  system_failure: {
    icon: '■',
    message: 'All blocks failed. Step back to Monthly/Weekly. You are likely lost in lower-timeframe noise.',
    type: 'negative',
  },
  execution_issue: {
    icon: '▣',
    message: 'Winning analysis but poor outcome. This is an execution/psychology issue — review how you managed these trades.',
    type: 'warning',
  },
  good_loss: {
    icon: '◉',
    message: 'Plan followed despite wrong analysis. Risk management protected your capital — treat these as learning wins.',
    type: 'positive',
  },
};

/**
 * Classifies a single trade into a SUCCESS CRITERIA combination pattern.
 * Returns null if outcomes are too incomplete to classify.
 */
const classifyTrade = (trade: Trade): PatternKey | null => {
  const o = trade.outcomes;
  if (!o) return null;

  const { biasPlayedOut, narrativePlayedOut, contextHeld, entryExecuted, riskManaged } = o;

  // Need at least the four analysis blocks to classify
  if (
    biasPlayedOut === null && narrativePlayedOut === null &&
    contextHeld === null && entryExecuted === null
  ) return null;

  const b = biasPlayedOut === true;
  const n = narrativePlayedOut === true;
  const c = contextHeld === true;
  const e = entryExecuted === true;
  const r = riskManaged === true;

  // Combined risk scenarios take precedence
  if (b && n && c && e && riskManaged === false) return 'execution_issue';
  if (!b && !n && !c && !e && riskManaged === true) return 'good_loss';

  // Four-block combination patterns (Bias / Narrative / Context / Entry)
  if ( b &&  n &&  c &&  e) return 'perfect';
  if ( b &&  n &&  c && !e) return 'missed_signal';
  if ( b &&  n && !c &&  e) return 'force_fed';
  if ( b &&  n && !c && !e) return 'left_without_me';
  if ( b && !n && !c && !e) return 'vague_analysis';
  if (!b && !n &&  c &&  e) return 'lucky';
  if (!b && !n && !c && !e) return 'system_failure';

  return null;
};

/**
 * Returns up to three actionable insights derived from the SUCCESS CRITERIA
 * combination patterns found across closed/reviewed trades.
 */
export const getCombinationInsights = (trades: Trade[]): DashboardInsight[] => {
  const reviewed = trades.filter(t =>
    ['closed', 'reviewed'].includes(t.status) &&
    t.outcomes &&
    (t.outcomes.biasPlayedOut !== null ||
      t.outcomes.narrativePlayedOut !== null ||
      t.outcomes.contextHeld !== null ||
      t.outcomes.entryExecuted !== null)
  );

  if (reviewed.length === 0) return [];

  const counts: Partial<Record<PatternKey, number>> = {};
  for (const trade of reviewed) {
    const key = classifyTrade(trade);
    if (key) counts[key] = (counts[key] ?? 0) + 1;
  }

  const total = reviewed.length;
  const entries = (Object.entries(counts) as [PatternKey, number][]).sort(
    (a, b) => CONCERN_WEIGHT[b[0]] - CONCERN_WEIGHT[a[0]] || b[1] - a[1]
  );

  if (entries.length === 0) return [];

  return entries.slice(0, 3).map(([key, count]) => {
    const pct = Math.round((count / total) * 100);
    const info = PATTERN_INFO[key];
    return {
      icon: info.icon,
      text: `${pct}% of trades — ${info.message}`,
      type: info.type,
    };
  });
};

import { C } from '../constants/Colors';

/**
 * Returns the color to use when displaying a PnL value.
 * Positive → gain, negative → loss, null/zero → muted.
 */
export const getPnLColor = (pnl: string | null): string => {
  if (!pnl) return C.textMuted;
  const value = parseFloat(pnl);
  return value > 0 ? C.gain : value < 0 ? C.loss : C.textMuted;
};

/**
 * Returns the color to use when displaying a risk:reward ratio value.
 * ≥ 3 → gain, < 1 → loss, in-between → teal.
 */
export const getRrColor = (ratioValue: number | null): string => {
  if (ratioValue === null) return C.textMuted;
  if (ratioValue >= 3) return C.gain;
  if (ratioValue < 1) return C.loss;
  return C.teal;
};

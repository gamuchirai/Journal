import { Trade } from '../types';

const parseRiskValue = (value: string | null | undefined): number | null => {
  if (!value) return null;
  const normalized = value.trim().replace(/[^0-9.-]/g, '');
  if (!normalized) return null;
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatRatio = (ratio: number): string => {
  if (Number.isInteger(ratio)) return String(ratio);
  if (ratio >= 10) return ratio.toFixed(1).replace(/\.0$/, '');
  return ratio.toFixed(2).replace(/\.00$/, '').replace(/0$/, '');
};

export const calculateRiskRewardRatio = (
  stop: string | null | undefined,
  target: string | null | undefined
): string | null => {
  const ratioValue = calculateRiskRewardValue(stop, target);
  if (ratioValue === null) return null;
  return `1:${formatRatio(ratioValue)}`;
};

export const calculateRiskRewardValue = (
  stop: string | null | undefined,
  target: string | null | undefined
): number | null => {
  const stopValue = parseRiskValue(stop);
  const targetValue = parseRiskValue(target);

  if (stopValue === null || targetValue === null) return null;

  const absoluteStop = Math.abs(stopValue);
  const absoluteTarget = Math.abs(targetValue);

  if (absoluteStop === 0 || absoluteTarget === 0) return null;

  return absoluteTarget / absoluteStop;
};

export const calculateTradeRiskRewardRatio = (trade: Pick<Trade, 'risk'>): string | null => {
  return calculateRiskRewardRatio(trade.risk.stop, trade.risk.target);
};

export const calculateTradeRiskRewardValue = (trade: Pick<Trade, 'risk'>): number | null => {
  return calculateRiskRewardValue(trade.risk.stop, trade.risk.target);
};

import {
  calculateRiskRewardRatio,
  calculateRiskRewardValue,
  calculateTradeRiskRewardRatio,
  calculateTradeRiskRewardValue,
} from './riskUtils';
import { Trade } from '../types';

const makeTrade = (stop: string, target: string): Pick<Trade, 'risk'> => ({
  risk: {
    stop,
    target,
    riskReward: '',
  },
});

describe('riskUtils', () => {
  describe('calculateRiskRewardValue', () => {
    it('returns null for missing or invalid values', () => {
      expect(calculateRiskRewardValue('', '2')).toBeNull();
      expect(calculateRiskRewardValue('2', '')).toBeNull();
      expect(calculateRiskRewardValue('abc', '2')).toBeNull();
      expect(calculateRiskRewardValue('2', 'xyz')).toBeNull();
      expect(calculateRiskRewardValue('0', '2')).toBeNull();
      expect(calculateRiskRewardValue('2', '0')).toBeNull();
    });

    it('parses decorated numeric strings and uses absolute values', () => {
      expect(calculateRiskRewardValue(' -2 pips ', '$6.00')).toBe(3);
      expect(calculateRiskRewardValue('2.5', '-5')).toBe(2);
    });
  });

  describe('calculateRiskRewardRatio', () => {
    it('formats integer and decimal ratios correctly', () => {
      expect(calculateRiskRewardRatio('2', '4')).toBe('1:2');
      expect(calculateRiskRewardRatio('2', '21')).toBe('1:10.5');
      expect(calculateRiskRewardRatio('3', '4')).toBe('1:1.33');
      expect(calculateRiskRewardRatio('4', '6')).toBe('1:1.5');
    });

    it('returns null when ratio cannot be computed', () => {
      expect(calculateRiskRewardRatio(undefined, '5')).toBeNull();
      expect(calculateRiskRewardRatio('5', undefined)).toBeNull();
    });
  });

  describe('trade helper wrappers', () => {
    it('delegates ratio/value calculations from trade risk fields', () => {
      const trade = makeTrade('2', '8');
      expect(calculateTradeRiskRewardValue(trade)).toBe(4);
      expect(calculateTradeRiskRewardRatio(trade)).toBe('1:4');
    });
  });
});
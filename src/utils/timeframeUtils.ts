import { TIMEFRAMES } from '../constants';

export const MIN_BIAS_TIMEFRAME_INDEX = 2;

export const getTimeframeIndex = (timeframe: string): number =>
  TIMEFRAMES.indexOf(timeframe);

export const getLowerTimeframes = (timeframe: string): string[] => {
  const index = getTimeframeIndex(timeframe);
  if (index <= 0) return [];
  return TIMEFRAMES.slice(0, index);
};

export const isStrictlyLowerTimeframe = (lower: string, higher: string): boolean => {
  const lowerIndex = getTimeframeIndex(lower);
  const higherIndex = getTimeframeIndex(higher);
  return lowerIndex >= 0 && higherIndex >= 0 && lowerIndex < higherIndex;
};

/**
 * Given the user's preferred bias timeframe, compute a safe set of
 * default timeframes that satisfy the Bias > Narrative > Entry hierarchy.
 */
export const getDefaultHierarchyTimeframes = (
  preferredBiasTimeframe: string
): { biasTimeframe: string; narrativeTimeframe: string; entryTimeframe: string } => {
  const preferredBiasIndex = getTimeframeIndex(preferredBiasTimeframe);
  const safeBiasIndex =
    preferredBiasIndex >= MIN_BIAS_TIMEFRAME_INDEX
      ? preferredBiasIndex
      : MIN_BIAS_TIMEFRAME_INDEX;
  const biasTimeframe = TIMEFRAMES[safeBiasIndex] || TIMEFRAMES[MIN_BIAS_TIMEFRAME_INDEX];

  const narrativeOptions = getLowerTimeframes(biasTimeframe).filter(
    (tf) => getTimeframeIndex(tf) >= 1
  );
  const narrativeTimeframe =
    narrativeOptions[narrativeOptions.length - 1] || TIMEFRAMES[1] || TIMEFRAMES[0] || '';

  const entryOptions = getLowerTimeframes(narrativeTimeframe);
  const entryTimeframe = entryOptions[entryOptions.length - 1] || TIMEFRAMES[0] || '';

  return { biasTimeframe, narrativeTimeframe, entryTimeframe };
};

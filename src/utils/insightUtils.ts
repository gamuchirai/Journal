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

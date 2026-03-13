import { useEffect, useState } from 'react';
import { Trade } from '../types';
import { resolveExistingImageUri } from '../utils/imageUtils';

/**
 * Resolves a map of trade IDs → display image URIs for a list of trades.
 * Used by TradeListScreen to show thumbnail previews in the card list.
 */
export const useTradeImageMap = (
  trades: Trade[]
): Record<string, string | null> => {
  const [imageUriMap, setImageUriMap] = useState<Record<string, string | null>>({});

  useEffect(() => {
    let mounted = true;

    const resolveTradeImages = async () => {
      const pairs = await Promise.all(
        trades.map(async (trade) => {
          const resolvedUri = await resolveExistingImageUri(
            trade.thumbnailUri,
            trade.screenshotUri
          );
          return [trade.id, resolvedUri] as const;
        })
      );

      if (!mounted) return;

      const map = Object.fromEntries(pairs);
      setImageUriMap(map);

      const withImages = trades.filter(
        (trade) => !!(trade.thumbnailUri || trade.screenshotUri)
      );
      const unresolved = withImages
        .filter((trade) => !map[trade.id])
        .map((trade) => trade.id);
      console.log('[useTradeImageMap] image debug summary', {
        totalTrades: trades.length,
        withImages: withImages.length,
        resolvedImages: Object.values(map).filter(Boolean).length,
        unresolvedTradeIds: unresolved,
      });
    };

    resolveTradeImages();

    return () => {
      mounted = false;
    };
  }, [trades]);

  return imageUriMap;
};

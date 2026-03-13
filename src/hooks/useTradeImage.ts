import { useEffect, useState } from 'react';
import { Trade } from '../types';
import { resolveExistingImageUri } from '../utils/imageUtils';
import { logImageUriDebug } from '../utils/imageUtils';

/**
 * Resolves the best display image URI for a single trade (used by the
 * detail screen to show the fullscreen chart image).
 *
 * Prefers screenshotUri over thumbnailUri.
 */
export const useTradeImage = (trade: Trade | null): string | null => {
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const resolveDetailImage = async () => {
      if (!trade) {
        if (mounted) setImageUri(null);
        return;
      }

      const resolved = await resolveExistingImageUri(
        trade.screenshotUri,
        trade.thumbnailUri
      );
      console.log('[useTradeImage] resolved detail image URI', {
        tradeId: trade.id,
        screenshotUri: trade.screenshotUri,
        thumbnailUri: trade.thumbnailUri,
        resolved,
      });

      if (mounted) setImageUri(resolved);
    };

    resolveDetailImage();

    return () => {
      mounted = false;
    };
  }, [trade]);

  return imageUri;
};

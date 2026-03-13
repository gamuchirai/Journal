import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';

// Use a simple string path for trade images
const THUMBNAIL_WIDTH = 300;
const THUMBNAIL_HEIGHT = 300;

export const normalizeImageUri = (uri: string | null | undefined): string | null => {
  if (!uri) return null;

  const trimmed = uri.trim();
  if (!trimmed) return null;

  if (
    trimmed.startsWith('file://') ||
    trimmed.startsWith('content://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    return `file://${trimmed}`;
  }

  if (trimmed.startsWith('file:/')) {
    return `file:///${trimmed.replace(/^file:\/+/, '')}`;
  }

  return trimmed;
};

export const logImageUriDebug = async (label: string, uri: string | null | undefined) => {
  const normalized = normalizeImageUri(uri);
  if (!normalized) {
    console.log(`[imageUtils] ${label}: uri is empty`);
    return;
  }

  try {
    if (normalized.startsWith('file://')) {
      const info = await FileSystem.getInfoAsync(normalized);
      console.log('[imageUtils] URI debug', {
        label,
        originalUri: uri,
        normalizedUri: normalized,
        exists: info.exists,
        size: 'size' in info ? info.size : undefined,
      });
      return;
    }

    console.log('[imageUtils] URI debug', {
      label,
      originalUri: uri,
      normalizedUri: normalized,
      exists: 'skipped (non-file URI)',
    });
  } catch (error) {
    console.error(`[imageUtils] Failed URI debug for ${label}:`, error);
  }
};

// Get persistent image directory path
const getImageStorageDir = () => {
  if (FileSystem.documentDirectory) {
    return `${FileSystem.documentDirectory}trade_images/`;
  }

  if (FileSystem.cacheDirectory) {
    console.warn('[imageUtils] documentDirectory unavailable, falling back to cacheDirectory');
    return `${FileSystem.cacheDirectory}trade_images/`;
  }

  throw new Error('No writable file-system directory available');
};

// Ensure cache directory exists
export const ensureImageCacheDir = async () => {
  const dirPath = getImageStorageDir();
  const dirInfo = await FileSystem.getInfoAsync(dirPath);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
  }
};

// Generate unique filename for image
export const generateImageFilename = (prefix: string = 'trade'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Compress and save full image
export const compressImage = async (imageUri: string): Promise<string> => {
  try {
    await ensureImageCacheDir();
    console.log('[imageUtils] compressImage source:', imageUri);

    const filename = generateImageFilename('full');
    const result = await ImageManipulator.manipulateAsync(
      imageUri,
      [],
      {
        compress: 0.75, // 75% quality
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    const destinationUri = `${getImageStorageDir()}${filename}.jpg`;
    await FileSystem.copyAsync({
      from: result.uri,
      to: destinationUri,
    });

    await logImageUriDebug('compressImage.destinationUri', destinationUri);

    return destinationUri;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
};

// Create and save thumbnail
export const createThumbnail = async (imageUri: string): Promise<string> => {
  try {
    await ensureImageCacheDir();
    console.log('[imageUtils] createThumbnail source:', imageUri);

    const filename = generateImageFilename('thumb');
    const result = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        {
          resize: {
            width: THUMBNAIL_WIDTH,
            height: THUMBNAIL_HEIGHT,
          },
        },
      ],
      {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    const destinationUri = `${getImageStorageDir()}${filename}.jpg`;
    await FileSystem.copyAsync({
      from: result.uri,
      to: destinationUri,
    });

    await logImageUriDebug('createThumbnail.destinationUri', destinationUri);

    return destinationUri;
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    throw error;
  }
};

// Process and save image (both full and thumbnail)
export const processAndSaveImage = async (imageUri: string) => {
  try {
    console.log('[imageUtils] processAndSaveImage input:', imageUri);
    const [fullUri, thumbnailUri] = await Promise.all([
      compressImage(imageUri),
      createThumbnail(imageUri),
    ]);

    console.log('[imageUtils] processAndSaveImage output:', {
      fullUri,
      thumbnailUri,
    });

    return { fullUri, thumbnailUri };
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
};

// Delete image file
export const deleteImage = async (imageUri: string) => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(imageUri);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

// Delete both full and thumbnail
export const deleteTradeImages = async (
  screenshotUri: string | null,
  thumbnailUri: string | null
) => {
  const deletePromises = [];
  if (screenshotUri) deletePromises.push(deleteImage(screenshotUri));
  if (thumbnailUri) deletePromises.push(deleteImage(thumbnailUri));

  if (deletePromises.length > 0) {
    await Promise.all(deletePromises);
  }
};

const fileUriExists = async (uri: string) => {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    return info.exists;
  } catch {
    return false;
  }
};

export const resolveExistingImageUri = async (
  ...uris: Array<string | null | undefined>
): Promise<string | null> => {
  for (const uri of uris) {
    const normalized = normalizeImageUri(uri);
    if (!normalized) continue;

    if (!normalized.startsWith('file://')) {
      return normalized;
    }

    const exists = await fileUriExists(normalized);
    if (exists) {
      return normalized;
    }
  }

  return null;
};

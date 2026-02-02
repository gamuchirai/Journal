import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

const IMAGE_CACHE_DIR = FileSystem.documentDirectory + 'trade_images/';
const THUMBNAIL_WIDTH = 300;
const THUMBNAIL_HEIGHT = 300;

// Ensure cache directory exists
export const ensureImageCacheDir = async () => {
  const dirInfo = await FileSystem.getInfoAsync(IMAGE_CACHE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(IMAGE_CACHE_DIR, { intermediates: true });
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

    const filename = generateImageFilename('full');
    const result = await ImageManipulator.manipulateAsync(
      imageUri,
      [],
      {
        compress: 0.75, // 75% quality
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    const destinationUri = IMAGE_CACHE_DIR + filename + '.jpg';
    await FileSystem.copyAsync({
      from: result.uri,
      to: destinationUri,
    });

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

    const destinationUri = IMAGE_CACHE_DIR + filename + '.jpg';
    await FileSystem.copyAsync({
      from: result.uri,
      to: destinationUri,
    });

    return destinationUri;
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    throw error;
  }
};

// Process and save image (both full and thumbnail)
export const processAndSaveImage = async (imageUri: string) => {
  try {
    const [fullUri, thumbnailUri] = await Promise.all([
      compressImage(imageUri),
      createThumbnail(imageUri),
    ]);

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

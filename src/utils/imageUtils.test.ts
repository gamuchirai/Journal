jest.mock('expo-image-manipulator', () => ({
  __esModule: true,
  manipulateAsync: jest.fn(),
  SaveFormat: {
    JPEG: 'jpeg',
  },
}));

jest.mock('expo-file-system/legacy', () => ({
  __esModule: true,
  cacheDirectory: 'file:///cache/',
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  copyAsync: jest.fn(),
  deleteAsync: jest.fn(),
}));

import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import {
  ensureImageCacheDir,
  generateImageFilename,
  compressImage,
  createThumbnail,
  deleteTradeImages,
} from './imageUtils';

const mockImageManipulator = ImageManipulator as jest.Mocked<typeof ImageManipulator>;
const mockFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;

describe('imageUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(1700000000000);
    jest.spyOn(Math, 'random').mockReturnValue(0.123456789);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates cache dir when missing', async () => {
    mockFileSystem.getInfoAsync.mockResolvedValue({ exists: false } as any);

    await ensureImageCacheDir();

    expect(mockFileSystem.getInfoAsync).toHaveBeenCalledWith('file:///cache/trade_images/');
    expect(mockFileSystem.makeDirectoryAsync).toHaveBeenCalledWith('file:///cache/trade_images/', {
      intermediates: true,
    });
  });

  it('generates deterministic filename with prefix', () => {
    const name = generateImageFilename('full');
    expect(name.startsWith('full_1700000000000_')).toBe(true);
  });

  it('compresses image and copies to cache', async () => {
    mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
    mockImageManipulator.manipulateAsync.mockResolvedValue({ uri: 'file:///tmp/compressed.jpg' } as any);

    const result = await compressImage('file:///tmp/source.jpg');

    expect(mockImageManipulator.manipulateAsync).toHaveBeenCalledWith('file:///tmp/source.jpg', [], {
      compress: 0.75,
      format: 'jpeg',
    });
    expect(mockFileSystem.copyAsync).toHaveBeenCalledTimes(1);
    expect(result.startsWith('file:///cache/trade_images/full_')).toBe(true);
    expect(result.endsWith('.jpg')).toBe(true);
  });

  it('creates thumbnail using resize action', async () => {
    mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);
    mockImageManipulator.manipulateAsync.mockResolvedValue({ uri: 'file:///tmp/thumb.jpg' } as any);

    await createThumbnail('file:///tmp/source.jpg');

    expect(mockImageManipulator.manipulateAsync).toHaveBeenCalledWith(
      'file:///tmp/source.jpg',
      [{ resize: { width: 200, height: 200 } }],
      { compress: 0.7, format: 'jpeg' }
    );
  });

  it('deletes only defined image uris', async () => {
    mockFileSystem.getInfoAsync.mockResolvedValue({ exists: true } as any);

    await deleteTradeImages('file:///cache/full.jpg', null);

    expect(mockFileSystem.deleteAsync).toHaveBeenCalledWith('file:///cache/full.jpg');
    expect(mockFileSystem.deleteAsync).toHaveBeenCalledTimes(1);
  });
});

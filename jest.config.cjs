module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'jsdom',
  testMatch: ['**/?(*.)+(test).ts', '**/?(*.)+(test).tsx'],
  clearMocks: true,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};

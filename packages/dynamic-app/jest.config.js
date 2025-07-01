module.exports = {
  // 1) Use the ts-jest preset that handles both TS & JS with JSX
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'jsdom',

  // 2) Where to find your tests
  roots: ['<rootDir>/components', '<rootDir>/pages', '<rootDir>/hooks'],

  // 3) File types Jest will process
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // 4) How to transform files
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },

  // 5) Stub out CSS module imports
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },

  // 6) Run this setup file (now in TS!) after the test environment is set up
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // 7) Which files to treat as tests
  testMatch: ['**/__tests__/**/*.(ts|tsx)', '**/?(*.)+(spec|test).(ts|tsx)'],
};
module.exports = {
  root: true,
  extends: '@react-native',
  ignorePatterns: ['src/assets/icons/index.ts'],
  overrides: [
    {
      files: ['__tests__/**/*', 'jest.setup.js'],
      env: {jest: true},
    },
  ],
};

module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|react-native-linear-gradient|react-native-svg|react-native-safe-area-context)/)',
  ],
};

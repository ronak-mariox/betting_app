/* Native modules that have no JS-only implementation under Jest. */
jest.mock('react-native-linear-gradient', () => 'LinearGradient');

jest.mock('react-native-safe-area-context', () => {
  const inset = {top: 47, right: 0, bottom: 34, left: 0};
  const React = require('react');
  return {
    SafeAreaProvider: ({children}) => React.createElement('SafeAreaProvider', null, children),
    useSafeAreaInsets: () => inset,
  };
});

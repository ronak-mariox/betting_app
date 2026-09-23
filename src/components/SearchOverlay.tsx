import React, {useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, hairline, scale, spacing, type} from '../theme';
import {Icon} from './Icon';
import {TextField} from './TextField';

type SearchOverlayProps = {
  /** Trending queries listed under the field. */
  suggestions: string[];
  onCancel?: () => void;
  onSelect?: (query: string) => void;
};

/**
 * Full-bleed search surface — Figma node 9:2504.
 * Covers the Home content while the bottom nav stays visible, so it renders
 * inside HomeScreen rather than as a route of its own.
 */
export const SearchOverlay = ({
  suggestions,
  onCancel,
  onSelect,
}: SearchOverlayProps) => {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  return (
    <View style={styles.overlay}>
      <View style={[styles.searchRow, {paddingTop: insets.top + spacing.xxl}]}>
        <TextField
          size="sm"
          icon="searchSm"
          placeholder="Search matches, teams…"
          value={query}
          onChangeText={setQuery}
          autoFocus
          returnKeyType="search"
          accessibilityLabel="Search matches and teams"
        />
        <Pressable
          onPress={onCancel}
          hitSlop={spacing.md}
          accessibilityRole="button">
          <Text style={type.linkStrong}>Cancel</Text>
        </Pressable>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.list}>
        {suggestions.map(suggestion => (
          <Pressable
            key={suggestion}
            onPress={() => onSelect?.(suggestion)}
            android_ripple={{color: colors.borderTile}}
            style={({pressed}) => [styles.row, pressed && styles.pressed]}>
            <Icon name="trending" />
            <Text style={type.suggestion}>{suggestion}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bgDeep,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg, // 12
    paddingHorizontal: spacing.gutter, // 16
    paddingBottom: spacing.lg, // 12
  },
  list: {
    flex: 1,
    paddingHorizontal: spacing.gutter, // 16
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg, // 12
    paddingTop: spacing.lg, // 12
    paddingBottom: scale(12.701),
    borderBottomWidth: hairline,
    borderBottomColor: colors.borderTile,
  },
  pressed: {
    opacity: 0.7,
  },
});

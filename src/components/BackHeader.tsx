import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {spacing, type} from '../theme';
import {Button} from './Button';

type BackHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
};

/**
 * Back button + title/subtitle bar used by the inner screens.
 * Padding: 20 top / 16 sides / 16 bottom, plus the safe-area top inset.
 */
export const BackHeader = ({title, subtitle, onBack}: BackHeaderProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, {paddingTop: insets.top + spacing.xxl}]}>
      <Button
        variant="icon"
        icon="arrowLeft"
        onPress={onBack}
        accessibilityLabel="Go back"
      />
      <View style={styles.copy}>
        <Text style={type.screenTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[type.screenSubtitle, styles.subtitle]}
            numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg, // 12
    paddingHorizontal: spacing.gutter, // 16
    paddingBottom: spacing.xl, // 16
  },
  copy: {
    flex: 1,
  },
  subtitle: {
    paddingTop: spacing.xxs, // 2
  },
});

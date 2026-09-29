import React from 'react';
import {StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import {colors, radius, scale, spacing, type} from '../theme';
import {Badge} from './Badge';
import {Button} from './Button';

type SectionHeaderProps = {
  title: string;
  /** Pink dot before the title, as on "Live Now". */
  showLiveDot?: boolean;
  /** Count pill after the title. */
  count?: number;
  /** Right-hand link label — "See All" / "View All". */
  actionLabel?: string;
  /** Renders the chevron after the link (only "See All" has one). */
  actionChevron?: boolean;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** Row that titles each Home section, with an optional right-aligned link. */
export const SectionHeader = ({
  title,
  showLiveDot = false,
  count,
  actionLabel,
  actionChevron = false,
  onActionPress,
  style,
}: SectionHeaderProps) => (
  <View style={[styles.row, style]}>
    <View style={styles.left}>
      {showLiveDot ? <View style={styles.liveDot} /> : null}
      <Text style={type.sectionTitle}>{title}</Text>
      {count !== undefined ? (
        <Badge label={String(count)} variant="count" />
      ) : null}
    </View>

    {actionLabel ? (
      <Button
        variant="ghost"
        label={actionLabel}
        iconRight={actionChevron ? 'chevronRight' : undefined}
        onPress={onActionPress}
        labelStyle={type.link}
      />
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md, // 8
  },
  liveDot: {
    width: scale(7.994),
    height: scale(7.994),
    borderRadius: radius.pill,
    backgroundColor: colors.live,
    opacity: 0.51,
  },
});

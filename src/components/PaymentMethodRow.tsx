import React from 'react';
import {Image, ImageSourcePropType, StyleSheet, Text, View} from 'react-native';
import {colors, hairline, radius, scale, spacing, type} from '../theme';
import {Card} from './Card';
import {Icon, IconName} from './Icon';

export type PaymentMethod = {
  id: string;
  name: string;
  subtitle: string;
  /** Brand logos ship as PNGs; Net Banking and Card are SVG icons. */
  logo?: ImageSourcePropType;
  icon?: IconName;
  /** Optional green tag — "Popular" / "Instant". */
  tag?: string;
};

type PaymentMethodRowProps = {
  method: PaymentMethod;
  selected: boolean;
  onSelect: (id: string) => void;
};

/** One selectable payment option, with a radio on the right. */
export const PaymentMethodRow = ({
  method,
  selected,
  onSelect,
}: PaymentMethodRowProps) => (
  <Card
    onPress={() => onSelect(method.id)}
    borderColor={selected ? colors.primary : colors.borderCard}
    style={selected ? styles.selected : undefined}
    contentStyle={styles.content}>
    {method.logo ? (
      <Image source={method.logo} style={styles.logo} resizeMode="contain" />
    ) : (
      <Icon name={method.icon!} />
    )}

    <View style={styles.copy}>
      <Text style={type.txnTitle}>{method.name}</Text>
      <Text style={type.league}>{method.subtitle}</Text>
    </View>

    {method.tag ? (
      <View style={styles.tag}>
        <Text style={[type.statusPill, styles.tagLabel]}>{method.tag}</Text>
      </View>
    ) : null}

    <View style={[styles.radio, selected && styles.radioOn]}>
      {selected ? <View style={styles.radioDot} /> : null}
    </View>
  </Card>
);

const styles = StyleSheet.create({
  selected: {
    backgroundColor: colors.tintPrimary, // 8% blue when chosen
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg, // 12
    padding: scale(16.701),
  },
  logo: {
    width: scale(32),
    height: scale(32),
  },
  copy: {
    flex: 1,
  },
  tag: {
    paddingHorizontal: spacing.md, // 8
    paddingVertical: spacing.xxs, // 2
    borderRadius: radius.pill,
    backgroundColor: colors.chipSuccessStrong,
  },
  tagLabel: {
    color: colors.success,
  },
  radio: {
    width: scale(19.997),
    height: scale(19.997),
    borderRadius: radius.pill,
    borderWidth: Math.max(hairline, scale(1.402)),
    borderColor: colors.borderRadio,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: scale(9.998),
    height: scale(9.998),
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
});

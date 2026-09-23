import React from 'react';
import {StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import {colors, radius, scale, spacing, type} from '../theme';
import {Card} from './Card';
import {Icon, IconName} from './Icon';

export type Feature = {
  id: string;
  icon: IconName;
  /** 13%-alpha well behind the icon — one per feature colour. */
  wellColor: string;
  title: string;
  subtitle: string;
};

type FeatureCardProps = {
  feature: Feature;
  style?: StyleProp<ViewStyle>;
};

/** One tile of the Welcome screen's 2 × 2 feature grid — 165 × 120. */
export const FeatureCard = ({feature, style}: FeatureCardProps) => (
  <Card
    borderColor={colors.borderTile}
    style={style}
    contentStyle={styles.content}>
    <View style={[styles.well, {backgroundColor: feature.wellColor}]}>
      <Icon name={feature.icon} />
    </View>
    <Text style={[type.featureTitle, styles.title]} numberOfLines={1}>
      {feature.title}
    </Text>
    <Text style={[type.featureSub, styles.subtitle]} numberOfLines={1}>
      {feature.subtitle}
    </Text>
  </Card>
);

const styles = StyleSheet.create({
  content: {
    padding: scale(16.701),
  },
  well: {
    width: scale(35.997),
    height: scale(35.997),
    borderRadius: radius.sm, // 14
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    paddingTop: spacing.lg, // 12
  },
  subtitle: {
    paddingTop: spacing.xxs, // 2
  },
});

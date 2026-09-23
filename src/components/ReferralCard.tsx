import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, radius, scale, spacing, type} from '../theme';
import {Button} from './Button';
import {Card} from './Card';
import {Icon} from './Icon';

type ReferralCardProps = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  onPress?: () => void;
};

/** "Invite Friends" row — 168.41° indigo gradient with a cyan hairline border. */
export const ReferralCard = ({
  title,
  subtitle,
  ctaLabel,
  onPress,
}: ReferralCardProps) => (
  <Card
    variant="gradient"
    gradient="referral"
    borderColor={colors.borderAccent}
    onPress={onPress}
    contentStyle={styles.content}>
    <View style={styles.iconWell}>
      <Icon name="users" />
    </View>

    <View style={styles.copy}>
      <Text style={type.cardTitle}>{title}</Text>
      <Text style={type.promoSub}>{subtitle}</Text>
    </View>

    <Button variant="tint" size="sm" label={ctaLabel} onPress={onPress} />
  </Card>
);

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg, // 12
    padding: scale(16.701),
  },
  iconWell: {
    width: scale(39.994),
    height: scale(39.994),
    borderRadius: radius.sm, // 14
    backgroundColor: colors.tintAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
});

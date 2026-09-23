import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {scale, spacing, type} from '../theme';
import {Button} from './Button';
import {Card} from './Card';

type PromoCardProps = {
  title: string;
  headline: string;
  subtitle: string;
  ctaLabel: string;
  /** Large decorative emoji on the right — 🏆 at 48pt. */
  emoji: string;
  onPress?: () => void;
};

/** "Welcome Bonus" banner — 134 tall, 159.48° green gradient. */
export const PromoCard = ({
  title,
  headline,
  subtitle,
  ctaLabel,
  emoji,
  onPress,
}: PromoCardProps) => (
  <Card
    variant="gradient"
    gradient="bonus"
    style={styles.card}
    contentStyle={styles.content}>
    <View style={styles.copy}>
      <Text style={type.promoTitle}>{title}</Text>
      <Text style={type.promoHeadline}>{headline}</Text>
      <Text style={type.promoSub}>{subtitle}</Text>
      <Button
        variant="success"
        size="sm"
        label={ctaLabel}
        onPress={onPress}
        style={styles.cta}
      />
    </View>

    <View style={styles.emojiWrap}>
      <Text style={type.promoTrophy}>{emoji}</Text>
    </View>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    height: scale(133.967),
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl, // 16
    padding: spacing.xl, // 16
  },
  copy: {
    flexShrink: 1,
  },
  cta: {
    alignSelf: 'flex-start',
    marginTop: spacing.md, // 8
    height: scale(27.98),
    paddingHorizontal: spacing.xl, // 16
  },
  emojiWrap: {
    flex: 1,
    alignItems: 'flex-end',
    alignSelf: 'flex-start',
  },
});

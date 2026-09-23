import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, hairline, radius, scale, spacing, type} from '../theme';

type InfoCalloutProps = {
  /** Leading emoji — 💡 on the login screen. Omitted by the warning tone. */
  emoji?: string;
  title?: string;
  body: string;
  /**
   * `gold` — 5% gold fill, titled tip box (login).
   * `warning` — 6% amber fill, single amber paragraph (withdraw).
   */
  tone?: 'gold' | 'warning';
};

/** Bordered notice box. */
export const InfoCallout = ({
  emoji,
  title,
  body,
  tone = 'gold',
}: InfoCalloutProps) => (
  <View
    style={[
      styles.container,
      tone === 'warning' ? styles.warning : styles.gold,
    ]}>
    {emoji ? <Text style={type.emojiLg}>{emoji}</Text> : null}
    <View style={styles.copy}>
      {title ? <Text style={type.calloutTitle}>{title}</Text> : null}
      <Text
        style={[
          tone === 'warning' ? type.warnText : type.calloutBody,
          !!title && styles.body,
        ]}>
        {body}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg, // 12
    padding: scale(16.701),
    borderRadius: radius.md, // 16
    borderWidth: hairline,
  },
  gold: {
    backgroundColor: colors.calloutGoldBg,
    borderColor: colors.calloutGoldBorder,
  },
  warning: {
    backgroundColor: colors.calloutWarnBg,
    borderColor: colors.calloutWarnBorder,
  },
  copy: {
    flex: 1,
  },
  body: {
    paddingTop: spacing.xxs, // 2
  },
});

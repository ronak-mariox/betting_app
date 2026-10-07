import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Button, Icon} from '../components';
import type {IconName} from '../components';
import {kycStatusCopy} from '../data/kyc';
import type {KycSubmissionSummary} from '../services/api';
import {formatKycDate} from '../utils/kyc';
import {
  colors,
  gradients,
  hairline,
  radius,
  scale,
  spacing,
  type,
} from '../theme';

type KycStatusScreenProps = {
  submission: KycSubmissionSummary;
  checking: boolean;
  onCheckStatus: () => void;
  onGoToApp: () => void;
  onResubmit: () => void;
};

const BADGE: Record<
  KycSubmissionSummary['status'],
  {bg: string; color: string; icon: IconName}
> = {
  Pending: {bg: colors.pillWarning, color: colors.warning, icon: 'clock'},
  Verified: {bg: colors.pillSuccess, color: colors.success, icon: 'checkValid'},
  Rejected: {bg: colors.pillDanger, color: colors.danger, icon: 'close'},
};

/**
 * KYC submitted — Figma nodes 312:1011 / 312:1012. The same layout reports the
 * review outcome later (Verified / Rejected). "App Mein Jao" stays disabled
 * until the status is Verified — an under-review player can't enter the app.
 */
export const KycStatusScreen = ({
  submission,
  checking,
  onCheckStatus,
  onGoToApp,
  onResubmit,
}: KycStatusScreenProps) => {
  const insets = useSafeAreaInsets();
  const copy = kycStatusCopy[submission.status];
  const badge = BADGE[submission.status];
  const rejected = submission.status === 'Rejected';
  /** The app opens only once KYC is verified; under review keeps "App Mein Jao" disabled. */
  const verified = submission.status === 'Verified';
  /** The big badge is green for submitted / verified, red with a cross once rejected. */
  const hero = rejected ? gradients.dangerBadge : gradients.successBadge;

  const rows = [
    {label: kycStatusCopy.referenceId, value: submission.referenceId},
    {
      label: kycStatusCopy.submittedOn,
      value: formatKycDate(submission.submittedAt),
    },
    ...(rejected && submission.rejectionReason
      ? [{label: kycStatusCopy.reason, value: submission.rejectionReason}]
      : []),
  ];

  return (
    <View style={[styles.screen, {paddingTop: insets.top}]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.ring, rejected && styles.ringRejected]}>
          <LinearGradient
            useAngle
            angle={hero.angle}
            colors={[...hero.colors]}
            locations={[...hero.locations]}
            style={styles.badge}>
            {rejected ? (
              <Icon name="close" size={28} color={colors.textPrimary} />
            ) : (
              <Icon name="checkLg" />
            )}
          </LinearGradient>
        </View>

        <Text style={[type.kycDoneTitle, styles.title]}>{copy.title}</Text>
        <Text style={[type.welcomeTagline, styles.body]}>{copy.body}</Text>

        <View style={styles.summary}>
          {rows.map(row => (
            <View key={row.label} style={styles.summaryRow}>
              <Text style={type.kycSummaryLabel}>{row.label}</Text>
              <Text style={[type.kycSummaryValue, styles.summaryValue]}>
                {row.value}
              </Text>
            </View>
          ))}
          <View style={[styles.summaryRow, styles.summaryLast]}>
            <Text style={type.kycSummaryLabel}>{kycStatusCopy.status}</Text>
            <View style={[styles.pill, {backgroundColor: badge.bg}]}>
              <Icon name={badge.icon} size={8.997} color={badge.color} />
              <Text style={[type.statusPill, {color: badge.color}]}>
                {copy.badge}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.note}>
          <Icon
            name="alert"
            size={12.998}
            color={colors.accent}
            style={styles.noteIcon}
          />
          <Text style={[type.calloutBody, styles.noteText]}>
            {submission.status === 'Pending'
              ? kycStatusCopy.lockedNote
              : rejected
                ? kycStatusCopy.rejectedNote
                : kycStatusCopy.note}
          </Text>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {paddingBottom: insets.bottom + spacing.xxxl + spacing.md},
        ]}>
        <Button
          variant="outlineLight"
          size="lg"
          label={kycStatusCopy.checkStatus}
          iconRight="arrowRight"
          disabled={checking}
          onPress={onCheckStatus}
          style={styles.cta}
        />
        <Button
          variant="primary"
          size="lg"
          label={rejected ? kycStatusCopy.resubmit : kycStatusCopy.goToApp}
          iconRight="arrowRight"
          disabled={!rejected && !verified}
          onPress={rejected ? onResubmit : onGoToApp}
          style={styles.cta}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl, // 24
  },
  ring: {
    width: scale(96),
    height: scale(96),
    marginBottom: spacing.xxxl, // 24
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.successRing,
    borderWidth: scale(1.607),
    borderColor: colors.successRingBorder,
  },
  ringRejected: {
    backgroundColor: colors.dangerRing,
    borderColor: colors.dangerRingBorder,
  },
  badge: {
    width: scale(63.994),
    height: scale(63.994),
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    paddingBottom: spacing.md, // 8
  },
  body: {
    maxWidth: scale(320),
    paddingBottom: spacing.xxxl, // 24
  },
  summary: {
    alignSelf: 'stretch',
    marginBottom: spacing.xl, // 16
    borderRadius: radius.md, // 16
    backgroundColor: colors.surface,
    borderWidth: hairline,
    borderColor: colors.borderNav, // 8% white
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xl,
    paddingHorizontal: spacing.xl, // 16
    paddingVertical: scale(14),
    borderBottomWidth: hairline,
    borderBottomColor: colors.borderTile, // 6% white
  },
  summaryLast: {
    borderBottomWidth: 0,
  },
  summaryValue: {
    flexShrink: 1,
    textAlign: 'right',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs, // 4
    paddingHorizontal: spacing.md, // 8
    paddingVertical: spacing.xxs, // 2
    borderRadius: radius.pill,
  },
  note: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg, // 12
    padding: scale(14),
    borderRadius: radius.md,
    backgroundColor: colors.noteBg,
    borderWidth: hairline,
    borderColor: colors.noteBorder,
  },
  noteIcon: {
    marginTop: 1,
  },
  noteText: {
    flex: 1,
    textAlign: 'center',
  },
  footer: {
    gap: scale(13),
    paddingHorizontal: spacing.xxxl, // 24
  },
  cta: {
    gap: spacing.md, // 8
  },
});

import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  BackHeader,
  Button,
  Checkbox,
  Icon,
  KycStepIndicator,
} from '../components';
import {kycHeader, kycReview, kycSteps} from '../data/kyc';
import type {KycDraft} from '../data/kyc';
import {maskDocumentNumber} from '../utils/kyc';
import {colors, hairline, radius, spacing, type} from '../theme';

type KycReviewScreenProps = {
  draft: KycDraft;
  submitting: boolean;
  onBack: () => void;
  onEditPersonal: () => void;
  onEditDocument: () => void;
  onOpenLink: (link: string) => void;
  onSubmit: () => void;
};

type Row = {label: string; value: string};

const Section = ({
  title,
  onEdit,
  rows,
  children,
}: {
  title: string;
  onEdit: () => void;
  rows: Row[];
  children?: React.ReactNode;
}) => (
  <View style={styles.card}>
    <View style={styles.cardHead}>
      <Text style={type.kycSectionHead}>{title}</Text>
      <Pressable
        onPress={onEdit}
        hitSlop={spacing.md}
        accessibilityRole="button"
        accessibilityLabel={`${kycReview.edit} ${title}`}
        style={({pressed}) => [styles.edit, pressed && styles.pressed]}>
        <Icon name="pencilSm" />
        <Text style={type.kycEdit}>{kycReview.edit}</Text>
      </Pressable>
    </View>
    {rows.map(row => (
      <View key={row.label} style={styles.row}>
        <Text style={type.kycRowLabel}>{row.label}</Text>
        <Text style={[type.kycRowValue, styles.rowValue]} numberOfLines={2}>
          {row.value}
        </Text>
      </View>
    ))}
    {children}
  </View>
);

/** KYC step 3 — review and consent, Figma nodes 312:678 (unticked) / 312:843 (ticked). */
export const KycReviewScreen = ({
  draft,
  submitting,
  onBack,
  onEditPersonal,
  onEditDocument,
  onOpenLink,
  onSubmit,
}: KycReviewScreenProps) => {
  const insets = useSafeAreaInsets();
  const [agreed, setAgreed] = useState(false);
  const files = [draft.front?.name, draft.back?.name].filter(
    (name): name is string => Boolean(name),
  );

  return (
    <View style={styles.screen}>
      <BackHeader
        title={kycHeader.title}
        subtitle={kycHeader.review}
        onBack={onBack}
      />
      <KycStepIndicator steps={kycSteps} current={2} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {paddingBottom: insets.bottom + spacing.xxxl + spacing.md},
        ]}>
        <Section
          title={kycReview.personalHead}
          onEdit={onEditPersonal}
          rows={[
            {label: kycReview.fullName, value: draft.fullName.trim()},
            {label: kycReview.phone, value: `+91 ${draft.phone.trim()}`},
            {label: kycReview.dob, value: draft.dob},
            {label: kycReview.address, value: draft.address.trim()},
            {
              label: kycReview.cityState,
              value: `${draft.city.trim()}, ${draft.state.trim()}`,
            },
            {label: kycReview.country, value: draft.country.trim()},
            {label: kycReview.postalCode, value: draft.postalCode.trim()},
          ]}
        />

        <Section
          title={kycReview.identityHead}
          onEdit={onEditDocument}
          rows={[
            {label: kycReview.documentType, value: draft.documentType},
            {
              label: kycReview.documentNumber,
              value: maskDocumentNumber(draft.documentNumber),
            },
          ]}>
          <View style={[styles.row, styles.filesRow]}>
            <Text style={type.kycRowLabel}>{kycReview.uploaded}</Text>
            <View style={styles.files}>
              {files.map(name => (
                <View key={name} style={styles.file}>
                  <Icon name="checkCircle" size={11.994} />
                  <Text style={type.kycFileName} numberOfLines={1}>
                    {name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Section>

        <View style={[styles.consent, agreed && styles.consentOn]}>
          <Checkbox
            checked={agreed}
            onChange={setAgreed}
            accessibilityLabel="I confirm my KYC details are correct">
            <Text style={type.consent}>
              {kycReview.consentBefore}
              <Text
                style={styles.link}
                onPress={() => onOpenLink('Privacy Policy')}>
                {kycReview.privacy}
              </Text>
              {kycReview.consentAnd}
              <Text
                style={styles.link}
                onPress={() => onOpenLink('Terms & Conditions')}>
                {kycReview.terms}
              </Text>
              {kycReview.consentAfter}
            </Text>
          </Checkbox>
        </View>

        <Button
          variant="primary"
          size="lg"
          icon="kycShieldSm"
          label={submitting ? kycReview.submitting : kycReview.cta}
          disabled={!agreed || submitting}
          onPress={onSubmit}
          style={styles.cta}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  content: {
    gap: spacing.xl, // 16
    paddingHorizontal: spacing.gutter, // 16
  },
  card: {
    overflow: 'hidden',
    borderRadius: radius.md, // 16
    borderWidth: hairline,
    borderColor: colors.borderCard, // 7% white
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, // 16
    paddingVertical: spacing.lg, // 12
    backgroundColor: colors.reviewHead,
  },
  edit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs, // 4
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, // 16
    paddingVertical: spacing.lg, // 12
    backgroundColor: colors.surface,
    borderTopWidth: hairline,
    borderTopColor: colors.borderTile, // 6% white
  },
  rowValue: {
    flex: 1,
    paddingLeft: spacing.xl, // 16
  },
  filesRow: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  files: {
    gap: spacing.sm, // 6
    paddingTop: spacing.md, // 8
  },
  file: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md, // 8
  },
  consent: {
    padding: spacing.xl, // 16
    borderRadius: radius.md,
    backgroundColor: colors.tintRow, // 4% blue
    borderWidth: hairline,
    borderColor: colors.borderNav, // 8% white
  },
  consentOn: {
    borderColor: colors.kycHeroBorder, // 30% blue
  },
  link: {
    color: colors.accent,
  },
  cta: {
    gap: spacing.md, // 8
  },
  pressed: {
    opacity: 0.75,
  },
});

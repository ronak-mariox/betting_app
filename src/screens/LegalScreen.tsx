import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {BackHeader, InfoCallout} from '../components';
import {LegalDocument} from '../data/legal';
import {colors, scale, spacing, type} from '../theme';

type LegalScreenProps = {
  document: LegalDocument;
  onBack?: () => void;
};

/**
 * Reusable document reader for Privacy Policy and Terms & Conditions.
 * These screens are not in the Figma file; they reuse the existing BackHeader
 * and card typography so they sit consistently with the rest of the app.
 */
export const LegalScreen = ({document, onBack}: LegalScreenProps) => (
  <View style={styles.screen}>
    <BackHeader
      title={document.title}
      subtitle={document.updated}
      onBack={onBack}
    />

    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.body}>
      <InfoCallout
        tone="warning"
        body="⚠️ Placeholder text — replace with your approved legal copy before release."
      />

      {document.sections.map(section => (
        <View key={section.heading}>
          <Text style={type.cardTitle}>{section.heading}</Text>
          <Text style={[type.faqAnswer, styles.paragraph]}>{section.body}</Text>
        </View>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  body: {
    gap: spacing.xxl, // 20
    paddingHorizontal: spacing.gutter, // 16
    paddingBottom: scale(32),
  },
  paragraph: {
    paddingTop: spacing.md, // 8
  },
});

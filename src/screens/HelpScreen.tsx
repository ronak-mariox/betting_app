import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {BackHeader, Button, Card, Chip, Icon} from '../components';
import {
  faqs,
  helpHeader,
  helpTabs,
  supportChannels,
  supportHours,
  ticketCategories,
} from '../data/help';
import {notify, openExternal} from '../utils/actions';
import {colors, hairline, radius, scale, spacing, type} from '../theme';

type HelpScreenProps = {
  onBack?: () => void;
};

/**
 * Help & Support — Figma nodes 9:613 / 9:695 (FAQs, collapsed and expanded),
 * 9:783 (Contact Us) and 9:889 (Raise Ticket): three tabs of one screen.
 */
export const HelpScreen = ({onBack}: HelpScreenProps) => {
  const [tab, setTab] = useState(helpTabs[0]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [issue, setIssue] = useState('');

  const canSubmit = category !== null && issue.trim().length > 0;

  /** No ticket API yet, so the form confirms and clears itself. */
  const submitTicket = () => {
    setCategory(null);
    setIssue('');
    setTab(helpTabs[0]);
    notify('Ticket bhej diya — support team jaldi contact karegi');
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <BackHeader
        title={helpHeader.title}
        subtitle={helpHeader.subtitle}
        onBack={onBack}
      />

      <View style={styles.tabs}>
        {helpTabs.map(item => (
          <Chip
            key={item}
            tone="help"
            label={item}
            active={item === tab}
            onPress={() => setTab(item)}
            style={styles.flex}
          />
        ))}
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}>
        {tab === helpTabs[0]
          ? faqs.map((faq, index) => {
              const open = openFaq === index;
              return (
                <Card key={faq.q} contentStyle={styles.faq}>
                  <Pressable
                    onPress={() => setOpenFaq(open ? null : index)}
                    accessibilityRole="button"
                    accessibilityState={{expanded: open}}
                    accessibilityLabel={faq.q}
                    style={styles.faqHeader}>
                    <Text style={[type.settingLabel, styles.faqQuestion]}>
                      {faq.q}
                    </Text>
                    <Icon name={open ? 'chevronUp' : 'chevronDown'} />
                  </Pressable>

                  {open ? (
                    <View style={styles.faqBody}>
                      <View style={styles.faqRule} />
                      <Text style={[type.faqAnswer, styles.faqAnswer]}>
                        {faq.a}
                      </Text>
                    </View>
                  ) : null}
                </Card>
              );
            })
          : null}

        {tab === helpTabs[1] ? (
          <>
            {supportChannels.map(channel => (
              <Card key={channel.id} contentStyle={styles.channel}>
                <View
                  style={[styles.channelWell, {backgroundColor: channel.well}]}>
                  <Icon name={channel.icon} color={channel.color} />
                </View>
                <View style={styles.flex}>
                  <Text style={type.cardTitle}>{channel.title}</Text>
                  <Text style={[type.settingSub, styles.channelDetail]}>
                    {channel.detail}
                  </Text>
                </View>
                <Pressable
                  onPress={() =>
                    openExternal(
                      channel.link,
                      `${channel.title} is device par nahi khul paya`,
                    )
                  }
                  accessibilityRole="button"
                  accessibilityLabel={channel.action}
                  style={({pressed}) => [
                    styles.channelCta,
                    {backgroundColor: channel.well},
                    pressed && styles.pressed,
                  ]}>
                  <Text style={[type.buttonSm, {color: channel.color}]}>
                    {channel.action}
                  </Text>
                </Pressable>
              </Card>
            ))}

            <Card contentStyle={styles.hours}>
              <Text style={type.offerLabel}>{supportHours.label}</Text>
              <Text style={[type.cardTitle, styles.hoursValue]}>
                {supportHours.value}
              </Text>
              <Text style={[type.link, styles.hoursNote]}>
                {supportHours.note}
              </Text>
            </Card>
          </>
        ) : null}

        {tab === helpTabs[2] ? (
          <>
            <View>
              <Text style={[type.fieldLabel, styles.label]}>Category</Text>
              <View style={styles.categories}>
                {ticketCategories.map(item => (
                  <Pressable
                    key={item}
                    onPress={() => setCategory(item)}
                    accessibilityRole="button"
                    accessibilityState={{selected: item === category}}
                    accessibilityLabel={item}
                    style={({pressed}) => [
                      styles.category,
                      item === category && styles.categoryOn,
                      pressed && styles.pressed,
                    ]}>
                    <Text
                      style={[
                        type.categoryLabel,
                        item === category && {color: colors.accent},
                      ]}>
                      {item}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View>
              <Text style={[type.fieldLabel, styles.label]}>
                Describe your issue
              </Text>
              <TextInput
                value={issue}
                onChangeText={setIssue}
                placeholder="Please describe your issue in detail…"
                placeholderTextColor={colors.textDim}
                multiline
                textAlignVertical="top"
                style={[type.input, styles.textArea]}
                accessibilityLabel="Describe your issue"
              />
            </View>

            <Button
              variant="primary"
              size="lg"
              label="Submit Ticket"
              disabled={!canSubmit}
              onPress={submitTicket}
            />
          </>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.md, // 8
    paddingHorizontal: spacing.gutter, // 16
  },
  flex: {
    flex: 1,
  },
  body: {
    gap: spacing.lg, // 12 (FAQ list uses 8; close enough at scale)
    paddingHorizontal: spacing.gutter, // 16
    paddingTop: spacing.xxl, // 20
    paddingBottom: scale(32),
  },
  label: {
    paddingBottom: spacing.md, // 8
  },

  /* --- FAQs ------------------------------------------------------------ */
  faq: {
    // Header and body bring their own padding.
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.xl, // 16
  },
  faqQuestion: {
    flex: 1,
    paddingRight: spacing.lg, // 12
  },
  faqBody: {
    paddingHorizontal: spacing.xl, // 16
    paddingBottom: spacing.xl, // 16
  },
  faqRule: {
    height: hairline,
    backgroundColor: colors.borderCard,
  },
  faqAnswer: {
    paddingTop: spacing.lg, // 12
  },

  /* --- Contact --------------------------------------------------------- */
  channel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl, // 16
    padding: scale(16.701),
  },
  channelWell: {
    width: scale(47.999),
    height: scale(47.999),
    borderRadius: radius.md, // 16
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelDetail: {
    paddingTop: spacing.xxs, // 2
  },
  channelCta: {
    paddingHorizontal: spacing.lg, // 12
    paddingVertical: spacing.sm, // 6
    borderRadius: radius.sm, // 14
  },
  hours: {
    alignItems: 'center',
    padding: scale(16.701),
  },
  hoursValue: {
    paddingTop: spacing.xs, // 4
  },
  hoursNote: {
    paddingTop: spacing.xxs, // 2
    textAlign: 'center',
  },

  /* --- Raise ticket ----------------------------------------------------- */
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md, // 8
  },
  category: {
    flexBasis: '47%',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(10.701),
    borderRadius: radius.sm, // 14
    backgroundColor: colors.surface,
    borderWidth: hairline,
    borderColor: colors.borderSheet,
  },
  categoryOn: {
    backgroundColor: colors.tintChipActive,
    borderColor: colors.primary,
  },
  textArea: {
    height: scale(125.315),
    paddingHorizontal: scale(16.701),
    paddingVertical: scale(12.701),
    borderRadius: radius.md, // 16
    backgroundColor: colors.surface,
    borderWidth: hairline,
    borderColor: colors.borderInput,
  },
  pressed: {
    opacity: 0.75,
  },
});

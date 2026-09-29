import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import type {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  BackHeader,
  Button,
  KycStepIndicator,
  PickerField,
  TextField,
} from '../components';
import {kycHeader, kycPersonal, kycSteps} from '../data/kyc';
import type {KycDraft} from '../data/kyc';
import {colors, spacing} from '../theme';
import {isPersonalValid, personalChecks} from '../utils/kyc';

type KycPersonalScreenProps = {
  draft: KycDraft;
  onChange: (patch: Partial<KycDraft>) => void;
  onBack: () => void;
  onContinue: () => void;
};

/** Players must be adults, so the calendar stops 18 years back. */
const latestAdultBirthday = () => {
  const today = new Date();
  return new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
};

const toDisplayDate = (date: Date) =>
  `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

const fromDisplayDate = (value: string) => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  return match
    ? new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]))
    : undefined;
};

/** KYC step 1 — personal details, Figma node 312:73. */
export const KycPersonalScreen = ({
  draft,
  onChange,
  onBack,
  onContinue,
}: KycPersonalScreenProps) => {
  const insets = useSafeAreaInsets();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const checks = personalChecks(draft);

  const onPickDate = (event: DateTimePickerEvent, selected?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selected) {
      onChange({dob: toDisplayDate(selected)});
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <BackHeader
        title={kycHeader.title}
        subtitle={kycHeader.personal}
        onBack={onBack}
      />
      <KycStepIndicator steps={kycSteps} current={0} />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.form,
          {paddingBottom: insets.bottom + spacing.xxxl + spacing.md},
        ]}>
        <TextField
          label={kycPersonal.fullName.label}
          icon="user"
          placeholder={kycPersonal.fullName.placeholder}
          value={draft.fullName}
          onChangeText={fullName => onChange({fullName})}
          autoCapitalize="words"
          textContentType="name"
          valid={checks.fullName}
        />
        <TextField
          label={kycPersonal.phone.label}
          icon="phone"
          placeholder={kycPersonal.phone.placeholder}
          value={draft.phone}
          onChangeText={phone => onChange({phone: phone.replace(/\D/g, '')})}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          maxLength={10}
          valid={checks.phone}
          error={
            draft.phone.length > 0 && !checks.phone
              ? kycPersonal.phone.error
              : undefined
          }
        />
        <PickerField
          label={kycPersonal.dob.label}
          icon="calendar"
          value={draft.dob}
          placeholder={kycPersonal.dob.placeholder}
          onPress={() => setShowDatePicker(true)}
        />
        <TextField
          label={kycPersonal.address.label}
          icon="mapPin"
          placeholder={kycPersonal.address.placeholder}
          value={draft.address}
          onChangeText={address => onChange({address})}
          autoCapitalize="words"
          valid={checks.address}
        />
        <TextField
          label={kycPersonal.city.label}
          icon="mapPin"
          placeholder={kycPersonal.city.placeholder}
          value={draft.city}
          onChangeText={city => onChange({city})}
          autoCapitalize="words"
          valid={checks.city}
        />
        <TextField
          label={kycPersonal.state.label}
          icon="mapPin"
          placeholder={kycPersonal.state.placeholder}
          value={draft.state}
          onChangeText={state => onChange({state})}
          autoCapitalize="words"
          valid={checks.state}
        />
        <TextField
          label={kycPersonal.country.label}
          icon="globe"
          iconColor={colors.textMuted}
          placeholder={kycPersonal.country.placeholder}
          value={draft.country}
          onChangeText={country => onChange({country})}
          autoCapitalize="words"
          valid={checks.country}
        />
        <TextField
          label={kycPersonal.postalCode.label}
          icon="mapPin"
          placeholder={kycPersonal.postalCode.placeholder}
          value={draft.postalCode}
          onChangeText={postalCode => onChange({postalCode})}
          keyboardType="number-pad"
          maxLength={10}
          valid={checks.postalCode}
        />

        <View style={styles.ctaWrap}>
          <Button
            variant="primary"
            size="lg"
            label={kycPersonal.cta}
            iconRight="arrowRight"
            disabled={!isPersonalValid(draft)}
            onPress={onContinue}
            style={styles.cta}
          />
        </View>
      </ScrollView>

      {showDatePicker ? (
        <DateTimePicker
          value={fromDisplayDate(draft.dob) ?? new Date(2000, 0, 1)}
          mode="date"
          display="default"
          maximumDate={latestAdultBirthday()}
          onChange={onPickDate}
        />
      ) : null}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  form: {
    gap: spacing.xl, // 16
    paddingHorizontal: spacing.gutter, // 16
  },
  ctaWrap: {
    paddingTop: spacing.md, // 8
  },
  cta: {
    gap: spacing.md, // 8
  },
});

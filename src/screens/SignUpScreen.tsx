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
import LinearGradient from 'react-native-linear-gradient';
import {BackHeader, Checkbox, Icon} from '../components';
import {
  isUsernameValid,
  passwordMinLength,
  signup,
  suggestPassword,
} from '../data/signup';
import {
  colors,
  gradients,
  hairline,
  radius,
  scale,
  spacing,
  type,
} from '../theme';

type SignUpScreenProps = {
  onBack?: () => void;
  /** Every value here is typed by the user; the CTA won't fire until they're valid. */
  /** Resolves to an error message to show under the button, or nothing once the account exists. */
  onSubmit?: (form: {
    username: string;
    password: string;
    referral: string;
  }) => Promise<string | void> | void;
  onLogin?: () => void;
  /** "Terms & Conditions" / "Privacy Policy" in the consent line. */
  onOpenLink?: (link: string) => void;
};

/**
 * Create Account — Figma nodes 62:292 (empty) and 62:366 (filled).
 * Those are one screen: the blue field borders, the green tick, the bonus pill
 * and the enabled CTA in 62:366 are all just the valid state of 62:292.
 */
export const SignUpScreen = ({
  onBack,
  onSubmit,
  onLogin,
  onOpenLink,
}: SignUpScreenProps) => {
  const [username, setUsername] = useState('');
  const [referral, setReferral] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const usernameValid = isUsernameValid(username);
  const referralValid = referral.trim().length > 0;
  const passwordValid = password.length >= passwordMinLength;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = !busy && usernameValid && passwordValid && agreed;

  const submit = async () => {
    setBusy(true);
    setError(null);
    const message = await onSubmit?.({username, password, referral});
    setBusy(false);
    if (message) {
      setError(message);
    }
  };

  /** "Auto" fills the same field and reveals it, so the user can note it down. */
  const fillSuggestedPassword = () => {
    setPassword(suggestPassword());
    setShowPassword(true);
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <BackHeader
        title={signup.title}
        subtitle={signup.subtitle}
        onBack={onBack}
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}>
        {/* Explainer */}
        <View style={styles.infoBox}>
          <View style={styles.infoWell}>
            <Icon name="boltSm" />
          </View>
          <View style={styles.flex}>
            <Text style={type.infoBoxTitle}>{signup.infoTitle}</Text>
            <Text style={[type.infoBoxBody, styles.infoBody]}>
              Apna <Text style={styles.accent}>username</Text> aur{' '}
              <Text style={styles.accent}>password</Text> khud chuno — inhi se
              aage login karoge, yaad rakhna!
            </Text>
          </View>
        </View>

        {/* Username — chosen by the user, so it has to be login-safe */}
        <View>
          <Text style={[type.fieldLabel, styles.label]}>
            {signup.usernameLabel}
          </Text>
          <View style={[styles.field, usernameValid && styles.fieldActive]}>
            <Icon name="userSm" />
            <TextInput
              value={username}
              onChangeText={next => setUsername(next.toLowerCase().trim())}
              placeholder={signup.usernamePlaceholder}
              placeholderTextColor={colors.textDim}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="username"
              style={[type.input, styles.input]}
              accessibilityLabel="Username"
            />
            {usernameValid ? <Icon name="checkValid" /> : null}
          </View>
          {username.length > 0 && !usernameValid ? (
            <Text style={[type.helperText, styles.error]}>
              {signup.usernameInvalid}
            </Text>
          ) : null}
        </View>

        {/* Password — typed by the user; "Auto" fills the same field */}
        <View>
          <Text style={[type.fieldLabel, styles.label]}>
            {signup.passwordLabel}
          </Text>
          <View style={[styles.field, passwordValid && styles.fieldActive]}>
            <Icon name="lock" />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder={signup.passwordPlaceholder}
              placeholderTextColor={colors.textDim}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
              style={[type.input, styles.input]}
              accessibilityLabel="Password"
            />
            <Pressable
              onPress={fillSuggestedPassword}
              accessibilityRole="button"
              accessibilityLabel="Generate a password"
              style={({pressed}) => [
                styles.autoPill,
                pressed && styles.pressed,
              ]}>
              <Icon name="boltSm" />
              <Text style={type.link}>{signup.generateCta}</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowPassword(current => !current)}
              hitSlop={spacing.md}
              accessibilityRole="button"
              accessibilityLabel={
                showPassword ? 'Hide password' : 'Show password'
              }>
              <Icon name="eyeSm" />
            </Pressable>
          </View>
          {password.length > 0 && !passwordValid ? (
            <Text style={[type.helperText, styles.error]}>
              {signup.passwordTooShort}
            </Text>
          ) : null}
        </View>

        {/* Referral */}
        <View>
          <Text style={[type.fieldLabel, styles.label]}>
            {signup.referralLabel}
            <Text style={styles.optional}>{signup.referralOptional}</Text>
          </Text>
          <View style={[styles.field, referralValid && styles.fieldActive]}>
            <Icon name="giftSm" />
            <TextInput
              value={referral}
              onChangeText={next => setReferral(next.toUpperCase())}
              placeholder={signup.referralPlaceholder}
              placeholderTextColor={colors.textDim}
              autoCapitalize="characters"
              autoCorrect={false}
              style={[type.referralInput, styles.input]}
              accessibilityLabel="Referral code"
            />
            {referralValid ? (
              <View style={styles.bonusPill}>
                <Text style={type.bonusLabel}>{signup.bonus}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Consent */}
        <Checkbox
          checked={agreed}
          onChange={setAgreed}
          accessibilityLabel="Agree to terms and confirm age">
          <Text style={type.consent}>
            Main{' '}
            <Text
              style={styles.accent}
              onPress={() => onOpenLink?.('Terms & Conditions')}>
              Terms & Conditions
            </Text>{' '}
            aur{' '}
            <Text
              style={styles.accent}
              onPress={() => onOpenLink?.('Privacy Policy')}>
              Privacy Policy
            </Text>{' '}
            se sehmat hoon aur meri umar 18+ hai
          </Text>
        </Checkbox>

        {/* Submit */}
        <Pressable
          onPress={submit}
          disabled={!canSubmit}
          accessibilityRole="button"
          accessibilityState={{disabled: !canSubmit}}
          accessibilityLabel={signup.submit}
          style={({pressed}) => [
            styles.cta,
            !canSubmit && styles.ctaDisabled,
            pressed && canSubmit && styles.pressed,
          ]}>
          <LinearGradient
            useAngle
            angle={gradients.ctaPrimary.angle}
            colors={[...gradients.ctaPrimary.colors]}
            locations={[...gradients.ctaPrimary.locations]}
            style={styles.ctaFill}>
            <Icon name="boltCta" />
            <Text style={[type.buttonXl, styles.ctaLabel]}>
              {busy ? 'Account ban raha hai…' : signup.submit}
            </Text>
          </LinearGradient>
        </Pressable>

        {error ? (
          <Text
            style={[type.helperText, styles.submitError]}
            accessibilityRole="alert">
            {error}
          </Text>
        ) : null}

        <View style={styles.loginRow}>
          <Text style={type.footerNote}>{signup.loginPrompt} </Text>
          <Pressable
            onPress={onLogin}
            hitSlop={spacing.md}
            accessibilityRole="button"
            accessibilityLabel={signup.loginCta}>
            <Text style={type.footerLink}>{signup.loginCta}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  submitError: {
    color: colors.danger,
    textAlign: 'center',
  },
  screen: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  body: {
    gap: spacing.xxl, // 20
    paddingHorizontal: spacing.xxl, // 20
    paddingBottom: scale(32),
  },
  flex: {
    flex: 1,
  },
  accent: {
    color: colors.accent,
  },
  label: {
    paddingBottom: spacing.md, // 8
  },
  optional: {
    color: colors.textDim,
  },
  autoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs, // 4
    paddingHorizontal: spacing.md, // 8
    paddingVertical: spacing.xs, // 4
    borderRadius: scale(10),
    backgroundColor: colors.copyPill,
  },
  error: {
    paddingTop: spacing.sm, // 6
    color: colors.alertText,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg, // 12
    padding: scale(16.701),
    borderRadius: radius.md, // 16
    backgroundColor: colors.infoBoxBg,
    borderWidth: hairline,
    borderColor: colors.infoBoxBorder,
  },
  infoWell: {
    width: scale(32),
    height: scale(32),
    borderRadius: radius.sm, // 14
    backgroundColor: colors.infoBoxWell,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBody: {
    paddingTop: spacing.xxs, // 2
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg, // 12
    height: scale(55.994),
    paddingHorizontal: scale(16.701),
    borderRadius: radius.md, // 16
    backgroundColor: colors.surface,
    borderWidth: hairline,
    borderColor: colors.borderInput,
  },
  fieldActive: {
    borderColor: colors.primary, // filled fields get the blue border
  },
  input: {
    flex: 1,
    paddingVertical: 0,
  },
  bonusPill: {
    paddingHorizontal: spacing.md, // 8
    paddingVertical: spacing.xs, // 4
    borderRadius: scale(10),
    backgroundColor: colors.bonusPill,
  },
  cta: {
    height: scale(55.994),
    borderRadius: radius.md, // 16
    overflow: 'hidden',
  },
  ctaDisabled: {
    opacity: 0.4,
  },
  ctaFill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md, // 8
  },
  ctaLabel: {
    color: colors.textPrimary,
  },
  pressed: {
    opacity: 0.85,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
});

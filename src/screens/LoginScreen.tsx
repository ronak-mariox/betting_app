import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {BackHeader, Button, InfoCallout, TextField} from '../components';
import {login} from '../data/login';
import {colors, scale, spacing, type} from '../theme';

type LoginScreenProps = {
  onBack?: () => void;
  /** Resolves to an error message to show under the button, or nothing once signed in. */
  onSubmit?: (credentials: {
    username: string;
    password: string;
  }) => Promise<string | void> | void;
  onCreateAccount?: () => void;
  /** Footer links — "Help", "Privacy" or "Terms". */
  onOpenLink?: (link: string) => void;
};

/**
 * Login — Figma node 62:214.
 * The CTA is drawn at 40% in Figma because the form is empty; here that's the
 * real disabled state, lifting once both fields have a value.
 */
export const LoginScreen = ({
  onBack,
  onSubmit,
  onCreateAccount,
  onOpenLink,
}: LoginScreenProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = !busy && username.trim().length > 0 && password.length > 0;

  const submit = async () => {
    setBusy(true);
    setError(null);
    const message = await onSubmit?.({username, password});
    setBusy(false);
    if (message) {
      setError(message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <BackHeader
        title={login.title}
        subtitle={login.subtitle}
        onBack={onBack}
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.form}>
        <TextField
          label="Username"
          icon="user"
          placeholder={login.usernamePlaceholder}
          value={username}
          onChangeText={setUsername}
          textContentType="username"
        />

        <TextField
          label="Password"
          icon="lock"
          secure
          placeholder={login.passwordPlaceholder}
          value={password}
          onChangeText={setPassword}
          textContentType="password"
        />

        <Button
          variant="primary"
          size="lg"
          label={busy ? 'Login ho raha hai…' : login.submitLabel}
          disabled={!canSubmit}
          onPress={submit}
        />

        {error ? (
          <Text
            style={[type.helperText, styles.error]}
            accessibilityRole="alert">
            {error}
          </Text>
        ) : null}

        <InfoCallout
          emoji="💡"
          title={login.calloutTitle}
          body={login.calloutBody}
        />

        <View style={styles.signupRow}>
          <Text style={type.footerNote}>{login.signupPrompt} </Text>
          <Pressable
            onPress={onCreateAccount}
            hitSlop={spacing.md}
            accessibilityRole="button">
            <Text style={type.footerLink}>{login.signupCta}</Text>
          </Pressable>
        </View>

        <View style={styles.footerLinks}>
          {login.footerLinks.map(link => (
            <Pressable
              key={link}
              onPress={() => onOpenLink?.(link)}
              hitSlop={spacing.md}
              accessibilityRole="link"
              accessibilityLabel={link}>
              <Text style={type.footerLinkSm}>{link}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  error: {
    color: colors.danger,
    textAlign: 'center',
  },
  screen: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  form: {
    gap: spacing.xxl, // 20
    paddingHorizontal: spacing.xxl, // 20
    paddingBottom: scale(32),
  },
  signupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xxxl, // 24
  },
});

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
  onSubmit?: (credentials: {username: string; password: string}) => void;
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

  const canSubmit = username.trim().length > 0 && password.length > 0;

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
          label={login.submitLabel}
          disabled={!canSubmit}
          onPress={() => onSubmit?.({username, password})}
        />

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

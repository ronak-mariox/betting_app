import React, {useEffect, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {
  BackHeader,
  Icon,
  SettingsGroup,
  SettingsRow,
  Toggle,
} from '../components';
import {languages, legalLinks, notificationSettings} from '../data/settings';
import {colors, hairline, radius, scale, spacing, type} from '../theme';

type SettingsScreenProps = {
  /** Saved notification switches from the account; one never touched is on. */
  preferences?: Record<string, boolean>;
  /** Saves a switch; resolves to false if it couldn't be saved, and the switch goes back. */
  onTogglePreference?: (id: string, value: boolean) => Promise<boolean>;
  onBack?: () => void;
  onLogout?: () => void;
  /** Legal rows — "Privacy Policy" / "Terms & Conditions". */
  onOpenLink?: (link: string) => void;
};

/** Settings — Figma node 9:451. */
export const SettingsScreen = ({
  preferences,
  onTogglePreference,
  onBack,
  onLogout,
  onOpenLink,
}: SettingsScreenProps) => {
  const saved = (source?: Record<string, boolean>) =>
    Object.fromEntries(
      notificationSettings.map(s => [s.id, source?.[s.id] !== false]),
    );
  const [toggles, setToggles] = useState<Record<string, boolean>>(() =>
    saved(preferences),
  );
  useEffect(() => {
    setToggles(saved(preferences));
  }, [preferences]);

  const toggle = async (id: string, next: boolean) => {
    setToggles(prev => ({...prev, [id]: next}));
    const ok = (await onTogglePreference?.(id, next)) ?? true;
    if (!ok) {
      setToggles(prev => ({...prev, [id]: !next}));
    }
  };
  const [language, setLanguage] = useState(languages[0]);

  return (
    <View style={styles.screen}>
      <BackHeader title="Settings" onBack={onBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}>
        <SettingsGroup title="NOTIFICATIONS">
          {notificationSettings.map(setting => (
            <SettingsRow key={setting.id}>
              <View style={styles.copy}>
                <Text style={type.settingLabel}>{setting.label}</Text>
                <Text style={type.settingSub}>{setting.sub}</Text>
              </View>
              <Toggle
                value={toggles[setting.id]}
                onChange={next => toggle(setting.id, next)}
                accessibilityLabel={setting.label}
              />
            </SettingsRow>
          ))}
        </SettingsGroup>

        <SettingsGroup title="PREFERENCES">
          <SettingsRow>
            <Icon name="globe" />
            <View style={styles.copy}>
              <Text style={type.settingLabel}>Language</Text>
              <Text style={type.settingSub}>{language}</Text>
            </View>
            <View style={styles.langRow}>
              {languages.map(lang => {
                const active = lang === language;
                return (
                  <Pressable
                    key={lang}
                    onPress={() => setLanguage(lang)}
                    accessibilityRole="button"
                    accessibilityState={{selected: active}}
                    accessibilityLabel={lang}
                    style={[
                      styles.langPill,
                      active ? styles.langOn : styles.langOff,
                    ]}>
                    <Text
                      style={[
                        type.langPill,
                        {
                          color: active ? colors.textPrimary : colors.textMuted,
                        },
                      ]}>
                      {lang}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </SettingsRow>

          {legalLinks.map(link => (
            <Pressable
              key={link.id}
              onPress={() => onOpenLink?.(link.label)}
              accessibilityRole="button"
              accessibilityLabel={link.label}
              style={({pressed}) => pressed && styles.pressed}>
              <SettingsRow>
                <Text style={[type.settingLabel, styles.copy]}>
                  {link.label}
                </Text>
                {link.value ? (
                  <Text style={type.settingValue}>{link.value}</Text>
                ) : null}
                <Icon name="chevronRightMd" />
              </SettingsRow>
            </Pressable>
          ))}
        </SettingsGroup>

        <Pressable
          onPress={onLogout}
          accessibilityRole="button"
          accessibilityLabel="Logout"
          style={({pressed}) => [styles.logout, pressed && styles.pressed]}>
          <Icon name="logout" />
          <Text style={type.logoutLabel}>Logout</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  body: {
    gap: spacing.xl, // 16
    paddingHorizontal: spacing.gutter, // 16
    paddingBottom: scale(32),
  },
  copy: {
    flex: 1,
  },
  langRow: {
    flexDirection: 'row',
    gap: spacing.md, // 8
  },
  langPill: {
    paddingHorizontal: spacing.lg, // 12
    paddingVertical: spacing.xs, // 4
    borderRadius: scale(10),
  },
  langOn: {
    backgroundColor: colors.primary,
  },
  langOff: {
    backgroundColor: colors.bgBase,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md, // 8
    height: scale(55.994),
    borderRadius: radius.md, // 16
    backgroundColor: colors.dangerSoft,
    borderWidth: hairline,
    borderColor: colors.borderDanger,
  },
  pressed: {
    opacity: 0.75,
  },
});

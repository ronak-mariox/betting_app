import React, {useState} from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  BottomNav,
  BottomSheet,
  Button,
  Card,
  Icon,
  MenuRow,
} from '../components';
import {logoutSheet, profile, profileMenu} from '../data/profile';
import {
  colors,
  gradients,
  hairline,
  radius,
  scale,
  spacing,
  type,
} from '../theme';

type ProfileScreenProps = {
  /** Name saved on Edit Profile; falls back to the mock one. */
  name?: string;
  /** Avatar initials; derived from `name` upstream, falls back to the mock one. */
  initials?: string;
  /** Verified mobile number; falls back to the mock one. Empty shows a placeholder. */
  phone?: string;
  /** This player's own shareable code; falls back to the mock one. */
  referralCode?: string;
  /** Drives the tick on the avatar and the status pill under the name. */
  kycVerified?: boolean;
  /** Total / won / win-rate figures under the avatar, from the player's bets. */
  stats?: {label: string; value: string}[];
  /** The player's current profile photo, as a data URI — empty/undefined shows initials instead. */
  avatarPhoto?: string;
  /** Fired for menu rows that map to a built screen. */
  onOpen?: (id: string) => void;
  /** Only set when the screen is pushed, not reached from the tab bar. */
  onBack?: () => void;
  onLogout?: () => void;
  onChangeNav?: (key: string) => void;
};

/** Profile — Figma node 8:1346, with the 9:1070 logout confirmation. */
export const ProfileScreen = ({
  kycVerified = false,
  name = profile.name,
  initials = profile.initials,
  phone = profile.phone,
  referralCode = profile.referralCode,
  avatarPhoto = '',
  stats = profile.stats,
  onOpen,
  onBack,
  onLogout,
  onChangeNav,
}: ProfileScreenProps) => {
  const insets = useSafeAreaInsets();
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {paddingTop: insets.top + spacing.xxl},
        ]}>
        {onBack ? (
          <View style={styles.titleRow}>
            <Button
              variant="icon"
              icon="arrowLeft"
              onPress={onBack}
              accessibilityLabel="Go back"
            />
            <Text style={type.pageTitle}>Profile</Text>
          </View>
        ) : null}

        {/* Identity card */}
        <LinearGradient
          useAngle
          angle={gradients.profileHero.angle}
          colors={[...gradients.profileHero.colors]}
          locations={[...gradients.profileHero.locations]}
          style={styles.hero}>
          <View style={styles.identity}>
            <View style={styles.avatar}>
              <View style={styles.avatarClip}>
                {avatarPhoto ? (
                  <Image
                    source={{uri: avatarPhoto}}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                  />
                ) : (
                  <LinearGradient
                    useAngle
                    angle={gradients.logo.angle}
                    colors={[...gradients.logo.colors]}
                    locations={[...gradients.logo.locations]}
                    style={[StyleSheet.absoluteFill, styles.avatarFill]}>
                    <Text style={type.avatarInitials}>{initials}</Text>
                  </LinearGradient>
                )}
              </View>
              {kycVerified ? (
                <View style={styles.verified}>
                  <Icon name="verified" />
                </View>
              ) : null}
            </View>

            <View style={styles.identityCopy}>
              <Text style={type.profileName}>{name}</Text>
              <Text style={type.statText}>
                {phone || 'Add your mobile number'}
              </Text>
              <View style={[styles.tier, !kycVerified && styles.tierOff]}>
                <Text style={type.tierPill}>
                  {kycVerified ? '✅ KYC Verified' : 'KYC baaki hai'}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => onOpen?.('edit')}
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
              style={({pressed}) => [
                styles.editBtn,
                pressed && styles.pressed,
              ]}>
              <Icon name="pencil" />
            </Pressable>
          </View>

          <View style={styles.stats}>
            {stats.map(stat => (
              <View key={stat.label} style={styles.stat}>
                <Text style={type.profileStat}>{stat.value}</Text>
                <Text style={type.profileStatLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Referral code */}
        <Card
          borderColor={colors.borderAccentSoft}
          onPress={() => onOpen?.('referral')}
          style={styles.referral}
          contentStyle={styles.referralPad}>
          <View style={styles.referralCopy}>
            <Text style={type.promoSub}>Your Referral Code</Text>
            <Text style={type.referralCode}>{referralCode}</Text>
          </View>
          <View style={styles.referralIcons}>
            <Icon name="copyAlt" />
            <Icon name="chevronRightMd" />
          </View>
        </Card>

        {/* Menu */}
        <Card style={styles.menu} contentStyle={styles.menuPad}>
          {profileMenu.map((item, index) => (
            <MenuRow
              key={item.id}
              item={item}
              showDivider={index < profileMenu.length - 1}
              onPress={onOpen}
            />
          ))}
        </Card>

        <Pressable
          onPress={() => setConfirmingLogout(true)}
          accessibilityRole="button"
          accessibilityLabel="Logout"
          style={({pressed}) => [styles.logout, pressed && styles.pressed]}>
          <Icon name="logout" />
          <Text style={type.logoutLabel}>Logout</Text>
        </Pressable>
      </ScrollView>

      <BottomSheet
        visible={confirmingLogout}
        onClose={() => setConfirmingLogout(false)}>
        <View style={styles.sheet}>
          <View style={styles.sheetIcon}>
            <Icon name="logoutLg" />
          </View>
          <Text style={type.profileName}>{logoutSheet.title}</Text>
          <Text style={[type.successSub, styles.sheetBody]}>
            {logoutSheet.body}
          </Text>

          <View style={styles.sheetActions}>
            <Pressable
              onPress={() => setConfirmingLogout(false)}
              accessibilityRole="button"
              accessibilityLabel={logoutSheet.cancel}
              style={({pressed}) => [
                styles.sheetAction,
                styles.cancel,
                pressed && styles.pressed,
              ]}>
              <Text style={[type.sheetButton, styles.cancelLabel]}>
                {logoutSheet.cancel}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setConfirmingLogout(false);
                onLogout?.();
              }}
              accessibilityRole="button"
              accessibilityLabel="Confirm logout"
              style={({pressed}) => [
                styles.sheetAction,
                pressed && styles.pressed,
              ]}>
              <LinearGradient
                useAngle
                angle={gradients.ctaDanger.angle}
                colors={[...gradients.ctaDanger.colors]}
                locations={[...gradients.ctaDanger.locations]}
                style={styles.sheetActionFill}>
                <Text style={[type.sheetButton, styles.confirmLabel]}>
                  {logoutSheet.confirm}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </BottomSheet>

      <BottomNav activeKey="profile" onChange={key => onChangeNav?.(key)} />
    </View>
  );
};

const styles = StyleSheet.create({
  tierOff: {
    backgroundColor: colors.surface,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  content: {
    paddingHorizontal: spacing.gutter, // 16
    paddingBottom: scale(24),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg, // 12 — same arrow-to-title gap as BackHeader
    paddingBottom: spacing.xl, // 16
  },
  hero: {
    padding: scale(20.701),
    borderRadius: radius.lg, // 24
    borderWidth: hairline,
    borderColor: colors.borderNav,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl, // 16
  },
  avatar: {
    width: scale(63.999),
    height: scale(63.999),
  },
  avatarClip: {
    flex: 1,
    borderRadius: radius.md, // 16
    overflow: 'hidden',
  },
  avatarFill: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  verified: {
    position: 'absolute',
    // Figma: 20px badge at x/y 48 on the 64px avatar.
    top: scale(48),
    left: scale(48),
    width: scale(19.997),
    height: scale(19.997),
    borderRadius: radius.pill,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityCopy: {
    flex: 1,
  },
  tier: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm, // 6
    paddingHorizontal: spacing.md, // 8
    paddingVertical: spacing.xxs, // 2
    borderRadius: radius.pill,
    backgroundColor: colors.tierGold,
  },
  editBtn: {
    width: scale(35.997),
    height: scale(35.997),
    borderRadius: radius.sm, // 14
    backgroundColor: colors.glassSoftAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.lg, // 12
    marginTop: spacing.xl, // 16
    paddingTop: scale(16.701),
    borderTopWidth: hairline,
    borderTopColor: colors.borderNav,
  },
  stat: {
    flex: 1,
  },
  referral: {
    marginTop: spacing.xl, // 16
  },
  referralPad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg, // 12
    padding: scale(16.701),
  },
  referralCopy: {
    flex: 1,
  },
  referralIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md, // 8
  },
  menu: {
    marginTop: spacing.xl, // 16
  },
  menuPad: {
    // Rows bring their own padding and dividers.
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md, // 8
    height: scale(55.994),
    marginTop: spacing.xl, // 16
    borderRadius: radius.md, // 16
    backgroundColor: colors.dangerSoft,
    borderWidth: hairline,
    borderColor: colors.borderDanger,
  },
  pressed: {
    opacity: 0.75,
  },

  /* --- Logout sheet ---------------------------------------------------- */
  sheet: {
    alignItems: 'center',
    padding: scale(24),
  },
  sheetIcon: {
    width: scale(63.999),
    height: scale(63.999),
    borderRadius: radius.pill,
    backgroundColor: colors.wellDanger,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg, // 12
  },
  sheetBody: {
    paddingTop: spacing.xs, // 4
  },
  sheetActions: {
    flexDirection: 'row',
    gap: spacing.lg, // 12
    alignSelf: 'stretch',
    marginTop: spacing.xxxl, // 24
  },
  sheetAction: {
    flex: 1,
    height: scale(55.994),
    borderRadius: radius.md, // 16
    overflow: 'hidden',
  },
  sheetActionFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancel: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: hairline,
    borderColor: colors.borderNeutral,
  },
  cancelLabel: {
    color: colors.textLabel,
  },
  confirmLabel: {
    color: colors.textPrimary,
  },
});

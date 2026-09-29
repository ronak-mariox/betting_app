import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  colors,
  gradients,
  hairline,
  radius,
  scale,
  spacing,
  type,
} from '../theme';
import {Icon} from './Icon';

type DocUploadCardProps = {
  title: string;
  hint: string;
  cta: string;
  uploadedLabel: string;
  /** Picked file name, or null while empty. */
  fileName: string | null;
  onPick: () => void;
  onRemove: () => void;
};

/**
 * Document slot (Figma DocUploadCard): a dashed drop-zone until a photo is
 * picked, then a green row with the file name plus replace / remove buttons.
 */
export const DocUploadCard = ({
  title,
  hint,
  cta,
  uploadedLabel,
  fileName,
  onPick,
  onRemove,
}: DocUploadCardProps) => {
  if (fileName) {
    return (
      <View style={styles.done}>
        <View style={styles.doneWell}>
          <Icon name="checkCircle" />
        </View>
        <View style={styles.doneCopy}>
          <Text style={type.kycUploadedName} numberOfLines={1}>
            {fileName}
          </Text>
          <Text style={type.kycUploadedOk}>{uploadedLabel}</Text>
        </View>
        <View style={styles.doneActions}>
          <Pressable
            onPress={onPick}
            accessibilityRole="button"
            accessibilityLabel={`Replace ${title}`}
            style={({pressed}) => [
              styles.iconBtn,
              styles.replaceBtn,
              pressed && styles.pressed,
            ]}>
            <Icon name="refresh" />
          </Pressable>
          <Pressable
            onPress={onRemove}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${title}`}
            style={({pressed}) => [
              styles.iconBtn,
              styles.removeBtn,
              pressed && styles.pressed,
            ]}>
            <Icon name="close" size={12.998} color={colors.danger} />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPick}
      accessibilityRole="button"
      accessibilityLabel={`${cta}: ${title}`}
      style={({pressed}) => [styles.empty, pressed && styles.pressed]}>
      <View style={styles.emptyWell}>
        <Icon name="upload" />
      </View>
      <Text style={type.kycUploadTitle}>{title}</Text>
      <Text style={type.kycUploadHint}>{hint}</Text>
      <LinearGradient
        useAngle
        angle={165.47}
        colors={[...gradients.ctaPrimary.colors]}
        locations={[...gradients.ctaPrimary.locations]}
        style={styles.pill}>
        <Text style={type.kycUploadCta}>{cta}</Text>
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    gap: spacing.md, // 8
    marginTop: spacing.md,
    padding: spacing.xxl, // 20
    borderRadius: radius.md, // 16
    borderWidth: scale(1.607),
    borderStyle: 'dashed',
    borderColor: colors.uploadBorder,
    backgroundColor: colors.uploadBg,
  },
  emptyWell: {
    width: scale(43.999),
    height: scale(43.999),
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.uploadWell,
  },
  pill: {
    marginTop: spacing.xs, // 4
    paddingHorizontal: spacing.xl, // 16
    paddingVertical: spacing.sm, // 6
    borderRadius: radius.sm, // 14
  },
  done: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg, // 12
    marginTop: spacing.md,
    padding: spacing.xl, // 16
    borderRadius: radius.md,
    borderWidth: hairline,
    borderColor: colors.uploadedBorder,
    backgroundColor: colors.surface,
  },
  doneWell: {
    width: scale(39.999),
    height: scale(39.999),
    borderRadius: radius.sm, // 14
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.chipSuccess, // 12% green
  },
  doneCopy: {
    flex: 1,
  },
  doneActions: {
    flexDirection: 'row',
    gap: spacing.md, // 8
  },
  iconBtn: {
    width: scale(31.997),
    height: scale(31.997),
    borderRadius: scale(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  replaceBtn: {
    backgroundColor: colors.uploadWell,
  },
  removeBtn: {
    backgroundColor: colors.wellDangerStrong,
  },
  pressed: {
    opacity: 0.75,
  },
});

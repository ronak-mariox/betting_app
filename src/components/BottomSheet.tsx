import React, {PropsWithChildren} from 'react';
import {Modal, Pressable, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, radius, scale, spacing} from '../theme';

type BottomSheetProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  /** Sheets with their own title row (e.g. the KYC document picker) omit the grab handle. */
  showHandle?: boolean;
}>;

/**
 * Modal sheet pinned to the bottom over a 70% scrim, with a 24 top radius and
 * the grab handle from the design. Tapping the scrim or the Android back
 * button dismisses it.
 */
export const BottomSheet = ({
  visible,
  onClose,
  showHandle = true,
  children,
}: BottomSheetProps) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.scrim}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />

        <View style={[styles.sheet, {paddingBottom: insets.bottom}]}>
          {showHandle ? (
            <View style={styles.handleRow}>
              <View style={styles.handle} />
            </View>
          ) : null}
          {children}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.scrim,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: colors.bgBase,
    borderTopLeftRadius: radius.lg, // 24
    borderTopRightRadius: radius.lg,
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: spacing.lg, // 12
    paddingBottom: spacing.md, // 8
  },
  handle: {
    width: scale(39.994),
    height: scale(3.997),
    borderRadius: radius.pill,
    backgroundColor: colors.glass, // 20% white
  },
});

import React, {useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import type {ImagePickerResponse} from 'react-native-image-picker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  BackHeader,
  BottomSheet,
  Button,
  DocUploadCard,
  Icon,
  KycStepIndicator,
  PickerField,
  TextField,
} from '../components';
import {kycDocument, kycDocumentTypes, kycHeader, kycSteps} from '../data/kyc';
import type {KycDraft, KycFile} from '../data/kyc';
import {notify} from '../utils/actions';
import {isDocumentNumberValid, isDocumentValid} from '../utils/kyc';
import {colors, hairline, scale, spacing, type} from '../theme';

type KycDocumentScreenProps = {
  draft: KycDraft;
  onChange: (patch: Partial<KycDraft>) => void;
  onBack: () => void;
  onReview: () => void;
};

/** Sharp enough to read a card number, small enough to upload quickly. */
const PICKER_OPTIONS = {
  mediaType: 'photo' as const,
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.7 as const,
  includeBase64: true,
};

const MAX_BYTES = 5 * 1024 * 1024;

/** KYC step 2 — identity document, Figma nodes 312:211 / 312:339 / 312:534. */
export const KycDocumentScreen = ({
  draft,
  onChange,
  onBack,
  onReview,
}: KycDocumentScreenProps) => {
  const insets = useSafeAreaInsets();
  const [sheetOpen, setSheetOpen] = useState(false);

  const pick = (side: 'front' | 'back') => {
    const onResult = (result: ImagePickerResponse) => {
      if (result.didCancel) {
        return;
      }
      if (result.errorCode) {
        notify(result.errorMessage ?? 'Photo select nahi ho paya');
        return;
      }
      const asset = result.assets?.[0];
      if (!asset?.base64) {
        return;
      }
      if ((asset.base64.length * 3) / 4 > MAX_BYTES) {
        notify('Photo 5MB se chhoti honi chahiye');
        return;
      }
      const file: KycFile = {
        name: asset.fileName ?? `${side}_side_doc.jpg`,
        data: `data:${asset.type ?? 'image/jpeg'};base64,${asset.base64}`,
      };
      onChange(side === 'front' ? {front: file} : {back: file});
    };

    Alert.alert(
      side === 'front' ? kycDocument.frontTitle : kycDocument.backTitle,
      undefined,
      [
        {text: 'Camera', onPress: () => launchCamera(PICKER_OPTIONS, onResult)},
        {
          text: 'Choose from Gallery',
          onPress: () => launchImageLibrary(PICKER_OPTIONS, onResult),
        },
        {text: 'Cancel', style: 'cancel'},
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <BackHeader
        title={kycHeader.title}
        subtitle={kycHeader.document}
        onBack={onBack}
      />
      <KycStepIndicator steps={kycSteps} current={1} />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.form,
          {paddingBottom: insets.bottom + spacing.xxxl + spacing.md},
        ]}>
        <PickerField
          label={kycDocument.typeLabel}
          icon="fileText"
          value={draft.documentType}
          placeholder={kycDocument.typePlaceholder}
          onPress={() => setSheetOpen(true)}
          chevron
        />
        <TextField
          label={kycDocument.numberLabel}
          icon="fileText"
          placeholder={kycDocument.numberPlaceholder}
          value={draft.documentNumber}
          onChangeText={documentNumber =>
            onChange({documentNumber: documentNumber.toUpperCase()})
          }
          autoCapitalize="characters"
          maxLength={30}
          valid={isDocumentNumberValid(draft.documentNumber)}
        />

        <View>
          <Text style={type.fieldLabel}>{kycDocument.frontLabel}</Text>
          <DocUploadCard
            title={kycDocument.frontTitle}
            hint={kycDocument.hint}
            cta={kycDocument.upload}
            uploadedLabel={kycDocument.uploaded}
            fileName={draft.front?.name ?? null}
            onPick={() => pick('front')}
            onRemove={() => onChange({front: null})}
          />
        </View>

        <View>
          <Text style={type.fieldLabel}>
            {kycDocument.backLabel}
            <Text style={styles.optional}>{kycDocument.optional}</Text>
          </Text>
          <DocUploadCard
            title={kycDocument.backTitle}
            hint={kycDocument.hint}
            cta={kycDocument.upload}
            uploadedLabel={kycDocument.uploaded}
            fileName={draft.back?.name ?? null}
            onPick={() => pick('back')}
            onRemove={() => onChange({back: null})}
          />
        </View>

        <Button
          variant="primary"
          size="lg"
          label={kycDocument.cta}
          iconRight="arrowRight"
          disabled={!isDocumentValid(draft)}
          onPress={onReview}
          style={styles.cta}
        />
      </ScrollView>

      <BottomSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        showHandle={false}>
        <View style={styles.sheetHead}>
          <Text style={type.sheetTitle}>{kycDocument.sheetTitle}</Text>
          <Pressable
            onPress={() => setSheetOpen(false)}
            hitSlop={spacing.md}
            accessibilityRole="button"
            accessibilityLabel="Close">
            <Icon name="close" size={19.995} />
          </Pressable>
        </View>
        {kycDocumentTypes.map(option => (
          <Pressable
            key={option}
            onPress={() => {
              onChange({documentType: option});
              setSheetOpen(false);
            }}
            accessibilityRole="button"
            accessibilityState={{selected: draft.documentType === option}}
            style={({pressed}) => [styles.sheetRow, pressed && styles.pressed]}>
            <Icon name="fileText" size={14.998} />
            <Text style={[type.menuLabel, styles.sheetLabel]}>{option}</Text>
            {draft.documentType === option ? (
              <Icon name="checkValid" size={13.994} />
            ) : null}
          </Pressable>
        ))}
        <View style={styles.sheetSpacer} />
      </BottomSheet>
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
    paddingHorizontal: spacing.gutter, // 16
  },
  optional: {
    color: colors.textDim,
    fontFamily: type.input.fontFamily,
    fontWeight: type.input.fontWeight,
  },
  cta: {
    gap: spacing.md, // 8
  },
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xxl, // 20
    paddingBottom: spacing.lg, // 12
    paddingHorizontal: spacing.xxl,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg, // 12
    paddingHorizontal: spacing.xxl, // 20
    paddingVertical: spacing.xl, // 16
    backgroundColor: colors.surface,
    borderTopWidth: hairline,
    borderTopColor: colors.borderTile, // 6% white
  },
  sheetLabel: {
    flex: 1,
  },
  sheetSpacer: {
    height: scale(23.996),
  },
  pressed: {
    opacity: 0.75,
  },
});

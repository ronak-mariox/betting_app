import React, {useState} from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import type {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import type {ImagePickerResponse} from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import {BackHeader, Button, Card, Icon} from '../components';
import {editProfileFields, profile} from '../data/profile';
import {notify} from '../utils/actions';
import {
  colors,
  gradients,
  hairline,
  radius,
  scale,
  spacing,
  type,
} from '../theme';

type EditProfileScreenProps = {
  onBack?: () => void;
  /** `avatar` is a data URI (or '' if unchanged/never set) alongside the text fields. */
  onSave?: (values: Record<string, string>) => void;
  /** The signed-in player's current values, keyed the same as `editProfileFields`. Falls back to the mock ones. */
  initialValues?: Partial<Record<string, string>>;
  /** Verified mobile number (read-only here); falls back to the mock one. Empty shows a placeholder, no "Verified" pill. */
  phone?: string;
  /** Avatar initials shown until a real photo is set; falls back to the mock one. */
  avatarInitials?: string;
  /** The player's current profile photo, as a data URI — empty/undefined shows initials instead. */
  avatarPhoto?: string;
};

/** dd/mm/yyyy shown on screen -> a Date for the picker's initial value. */
const parseDisplayDate = (value?: string): Date | undefined => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value?.trim() ?? '');
  if (!match) {
    return undefined;
  }
  const [, dd, mm, yyyy] = match;
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
};

/** A Date picked from the calendar -> the screen's dd/mm/yyyy display format. */
const formatDisplayDate = (date: Date): string => {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${date.getFullYear()}`;
};

/** Photos are resized/compressed before upload so the profile stays light to store and send. */
const PICKER_OPTIONS = {
  mediaType: 'photo' as const,
  maxWidth: 512,
  maxHeight: 512,
  quality: 0.7 as const,
  includeBase64: true,
};

/** Edit Profile — Figma node 9:2. */
export const EditProfileScreen = ({
  onBack,
  onSave,
  initialValues,
  phone = profile.phone,
  avatarInitials = profile.initials,
  avatarPhoto = '',
}: EditProfileScreenProps) => {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      editProfileFields.map(f => [f.id, initialValues?.[f.id] ?? f.value]),
    ),
  );
  const [photo, setPhoto] = useState(avatarPhoto);
  const [dobDate, setDobDate] = useState(() => parseDisplayDate(values.dob));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handlePickerResult = (result: ImagePickerResponse) => {
    if (result.didCancel) {
      return;
    }
    if (result.errorCode) {
      notify(result.errorMessage ?? 'Photo select nahi ho paya');
      return;
    }
    const asset = result.assets?.[0];
    if (asset?.base64) {
      setPhoto(`data:${asset.type ?? 'image/jpeg'};base64,${asset.base64}`);
    }
  };

  const changePhoto = () => {
    Alert.alert('Change Photo', undefined, [
      {
        text: 'Camera',
        onPress: () => launchCamera(PICKER_OPTIONS, handlePickerResult),
      },
      {
        text: 'Choose from Gallery',
        onPress: () => launchImageLibrary(PICKER_OPTIONS, handlePickerResult),
      },
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  const onChangeDob = (event: DateTimePickerEvent, selected?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selected) {
      setDobDate(selected);
      setValues(prev => ({...prev, dob: formatDisplayDate(selected)}));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <BackHeader
        title="Edit Profile"
        subtitle="Update your information"
        onBack={onBack}
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}>
        {/* Avatar */}
        <View style={styles.avatarBlock}>
          <View>
            {photo ? (
              <Image
                source={{uri: photo}}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                useAngle
                angle={gradients.logo.angle}
                colors={[...gradients.logo.colors]}
                locations={[...gradients.logo.locations]}
                style={styles.avatar}>
                <Text style={type.avatarLg}>{avatarInitials}</Text>
              </LinearGradient>
            )}
            <Pressable
              onPress={changePhoto}
              accessibilityRole="button"
              accessibilityLabel="Change photo"
              style={({pressed}) => [styles.camera, pressed && styles.pressed]}>
              <Icon name="camera" />
            </Pressable>
          </View>
          <Text
            onPress={changePhoto}
            style={[type.link, styles.changePhoto]}
            accessibilityRole="button">
            Change Photo
          </Text>
        </View>

        {/* Editable fields */}
        <View style={styles.fields}>
          {editProfileFields.map((field, index, all) => (
            <View
              key={field.id}
              style={[
                styles.field,
                index < all.length - 1 && styles.fieldDivider,
              ]}>
              <Text style={type.fieldCaption}>{field.label}</Text>
              {field.id === 'dob' ? (
                <Pressable
                  onPress={() => setShowDatePicker(true)}
                  accessibilityRole="button"
                  accessibilityLabel={field.label}>
                  <Text style={[type.input, styles.fieldInput]}>
                    {values.dob || 'Select date'}
                  </Text>
                </Pressable>
              ) : (
                <TextInput
                  value={values[field.id]}
                  onChangeText={next =>
                    setValues(prev => ({...prev, [field.id]: next}))
                  }
                  keyboardType={field.keyboardType}
                  autoCapitalize={field.id === 'email' ? 'none' : 'words'}
                  style={[type.input, styles.fieldInput]}
                  accessibilityLabel={field.label}
                />
              )}
            </View>
          ))}
        </View>

        {showDatePicker ? (
          <DateTimePicker
            value={dobDate ?? new Date(2000, 0, 1)}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={onChangeDob}
          />
        ) : null}

        {/* Read-only: the mobile given on the KYC form */}
        <Card contentStyle={styles.mobile}>
          <Icon name="phone" />
          <View style={styles.mobileCopy}>
            <Text style={type.fieldCaption}>Mobile Number</Text>
            <Text style={type.mobileValue}>{phone || 'Not added yet'}</Text>
          </View>
        </Card>

        <Button
          variant="primary"
          size="lg"
          label="Save Changes"
          onPress={() => onSave?.({...values, avatar: photo})}
        />
      </ScrollView>
    </KeyboardAvoidingView>
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
  avatarBlock: {
    alignItems: 'center',
    paddingVertical: spacing.xl, // 16
  },
  avatar: {
    width: scale(95.999),
    height: scale(95.999),
    borderRadius: radius.lg, // 24
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: {
    position: 'absolute',
    // Figma: 32px button at x/y 71.99 on the 96px avatar.
    top: scale(71.99),
    left: scale(71.99),
    width: scale(32),
    height: scale(32),
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhoto: {
    paddingTop: spacing.lg, // 12
  },
  fields: {
    borderRadius: radius.md, // 16
    borderWidth: hairline,
    borderColor: colors.borderCard,
    overflow: 'hidden',
  },
  field: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl, // 16
    paddingTop: scale(22.31),
    paddingBottom: scale(22),
  },
  fieldDivider: {
    borderBottomWidth: hairline,
    borderBottomColor: colors.borderTile,
  },
  fieldInput: {
    paddingVertical: 0,
    paddingTop: spacing.xs, // 4
  },
  mobile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg, // 12
    padding: scale(16.701),
  },
  mobileCopy: {
    flex: 1,
  },
  verifiedPill: {
    paddingHorizontal: spacing.md, // 8
    paddingVertical: spacing.xxs, // 2
    borderRadius: radius.pill,
    backgroundColor: colors.chipSuccess,
  },
  pressed: {
    opacity: 0.75,
  },
});

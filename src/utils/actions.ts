import {
  Alert,
  Clipboard,
  Linking,
  Platform,
  Share,
  ToastAndroid,
} from 'react-native';

/** Brief confirmation — a toast on Android, an alert everywhere else. */
export const notify = (message: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert(message);
  }
};

/** Copies `value` to the clipboard and confirms it. */
export const copyToClipboard = (value: string, message: string) => {
  Clipboard.setString(value);
  notify(message);
};

/**
 * Opens a tel: / mailto: / whatsapp: URL. Nothing handles those on an
 * emulator or a device without the app, so failures fall back to a note.
 */
export const openExternal = async (url: string, fallback: string) => {
  try {
    await Linking.openURL(url);
  } catch {
    notify(fallback);
  }
};

/** Native share sheet; a cancelled share is not an error. */
export const shareText = async (message: string) => {
  try {
    await Share.share({message});
  } catch {
    notify('Share nahi ho paya');
  }
};

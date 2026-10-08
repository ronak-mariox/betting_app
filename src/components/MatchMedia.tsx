import React, {useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import {WebView} from 'react-native-webview';
import {colors, radius, spacing, type} from '../theme';

type MatchMediaProps = {
  /** Embeddable live score card from the odds feed; nothing renders without it. */
  scoreUrl?: string | null;
  /** Embeddable video, when the feed has one for this match. */
  streamUrl?: string | null;
};

const SCORE_HEIGHT = 190;

/** One embedded feed page, with a spinner until it has loaded. */
const Embed = ({uri, height}: {uri: string; height?: number}) => {
  const [loading, setLoading] = useState(true);
  return (
    <View style={[styles.frame, height ? {height} : styles.video]}>
      <WebView
        source={{uri}}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        setSupportMultipleWindows={false}
        // Feed pages may try to navigate away (ads, pop-ups); keep them in place.
        onShouldStartLoadWithRequest={request => request.url.startsWith('http')}
        onLoadEnd={() => setLoading(false)}
      />
      {loading ? (
        <View style={styles.loading} pointerEvents="none">
          <ActivityIndicator color={colors.textPrimary} />
        </View>
      ) : null}
    </View>
  );
};

/**
 * Live score card (always, for feed matches) and a "Watch Live" video that
 * opens on demand, both embedded from the odds feed's pages.
 */
export const MatchMedia = ({scoreUrl, streamUrl}: MatchMediaProps) => {
  const [watching, setWatching] = useState(false);
  if (!scoreUrl && !streamUrl) {
    return null;
  }
  return (
    <View style={styles.wrap}>
      {streamUrl ? (
        <Pressable
          onPress={() => setWatching(current => !current)}
          accessibilityRole="button"
          style={styles.toggle}>
          <Text style={type.cardTitle}>
            {watching ? '✕  Close video' : '▶  Watch Live'}
          </Text>
        </Pressable>
      ) : null}
      {watching && streamUrl ? <Embed uri={streamUrl} /> : null}
      {scoreUrl ? <Embed uri={scoreUrl} height={SCORE_HEIGHT} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  frame: {
    overflow: 'hidden',
    borderRadius: radius.md,
    backgroundColor: '#000',
  },
  video: {
    aspectRatio: 16 / 9,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggle: {
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
  },
});

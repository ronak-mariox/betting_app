import React, {useEffect, useState} from 'react';
import {AppRegistry, StyleSheet, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {applyBranding} from './src/theme/brand';
import {brandingApi} from './src/services/api';
import {name as appName} from './app.json';

const BRAND_KEY = 'betpro.branding';
/** How long the first screen waits for a fresh brand before using the saved one. */
const BRAND_WAIT_MS = 1500;

/**
 * Screens build their styles when their modules load, so the admin panel's
 * brand (colours, name) goes onto the theme first and the app is only
 * required after that. The last brand is kept on the device, so an offline
 * start still looks right; a fresh one is saved for next time.
 */
function Boot() {
  const [App, setApp] = useState(null);

  useEffect(() => {
    let done = false;
    (async () => {
      let saved = null;
      try {
        saved = JSON.parse((await AsyncStorage.getItem(BRAND_KEY)) || 'null');
      } catch {
        saved = null;
      }
      const fresh = brandingApi
        .get()
        .then(res => {
          AsyncStorage.setItem(BRAND_KEY, JSON.stringify(res.branding)).catch(() => {});
          return res.branding;
        })
        .catch(() => null);
      const brand = await Promise.race([
        fresh,
        new Promise(resolve => setTimeout(() => resolve(null), BRAND_WAIT_MS)),
      ]);
      if (done) {
        return;
      }
      applyBranding(brand || saved);
      setApp(() => require('./App').default);
    })();
    return () => {
      done = true;
    };
  }, []);

  return App ? <App /> : <View style={styles.boot} />;
}

const styles = StyleSheet.create({
  // Same navy as the splash, for the moment before the app loads.
  boot: {flex: 1, backgroundColor: '#07111F'},
});

AppRegistry.registerComponent(appName, () => Boot);

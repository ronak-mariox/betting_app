import {Dimensions, PixelRatio, Platform} from 'react-native';

/**
 * Every measurement in the Figma file is authored against a 390 × 844 frame
 * (iPhone 14). `scale()` maps those numbers onto the real device width so the
 * layout stays proportional from a 320 pt iPhone SE up to a tablet, while
 * Flexbox handles everything that should genuinely stretch.
 */
export const DESIGN_WIDTH = 390;
export const DESIGN_HEIGHT = 844;

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

export const screen = {width: SCREEN_WIDTH, height: SCREEN_HEIGHT};

/** Clamped so phablets/tablets don't blow the type scale out. */
const widthRatio = Math.min(Math.max(SCREEN_WIDTH / DESIGN_WIDTH, 0.85), 1.3);

/** Scale a Figma pixel value, snapped to the device pixel grid. */
export const scale = (size: number): number =>
  PixelRatio.roundToNearestPixel(size * widthRatio);

/**
 * Font scaling is deliberately gentler than layout scaling (factor 0.5) so
 * copy stays readable on small screens without ballooning on large ones.
 */
export const fontScale = (size: number, factor = 0.5): number =>
  PixelRatio.roundToNearestPixel(size + (size * widthRatio - size) * factor);

/** Figma draws borders at 0.701px; on device that's the thinnest real line. */
export const hairline = Math.max(1 / PixelRatio.get(), 0.5);

export const spacing = {
  xxs: scale(2),
  xs: scale(4),
  sm: scale(6),
  md: scale(8),
  lg: scale(12),
  xl: scale(16),
  xxl: scale(20),
  xxxl: scale(24),
  xxxxl: scale(40),
  /** Horizontal gutter used by every section of the Home screen. */
  gutter: scale(16),
} as const;

export const radius = {
  pill: 999,
  sm: scale(14),
  md: scale(16),
  lg: scale(24),
} as const;

/** Figma `drop-shadow(0 25px 25px rgba(0,0,0,0.25))` on the splash logo tile. */
export const shadows = {
  logo: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: {width: 0, height: scale(25)},
      shadowOpacity: 0.25,
      shadowRadius: scale(25),
    },
    android: {elevation: 16},
    default: {},
  }),
} as const;

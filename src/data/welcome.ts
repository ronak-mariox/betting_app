import {Feature} from '../components';
import {colors} from '../theme';
import {brand} from '../theme/brand';

/** Copy transcribed from the Figma WelcomeScreen frame (node 7:30). */

export const welcome = {
  title: brand.name,
  tagline: 'The smartest way to bet on cricket, football, tennis & more',
  primaryCta: 'Login',
  secondaryCta: 'Create Account',
};

export const features: Feature[] = [
  {
    id: 'fast',
    icon: 'featureFast',
    wellColor: colors.wellGold,
    title: 'Fast Betting',
    subtitle: 'Place bets in 3 seconds',
  },
  {
    id: 'secure',
    icon: 'featureSecure',
    wellColor: colors.wellSuccess,
    title: 'Secure Wallet',
    subtitle: 'Bank-grade security',
  },
  {
    id: 'odds',
    icon: 'featureOdds',
    wellColor: colors.wellAccent,
    title: 'Live Odds',
    subtitle: 'Real-time updates',
  },
  {
    id: 'wins',
    icon: 'featureWins',
    wellColor: colors.wellLive,
    title: 'Big Wins',
    subtitle: 'Cash out anytime',
  },
];

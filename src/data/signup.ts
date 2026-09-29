/**
 * Copy transcribed from the Figma sign-up frames
 * (62:292 empty form, 62:366 filled form, 62:447 credentials).
 */

export const signup = {
  title: 'Account Banao',
  subtitle: 'Apna username aur password khud chuno',
  infoTitle: 'Aasaan Registration',
  usernameLabel: 'Username Chuno *',
  usernamePlaceholder: 'Jaise: rahul_250',
  usernameInvalid:
    'Sirf chote letters, numbers aur _ — kam se kam 4 characters',
  referralLabel: 'Referral Code ',
  referralOptional: '(Optional)',
  referralPlaceholder: 'Jaise: RAHUL250',
  /** Shown beside a referral code that looks right. */
  bonus: 'Code ✓',
  passwordLabel: 'Password Banao *',
  passwordPlaceholder: 'Kam se kam 6 characters',
  /** In-field shortcut that fills a ready-made password. */
  generateCta: 'Auto',
  passwordTooShort: 'Password kam se kam 6 characters ka hona chahiye',
  submit: 'Account Banao',
  loginPrompt: 'Pehle se account hai?',
  loginCta: 'Login Karo',
};

/** Shortest password we accept. */
export const passwordMinLength = 6;

/** Shortest username we accept. */
export const usernameMinLength = 4;

/** Lowercase letters, digits and underscores — what login expects back. */
export const usernamePattern = /^[a-z0-9_]+$/;

export const isUsernameValid = (username: string) =>
  username.length >= usernameMinLength && usernamePattern.test(username);

export const credentials = {
  title: 'Account Ban Gaya! 🎉',
  warning:
    'Yeh wahi username aur password hai jo aapne abhi banaya — inhi se login karoge.',
  usernameLabel: 'Username',
  passwordLabel: 'Password',
  copy: 'Copy',
  submit: 'App Mein Jao',
};

const passwordWords = ['Sher', 'Raja', 'Champ', 'Vijay', 'Bolt', 'Star'];

/**
 * Suggestion behind the "Auto" button — easy to read out and re-type, and
 * long enough to clear `passwordMinLength`. Only a starting point: it lands
 * in the password field where the user can edit it.
 */
export const suggestPassword = () => {
  const word = passwordWords[Math.floor(Math.random() * passwordWords.length)];
  return `${word}@${1000 + Math.floor(Math.random() * 9000)}`;
};

/**
 * PLACEHOLDER legal copy.
 *
 * These documents are not in the Figma file and this text is not real legal
 * wording — it exists so the Login and Settings links have somewhere to go.
 * Replace `sections` with copy from your legal team before shipping.
 */

export type LegalDocument = {
  title: string;
  updated: string;
  sections: {heading: string; body: string}[];
};

export const privacyPolicy: LegalDocument = {
  title: 'Privacy Policy',
  updated: 'Last updated 13 Aug 2026',
  sections: [
    {
      heading: 'Information we collect',
      body: 'We collect the details you give us when you create an account — your name, mobile number, email address and date of birth — along with transaction records for deposits, withdrawals and bets placed.',
    },
    {
      heading: 'How we use your information',
      body: 'Your information is used to operate your account, process payments, verify your identity where the law requires it, and keep the service secure. We also use it to send the alerts you have switched on in Settings.',
    },
    {
      heading: 'Sharing',
      body: 'We do not sell your personal information. We share it only with payment providers needed to complete a transaction, and with regulators or law enforcement where we are legally required to do so.',
    },
    {
      heading: 'Data retention',
      body: 'Account and transaction records are kept for as long as your account is open, and afterwards for the period required by applicable financial regulations.',
    },
    {
      heading: 'Your choices',
      body: 'You can review and update your details from Edit Profile, control notifications from Settings, and request deletion of your account by contacting support.',
    },
    {
      heading: 'Contact',
      body: 'Questions about this policy can be sent to support@betpro.com or raised through Help & Support in the app.',
    },
  ],
};

export const termsConditions: LegalDocument = {
  title: 'Terms & Conditions',
  updated: 'Last updated 13 Aug 2026',
  sections: [
    {
      heading: 'Eligibility',
      body: 'You must be 18 years or older and resident in a territory where this service is permitted. Accounts found to belong to underage users are closed and remaining balances returned.',
    },
    {
      heading: 'Your account',
      body: 'One account per person. You are responsible for keeping your username and password confidential, and for all activity that takes place on your account.',
    },
    {
      heading: 'Deposits and withdrawals',
      body: 'Deposits are credited once confirmed by the payment provider. Withdrawals are processed within 24 hours, subject to a ₹500 minimum and successful verification of your identity.',
    },
    {
      heading: 'Placing bets',
      body: 'A bet is accepted once confirmed in your bet slip and cannot be cancelled. Where an early settlement (Cash Out) offer is shown, it is available only while the offer is displayed and may change as odds move.',
    },
    {
      heading: 'Settlement and voids',
      body: 'Markets are settled on the official result. If an event is abandoned or a market is offered in error, affected bets are voided and stakes returned.',
    },
    {
      heading: 'Responsible play',
      body: 'Set limits that suit you and treat betting as entertainment rather than income. Contact support if you would like your account restricted or closed.',
    },
  ],
};

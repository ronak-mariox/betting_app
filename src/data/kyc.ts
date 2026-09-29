/**
 * Copy transcribed from the Figma KYC frames: intro (312:2), personal
 * details (312:73), document (312:211 empty, 312:339 type sheet, 312:534
 * uploaded), review (312:678 unchecked, 312:843 checked) and submitted
 * (312:1011).
 */

export const kycIntro = {
  title: 'KYC Verification',
  body: 'Apni identity verify karo aur BetPro ki sabhi features ka full access pao. Yeh ek baar ka process hai.',
  benefits: [
    {
      emoji: '🏦',
      title: 'Betting & Withdrawal',
      sub: 'KYC ke baad hi bet aur withdrawal khulte hain',
    },
    {
      emoji: '🔒',
      title: '100% Secure',
      sub: 'Bank-grade encryption se protected',
    },
    {
      emoji: '⚡',
      title: 'Quick 3-Step Process',
      sub: '5 minute mein complete hota hai',
    },
  ],
  start: 'Start KYC',
  later: 'Continue Later',
  safeBefore: 'Aapka data ',
  safeWord: 'safe',
  safeAfter: ' hai — kabhi share nahi hoga',
};

export const kycHeader = {
  title: 'KYC Verification',
  personal: 'Personal details — Step 1 of 3',
  document: 'Identity document — Step 2 of 3',
  review: 'Review your information — Step 3 of 3',
};

export const kycSteps = ['Personal', 'Document', 'Review'] as const;

export const kycPersonal = {
  fullName: {label: 'Full Name *', placeholder: 'Jaise: Rahul Kumar'},
  phone: {
    label: 'Mobile Number *',
    placeholder: '10 digit mobile number',
    error: '10 digit ka sahi mobile number daalo (6, 7, 8 ya 9 se shuru)',
  },
  dob: {label: 'Date of Birth *', placeholder: 'DD/MM/YYYY'},
  address: {label: 'Address *', placeholder: 'Street, Building, Area'},
  city: {label: 'City *', placeholder: 'Jaise: Mumbai'},
  state: {label: 'State *', placeholder: 'Jaise: Maharashtra'},
  country: {label: 'Country', placeholder: 'India'},
  postalCode: {label: 'Postal Code *', placeholder: '400001'},
  cta: 'Continue',
};

export const kycDocument = {
  typeLabel: 'Document Type *',
  typePlaceholder: 'Document type choose karo',
  numberLabel: 'Document Number *',
  numberPlaceholder: 'Document number daalo',
  frontLabel: 'Document Front *',
  backLabel: 'Document Back ',
  optional: '(Optional)',
  frontTitle: 'Front Side',
  backTitle: 'Back Side',
  // The app's picker offers photos (camera / gallery); PDFs aren't pickable here.
  hint: 'JPG ya PNG • Max 5MB',
  upload: 'Upload Karo',
  uploaded: 'Upload ho gaya ✓',
  sheetTitle: 'Document Type Choose Karo',
  cta: 'Review Details',
};

/** Must match KYC_DOCUMENT_TYPES in backend/src/constants/admin.js. */
export const kycDocumentTypes = [
  'Aadhaar Card',
  'PAN Card',
  'Passport',
  'Voter ID',
  'Driving License',
] as const;

export type KycDocumentType = (typeof kycDocumentTypes)[number];

export const kycReview = {
  personalHead: 'Personal Details',
  identityHead: 'Identity Details',
  edit: 'Edit',
  fullName: 'Full Name',
  phone: 'Mobile Number',
  dob: 'Date of Birth',
  address: 'Address',
  cityState: 'City / State',
  country: 'Country',
  postalCode: 'Postal Code',
  documentType: 'Document Type',
  documentNumber: 'Document Number',
  uploaded: 'Uploaded Documents',
  consentBefore:
    'Main confirm karta/karti hoon ki di gayi information sahi hai aur meri apni hai. Main ',
  privacy: 'Privacy Policy',
  consentAnd: ' aur ',
  terms: 'Terms & Conditions',
  consentAfter: ' se sehmat hoon.',
  cta: 'Submit KYC',
  submitting: 'Submit ho raha hai…',
};

/** The submitted/status screen (312:1011), with copy for each review outcome. */
export const kycStatusCopy = {
  Pending: {
    title: 'KYC Submit Ho Gaya! 🎉',
    body: 'Aapka KYC review queue mein hai. 24–48 ghante mein hum verify karenge aur notification bhejenge.',
    badge: 'Under Review',
  },
  Verified: {
    title: 'KYC Verified Ho Gaya! ✅',
    body: 'Aapki identity verify ho gayi hai. Ab aap BetPro ki sabhi features use kar sakte ho.',
    badge: 'Verified',
  },
  Rejected: {
    title: 'KYC Reject Ho Gaya',
    body: 'Aapke documents verify nahi ho paaye. Details check karke dobara submit karo.',
    badge: 'Rejected',
  },
  referenceId: 'Reference ID',
  submittedOn: 'Submitted On',
  status: 'Status',
  reason: 'Reason',
  note: 'Profile > KYC Verification mein kabhi bhi status check kar sakte ho.',
  /** Shown instead of `note` while the review is pending — the app opens only once verified. */
  lockedNote:
    'KYC verify hone ke baad hi app khulega. Check Status dabake latest status dekho.',
  /** Shown after a rejection — the app stays closed until a new submission is verified. */
  rejectedNote:
    'KYC verify hone ke baad hi app khulega. Upar diya reason theek karke dobara submit karo.',
  checkStatus: 'Check Status',
  goToApp: 'App Mein Jao',
  resubmit: 'KYC Dobara Karo',
};

/** One picked document photo, ready to upload as a data URI. */
export type KycFile = {name: string; data: string};

/** Everything collected across the three steps, kept until submit. */
export type KycDraft = {
  fullName: string;
  /** 10-digit Indian mobile, digits only. */
  phone: string;
  /** dd/mm/yyyy, as typed/picked on screen. */
  dob: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  documentType: KycDocumentType | '';
  documentNumber: string;
  front: KycFile | null;
  back: KycFile | null;
};

export const emptyKycDraft: KycDraft = {
  fullName: '',
  phone: '',
  dob: '',
  address: '',
  city: '',
  state: '',
  country: 'India',
  postalCode: '',
  documentType: '',
  documentNumber: '',
  front: null,
  back: null,
};

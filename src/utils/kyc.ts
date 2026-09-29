import type {KycDraft} from '../data/kyc';
import {displayDateToIso} from './profile';

/** Per-field checks for step 1 — each field turns blue with a check once it passes. */
/** Indian mobile: 10 digits starting 6–9 (same rule as the backend). */
export const isMobileValid = (value: string) =>
  /^[6-9]\d{9}$/.test(value.trim());

/** "+91 98765 43210" / "9876543210" -> "9876543210" (last 10 digits), for pre-filling. */
export const toMobileDigits = (value = '') =>
  value.replace(/\D/g, '').slice(-10);

export const personalChecks = (draft: KycDraft) => ({
  fullName: draft.fullName.trim().length >= 2,
  phone: isMobileValid(draft.phone),
  dob: Boolean(displayDateToIso(draft.dob)),
  address: draft.address.trim().length >= 3,
  city: draft.city.trim().length >= 2,
  state: draft.state.trim().length >= 2,
  country: draft.country.trim().length >= 2,
  postalCode: /^[A-Za-z0-9 -]{4,10}$/.test(draft.postalCode.trim()),
});

export const isPersonalValid = (draft: KycDraft) =>
  Object.values(personalChecks(draft)).every(Boolean);

export const isDocumentNumberValid = (value: string) =>
  value.trim().length >= 4 && value.trim().length <= 30;

export const isDocumentValid = (draft: KycDraft) =>
  Boolean(draft.documentType) &&
  isDocumentNumberValid(draft.documentNumber) &&
  Boolean(draft.front);

/** "123456789012" -> "••••••9012", as on the review screen. */
export const maskDocumentNumber = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length <= 4 ? trimmed : `${'•'.repeat(6)}${trimmed.slice(-4)}`;
};

/** "2026-09-28T…" -> "28 Sept 2026". */
export const formatKycDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'June',
    'July',
    'Aug',
    'Sept',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

/** Up to 2 initials from a display name, e.g. "Rahul Kumar" -> "RK". */
export const getInitials = (name?: string, fallback = ''): string => {
  const trimmed = name?.trim();
  if (!trimmed) {
    return fallback;
  }
  const initials = trimmed
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase() ?? '')
    .join('');
  return initials || fallback;
};

/** A friendlier stand-in for players who haven't set a name yet, e.g. "rahul_250" -> "Rahul 250". */
export const usernameToDisplayName = (username: string): string =>
  username
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(word => word[0]?.toUpperCase() + word.slice(1))
    .join(' ');

/** Backend ISO date ("1995-03-15T00:00:00.000Z") -> the screen's dd/mm/yyyy display format. */
export const isoToDisplayDate = (iso?: string | null): string => {
  if (!iso) {
    return '';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${date.getUTCFullYear()}`;
};

/** dd/mm/yyyy text -> an ISO date the backend accepts, or undefined if it isn't a valid date. */
export const displayDateToIso = (value: string): string | undefined => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) {
    return undefined;
  }
  const [, dd, mm, yyyy] = match;
  const iso = `${yyyy}-${mm}-${dd}`;
  return Number.isNaN(new Date(iso).getTime()) ? undefined : iso;
};

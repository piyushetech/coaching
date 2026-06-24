import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'sankalp_access_grants';
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export type AccessGrant = {
  mobile: string;
  name: string;
  grantedAt: string;
  expiresAt: string;
};

export type AccessStatus =
  | { state: 'active'; grant: AccessGrant }
  | { state: 'none' }
  | { state: 'expired'; grant: AccessGrant };

function normalizeMobile(value: string) {
  return value.replace(/\D/g, '').slice(-10);
}

function expiryFromGrantDate(grantedAt: string) {
  return new Date(new Date(grantedAt).getTime() + ONE_YEAR_MS).toISOString();
}

async function readGrants(): Promise<AccessGrant[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as AccessGrant[];
  } catch {
    return [];
  }
}

async function writeGrants(grants: AccessGrant[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(grants));
}

export async function listAccessGrants(): Promise<AccessGrant[]> {
  const grants = await readGrants();
  return grants.sort((a, b) => b.grantedAt.localeCompare(a.grantedAt));
}

export async function addAccessGrant(mobile: string, name = 'Student'): Promise<AccessGrant> {
  const digits = normalizeMobile(mobile);
  if (digits.length !== 10) {
    throw new Error('Enter a valid 10-digit mobile number.');
  }

  const grants = await readGrants();
  const grantedAt = new Date().toISOString();
  const grant: AccessGrant = {
    mobile: digits,
    name: name.trim() || 'Student',
    grantedAt,
    expiresAt: expiryFromGrantDate(grantedAt)
  };

  const next = grants.filter((g) => g.mobile !== digits);
  next.unshift(grant);
  await writeGrants(next);
  return grant;
}

export async function removeAccessGrant(mobile: string) {
  const digits = normalizeMobile(mobile);
  const grants = await readGrants();
  await writeGrants(grants.filter((g) => g.mobile !== digits));
}

export async function checkAccess(mobile: string): Promise<AccessStatus> {
  const digits = normalizeMobile(mobile);
  const grants = await readGrants();
  const grant = grants.find((g) => g.mobile === digits);
  if (!grant) return { state: 'none' };

  if (new Date(grant.expiresAt).getTime() <= Date.now()) {
    return { state: 'expired', grant };
  }

  return { state: 'active', grant };
}

export function formatAccessDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function daysLeft(expiresAt: string) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

/** Seed one demo student on first launch so admin flow can be tested quickly. */
export async function seedDemoAccessIfEmpty() {
  const grants = await readGrants();
  if (grants.length) return;
  await addAccessGrant('9876543210', 'Demo Student');
}

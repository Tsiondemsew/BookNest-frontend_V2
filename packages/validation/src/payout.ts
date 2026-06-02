/** Supported seller withdrawal channels in Ethiopia. */
export type PayoutMethod = 'cbe' | 'abyssinia' | 'telebirr';

export const PAYOUT_METHODS: Array<{
  id: PayoutMethod;
  label: string;
  shortLabel: string;
}> = [
  { id: 'cbe', label: 'Commercial Bank of Ethiopia (CBE)', shortLabel: 'CBE' },
  { id: 'abyssinia', label: 'Bank of Abyssinia', shortLabel: 'Abyssinia' },
  { id: 'telebirr', label: 'Telebirr (Ethio Telecom)', shortLabel: 'Telebirr' },
];

/** CBE account numbers are numeric; commonly 13 digits (some legacy 10–12). */
export const CBE_ACCOUNT_PATTERN = /^\d{10,13}$/;

/** Bank of Abyssinia accounts are typically 13 digits. */
export const ABYSSINIA_ACCOUNT_PATTERN = /^\d{13}$/;

/** Ethio Telecom mobile used for Telebirr — 09 + 8 digits (10 total). */
export const TELEBIRR_PHONE_PATTERN = /^09\d{8}$/;

export function normalizeDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Normalize Ethiopian mobile to 09XXXXXXXX.
 * Accepts: 0912345678, +251912345678, 251912345678
 */
export function normalizeEthiopianMobile(value: string): string | null {
  const digits = normalizeDigits(value);
  if (!digits) return null;

  if (digits.length === 10 && digits.startsWith('09')) {
    return digits;
  }
  if (digits.length === 12 && digits.startsWith('2519')) {
    return `0${digits.slice(3)}`;
  }
  if (digits.length === 9 && digits.startsWith('9')) {
    return `0${digits}`;
  }

  return null;
}

export function isValidCbeAccount(value: string): boolean {
  const digits = normalizeDigits(value);
  return CBE_ACCOUNT_PATTERN.test(digits);
}

export function isValidAbyssiniaAccount(value: string): boolean {
  const digits = normalizeDigits(value);
  return ABYSSINIA_ACCOUNT_PATTERN.test(digits);
}

export function isValidTelebirrPhone(value: string): boolean {
  const normalized = normalizeEthiopianMobile(value);
  return normalized !== null && TELEBIRR_PHONE_PATTERN.test(normalized);
}

export type PayoutDetailsInput = {
  payment_method?: string;
  account_name?: string;
  account_number?: string;
  telebirr_phone?: string;
  /** @deprecated legacy free-text fields */
  bank_name?: string;
  mobile_money?: string;
};

export type PayoutValidationResult =
  | { ok: true; data: {
      payment_method: PayoutMethod;
      account_name: string;
      account_number?: string;
      telebirr_phone?: string;
    } }
  | { ok: false; message: string };

export function validatePayoutDetails(input: PayoutDetailsInput): PayoutValidationResult {
  const method = input.payment_method as PayoutMethod | undefined;
  if (!method || !PAYOUT_METHODS.some((m) => m.id === method)) {
    return { ok: false, message: 'Select a payout method: CBE, Abyssinia, or Telebirr.' };
  }

  const accountName = (input.account_name ?? '').trim();
  if (accountName.length < 2) {
    return { ok: false, message: 'Account holder name is required (at least 2 characters).' };
  }

  if (method === 'cbe') {
    const raw = input.account_number ?? '';
    if (!isValidCbeAccount(raw)) {
      return {
        ok: false,
        message: 'CBE account must be 10–13 digits (numbers only).',
      };
    }
    return {
      ok: true,
      data: {
        payment_method: 'cbe',
        account_name: accountName,
        account_number: normalizeDigits(raw),
      },
    };
  }

  if (method === 'abyssinia') {
    const raw = input.account_number ?? '';
    if (!isValidAbyssiniaAccount(raw)) {
      return {
        ok: false,
        message: 'Bank of Abyssinia account must be exactly 13 digits.',
      };
    }
    return {
      ok: true,
      data: {
        payment_method: 'abyssinia',
        account_name: accountName,
        account_number: normalizeDigits(raw),
      },
    };
  }

  const phoneRaw = input.telebirr_phone ?? input.mobile_money ?? '';
  const normalized = normalizeEthiopianMobile(phoneRaw);
  if (!normalized || !TELEBIRR_PHONE_PATTERN.test(normalized)) {
    return {
      ok: false,
      message: 'Telebirr number must be a valid Ethio Telecom mobile (e.g. 0912345678).',
    };
  }

  return {
    ok: true,
    data: {
      payment_method: 'telebirr',
      account_name: accountName,
      telebirr_phone: normalized,
    },
  };
}

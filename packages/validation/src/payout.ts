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

/** CBE: 13 digits, must start with 1000 */
export const CBE_ACCOUNT_PATTERN = /^1000\d{9}$/;

/** Bank of Abyssinia: 8 or 9 digits */
export const ABYSSINIA_ACCOUNT_PATTERN = /^\d{8}$|^\d{9}$/;

/** Telebirr / Ethio Telecom mobile */
export const TELEBIRR_INPUT_PATTERN = /^(09|2519|\+2519|\+2517)\d{8}$/;

export function normalizeDigits(value: string): string {
  return value.replace(/\D/g, '');
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
  return TELEBIRR_INPUT_PATTERN.test(value.trim());
}

/** Store Telebirr numbers in local 09… or 07… format. */
export function normalizeTelebirrPhone(value: string): string | null {
  const trimmed = value.trim();
  if (!TELEBIRR_INPUT_PATTERN.test(trimmed)) return null;

  const digits = normalizeDigits(trimmed);
  if (digits.length === 10 && digits.startsWith('09')) return digits;
  if (digits.length === 12 && digits.startsWith('2519')) return `0${digits.slice(3)}`;
  if (digits.length === 12 && digits.startsWith('2517')) return `0${digits.slice(3)}`;

  return null;
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
        message: 'CBE account must be 13 digits and start with 1000.',
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
        message: 'Bank of Abyssinia account must be 8 or 9 digits.',
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
  const normalized = normalizeTelebirrPhone(phoneRaw);
  if (!normalized) {
    return {
      ok: false,
      message: 'Telebirr number must be a valid Ethiopian mobile (e.g. 0912345678).',
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

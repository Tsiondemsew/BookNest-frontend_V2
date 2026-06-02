import type { PayoutMethod } from '@repo/validation';
import {
  isValidAbyssiniaAccount,
  isValidCbeAccount,
  isValidTelebirrPhone,
  normalizeDigits,
  normalizeEthiopianMobile,
} from '@repo/validation';

export type WithdrawalFormValues = {
  amount: string;
  accountName: string;
  paymentMethod: PayoutMethod | '';
  accountNumber: string;
  telebirrPhone: string;
};

export type WithdrawalFormErrors = Partial<
  Record<keyof WithdrawalFormValues | 'form', string>
>;

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export function validateWithdrawalForm(
  values: WithdrawalFormValues,
  availableBalance: number,
  currency: string,
  t: TranslateFn
): WithdrawalFormErrors {
  const errors: WithdrawalFormErrors = {};
  const trimmedAmount = values.amount.trim();
  const amount = parseFloat(trimmedAmount);
  const available = Number(availableBalance) || 0;

  if (!trimmedAmount) {
    errors.amount = t('studioPayouts.errorAmountRequired');
  } else if (!/^\d+(\.\d{1,2})?$/.test(trimmedAmount) || Number.isNaN(amount) || amount <= 0) {
    errors.amount = t('studioPayouts.errorAmountInvalid');
  } else if (amount > available) {
    errors.amount = t('studioPayouts.errorAmountExceeds', {
      amount: available.toFixed(2),
      currency,
    });
  }

  const accountName = values.accountName.trim();
  if (accountName.length < 2) {
    errors.accountName = t('studioPayouts.errorAccountName');
  }

  if (!values.paymentMethod) {
    errors.paymentMethod = t('studioPayouts.errorPaymentMethodRequired');
  } else if (values.paymentMethod === 'cbe') {
    if (!isValidCbeAccount(values.accountNumber)) {
      errors.accountNumber = t('studioPayouts.errorCbeAccount');
    }
  } else if (values.paymentMethod === 'abyssinia') {
    if (!isValidAbyssiniaAccount(values.accountNumber)) {
      errors.accountNumber = t('studioPayouts.errorAbyssiniaAccount');
    }
  } else if (values.paymentMethod === 'telebirr') {
    if (!isValidTelebirrPhone(values.telebirrPhone)) {
      errors.telebirrPhone = t('studioPayouts.errorTelebirrPhone');
    }
  }

  return errors;
}

export function buildPayoutDetailsPayload(values: WithdrawalFormValues) {
  const accountName = values.accountName.trim();

  if (values.paymentMethod === 'telebirr') {
    const phone = normalizeEthiopianMobile(values.telebirrPhone) ?? values.telebirrPhone.trim();
    return {
      payment_method: 'telebirr' as const,
      account_name: accountName,
      telebirr_phone: phone,
    };
  }

  if (values.paymentMethod === 'cbe' || values.paymentMethod === 'abyssinia') {
    return {
      payment_method: values.paymentMethod,
      account_name: accountName,
      account_number: normalizeDigits(values.accountNumber),
    };
  }

  throw new Error('Payment method required');
}

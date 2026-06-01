export type WithdrawalFormValues = {
  amount: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  mobileMoney: string;
};

export type WithdrawalFormErrors = Partial<
  Record<keyof WithdrawalFormValues | 'payoutMethod' | 'form', string>
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

  const bankName = values.bankName.trim();
  const accountNumber = values.accountNumber.trim();
  const mobileMoney = values.mobileMoney.trim();
  const hasBank = Boolean(bankName || accountNumber);
  const hasMobile = mobileMoney.length >= 9;

  if (!hasBank && !hasMobile) {
    errors.payoutMethod = t('studioPayouts.errorPayoutMethod');
  }

  if (accountNumber && accountNumber.length < 4) {
    errors.accountNumber = t('studioPayouts.errorAccountNumber');
  }

  if (accountNumber && !bankName) {
    errors.bankName = t('studioPayouts.errorBankName');
  }

  if (mobileMoney && mobileMoney.length > 0 && mobileMoney.length < 9) {
    errors.mobileMoney = t('studioPayouts.errorPayoutMethod');
  }

  return errors;
}

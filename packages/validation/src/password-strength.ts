export const getPasswordStrength = (password: string): number => {
  if (!password) return 0;

  let strength = 0;
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  if (/[A-Z]/.test(password)) strength += 20;
  if (/[a-z]/.test(password)) strength += 20;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[^A-Za-z0-9]/.test(password)) strength += 15;

  return Math.min(100, strength);
};

export const getPasswordStrengthLabel = (
  strength: number
): { label: string; color: string; bgColor: string } => {
  if (strength < 30) {
    return { label: 'Weak', color: 'text-red-600', bgColor: 'bg-red-500' };
  }
  if (strength < 60) {
    return { label: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-500' };
  }
  if (strength < 80) {
    return { label: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-500' };
  }
  return { label: 'Strong', color: 'text-green-600', bgColor: 'bg-green-500' };
};

export const PASSWORD_REQUIREMENTS = [
  { key: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { key: 'upper', label: 'At least 1 uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { key: 'lower', label: 'At least 1 lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { key: 'number', label: 'At least 1 number', test: (p: string) => /[0-9]/.test(p) },
  {
    key: 'special',
    label: 'At least 1 special character',
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
] as const;

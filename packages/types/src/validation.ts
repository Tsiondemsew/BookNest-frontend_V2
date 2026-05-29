// Shared validation rules between frontend and backend
export const ValidationRules = {
  email: {
    min: 5,
    max: 255,
    pattern: /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/,
  },
  password: {
    min: 8,
    max: 100,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: true,
  },
  displayName: {
    min: 2,
    max: 50,
    pattern: /^[a-zA-Z0-9\s-_]+$/,
  },
  verificationCode: {
    length: 6,
    pattern: /^[0-9]{6}$/,
  },
};

export interface ValidationError {
  field: string;
  message: string;
}
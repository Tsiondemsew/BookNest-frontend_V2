/** Shared BookNest form control styles — always readable on light surfaces */
export const bnInputClass = (hasError = false) =>
  `w-full px-3.5 py-2.5 rounded-xl border bg-white text-[#1A2A3A] placeholder:text-[#4A5568]/70 ` +
  `focus:outline-none focus:ring-2 focus:ring-[#B85C38]/25 focus:border-[#B85C38] transition-colors ` +
  `disabled:opacity-60 disabled:bg-[#F5F1EB] ` +
  (hasError ? 'border-red-400' : 'border-[#E8E2D9]');

export const bnTextareaClass = (hasError = false) => `${bnInputClass(hasError)} resize-none`;

export const bnSelectClass = (hasError = false) =>
  `${bnInputClass(hasError)} appearance-none cursor-pointer`;

'use client';

import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { bnInputClass, bnTextareaClass } from './inputStyles';

interface FormFieldBaseProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

type InputProps = FormFieldBaseProps &
  InputHTMLAttributes<HTMLInputElement> & { multiline?: false };

type TextareaProps = FormFieldBaseProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & { multiline: true };

export function FormField(props: InputProps | TextareaProps) {
  const { label, error, hint, required, multiline, className, id, ...rest } = props;
  const fieldId = id || label.replace(/\s+/g, '-').toLowerCase();
  const hasError = Boolean(error);

  let control: ReactNode;
  if (multiline) {
    const { multiline: _m, ...textareaRest } = props as TextareaProps;
    control = (
      <textarea
        id={fieldId}
        className={`${bnTextareaClass(hasError)} ${className || ''}`}
        aria-invalid={hasError}
        {...textareaRest}
      />
    );
  } else {
    const { multiline: _m, ...inputRest } = props as InputProps;
    control = (
      <input
        id={fieldId}
        className={`${bnInputClass(hasError)} ${className || ''}`}
        aria-invalid={hasError}
        {...inputRest}
      />
    );
  }

  return (
    <div className="space-y-1">
      <label htmlFor={fieldId} className="block text-sm font-medium text-[#1A2A3A]">
        {label}
        {required ? <span className="text-[#B85C38] ml-0.5">*</span> : null}
      </label>
      {control}
      {hint && !error ? <p className="text-xs text-[#4A5568]">{hint}</p> : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

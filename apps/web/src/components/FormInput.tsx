'use client';

import React, { forwardRef } from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  icon?: React.ReactNode;
}

/**
 * FormInput - Accessible form input with label, error handling, and hints
 * 
 * Features:
 * - Always includes associated label
 * - Error messages linked via aria-describedby
 * - Helper text for additional context
 * - Visual and aria feedback
 * - Required field indication
 */
export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      hint,
      required = false,
      id,
      className = '',
      icon,
      ...rest
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    const describedBy = [error && errorId, hint && hintId]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div className="space-y-2">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground"
        >
          {label}
          {required && <span aria-label="required"> *</span>}
        </label>

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            required={required}
            className={`w-full px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed ${
              error
                ? 'border-accent text-accent'
                : 'border-border text-foreground'
            } ${icon ? 'pl-10' : ''} ${className}`}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            {...rest}
          />

          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/60">
              {icon}
            </div>
          )}
        </div>

        {error && (
          <p
            id={errorId}
            className="text-sm text-accent font-medium"
            role="alert"
          >
            {error}
          </p>
        )}

        {hint && (
          <p id={hintId} className="text-xs text-foreground/60">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export type FieldErrorDetail = {
  field: string;
  message: string;
};

export type ParsedApiError = {
  message: string;
  code: string;
  details?: FieldErrorDetail[];
  existingBookId?: string;
};

export function parseApiErrorBody(parsedBody: unknown): ParsedApiError {
  if (typeof parsedBody !== 'object' || parsedBody === null) {
    return { message: 'Request failed', code: 'INTERNAL_ERROR' };
  }

  const body = parsedBody as Record<string, unknown>;
  const nested = body.error;

  if (typeof nested === 'object' && nested !== null) {
    const err = nested as Record<string, unknown>;
    const details = Array.isArray(err.details)
      ? (err.details as FieldErrorDetail[]).filter(
          (d) => typeof d?.field === 'string' && typeof d?.message === 'string'
        )
      : undefined;

    return {
      message:
        typeof err.message === 'string' ? err.message : 'Request failed',
      code: typeof err.code === 'string' ? err.code : 'INTERNAL_ERROR',
      details: details?.length ? details : undefined,
      existingBookId:
        typeof err.existingBookId === 'string' ? err.existingBookId : undefined,
    };
  }

  if (typeof nested === 'string' && nested.trim()) {
    return { message: nested, code: 'INTERNAL_ERROR' };
  }

  if (typeof body.message === 'string') {
    return { message: body.message, code: 'INTERNAL_ERROR' };
  }

  return { message: 'Request failed', code: 'INTERNAL_ERROR' };
}

export function fieldErrorsFromDetails(
  details?: FieldErrorDetail[]
): Record<string, string> {
  if (!details?.length) return {};

  const map: Record<string, string> = {};
  for (const { field, message } of details) {
    const key =
      field === 'display_name'
        ? 'displayName'
        : field === 'confirmPassword'
          ? 'confirmPassword'
          : field;
    if (!map[key]) {
      map[key] = message;
    }
  }
  return map;
}

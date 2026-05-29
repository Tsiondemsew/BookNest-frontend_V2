export function getApiErrorMessage(
  payload: { error?: { message?: string }; message?: string },
  fallback: string,
) {
  return payload?.error?.message || payload?.message || fallback;
}

export function getApiErrorMessage(
  payload: {
    error?: { message?: string } | string;
    message?: string;
    path?: string;
  },
  fallback: string,
) {
  if (typeof payload?.error === 'string') {
    if (payload.error === 'Endpoint not found') {
      return 'Invitations API not found. Restart the backend on port 5000 (node index.js in Book-Nest-WebApp/backend).';
    }
    return payload.error;
  }
  const msg = payload?.error?.message || payload?.message || fallback;
  if (msg === 'Endpoint not found' || payload?.path?.includes('/invitations')) {
    return 'Invitations API not found. Restart the backend on port 5000 (node index.js in Book-Nest-WebApp/backend).';
  }
  return msg;
}

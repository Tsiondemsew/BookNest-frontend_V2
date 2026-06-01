'use server';

import { createSupabaseAuthClient } from '@/lib/supabase/admin-auth';

export type ForgotPasswordState = {
  error?: string;
  success?: string;
};

export async function requestPasswordReset(
  _prev: ForgotPasswordState | undefined,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();

  if (!email) {
    return { error: 'Enter your admin email first.' };
  }

  try {
    const supabase = createSupabaseAuthClient();
    const redirectTo =
      process.env.NEXT_PUBLIC_ADMIN_URL ||
      process.env.ADMIN_APP_URL ||
      'http://localhost:3001/login';

    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) {
      return { error: error.message };
    }

    return {
      success: `If ${email} is registered, a reset link was sent. Check your inbox.`,
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Could not send reset email.',
    };
  }
}

'use client';

import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

/**
 * Component for a login button that uses Supabase OAuth with Google.
 *
 * @component
 */
export function LoginButton({ title }: { title: string }) {
  /**
   * Handles the login process using Supabase OAuth with Google.
   */
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  };

  return (
    <Button
      onClick={handleLogin}
      className="h-[3rem] w-full flex items-center text-base font-semibold justify-center bg-white text-blue-900 border border-blue-950 rounded-md hover:bg-white"
    >
      <img src="/assets/google-logo.png" alt="Google Logo" className="w-6 h-6 mr-2" />
      {title}
    </Button>
  );
}
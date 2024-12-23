'use client';

import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { LogIn } from 'lucide-react';

/**
 * Component for a login button that uses Supabase OAuth with Google.
 *
 * @component
 */
export function LoginButton() {
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
    <Button onClick={handleLogin} className="w-full">
      <LogIn className="mr-2 h-4 w-4" />
      Sign in with Google
    </Button>
  );
}
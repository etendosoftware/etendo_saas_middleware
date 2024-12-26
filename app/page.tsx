'use client';

import { LoginButton } from '@/components/auth/login-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Boxes } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard/redirect');
      }
      setLoading(false);
    };

    checkUser();
  }, [router]);

  if (loading) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Boxes className="h-12 w-12 text-primary" />
          </div>
          <CardTitle>Welcome to Environment Manager</CardTitle>
          <CardDescription>
            Sign in to manage your environments and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <LoginButton />
            <div className="text-center text-sm text-muted-foreground">
              <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
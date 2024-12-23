'use client';

import { LoginButton } from '@/components/auth/login-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { dictionary } from '@/translations';
import { Boxes } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home({ params }: {
  params: { locale: 'en' | 'es' };
}) {
  const t = dictionary[params.locale] ?? dictionary.en;
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
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
          <CardTitle>{t.login.welcomeTitle}</CardTitle>
          <CardDescription>
            {t.login.welcomeDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <LoginButton />
            <div className="text-center text-sm text-muted-foreground">
              <p>{t.login.signInTerms}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
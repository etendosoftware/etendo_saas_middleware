'use client';

import { LoginButton } from '@/components/auth/login-button';
import { supabase } from '@/lib/supabase';
import { dictionary } from '@/translations';
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
        router.push('/dashboard/redirect');
      } else {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  if (loading) {
    return null;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/assets/login-background.png')" }}
    >
      <div className="w-[33.25rem] p-[4rem] bg-white/90 rounded-[1.25rem]">
        <div className="flex justify-center">
          <img src="/assets/etendo-login-logo.png" alt="Etendo Logo" className="h-[4.75rem] w-[4.75rem]" />
        </div>
        <div className="text-center mt-4">
          <div className='flex items-center justify-center'>
            <h1 className="text-[1.75rem] font-semibold text-blue-900">
              {t.login.welcomeTitle}
            </h1>
            <img src="/assets/stars.png" alt="Etendo Logo" className="h-8 w-8 ml-1" />
          </div>
          <p className="mt-2 text-base text-gray-600">
            {t.login.welcomeDescription}
          </p>
        </div>

        <div className="mt-6">
          <LoginButton title={t.login.signInWithGoogle} />
        </div>
      </div>
    </div>
  );
}
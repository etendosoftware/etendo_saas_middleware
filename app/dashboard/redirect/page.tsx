'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { etendoLogin } from '@/utils/supabase/etendo';

export default function EnvironmentRedirectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/');
          return;
        }

        const { data: envs } = await supabase
          .from('environments')
          .select('*')
          .eq('created_by', session.user.id);

        if (!envs || envs.length === 0) {
          router.push('/dashboard/new');
          return;
        }

        await etendoLogin(envs[0].name + 'User');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    handleRedirect();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-[300px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Checking your environment...</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              Please wait
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }
}
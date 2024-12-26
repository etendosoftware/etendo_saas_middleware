'use client';

import { UserNav } from '@/components/auth/user-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Environment, UserProfile } from '@/lib/types';
import { Cog, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from "next/link";
import { dictionary } from '@/translations';
import { LanguageSelector } from '@/components/ui/language-selector';
import { Navbar } from '@/components/ui/navbar';

export default function Dashboard({ params }: {
  params: { locale: 'en' | 'es' };
}) {
  const t = dictionary[params.locale] ?? dictionary.en;
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        if (session?.user?.identities && session.user.identities.length > 0 && session.user.identities[0].identity_data?.avatar_url) {
          profile.avatar_url = session.user.identities[0].identity_data.avatar_url;
        }
        setUser(profile);
      }

      const { data: envs } = await supabase
        .from('environments')
        .select('*')
        .eq('created_by', session.user.id);

      if (envs) {
        setEnvironments(envs);
      }

      setLoading(false);
    };

    checkUser();
  }, [router]);

  const remoteBaseUrl = process.env.NEXT_PUBLIC_ETENDO_URL ?? 'http://localhost:8080/etendo'
  const loginUri = '/secureApp/LoginHandler.html'

  /**
   * Logs in to the remote system using the provided username and password.
   *
   * @param {string} name - The username to log in with.
   * @param {string | null} [pass=null] - The password to log in with. If not provided, the access token will be used.
   */
  const logIn = async (name: string, pass: string | null = null) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (token) {
      const formParams = new URLSearchParams();
      if (pass) {
        formParams.append('password', pass);
      } else {
        formParams.append('access_token', token);
      }
      formParams.append('user', name);

      const response = await fetch(remoteBaseUrl + loginUri, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formParams.toString()
      });

      if (!response.ok) {
        console.error('Error en el login remoto');
        return;
      }

      const data = await response.json();
      console.log('Respuesta JSON:', data);

      if (data && data.target) {
        window.location.href = data.target;
      } else {
        console.error('No se encontró campo "target" en la respuesta');
      }
    }
  }

  if (loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} locale={params.locale} />

      <main className="container py-8 space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">{t.dashboard.yourEnvironments}</h2>
            <p className="text-muted-foreground">
              {t.dashboard.manageMonitor}
            </p>
          </div>
          <Link href={`/${params.locale}/dashboard/new`} passHref>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              {t.dashboard.newEnvironment}
            </Button>
          </Link>
        </div>

        <Button className="w-full sm:w-auto" variant={"ghost"} onClick={() => logIn("admin", "admin")}>
          <Cog className="mr-2 h-4 w-4" />
          {t.dashboard.systemAccess}
        </Button>
        {environments.length === 0 ? (
          <Card className="border-dashed">
            <CardHeader className="space-y-4">
              <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2 text-center">
                <CardTitle>{t.dashboard.noEnvironmentsYet}</CardTitle>
                <CardDescription>
                  {t.dashboard.createFirstEnvironment}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {environments.map((env) => (
              <Card
                key={env.id}
                className="group relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/50"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {env.name}
                  </CardTitle>
                  <CardDescription>{env.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {t.dashboard.createdOn} {new Date(env.created_at).toLocaleDateString()}
                  </p>
                  <p className="space-x-2">
                    <Button onClick={() => logIn(env.name + 'Admin')}>{t.dashboard.adminAccess}</Button>
                    <Button onClick={() => logIn(env.name + 'User')}>{t.dashboard.userAccess}</Button>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
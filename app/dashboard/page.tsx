'use client';

import { UserNav } from '@/components/auth/user-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Environment, UserProfile } from '@/lib/types';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Dashboard() {
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

  if (loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-2xl font-bold">Environment Manager</h1>
          {user && <UserNav user={user} />}
        </div>
      </header>
      
      <main className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Your Environments</h2>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Environment
          </Button>
        </div>

        {environments.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No environments yet</CardTitle>
              <CardDescription>
                Create your first environment to get started
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {environments.map((env) => (
              <Card key={env.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{env.name}</CardTitle>
                  <CardDescription>{env.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Created on {new Date(env.created_at).toLocaleDateString()}
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
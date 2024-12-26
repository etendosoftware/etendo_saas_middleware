'use client';

import { dictionary } from '@/translations';
import { CreationProgress } from '@/components/environments/creation-progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { industries } from '@/lib/config/industries';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface Step {
  id: string;
  label: string;
  callback: (environmentId: string) => Promise<void>;
}

export default function NewEnvironment({
  params,
}: {
  params: { locale: 'en' | 'es' };
}) {
  const t = dictionary[params.locale] ?? dictionary.en;

  const BASE_CREATION_STEPS: Step[] = [
    {
      id: 'instance',
      label: t.steps.instance,
      callback: async (environmentId: string) => {
        const response = await fetch('/api/setup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ environmentId }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`${t.steps.errorInstance} ${errorText}`);
        }
      },
    },
    {
      id: 'organization',
      label: t.steps.organization,
      callback: async (environmentId: string) => {
        const response = await fetch('/api/organization', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ environmentId }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`${t.steps.errorOrganization} ${errorText}`);
        }
      },
    },
    {
      id: 'organization-ready',
      label: t.steps.organizationReady,
      callback: async (environmentId: string) => {
        const response = await fetch('/api/organization-ready', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ environmentId }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`${t.steps.errorOrganizationReady} ${errorText}`);
        }
      },
    },
    {
      id: 'assistant-access',
      label: t.steps.assistantAccess,
      callback: async (environmentId: string) => {
        const response = await fetch('/api/assistant-access', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ environmentId }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`${t.steps.errorAssistantAccess} ${errorText}`);
        }
      },
    },
    {
      id: 'organization-final',
      label: t.steps.organizationFinal,
      callback: async () => {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      },
    },
  ];

  const router = useRouter();
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [environmentId, setEnvironmentId] = useState<string | null>(null);
  const [environmentName, setEnvironmentName] = useState<string | null>(null);

  const remoteBaseUrl =
    process.env.NEXT_PUBLIC_ETENDO_URL ?? 'http://localhost:8080/etendo';
  const loginUri = '/secureApp/LoginHandler.html';

  /**
   Creates the environment in your DB & Sets up the environment ID for the multi-step creation process.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push('/');
      return;
    }

    const response = await fetch('/api/environments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, industry, created_by: session?.user.id }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert(`${t.ui.errorCreatingEnv} ${errorData.error}`);
      return;
    }

    const { environment } = await response.json();

    setEnvironmentId(environment.id);
    setEnvironmentName(environment.name);
    setIsCreating(true);
  };

  const handleCreationComplete = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t.ui.createNewEnv}</CardTitle>
          <CardDescription>
            {t.ui.createNewEnvDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCreating && environmentId ? (
            <CreationProgress
              environmentId={environmentId}
              onComplete={handleCreationComplete}
              steps={BASE_CREATION_STEPS}
            />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t.ui.companyName}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.ui.enterCompanyName}
                    className="w-full"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">{t.ui.industry}</Label>
                  <Select
                    value={industry}
                    onValueChange={setIndustry}
                    required
                  >
                    <SelectTrigger id="industry">
                      <SelectValue placeholder={t.ui.selectIndustry} />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((ind) => (
                        <SelectItem key={ind.id} value={ind.id}>
                          {ind.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  {t.ui.cancel}
                </Button>
                <Button type="submit">{t.ui.createEnv}</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
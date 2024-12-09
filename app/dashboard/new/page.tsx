'use client';

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
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {supabase} from "@/lib/supabase";

export default function NewEnvironment() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [environmentId, setEnvironmentId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { session } } = await supabase.auth.getSession();

    const response = await fetch('/api/environments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, industry, created_by: session?.user.id })
    })

    if (!response.ok) {
      const errorData = await response.json();
      alert(`Error creating environment: ${errorData.error}`);
      return;
    }

    const { environment } = await response.json();

    setEnvironmentId(environment.id);
    setIsCreating(true);
  };

  const handleCreationComplete = () => {
    router.push('/dashboard');
  };

  return (
    <div className="container max-w-2xl py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Environment</CardTitle>
          <CardDescription>
            Set up a new environment for your organization. Fill in the details below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCreating && environmentId ? (
            <CreationProgress
              environmentId={environmentId}
              onComplete={handleCreationComplete}
            />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter company name"
                    className="w-full"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={industry}
                    onValueChange={setIndustry}
                    required
                  >
                    <SelectTrigger id="industry">
                      <SelectValue placeholder="Select industry" />
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
                  Cancel
                </Button>
                <Button type="submit">
                  Create Environment
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
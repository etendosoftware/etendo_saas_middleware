'use client';

import { CheckCircle2, Circle, Loader2, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Step {
  id: string;
  label: string;
  callback: () => Promise<void>;
}

const BASE_CREATION_STEPS: Step[] = [
  {
    id: 'instance',
    label: 'Creating instance',
    callback: async () => {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inpClient: 'Cliente',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error creating instance: ${errorText}`);
      }
    }
  },
  {
    id: 'organization',
    label: 'Setting up organization',
    callback: async () => {
      throw new Error('Organization setup failed due to missing configuration');
    }
  },
];

export function CreationProgress({
  onComplete,
  environmentId,
}: {
  onComplete: () => void;
  environmentId: string;
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [errorSteps, setErrorSteps] = useState<Record<string, string>>({});

  const CREATION_STEPS = BASE_CREATION_STEPS.map(step => {
    if (step.id === 'instance') {
      return {
        ...step,
        callback: async () => {
          const response = await fetch('/api/setup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ environmentId })
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error creating instance: ${errorText}`);
          }
        }
      };
    }
    return step;
  });

  useEffect(() => {
    const runSteps = async () => {
      for (let i = 0; i < CREATION_STEPS.length; i++) {
        setCurrentStepIndex(i);
        const step = CREATION_STEPS[i];

        try {
          await step.callback();
          setCompletedSteps((prev) => [...prev, step.id]);
        } catch (error: any) {
          setErrorSteps((prev) => ({ ...prev, [step.id]: error.message }));
          return; // Detiene la ejecución de los siguientes pasos en caso de error
        }
      }

      onComplete();
    };

    runSteps();
  }, [onComplete, environmentId]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {CREATION_STEPS.map((step, index) => {
          const isActive = index === currentStepIndex && !errorSteps[step.id] && !completedSteps.includes(step.id);
          const isCompleted = completedSteps.includes(step.id);
          const hasError = !!errorSteps[step.id];

          let icon = <Circle className="h-5 w-5 text-muted-foreground shrink-0" />;
          if (isCompleted) {
            icon = <CheckCircle2 className="h-5 w-5 text-brand-primary shrink-0" />;
          } else if (hasError) {
            icon = <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />;
          } else if (isActive) {
            icon = <Loader2 className="h-5 w-5 text-brand-primary animate-spin shrink-0" />;
          }

          return (
            <div
              key={step.id}
              className={`flex flex-col gap-1 transition-opacity ${
                index > currentStepIndex ? 'opacity-50' : 'opacity-100'
              }`}
            >
              <div className="flex items-center gap-3">
                {icon}
                <span className="text-sm font-medium">{step.label}</span>
              </div>
              {hasError && (
                <p className="text-sm text-red-500 ml-8">
                  {errorSteps[step.id]}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
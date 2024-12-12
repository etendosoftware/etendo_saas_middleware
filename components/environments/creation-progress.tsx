"use client";

import { CheckCircle2, Circle, Loader2, AlertCircle } from 'lucide-react';
import {useCallback, useEffect, useRef, useState} from 'react';
import {Step} from '../../app/dashboard/new/page';

export function CreationProgress({
                                   onComplete,
                                   environmentId,
  steps
                                 }: {
  onComplete: () => void;
  environmentId: string;
  steps: Step[];
}) {
  console.log("🚩 Creando entorno con ID:", environmentId);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [errorSteps, setErrorSteps] = useState<Record<string, string>>({});

  // Guardar en un ref si ya se ejecutó runSteps
  const hasRunRef = useRef(false);

  const runSteps = useCallback(async () => {
    console.log("🚩 Run steps");
    for (let i = 0; i < steps.length; i++) {
      setCurrentStepIndex(i);
      const step = steps[i];
      try {
        await step.callback(environmentId);
        setCompletedSteps((prev) => [...prev, step.id]);
      } catch (error: any) {
        setErrorSteps((prev) => ({ ...prev, [step.id]: error.message }));
        console.error(`Error en el paso ${step.label}: ${error.message}`);
        return; // Detiene la ejecución si hay un error
      }
    }
    onComplete();
  }, [steps, environmentId, onComplete]);

  useEffect(() => {
    // Este efecto se ejecutará en cada render, pero gracias a hasRunRef,
    // runSteps se iniciará solo la primera vez.
    if (!hasRunRef.current) {
      hasRunRef.current = true;
      runSteps();
    }
  }, [runSteps]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isActive =
            index === currentStepIndex &&
            !errorSteps[step.id] &&
            !completedSteps.includes(step.id);
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

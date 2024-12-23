"use client";

import { CheckCircle2, Circle, Loader2, AlertCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Step } from '../../app/dashboard/new/page';

/**
 * Component to display the progress of environment creation steps.
 *
 * @component
 * @param {Object} props - The properties for the CreationProgress component.
 * @param {Function} props.onComplete - Callback function to be called when all steps are completed.
 * @param {string} props.environmentId - The ID of the environment being created.
 * @param {Step[]} props.steps - Array of steps to be executed for environment creation.
 */
export function CreationProgress({
  onComplete,
  environmentId,
  steps
}: {
  onComplete: () => void;
  environmentId: string;
  steps: Step[];
}) {
  console.log("🚩 Creating environment with ID:", environmentId);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [errorSteps, setErrorSteps] = useState<Record<string, string>>({});

  // Ref to track if runSteps has already been executed
  const hasRunRef = useRef(false);

  /**
   * Function to execute the steps sequentially.
   */
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
        console.error(`Error in step ${step.label}: ${error.message}`);
        return; // Stop execution if there is an error
      }
    }
    onComplete();
  }, [steps, environmentId, onComplete]);

  useEffect(() => {
    // This effect will run on every render, but thanks to hasRunRef,
    // runSteps will only be initiated the first time.
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
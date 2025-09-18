import React from 'react';
import { useImport } from '@/contexts/ImportContext';
import { FileUploadStep } from './FileUploadStep';
import { ColumnMappingStep } from './ColumnMappingStep';
import { ImportProcessStep } from './ImportProcessStep';
import { cn } from '@/lib/utils';
import { Check, Upload, Settings, Play } from 'lucide-react';

const steps = [
  { id: 1, name: 'Upload File', icon: Upload, description: 'Upload file Excel atau CSV' },
  { id: 2, name: 'Mapping Kolom', icon: Settings, description: 'Petakan kolom data ke field database' },
  { id: 3, name: 'Proses Import', icon: Play, description: 'Review dan jalankan import data' }
];

export const ImportStepper = () => {
  const { currentStep } = useImport();

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <FileUploadStep />;
      case 2:
        return <ColumnMappingStep />;
      case 3:
        return <ImportProcessStep />;
      default:
        return <FileUploadStep />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Step indicator */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isUpcoming = currentStep < step.id;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center space-y-2">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2',
                    {
                      'border-primary bg-primary text-primary-foreground': isCompleted,
                      'border-primary bg-background text-primary': isCurrent,
                      'border-muted-foreground/25 bg-background text-muted-foreground': isUpcoming
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <div className="text-center">
                  <p className={cn('text-sm font-medium', {
                    'text-primary': isCurrent || isCompleted,
                    'text-muted-foreground': isUpcoming
                  })}>
                    {step.name}
                  </p>
                  <p className="text-xs text-muted-foreground max-w-24">
                    {step.description}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={cn('flex-1 h-0.5 mx-4', {
                  'bg-primary': currentStep > step.id,
                  'bg-muted-foreground/25': currentStep <= step.id
                })} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step content */}
      <div className="mt-8">
        {renderStepContent()}
      </div>
    </div>
  );
};
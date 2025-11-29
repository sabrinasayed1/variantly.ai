import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VariantData, ComparisonContext, Comparison } from '@/types/comparison';
import { generateAISummary, generateImpactPredictions } from '@/lib/mockAI';
import { saveComparison } from '@/lib/storage';
import UploadStep from './wizard/UploadStep';
import ContextStep from './wizard/ContextStep';
import ResultsStep from './wizard/ResultsStep';

const steps = [
  { id: 1, name: 'Upload Variants', description: 'Upload your design variants' },
  { id: 2, name: 'Add Context', description: 'Provide context for better predictions' },
  { id: 3, name: 'Results', description: 'View AI analysis and projections' },
];

export default function ComparisonWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [comparisonId] = useState(() => `comp-${Date.now()}`);
  
  const [variantA, setVariantA] = useState<VariantData>({ id: 'A' });
  const [variantB, setVariantB] = useState<VariantData>({ id: 'B' });
  const [context, setContext] = useState<ComparisonContext>({
    userSegment: '',
    productStage: '',
    assumptions: '',
    painPoints: '',
    primaryMetric: '',
    userMindset: '',
  });

  const canProceedFromUpload = variantA.imageUrl && variantB.imageUrl;
  const canProceedFromContext = context.primaryMetric && context.productStage;

  const handleNext = () => {
    if (currentStep === 2) {
      // Generate AI results before moving to results step
      const aiSummary = generateAISummary(context);
      const impact = generateImpactPredictions(context);
      
      const comparison: Comparison = {
        id: comparisonId,
        variantA,
        variantB,
        context,
        aiSummary,
        impact,
        createdAt: new Date().toISOString(),
      };
      
      saveComparison(comparison);
    }
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
  };

  const handleBack = () => {
    if (currentStep === 1) {
      navigate('/');
    } else {
      setCurrentStep(prev => Math.max(prev - 1, 1));
    }
  };

  const handleFinish = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground transition-colors mb-4 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold mb-2">New Comparison</h1>
          <p className="text-muted-foreground">Compare two design variants and get AI-powered impact projections</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all
                    ${currentStep > step.id 
                      ? 'bg-primary text-primary-foreground' 
                      : currentStep === step.id 
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' 
                        : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <div className="text-center mt-2">
                    <div className={`text-sm font-medium ${currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.name}
                    </div>
                    <div className="text-xs text-muted-foreground hidden sm:block">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-4 transition-colors ${currentStep > step.id ? 'bg-primary' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {currentStep === 1 && (
            <UploadStep 
              variantA={variantA}
              variantB={variantB}
              onUpdateA={setVariantA}
              onUpdateB={setVariantB}
            />
          )}
          {currentStep === 2 && (
            <ContextStep context={context} onUpdate={setContext} />
          )}
          {currentStep === 3 && (
            <ResultsStep 
              comparisonId={comparisonId}
              variantA={variantA}
              variantB={variantB}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center max-w-3xl mx-auto">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </Button>
          
          {currentStep < 3 ? (
            <Button 
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !canProceedFromUpload) ||
                (currentStep === 2 && !canProceedFromContext)
              }
              className="gap-2"
            >
              {currentStep === 2 ? 'Generate Analysis' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleFinish} className="gap-2">
              <Check className="w-4 h-4" />
              Finish
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

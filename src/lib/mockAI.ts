import { AISummary, ImpactData, ComparisonContext } from '@/types/comparison';

// Mock AI function to analyze image and generate summary
export const analyzeImage = (variantName: string, context?: ComparisonContext): string => {
  const summaries = [
    `This design features a clean, card-based layout with a prominent call-to-action button. The visual hierarchy guides users toward the primary action with ${context?.primaryMetric === 'CTR' ? 'bold, attention-grabbing elements' : 'subtle, trust-building elements'}.`,
    `The interface uses a minimalist approach with ample white space. Key information is displayed using a ${context?.productStage === 'MVP' ? 'straightforward, functional' : 'polished, refined'} design pattern that reduces cognitive load.`,
    `This variant employs a ${context?.userMindset === 'Browsing' ? 'discovery-focused layout with multiple entry points' : 'conversion-optimized design with a clear primary path'}. Color contrast and typography support ${context?.primaryMetric || 'user engagement'}.`,
  ];
  return summaries[Math.floor(Math.random() * summaries.length)];
};

// Mock AI function to compare two screens
export const compareScreens = (context?: ComparisonContext): string[] => {
  const allDifferences = [
    'Variant A uses a centered layout while Variant B employs a left-aligned structure',
    'Button placement differs: Variant A positions CTAs above the fold, Variant B below key content',
    'Color palette: Variant A uses high-contrast elements, Variant B opts for softer, muted tones',
    'Typography hierarchy: Variant A has larger headings (48px vs 36px)',
    'Navigation structure: Variant A shows inline navigation, Variant B uses a hamburger menu',
    'Image sizing: Variant A features full-width images, Variant B uses constrained aspect ratios',
    'Form fields: Variant A has progressive disclosure, Variant B shows all fields upfront',
    'Social proof placement: Variant A integrates testimonials in-line, Variant B uses a dedicated section',
  ];
  
  // Return 3-5 random differences
  const count = Math.floor(Math.random() * 3) + 3;
  return allDifferences.sort(() => 0.5 - Math.random()).slice(0, count);
};

// Mock AI function to generate impact predictions
export const generateImpactPredictions = (context: ComparisonContext): ImpactData => {
  const primaryMetric = context.primaryMetric || 'Conversion Rate';
  const productStage = context.productStage;
  const userSegment = context.userSegment;
  
  // Determine confidence based on context completeness
  const hasFullContext = context.assumptions && context.painPoints && context.userSegment;
  const confidence: 'High' | 'Medium' | 'Low' = hasFullContext ? 'High' : context.assumptions ? 'Medium' : 'Low';
  
  const metricsTable = [
    {
      metric: 'Click-Through Rate (CTR)',
      variantA: primaryMetric === 'CTR' ? '8.2%' : '5.4%',
      variantB: primaryMetric === 'CTR' ? '6.1%' : '7.8%',
      winner: primaryMetric === 'CTR' ? 'A' as const : 'B' as const,
      confidence: confidence,
    },
    {
      metric: 'Conversion Rate',
      variantA: primaryMetric === 'Conversion Rate' ? '12.5%' : '8.3%',
      variantB: primaryMetric === 'Conversion Rate' ? '9.8%' : '14.1%',
      winner: primaryMetric === 'Conversion Rate' ? 'A' as const : 'B' as const,
      confidence: confidence,
    },
    {
      metric: 'Drop-off %',
      variantA: productStage === 'MVP' ? '32%' : '18%',
      variantB: productStage === 'MVP' ? '28%' : '22%',
      winner: productStage === 'MVP' ? 'B' as const : 'A' as const,
      confidence: confidence,
    },
    {
      metric: 'Task Completion',
      variantA: '74%',
      variantB: '82%',
      winner: 'B' as const,
      confidence: confidence,
    },
    {
      metric: 'Avg. Time-to-Action',
      variantA: '24s',
      variantB: '18s',
      winner: 'B' as const,
      confidence: confidence,
    },
  ];

  const rationale = `Based on the provided context${userSegment ? ` targeting ${userSegment}` : ''}, Variant B shows stronger projected performance overall. 

**Key Factors:**
- The ${productStage === 'MVP' ? 'simplified, MVP-focused' : 'established product'} design patterns align better with user expectations
- Visual hierarchy in Variant B reduces cognitive friction, leading to faster decision-making
- ${context.painPoints ? `Addressing known pain points (${context.painPoints.split(',')[0]}) through improved UX flows` : 'Layout improvements support better user navigation'}
- ${primaryMetric} optimization appears more effective in Variant B's implementation

**Confidence Level: ${confidence}**
${hasFullContext 
  ? 'High confidence due to comprehensive context including user assumptions and pain points.' 
  : 'Medium confidence. Additional context about user behavior patterns and specific pain points would improve prediction accuracy.'}

**Note:** These projections are directional insights based on UX heuristics and design patterns. Actual results may vary based on your specific user base and market conditions. Consider validating with qualitative user testing.`;

  return {
    metricsTable,
    rationale,
    confidence,
  };
};

// Mock AI function to summarize context
export const summarizeContext = (context: ComparisonContext): string => {
  return `Analyzing for ${context.userSegment || 'general users'} at ${context.productStage || 'current'} stage, 
  optimizing for ${context.primaryMetric || 'overall performance'}. 
  ${context.assumptions ? `Key assumptions: ${context.assumptions}.` : ''} 
  ${context.painPoints ? `Addressing pain points: ${context.painPoints}.` : ''}`;
};

// Generate full AI summary
export const generateAISummary = (context?: ComparisonContext): AISummary => {
  return {
    summaryA: analyzeImage('A', context),
    summaryB: analyzeImage('B', context),
    differences: compareScreens(context),
  };
};

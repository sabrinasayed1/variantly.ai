import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VisionFeatures {
  components: string[];
  hierarchy: string[];
  ctaCount: number;
  textBlocks: number;
  tapTargets: number;
  flowSteps: number;
  dominantColors: string[];
  clutterScore: number;
  readabilityScore: number;
  primaryCTAAboveFold: boolean;
  visualHierarchyStrong: boolean;
}

interface HeuristicScores {
  predictedCTR: number;
  predictedConversion: number;
  predictedDropoff: number;
  predictedTimeToAct: number;
  predictedTaskCompletion: number;
  usabilityRisks: string[];
}

// Heuristic scoring rules
function applyHeuristics(features: VisionFeatures): HeuristicScores {
  let ctr = 50;
  let conversion = 50;
  let dropoff = 20;
  let timeToAct = 20;
  let taskCompletion = 75;
  const risks: string[] = [];

  // Flow steps rule
  if (features.flowSteps > 3) {
    dropoff += 12;
    risks.push(`High flow complexity (${features.flowSteps} steps) may increase drop-off`);
  }

  // Clutter score rule
  if (features.clutterScore > 0.6) {
    taskCompletion -= 10;
    risks.push(`Visual clutter (score: ${(features.clutterScore * 100).toFixed(0)}%) may hinder task completion`);
  }

  // Readability rule
  if (features.readabilityScore < 0.5) {
    conversion -= 7;
    risks.push(`Low readability (score: ${(features.readabilityScore * 100).toFixed(0)}%) may reduce clarity`);
  }

  // Multiple CTAs rule
  if (features.ctaCount > 1) {
    ctr -= 5;
    risks.push(`Multiple CTAs (${features.ctaCount}) may dilute focus`);
  }

  // Primary CTA above fold rule
  if (features.primaryCTAAboveFold) {
    ctr += 8;
  } else {
    risks.push('Primary CTA is not prominently positioned above the fold');
  }

  // Strong visual hierarchy rule
  if (features.visualHierarchyStrong) {
    conversion += 10;
  } else {
    risks.push('Visual hierarchy could be strengthened for better comprehension');
  }

  // Text blocks rule
  if (features.textBlocks > 6) {
    conversion -= 5;
    risks.push(`High text density (${features.textBlocks} blocks) may reduce engagement`);
  }

  return {
    predictedCTR: Math.max(0, Math.min(100, ctr)),
    predictedConversion: Math.max(0, Math.min(100, conversion)),
    predictedDropoff: Math.max(0, Math.min(100, dropoff)),
    predictedTimeToAct: Math.max(5, Math.min(60, timeToAct)),
    predictedTaskCompletion: Math.max(0, Math.min(100, taskCompletion)),
    usabilityRisks: risks,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageA, imageB, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Starting vision analysis for both variants...');

    // Step 1: Vision Analysis for both variants using Gemini Flash
    const visionPrompt = `Analyze this UI design screenshot and extract the following information in JSON format:
{
  "components": ["list of UI components like buttons, inputs, nav bars, cards, etc."],
  "hierarchy": ["describe the visual hierarchy from most to least prominent elements"],
  "ctaCount": <number of call-to-action buttons/links>,
  "textBlocks": <number of distinct text content blocks>,
  "tapTargets": <number of interactive elements>,
  "flowSteps": <estimated number of steps in the user flow>,
  "dominantColors": ["list of main colors used"],
  "clutterScore": <0-1 score where 0 is minimal and 1 is very cluttered>,
  "readabilityScore": <0-1 score where 0 is hard to read and 1 is very readable>,
  "primaryCTAAboveFold": <true/false if main action is prominently visible>,
  "visualHierarchyStrong": <true/false if there's clear visual hierarchy>
}

Be precise and analytical. Focus on UX patterns and usability aspects.`;

    // Analyze both variants in parallel
    const [featuresA, featuresB] = await Promise.all([
      analyzeImage(imageA, visionPrompt, LOVABLE_API_KEY),
      analyzeImage(imageB, visionPrompt, LOVABLE_API_KEY),
    ]);

    console.log('Vision analysis complete. Applying heuristics...');

    // Step 2: Apply heuristic scoring
    const scoresA = applyHeuristics(featuresA);
    const scoresB = applyHeuristics(featuresB);

    console.log('Heuristics applied. Starting reasoning analysis...');

    // Step 3: Reasoning Layer - Compare and generate insights
    const reasoningPrompt = `You are a UX expert analyzing two design variants. Based on the extracted features and heuristic scores below, provide a detailed comparison and recommendation.

**Variant A Features:**
${JSON.stringify(featuresA, null, 2)}

**Variant A Heuristic Scores:**
- Predicted CTR: ${scoresA.predictedCTR}%
- Predicted Conversion: ${scoresA.predictedConversion}%
- Predicted Drop-off: ${scoresA.predictedDropoff}%
- Predicted Time-to-Act: ${scoresA.predictedTimeToAct}s
- Predicted Task Completion: ${scoresA.predictedTaskCompletion}%
- Usability Risks: ${scoresA.usabilityRisks.join('; ')}

**Variant B Features:**
${JSON.stringify(featuresB, null, 2)}

**Variant B Heuristic Scores:**
- Predicted CTR: ${scoresB.predictedCTR}%
- Predicted Conversion: ${scoresB.predictedConversion}%
- Predicted Drop-off: ${scoresB.predictedDropoff}%
- Predicted Time-to-Act: ${scoresB.predictedTimeToAct}s
- Predicted Task Completion: ${scoresB.predictedTaskCompletion}%
- Usability Risks: ${scoresB.usabilityRisks.join('; ')}

**User Context:**
- Target Users: ${context?.userSegment || 'General users'}
- Product Stage: ${context?.productStage || 'Not specified'}
- User Mindset: ${context?.userMindset || 'Not specified'}
- Primary Metric: ${context?.primaryMetric || 'Conversion Rate'}
- Assumptions: ${context?.assumptions || 'None provided'}
- Pain Points: ${context?.painPoints || 'None provided'}

Provide your analysis in this JSON format:
{
  "summaryA": "Brief description of Variant A's design approach and strengths (2-3 sentences)",
  "summaryB": "Brief description of Variant B's design approach and strengths (2-3 sentences)",
  "differences": ["List of 4-6 key differences between the variants"],
  "projectedMetrics": {
    "ctrA": "<percentage>",
    "ctrB": "<percentage>",
    "conversionA": "<percentage>",
    "conversionB": "<percentage>",
    "dropoffA": "<percentage>",
    "dropoffB": "<percentage>",
    "completionA": "<percentage>",
    "completionB": "<percentage>",
    "timeToActA": "<seconds>",
    "timeToActB": "<seconds>",
    "confidence": "High/Medium/Low"
  },
  "rationale": "Detailed explanation of why one variant performs better (3-4 paragraphs with clear reasoning)",
  "risks": ["List of 3-5 UX risks to consider"],
  "recommendation": "A wins/B wins/Tie - with brief justification"
}`;

    const reasoningResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a UX expert providing analytical comparisons of design variants. Always respond with valid JSON only.' },
          { role: 'user', content: reasoningPrompt }
        ],
      }),
    });

    if (!reasoningResponse.ok) {
      const errorText = await reasoningResponse.text();
      console.error('Reasoning API error:', reasoningResponse.status, errorText);
      throw new Error(`Reasoning analysis failed: ${reasoningResponse.status}`);
    }

    const reasoningData = await reasoningResponse.json();
    const reasoningContent = reasoningData.choices?.[0]?.message?.content;
    
    console.log('Reasoning response received:', reasoningContent?.substring(0, 200));

    // Parse the reasoning response
    let analysis;
    try {
      const jsonMatch = reasoningContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse reasoning response:', parseError);
      // Provide fallback with heuristic data
      analysis = generateFallbackAnalysis(featuresA, featuresB, scoresA, scoresB, context);
    }

    // Combine all results
    const result = {
      featuresA,
      featuresB,
      scoresA,
      scoresB,
      analysis,
      disclaimer: "This projection combines visual analysis + heuristics + LLM reasoning. Metrics are directional, not absolute.",
    };

    console.log('Analysis complete successfully');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-variants:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Failed to analyze variants'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeImage(imageData: string, prompt: string, apiKey: string): Promise<VisionFeatures> {
  const isUrl = imageData.startsWith('http');
  
  const content = [
    { type: 'text', text: prompt },
    {
      type: 'image_url',
      image_url: {
        url: isUrl ? imageData : imageData
      }
    }
  ];

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'user', content }
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Vision API error:', response.status, errorText);
    throw new Error(`Vision analysis failed: ${response.status}`);
  }

  const data = await response.json();
  const textContent = data.choices?.[0]?.message?.content;
  
  console.log('Vision response:', textContent?.substring(0, 300));

  // Parse JSON from response
  try {
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse vision response:', e);
  }

  // Return default features if parsing fails
  return {
    components: ['Unable to extract'],
    hierarchy: ['Unable to analyze'],
    ctaCount: 1,
    textBlocks: 3,
    tapTargets: 5,
    flowSteps: 2,
    dominantColors: ['unknown'],
    clutterScore: 0.5,
    readabilityScore: 0.7,
    primaryCTAAboveFold: true,
    visualHierarchyStrong: true,
  };
}

function generateFallbackAnalysis(featuresA: VisionFeatures, featuresB: VisionFeatures, scoresA: HeuristicScores, scoresB: HeuristicScores, context: any) {
  const winner = scoresB.predictedConversion > scoresA.predictedConversion ? 'B' : 'A';
  
  return {
    summaryA: `Variant A features ${featuresA.components.slice(0, 3).join(', ')} with ${featuresA.ctaCount} CTAs and a clutter score of ${(featuresA.clutterScore * 100).toFixed(0)}%.`,
    summaryB: `Variant B features ${featuresB.components.slice(0, 3).join(', ')} with ${featuresB.ctaCount} CTAs and a clutter score of ${(featuresB.clutterScore * 100).toFixed(0)}%.`,
    differences: [
      `CTA count: A has ${featuresA.ctaCount}, B has ${featuresB.ctaCount}`,
      `Flow steps: A has ${featuresA.flowSteps}, B has ${featuresB.flowSteps}`,
      `Clutter: A scores ${(featuresA.clutterScore * 100).toFixed(0)}%, B scores ${(featuresB.clutterScore * 100).toFixed(0)}%`,
      `Readability: A scores ${(featuresA.readabilityScore * 100).toFixed(0)}%, B scores ${(featuresB.readabilityScore * 100).toFixed(0)}%`,
    ],
    projectedMetrics: {
      ctrA: `${scoresA.predictedCTR.toFixed(1)}%`,
      ctrB: `${scoresB.predictedCTR.toFixed(1)}%`,
      conversionA: `${scoresA.predictedConversion.toFixed(1)}%`,
      conversionB: `${scoresB.predictedConversion.toFixed(1)}%`,
      dropoffA: `${scoresA.predictedDropoff.toFixed(1)}%`,
      dropoffB: `${scoresB.predictedDropoff.toFixed(1)}%`,
      completionA: `${scoresA.predictedTaskCompletion.toFixed(1)}%`,
      completionB: `${scoresB.predictedTaskCompletion.toFixed(1)}%`,
      timeToActA: `${scoresA.predictedTimeToAct}s`,
      timeToActB: `${scoresB.predictedTimeToAct}s`,
      confidence: 'Medium',
    },
    rationale: `Based on heuristic analysis, Variant ${winner} shows stronger projected performance. The analysis considers flow complexity, visual clutter, readability, and CTA placement.`,
    risks: [...scoresA.usabilityRisks.slice(0, 2), ...scoresB.usabilityRisks.slice(0, 2)],
    recommendation: `${winner} wins - based on heuristic scoring`,
  };
}

// Gemini AI integration for Tier 2 LLM cross-reference analysis
import { getGeminiKey } from '@/lib/keys';

export function hasGeminiKey(): boolean {
  return getGeminiKey().length > 0;
}

interface GeminiAnalysisResult {
  analysis: string;
  confidence: number;
  contradictions: string[];
}

// Rate limiter for Gemini calls
const geminiRateState = { calls: 0, windowStart: 0 };

function checkGeminiRateLimit(): boolean {
  const now = Date.now();
  if (now - geminiRateState.windowStart > 60_000) {
    geminiRateState.calls = 0;
    geminiRateState.windowStart = now;
  }
  if (geminiRateState.calls >= 8) return false;
  geminiRateState.calls++;
  return true;
}

export async function runGeminiAnalysis(
  taskType: 'classifier' | 'greenwash' | 'evidence' | 'sentiment',
  tier1Data: {
    supplierName: string;
    claims: string[];
    violations: string[];
    discrepancies: { claim: string; finding: string }[];
  },
): Promise<GeminiAnalysisResult> {
  const apiKey = getGeminiKey();
  if (!apiKey) {
    return { analysis: '', confidence: 0, contradictions: [] };
  }

  if (!checkGeminiRateLimit()) {
    return { analysis: 'Rate limit exceeded', confidence: 0, contradictions: [] };
  }

  const prompts: Record<string, string> = {
    classifier: `You are a violation classifier for EU CSRD compliance. Analyze the following supplier data and classify violation severity.

Supplier: ${tier1Data.supplierName}
Claims: ${tier1Data.claims.join('; ')}
Violations found: ${tier1Data.violations.join('; ')}
Discrepancies: ${tier1Data.discrepancies.map(d => `Claim: "${d.claim}" vs Finding: "${d.finding}"`).join('; ')}

Classify each violation as: critical, high, medium, or low severity. Provide a brief explanation for each classification. Be concise.`,

    greenwash: `You are a greenwashing detection expert for EU CSRD compliance. Cross-reference the supplier's public claims against the evidence found.

Supplier: ${tier1Data.supplierName}
Public Claims: ${tier1Data.claims.join('; ')}
Evidence Found: ${tier1Data.violations.join('; ')}
Discrepancies: ${tier1Data.discrepancies.map(d => `"${d.claim}" contradicted by: "${d.finding}"`).join('; ')}

Identify any greenwashing patterns. For each, explain why the claim is misleading. Be concise and specific.`,

    evidence: `You are an evidence chain verifier for EU CSRD compliance auditing. Rank and verify the evidence strength.

Supplier: ${tier1Data.supplierName}
Claims: ${tier1Data.claims.join('; ')}
Violations: ${tier1Data.violations.join('; ')}
Evidence pairs: ${tier1Data.discrepancies.map(d => `Claim: "${d.claim}" → Evidence: "${d.finding}"`).join('; ')}

Rate each evidence chain's reliability (strong, moderate, weak). Identify any gaps. Be concise.`,

    sentiment: `You are a public sentiment analyst. Assess the public perception risk for this supplier based on the findings.

Supplier: ${tier1Data.supplierName}
Issues found: ${tier1Data.violations.join('; ')}
Discrepancies: ${tier1Data.discrepancies.map(d => `"${d.claim}" vs "${d.finding}"`).join('; ')}

Assess overall sentiment risk: positive, neutral, negative, or highly negative. Explain briefly.`,
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompts[taskType] }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500,
          },
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Gemini API error: ${response.status}`, errText);
      return { analysis: `Gemini API error: ${response.status}`, confidence: 0, contradictions: [] };
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract contradictions mentioned in the analysis
    const contradictions: string[] = [];
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.toLowerCase().includes('contradict') || line.toLowerCase().includes('mismatch') || line.toLowerCase().includes('greenwash')) {
        contradictions.push(line.trim());
      }
    }

    return {
      analysis: text,
      confidence: contradictions.length > 0 ? 0.88 : 0.75,
      contradictions,
    };
  } catch (err) {
    console.error('Gemini analysis failed:', err);
    return { analysis: 'Analysis failed', confidence: 0, contradictions: [] };
  }
}

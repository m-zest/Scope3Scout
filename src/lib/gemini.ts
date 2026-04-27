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

// Gemini-powered executive report generation
export async function generateGeminiReport(
  supplierName: string,
  findings: { claim: string; evidence: string; confidence: number }[],
  violations: { type: string; description: string; severity: string; fine_amount_eur?: number }[],
  riskScore: number,
  riskLevel: string,
  exposure: number,
): Promise<string> {
  const apiKey = getGeminiKey();

  const findingsText = findings.map((f, i) => `${i + 1}. Claim: "${f.claim}" → Evidence: "${f.evidence}" (${Math.round(f.confidence * 100)}% confidence)`).join('\n');
  const violationsText = violations.map((v, i) => `${i + 1}. [${v.severity.toUpperCase()}] ${v.type}: ${v.description}${v.fine_amount_eur ? ` (Fine: EUR ${v.fine_amount_eur.toLocaleString()})` : ''}`).join('\n');

  const prompt = `You are a senior ESG compliance analyst. Write a concise executive summary report for the following supplier audit.

SUPPLIER: ${supplierName}
RISK SCORE: ${riskScore}/100 (${riskLevel.toUpperCase()})
FINANCIAL EXPOSURE: EUR ${exposure.toLocaleString()}

FINDINGS (claim vs evidence):
${findingsText}

VIOLATIONS:
${violationsText}

Write an executive summary with these sections (use markdown headers):
## Executive Summary
(2-3 sentences summarizing the overall risk)

## Key Findings
(bullet points of the most critical issues)

## Recommended Actions
(numbered list of specific actions with timelines)

## Regulatory Risk
(1-2 sentences about CSRD/CSDDD compliance implications)

Be direct, specific, and professional. No filler. Max 300 words.`;

  if (!apiKey) return '';

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 800 },
        }),
      },
    );
    if (!response.ok) return '';
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch {
    return '';
  }
}

// Gemini-powered compliance action draft
export async function generateComplianceAction(
  supplierName: string,
  findings: { claim: string; evidence: string }[],
  riskLevel: string,
): Promise<string> {
  const apiKey = getGeminiKey();

  const prompt = `You are a compliance officer. Draft a brief supplier notification letter for ${supplierName}.

Issue: ${findings.map(f => `"${f.claim}" contradicted by "${f.evidence}"`).join('; ')}
Risk Level: ${riskLevel.toUpperCase()}

Write a professional 3-4 sentence notification requesting:
1. Immediate clarification on the discrepancy
2. Updated certification documentation within 14 days
3. Note that failure to respond may result in contract review

Tone: firm but professional. No greeting or sign-off needed. Max 100 words.`;

  if (!apiKey) return '';

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 300 },
        }),
      },
    );
    if (!response.ok) return '';
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch {
    return '';
  }
}

// Strict structured contradiction analysis for LIVE AUDIT mode.
// Compares a supplier's own ESG claim against scraped evidence and returns
// a strict JSON shape. NO fallbacks, NO defaults — throws on missing key,
// network/HTTP error, missing Gemini text, or invalid JSON. Confidence is
// passed through verbatim from the model.
export interface StructuredContradiction {
  contradictionFound: boolean;
  claim: string;
  evidence: string;
  sourceUrl: string;
  confidence: number;
  reasoning: string;
}

export async function analyzeForContradictionStructured(
  claim: string,
  evidence: string,
  sourceUrl: string,
): Promise<StructuredContradiction> {
  const apiKey = getGeminiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is required for structured contradiction analysis');
  }

  const prompt = `You are an EU CSRD compliance auditor. Compare a supplier's own published ESG claim against scraped public evidence (news, regulatory filings, progress reports). Decide whether the evidence directly contradicts the claim. A contradiction requires a concrete factual mismatch (missed target, expired certification, documented violation, admitted shortfall) — not just sentiment or speculation.

CLAIM (from supplier's own materials):
"""
${claim}
"""

EVIDENCE (from independent or self-reported public sources):
"""
${evidence}
"""

EVIDENCE SOURCE URL: ${sourceUrl}

Respond with ONLY a JSON object matching this exact schema, no prose, no markdown:
{
  "contradictionFound": boolean,
  "claim": string,         // the claim verbatim or the most concise faithful summary
  "evidence": string,      // the specific contradicting fact in one sentence
  "sourceUrl": string,     // the evidence source URL provided above, unchanged
  "confidence": number,    // 0.0 to 1.0, your honest calibration
  "reasoning": string      // one or two sentences explaining the verdict
}

If there is no genuine contradiction, set contradictionFound to false and explain why in reasoning.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 600,
          responseMimeType: 'application/json',
        },
      }),
    },
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!text) {
    throw new Error('Gemini returned an empty response');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`Gemini returned non-JSON output: ${text.slice(0, 200)}`);
  }

  const obj = parsed as Record<string, unknown>;
  if (
    typeof obj.contradictionFound !== 'boolean' ||
    typeof obj.claim !== 'string' ||
    typeof obj.evidence !== 'string' ||
    typeof obj.sourceUrl !== 'string' ||
    typeof obj.confidence !== 'number' ||
    typeof obj.reasoning !== 'string'
  ) {
    throw new Error(`Gemini response did not match required schema: ${text.slice(0, 200)}`);
  }

  return {
    contradictionFound: obj.contradictionFound,
    claim: obj.claim,
    evidence: obj.evidence,
    sourceUrl: obj.sourceUrl,
    confidence: obj.confidence,
    reasoning: obj.reasoning,
  };
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

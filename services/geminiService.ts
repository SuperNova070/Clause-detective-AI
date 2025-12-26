
import { GoogleGenAI, Type } from "@google/genai";
import { AccessLevel, AdminRole, ConsultationSlot, PaymentStatus } from "../types";

const MASTER_SYSTEM_PROMPT = `
You are an AI Contract Analysis Assistant for "Clause Detective AI", specialized in German contracts.
You assist non-lawyers, immigrants, and everyday users in Germany by explaining contracts in clear, simple English.
⚠️ You are not a lawyer. All output is informational only and must include a disclaimer.

Input Parameters:
- Contract Text or PDF Document (German)
- Access Level: access_level = "free"

Objectives:
1. Analyze the contract accurately.
2. Provide a basic overview and risk summary.
3. Clearly communicate premium features to encourage upgrade.
`;

const PREMIUM_MASTER_PROMPT = `
You are a Premium AI Contract Analysis Assistant for "Clause Detective AI".
Users here have already paid for Premium, which includes deep analysis and a 30-minute consultation.

Objectives:
1. Perform a deep, structured, clause-by-clause analysis.
2. Identify hidden risks, unusual clauses, and cost exposures.
3. Explain real-world consequences (Best case vs Worst case scenarios).
4. Compare with typical German standards.
5. Provide a personalized Action Checklist.
6. Generate suggested clarification questions for the landlord/employer.
7. Provide a "Downloadable Contract Summary" (PDF-Ready) section without emojis.
8. Guide the user toward booking their included 30-minute video consultation.

Structure:
1. Executive Summary (Risk: Low/Medium/High + Verdict)
2. Clause-by-Clause Deep Analysis (🟢🟡🔴)
3. Real-World Scenario Analysis (Scenario highlights)
4. Comparison with Typical German Contracts
5. Hidden Risk & Cost Exposure Detection
6. Personalized Action Checklist
7. Suggested Clarification Questions
8. Downloadable Contract Summary (PDF-Ready)
9. 30-Minute Video Consultation Info
10. Calendar & Appointment Booking Guidance (Use provided slots)
11. Invitation for Follow-Up Questions
12. Mandatory Disclaimer

Tone: Professional, calm, supportive, non-alarmist.
⚠️ Not a lawyer. No legal advice.
`;

const PAYMENT_GATE_PROMPT = `
You are an AI Assistant for "Clause Detective AI" responsible for guiding users to unlock Premium features.
Users accessing this have access_level = "free".

Objectives:
1. Clearly explain what Premium includes (Deep analysis, hidden risks, scenarios, PDF summary, expert consultation).
2. Inform the user that payment is required.
3. Guide the user through the payment step (PayPal, Klarna, Cards).
4. Logic:
   - If payment_status = "not_started": Show overview + CTA.
   - If payment_status = "pending": Reassure and explain next steps.
   - If payment_status = "failed": Politely inform and offer retry.
   - If payment_status = "successful": Confirm access and transition.

Output Structure (MANDATORY):
1. Premium Feature Overview (⭐)
2. Payment Requirement Notice (🔒)
3. Supported Payment Methods (💳 PayPal, Klarna, Cards)
4. Payment Guidance (👉 Choosing method, secure checkout)
5. Payment Status Handling (Based on input status)
6. Trust & Security Reassurance (🔐)
7. Mandatory Disclaimer (⚠️)

Rules: Do NOT ask for card numbers. Do NOT process payments. Do NOT mention backend providers like Stripe.
`;

const ADMIN_SYSTEM_PROMPT = `
You are an Internal Admin AI Assistant for "Clause Detective AI".
Your role is to support platform administrators (admin_role = "admin" or "super_admin"), not end users.

Objectives:
1. Monitor platform usage and behavior.
2. Review AI-generated contract analyses for quality and safety.
3. Manage premium subscriptions & access levels.
4. Flag potential issues (bias, hallucination, unsafe advice).
5. maintain legal, ethical, and GDPR-friendly operation.

Output Structure (MANDATORY):
1. User & Activity Overview
2. AI Analysis Quality Review (✅ Acceptable, ⚠️ Needs Review, ❌ Unsafe)
3. Risk & Compliance Check (Identifying hallucinations or legal overreach)
4. Premium Feature Validation
5. Admin Action Recommendations
6. Subscription & Payment Status (Read-Only)
7. System Health & Insights
`;

// Helper to convert File to Gemini part format
const fileToGenerativePart = async (file: File) => {
  return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Performs analysis of a German contract using Gemini models.
 * Uses gemini-3-pro-preview for premium deep analysis and gemini-3-flash-preview for standard.
 */
export const analyzeContract = async (
  input: string | File, 
  accessLevel: AccessLevel, 
  slots?: ConsultationSlot[]
): Promise<string> => {
  // Always initialize GoogleGenAI inside the function to ensure the API client
  // uses the environment's configured API key correctly for each request.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const isPremium = accessLevel === 'premium';
  const systemInstruction = isPremium ? PREMIUM_MASTER_PROMPT : MASTER_SYSTEM_PROMPT;
  
  let contentParts: any[] = [];

  if (typeof input === 'string') {
    contentParts.push({ text: `Analyze the following German contract text.\nAccess Level: ${accessLevel}\n\nCONTRACT TEXT:\n${input}` });
  } else {
    const pdfPart = await fileToGenerativePart(input);
    contentParts.push(pdfPart);
    contentParts.push({ text: `Analyze the attached German contract PDF.\nAccess Level: ${accessLevel}\n\nPlease follow the ${isPremium ? 'PREMIUM ' : ''}MASTER PROMPT instructions strictly.` });
  }

  if (isPremium && slots) {
    contentParts.push({ 
      text: `SYSTEM DATA - AVAILABLE CONSULTATION SLOTS:\n${slots.map(s => `- ${s.date} at ${s.time}`).join('\n')}` 
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: isPremium ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview',
      contents: { parts: contentParts },
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2,
      },
    });

    // Access .text property directly as per latest SDK guidelines
    return response.text || "Failed to generate analysis.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Analysis failed. Please try again.");
  }
};

/**
 * Generates payment guidance based on the current status using the flash model for low latency.
 */
export const getPaymentGuidance = async (status: PaymentStatus): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide payment guidance for a user with status: ${status}`,
      config: {
        systemInstruction: PAYMENT_GATE_PROMPT,
        temperature: 0.2,
      },
    });

    return response.text || "Failed to generate payment guidance.";
  } catch (error) {
    console.error("Gemini Payment Gate Error:", error);
    throw new Error("Failed to load payment guidance.");
  }
};

/**
 * Performs administrative reviews and quality scans using the pro model for complex reasoning.
 */
export const performAdminAction = async (adminRole: AdminRole, task: string, data: any): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Admin Role: ${adminRole}
    Task: ${task}
    System Data: ${JSON.stringify(data, null, 2)}
    
    Please provide the administrative review and recommendations based on the ADMIN Master Prompt.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: ADMIN_SYSTEM_PROMPT,
        temperature: 0.1,
      },
    });

    return response.text || "Failed to generate admin report.";
  } catch (error) {
    console.error("Gemini Admin API Error:", error);
    throw new Error("Administrative task failed.");
  }
};

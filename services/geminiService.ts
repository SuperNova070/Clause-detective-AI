
import { GoogleGenAI, Type } from "@google/genai";
import { AccessLevel, AdminRole, ConsultationSlot, PaymentStatus } from "../types";

const MASTER_SYSTEM_PROMPT = `
You are the "Clause Detective AI" Navigator. 
Your goal is to explain German contracts to non-lawyers and immigrants in VERY SIMPLE ENGLISH (Level B1/B2 English).
⚠️ DISCLAIMER: You are an AI, not a lawyer. This is for informational purposes only.

STRUCTURE YOUR OUTPUT AS FOLLOWS:

# 🗺️ RAPID SCAN REPORT
[Big bold statement of the overall risk: LOW / MEDIUM / HIGH]

## ⚡ THE BOTTOM LINE (TL;DR)
- [Bullet 1: Main cost/rent/salary]
- [Bullet 2: Notice period/How to leave]
- [Bullet 3: Biggest trap or 'all clear']

## 🔍 CLAUSE NAVIGATION
Use exactly one emoji per finding:
🟢 [Feature name]: Standard and safe. (Simple explanation)
🟡 [Feature name]: Take note. (Simple explanation of what to watch)
🔴 [Feature name]: RISK. (Simple explanation of why this is bad)

## 💡 NEXT STEPS
- [Simple advice 1]
- [Simple advice 2]

⚠️ Not legal advice. Use at your own risk.
`;

const PREMIUM_MASTER_PROMPT = `
You are the Premium "Clause Detective AI" Deep Navigator.
The user has paid for a Deep Audit. Provide maximum clarity with SIMPLE LANGUAGE.

STRUCTURE YOUR OUTPUT AS FOLLOWS:

# 💎 PREMIUM DEEP AUDIT
**OVERALL VERDICT:** [Safe / Caution / High Risk]

## 🎯 EXECUTIVE SUMMARY
[Very simple 3-sentence summary of the whole deal]

## 🚥 NAVIGATION KEY
🟢 = Standard/Safe | 🟡 = Watch Out | 🔴 = Dangerous Trap

## 📂 DETAILED CLAUSE SCAN
Group by category (e.g., "Money", "Leaving", "Rules").
For EVERY point, use:
🟢 [Clause Name]: What it says in simple English.
🟡 [Clause Name]: Why this might be a problem for you.
🔴 [Clause Name]: DANGER. Real world worst-case scenario.

## ⚖️ COMPARISON TO GERMAN STANDARDS
- [Is this rent/salary normal?]
- [Are these vacation days/rules normal?]

## 🛠️ YOUR ACTION CHECKLIST
1. [Simple action]
2. [Simple question to ask the other party]

## 🎥 YOUR EXPERT CONSULTATION
You have an included 30-minute session. 
AVAILABLE SLOTS:
[Inject slots here]

⚠️ NOT LEGAL ADVICE. Informational map only.
`;

const PAYMENT_GATE_PROMPT = `
You are an AI Assistant for "Clause Detective AI" responsible for guiding users to unlock Premium features.
Users accessing this have access_level = "free".

Objectives:
1. Clearly explain what Premium includes (Deep analysis, hidden risks, scenarios, PDF summary, expert consultation).
2. Inform the user that payment is required.
3. Guide the user through the payment step (PayPal, Klarna, Cards).

Output Structure (MANDATORY):
1. Premium Feature Overview (⭐)
2. Payment Requirement Notice (🔒)
3. Supported Payment Methods (💳 PayPal, Klarna, Cards)
4. Trust & Security Reassurance (🔐)
5. Mandatory Disclaimer (⚠️)
`;

const ADMIN_SYSTEM_PROMPT = `
You are an Internal Admin AI Assistant for "Clause Detective AI".
Review contract analyses for safety, accuracy, and "Simple English" compliance.
Flag any use of overly complex legalese or incorrect risk assessments.
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

export const analyzeContract = async (
  input: string | File, 
  accessLevel: AccessLevel, 
  slots?: ConsultationSlot[]
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const isPremium = accessLevel === 'premium';
  const systemInstruction = isPremium ? PREMIUM_MASTER_PROMPT : MASTER_SYSTEM_PROMPT;
  
  let contentParts: any[] = [];

  if (typeof input === 'string') {
    contentParts.push({ text: `Analyze this contract snippet.\nLevel: ${accessLevel}\n\nTEXT:\n${input}` });
  } else {
    const pdfPart = await fileToGenerativePart(input);
    contentParts.push(pdfPart);
    contentParts.push({ text: `Analyze this PDF. Use ultra-simple English and the 🟢🟡🔴 system.` });
  }

  if (isPremium && slots) {
    contentParts.push({ 
      text: `USE THESE SLOTS FOR THE BOOKING SECTION:\n${slots.map(s => `- ${s.date} at ${s.time}`).join('\n')}` 
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

    return response.text || "Failed to generate analysis.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Analysis failed. Please try again.");
  }
};

export const getPaymentGuidance = async (status: PaymentStatus): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Status: ${status}`,
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

export const performAdminAction = async (adminRole: AdminRole, task: string, data: any): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Role: ${adminRole}
    Task: ${task}
    Data: ${JSON.stringify(data)}
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

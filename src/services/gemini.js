import { GoogleGenAI } from '@google/genai';
import { 
  HEALTH_SCAN_PROMPT, 
  AI_ASSISTANT_PROMPT, 
  MARKETING_PROMPT 
} from '../constants/prompts';

// Helper to retrieve API key lazily and throw a user-friendly error if missing
const getApiKey = () => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    throw new Error("VITE_GEMINI_API_KEY is missing. Please configure VITE_GEMINI_API_KEY inside your .env file to run AI features.");
  }
  return key;
};

// Lazily load client instance
let aiInstance = null;
const getAIClient = () => {
  if (!aiInstance) {
    const apiKey = getApiKey();
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

// Helper to sanitize JSON response from Gemini
const cleanJSONResponse = (text) => {
  if (!text) return "";
  let cleaned = text.trim();
  // Remove markdown code blocks if present
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
};

// 1. AI Health Scan
export async function runGeminiHealthScan(businessContext) {
  try {
    const ai = getAIClient();
    
    const formattedPrompt = `${HEALTH_SCAN_PROMPT}

=========================
LIVE BUSINESS DATA
=========================

${JSON.stringify(businessContext, null, 2)}

=========================
IMPORTANT
=========================

This JSON is the COMPLETE business database.

Use ONLY this data.

Never invent products.

Never invent vendors.

Never invent campaigns.

Never invent procurement history.

Never invent delivery history.

If information is unavailable, explicitly respond:
"Not enough data available."
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedPrompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || "";
    const cleanJSON = cleanJSONResponse(text);
    const result = JSON.parse(cleanJSON);

    // ==========================================
    // VALIDATION BEFORE RETURNING RESPONSE
    // ==========================================
    const validInventoryNames = (businessContext.inventory || []).map(i => (i.name || '').trim().toLowerCase());
    const validVendorNames = (businessContext.vendors || []).map(v => (v.name || '').trim().toLowerCase());

    const isHallucinated = (text) => {
      if (!text) return false;
      const lowerText = text.toLowerCase();

      // Check generic fictional retail products or suppliers
      const genericFictionalWords = ['cotton t-shirt', 'leather wallet', 'eco bottle', 'apex supplier', 'coffee mug', 'apex', 'wallets', 't-shirts', 'bottles'];
      if (genericFictionalWords.some(word => lowerText.includes(word))) {
        return true;
      }
      return false;
    };

    const cleanList = (arr) => {
      if (!Array.isArray(arr)) return [];
      return arr.filter(item => {
        const fullContent = `${item.title || ''} ${item.description || ''} ${item.suggestedAction || ''} ${item.recommendation || ''} ${item.businessImpact || ''} ${item.expectedResult || ''}`.toLowerCase();
        if (isHallucinated(fullContent)) {
          return false;
        }
        return true;
      });
    };

    result.criticalActions = cleanList(result.criticalActions);
    result.growthOpportunities = cleanList(result.growthOpportunities);
    result.costOptimization = cleanList(result.costOptimization);
    result.businessInsights = cleanList(result.businessInsights);
    result.marketingSuggestions = cleanList(result.marketingSuggestions);

    return result;
  } catch (error) {
    console.error("Gemini Health Scan Error:", error);
    throw error;
  }
}

// 2. Floating AI Assistant Chat
export async function askGeminiAssistant(businessData, question) {
  try {
    const ai = getAIClient();
    const formattedPrompt = AI_ASSISTANT_PROMPT
      .replace("{{BUSINESS_DATA}}", JSON.stringify(businessData, null, 2))
      .replace("{{QUESTION}}", question);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedPrompt
    });

    return response.text || "I was unable to formulate a response. Please check details and ask again.";
  } catch (error) {
    console.error("Gemini Assistant Error:", error);
    throw error;
  }
}

// 3. Marketing Campaign Kit Generator
export async function generateGeminiMarketingCampaign(businessName, businessType, product, offer, discount, audience) {
  try {
    const ai = getAIClient();
    const formattedPrompt = MARKETING_PROMPT
      .replace("{{BUSINESS_NAME}}", businessName)
      .replace("{{BUSINESS_TYPE}}", businessType)
      .replace("{{PRODUCT}}", product)
      .replace("{{OFFER}}", offer)
      .replace("{{DISCOUNT}}", String(discount))
      .replace("{{AUDIENCE}}", audience);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedPrompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || "";
    const cleanJSON = cleanJSONResponse(text);
    return JSON.parse(cleanJSON);
  } catch (error) {
    console.error("Gemini Marketing Campaign Error:", error);
    throw error;
  }
}

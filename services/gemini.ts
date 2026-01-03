
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface ChartAnalysis {
  detected_pattern: string;
  confidence_score: string;
  direction: 'Bearish' | 'Bullish' | 'Neutral';
  market_bias: string; 
  analysis_summary: string;
  
  // The Setup
  trade_setup: {
    suggested_entry: string;
    stop_loss: string;
    stop_loss_logic: string; 
    target_1: string;
    target_2: string;
    win_rate_simulation: string;
  };

  // Smart Money Logic
  why_this_works: string; 

  // Risk Management
  risk_shield: {
    recommended_leverage: string;
    risk_per_trade: string;
  };

  insider_tip: string; 

  micro_insights: string[];
  disclaimer_text: string;
}

const cleanBase64 = (base64: string): string => {
  if (base64.includes('base64,')) {
    return base64.split('base64,')[1];
  }
  return base64;
};

export const analyzeChartImage = async (base64Image: string, mimeType: string): Promise<ChartAnalysis | null> => {
  try {
    // Speed Optimization: Using 'gemini-3-flash-preview' for the fastest possible vision processing.
    const modelId = 'gemini-3-flash-preview'; 
    const imageData = cleanBase64(base64Image);

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              data: imageData,
              mimeType: mimeType,
            },
          },
          {
            text: `Analyze this chart INSTANTLY as an Institutional Technical Analyst. 
            Focus on Smart Money Concepts (SMC). Be extremely concise.
            
            Identify:
            1. MARKET BIAS: Institutional Bias.
            2. THE SETUP: Entry, SL (with logic), TP1, TP2.
            3. WHY THIS WORKS: Liquidity sweeps or traps.
            4. RISK: Leverage & % Risk.
            5. INSIDER TIP: One subtle technical secret.
            
            Strict JSON output.`,
          },
        ],
      },
      config: {
        // Latency Optimization: Disable thinking budget for zero-delay response.
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detected_pattern: { type: Type.STRING },
            confidence_score: { type: Type.STRING },
            direction: { type: Type.STRING, enum: ["Bearish", "Bullish", "Neutral"] },
            market_bias: { type: Type.STRING },
            analysis_summary: { type: Type.STRING },
            trade_setup: {
              type: Type.OBJECT,
              properties: {
                suggested_entry: { type: Type.STRING },
                stop_loss: { type: Type.STRING },
                stop_loss_logic: { type: Type.STRING },
                target_1: { type: Type.STRING },
                target_2: { type: Type.STRING },
                win_rate_simulation: { type: Type.STRING }
              },
              required: ["suggested_entry", "stop_loss", "stop_loss_logic", "target_1", "target_2", "win_rate_simulation"]
            },
            why_this_works: { type: Type.STRING },
            risk_shield: {
              type: Type.OBJECT,
              properties: {
                recommended_leverage: { type: Type.STRING },
                risk_per_trade: { type: Type.STRING }
              },
              required: ["recommended_leverage", "risk_per_trade"]
            },
            insider_tip: { type: Type.STRING },
            micro_insights: { type: Type.ARRAY, items: { type: Type.STRING } },
            disclaimer_text: { type: Type.STRING }
          },
          required: [
            "detected_pattern", "confidence_score", "direction", "market_bias", 
            "analysis_summary", "trade_setup", "why_this_works", "risk_shield", 
            "insider_tip", "micro_insights", "disclaimer_text"
          ]
        }
      }
    });

    if (response.text) {
      const text = response.text.trim();
      const cleanedJson = text.startsWith('```') 
        ? text.replace(/^```json\s?|```$/g, "").trim()
        : text;
        
      try {
        return JSON.parse(cleanedJson) as ChartAnalysis;
      } catch (e) {
        console.error("JSON Parse Error:", e);
        const start = cleanedJson.indexOf('{');
        const end = cleanedJson.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          return JSON.parse(cleanedJson.substring(start, end + 1)) as ChartAnalysis;
        }
        throw new Error("Invalid response format from AI");
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const chatWithChart = async (base64Image: string, mimeType: string, message: string, history: {role: string, text: string}[]): Promise<string> => {
  try {
    const modelId = 'gemini-3-flash-preview'; 
    const imageData = cleanBase64(base64Image);

    const contextPrompt = `
      You are an expert trading mentor using Smart Money Concepts. 
      Context: ${JSON.stringify(history)}
      User: ${message}
      Answer briefly and professionally.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              data: imageData,
              mimeType: mimeType,
            },
          },
          {
            text: contextPrompt,
          },
        ],
      },
    });

    return response.text || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Sorry, I'm having trouble connecting right now.";
  }
};

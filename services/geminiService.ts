
import { GoogleGenAI } from "@google/genai";

// Always use process.env.API_KEY directly when initializing the client
export async function searchMarketplace(query: string, userLocation?: { lat: number; lng: number }) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    // Using gemini-3-flash-preview as recommended for basic text tasks and search grounding
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        parts: [{
          text: `User is looking for: "${query}". Based on this, provide a helpful response helping them find what they need in a local marketplace. If location is provided: ${userLocation ? JSON.stringify(userLocation) : 'Unknown'}.`
        }]
      }],
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a local marketplace expert assistant. Help users find provisions, stores, and compare prices. Keep answers concise and helpful."
      }
    });

    // Extracting URLs from groundingChunks as required by the guidelines
    return {
      text: response.text || "I couldn't find a response.",
      links: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => chunk.web?.uri).filter(Boolean) as string[] || []
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "I'm having trouble searching the market right now. Please try again later.", links: [] };
  }
}

export async function generateProductDescription(productName: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{
      parts: [{
        text: `Generate a catchy 2-sentence marketing description for a provision store product named: ${productName}`
      }]
    }],
  });
  
  return response.text || "";
}

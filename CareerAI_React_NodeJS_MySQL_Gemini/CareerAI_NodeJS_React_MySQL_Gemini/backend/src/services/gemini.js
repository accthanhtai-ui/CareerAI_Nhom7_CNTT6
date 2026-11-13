import { GoogleGenAI } from "@google/genai";

export async function askGemini(prompt) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const result = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
    contents: prompt
  });
  return result.text || "AI chưa tạo được câu trả lời.";
}

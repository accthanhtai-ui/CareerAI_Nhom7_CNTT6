import { GoogleGenAI } from "@google/genai";
export async function askGemini(prompt) {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error("Chưa cấu hình GEMINI_API_KEY trong backend/.env");
    error.status = 503;
    throw error;
  }
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const result = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: prompt
  });
  return result.text || "AI chưa tạo được câu trả lời.";
}

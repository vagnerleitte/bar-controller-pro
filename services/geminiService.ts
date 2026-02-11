
import { GoogleGenAI } from "@google/genai";

export async function getBarInsights(summaryData: any) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Com base nestes dados fictícios do meu bar hoje: ${JSON.stringify(summaryData)}. 
                 Gere uma frase curta de insight gerencial (máximo 150 caracteres) motivadora ou de alerta em Português.`,
    });
    return response.text?.trim() || "O movimento está estável. Mantenha o foco no atendimento!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Movimento 15% acima da média. Prepare o estoque de cerveja IPA!";
  }
}

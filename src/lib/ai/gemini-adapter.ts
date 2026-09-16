import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider } from '@/types/ai';

export function createGeminiAdapter(apiKey: string, model: string): AIProvider {
  const genAI = new GoogleGenerativeAI(apiKey);

  return {
    async generate(prompt, systemPrompt) {
      const genModel = genAI.getGenerativeModel({
        model,
        systemInstruction: systemPrompt,
      });
      const result = await genModel.generateContent(prompt);
      return result.response.text();
    },
  };
}

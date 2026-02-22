import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private getAI() {
    const apiKey = process.env.GEMINI_API_KEY || '';
    return new GoogleGenAI({ apiKey });
  }

  async generateImage(quote: string): Promise<string | null> {
    const ai = this.getAI();
    const prompt = `Create a high-quality, professional background image for a quote card featuring this quote: "${quote}". The image should be atmospheric, cinematic, and suitable for a motivational or inspirational post. Do not include any text in the image.`;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9",
          },
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    } catch (error) {
      console.error("Image generation error:", error);
    }
    return null;
  }
}

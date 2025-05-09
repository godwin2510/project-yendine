declare module '@google/generative-ai' {
  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    getGenerativeModel(config: { 
      model: string;
      generationConfig?: {
        responseMimeType?: string;
      };
    }): GenerativeModel;
  }

  export class GenerativeModel {
    generateContent(params: {
      contents: Array<{
        role: string;
        parts: Array<{
          text: string;
        }>;
      }>;
    }): Promise<{
      response: {
        text: () => string;
      };
    }>;
  }
} 
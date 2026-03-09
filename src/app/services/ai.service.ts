import { Injectable } from '@angular/core';
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { StoryElement } from './video.service';

export interface ScriptResult {
  title: string;
  script: string;
  scenes: { description: string; dialogue: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private ai?: GoogleGenAI;

  constructor() {
    try {
      if (typeof GEMINI_API_KEY !== 'undefined' && GEMINI_API_KEY) {
        this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        console.log('[AiService] GoogleGenAI initialized successfully');
      } else {
        console.warn('[AiService] GEMINI_API_KEY is missing. AI features will be disabled.');
      }
    } catch (e) {
      console.error('[AiService] Failed to initialize GoogleGenAI:', e);
    }
  }

  async generateVideo(prompt: string, style = 'Cinematic', resolution: '720p' | '1080p' = '720p', aspectRatio: '16:9' | '9:16' | '1:1' = '9:16'): Promise<string> {
    if (!this.ai) {
      throw new Error('AI Service not initialized: GEMINI_API_KEY is missing');
    }

    const styledPrompt = `Style: ${style}. ${prompt}`;
    const context = { prompt, style, resolution, aspectRatio };
    console.log(`[AiService] Starting video generation:`, context);
    
    try {
      let operation = await this.ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: styledPrompt,
        config: {
          numberOfVideos: 1,
          resolution,
          aspectRatio
        }
      });

      if (!operation) {
        throw new Error('Video generation failed: No operation returned from model');
      }

      let attempts = 0;
      const maxAttempts = 60; // 5 minutes max polling

      while (!operation.done && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await this.ai.operations.getVideosOperation({ operation: operation });
        attempts++;
        console.log(`[AiService] Polling video generation... (Attempt ${attempts}/${maxAttempts})`, context);
      }

      if (!operation.done) {
        console.error('[AiService] Video generation timed out', context);
        throw new Error('Video generation timed out after 5 minutes');
      }

      if (operation.error) {
        console.error('[AiService] Video generation model error:', operation.error, context);
        const errorMsg = (operation.error as { message?: string }).message || 'Unknown model error';
        throw new Error(`Video generation failed: ${errorMsg}`);
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) {
        console.error('[AiService] Video generation response missing URI. Full response:', JSON.stringify(operation.response), context);
        throw new Error('Video generation failed: No download link received from model');
      }
      
      console.log('[AiService] Video generation successful:', downloadLink, context);
      return downloadLink;
    } catch (error) {
      console.error('[AiService] Critical error in generateVideo:', error, context);
      const errorMessage = (error as Error).message || 'An unexpected error occurred during video generation';
      throw new Error(`[AiService] ${errorMessage}`);
    }
  }

  async generateVoiceover(text: string, voice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr' | 'Energetic' | 'Calm' | 'Professional' | 'Storyteller' | 'Enthusiastic' | 'Formal' | 'Announcer' = 'Kore'): Promise<string> {
    if (!this.ai) {
      throw new Error('AI Service not initialized: GEMINI_API_KEY is missing');
    }

    const context = { text: text.substring(0, 50) + '...', voice };
    console.log(`[AiService] Starting voiceover generation:`, context);
    
    // Map user-friendly names to technical voice names
    const voiceMap: Record<string, string> = {
      'Energetic': 'Fenrir',
      'Calm': 'Zephyr',
      'Professional': 'Charon',
      'Storyteller': 'Puck',
      'Enthusiastic': 'Fenrir',
      'Formal': 'Charon',
      'Announcer': 'Puck'
    };
    
    const technicalVoice = (voiceMap[voice] || voice) as 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: technicalVoice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        console.error('[AiService] Voiceover response missing audio data:', response, context);
        throw new Error('Voiceover generation failed: No audio data in response');
      }
      
      console.log('[AiService] Voiceover generation successful', context);
      return `data:audio/wav;base64,${base64Audio}`;
    } catch (error) {
      console.error('[AiService] Critical error in generateVoiceover:', error, context);
      throw error;
    }
  }

  async generateHooks(videoContext: string): Promise<string[]> {
    if (!this.ai) throw new Error('AI Service not initialized');
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 5 viral hooks for a video about: ${videoContext}. Return as a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  }

  async analyzeViralScore(videoDescription: string): Promise<{ score: number, feedback: string }> {
    if (!this.ai) throw new Error('AI Service not initialized');
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the viral potential of this video: ${videoDescription}. Return a score (0-100) and feedback.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING }
          },
          required: ["score", "feedback"]
        }
      }
    });
    return JSON.parse(response.text || '{"score": 0, "feedback": "Error analyzing"}');
  }

  async analyzeStory(videoContext: string): Promise<StoryElement[]> {
    if (!this.ai) throw new Error('AI Service not initialized');
    const response = await this.ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Analyze the narrative structure of this video footage: ${videoContext}. 
      Identify emotional peaks, comedic moments, dramatic pauses, and significant dialogue.
      Return a JSON array of objects with { type: string, timestamp: string, description: string }.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, description: "One of: emotional, comedic, dramatic, dialogue" },
              timestamp: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["type", "timestamp", "description"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]') as StoryElement[];
  }

  async generateThumbnail(prompt: string): Promise<string> {
    if (!this.ai) throw new Error('AI Service not initialized');
    const response = await this.ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: { parts: [{ text: `High quality viral YouTube thumbnail: ${prompt}` }] },
      config: {
        imageConfig: { aspectRatio: "16:9", imageSize: "1K" }
      },
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error('Thumbnail generation failed');
  }

  async generateScript(topic: string, keywords: string[]): Promise<ScriptResult> {
    if (!this.ai) throw new Error('AI Service not initialized');
    const response = await this.ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Create a professional video script about "${topic}". 
      Keywords to include: ${keywords.join(', ')}.
      Return a JSON object with:
      - title: A catchy title
      - script: The full narrative script
      - scenes: An array of { description: visual description, dialogue: spoken text }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            script: { type: Type.STRING },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  dialogue: { type: Type.STRING }
                },
                required: ["description", "dialogue"]
              }
            }
          },
          required: ["title", "script", "scenes"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  }
}

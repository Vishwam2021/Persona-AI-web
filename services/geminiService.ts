import { GoogleGenAI, Chat, Content } from "@google/genai";
import { Message } from '../types';

const apiKey = process.env.API_KEY || '';

// Initialize the client
const ai = new GoogleGenAI({ apiKey });

// Helper to convert internal Message type to Gemini Content type for history
const mapMessagesToHistory = (messages: Message[]): Content[] => {
  return messages.map(m => ({
    role: m.role,
    parts: [{ text: m.text }]
  }));
};

export const createChatSession = (systemInstruction: string, previousMessages: Message[] = []): Chat => {
  const history = mapMessagesToHistory(previousMessages);
  
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction,
    },
    history
  });
};

export type StreamCallback = (chunkText: string) => void;

export const sendMessageStream = async (
  chat: Chat, 
  message: string, 
  onChunk: StreamCallback
): Promise<string> => {
  let fullResponse = '';
  
  const result = await chat.sendMessageStream({ message });
  
  for await (const chunk of result) {
    const chunkText = chunk.text;
    if (chunkText) {
      fullResponse += chunkText;
      onChunk(chunkText);
    }
  }
  
  return fullResponse;
};
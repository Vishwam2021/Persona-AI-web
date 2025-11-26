export enum PersonaCategory {
  PRODUCTIVITY = 'Productivity',
  WELLNESS = 'Wellness',
  LEARNING = 'Learning',
  ENTERTAINMENT = 'Entertainment',
  CUSTOM = 'Custom'
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  category: PersonaCategory;
  systemInstruction: string;
  avatarUrl: string;
  isDefault?: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ChatSession {
  personaId: string;
  messages: Message[];
  lastUpdated: number;
}
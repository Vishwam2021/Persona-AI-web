import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ChatInterface } from './components/ChatInterface';
import { CreatePersona } from './components/CreatePersona';
import { Persona, PersonaCategory, Message, ChatSession } from './types';
import { MessageSquare, Plus, ArrowRight } from 'lucide-react';

// Default Data
const DEFAULT_PERSONAS: Persona[] = [
  {
    id: '1',
    name: 'Task Master',
    category: PersonaCategory.PRODUCTIVITY,
    description: 'Strict and efficient productivity coach.',
    systemInstruction: 'You are an ultra-efficient, no-nonsense productivity coach. Keep answers concise, actionable, and encouraging but firm. Use bullet points often.',
    avatarUrl: 'https://picsum.photos/id/1/200/200',
    isDefault: true
  },
  {
    id: '2',
    name: 'Zen Guide',
    category: PersonaCategory.WELLNESS,
    description: 'Calm, soothing mindfulness companion.',
    systemInstruction: 'You are a wise, calm zen master. Speak in a soothing tone. Offer philosophical insights and mindfulness advice. Use metaphors from nature.',
    avatarUrl: 'https://picsum.photos/id/64/200/200',
    isDefault: true
  },
  {
    id: '3',
    name: 'Code Wizard',
    category: PersonaCategory.LEARNING,
    description: 'Expert senior software engineer.',
    systemInstruction: 'You are an elite senior software engineer. You are expert in React, TypeScript, Python and System Design. Explain concepts clearly with code examples.',
    avatarUrl: 'https://picsum.photos/id/180/200/200',
    isDefault: true
  },
  {
    id: '4',
    name: 'The Jester',
    category: PersonaCategory.ENTERTAINMENT,
    description: 'Witty, sarcastic, and full of jokes.',
    systemInstruction: 'You are a sarcastic, witty court jester. You make jokes about everything, but you are still helpful. Use emojis and puns.',
    avatarUrl: 'https://picsum.photos/id/1062/200/200',
    isDefault: true
  }
];

const App: React.FC = () => {
  // State
  const [personas, setPersonas] = useState<Persona[]>(() => {
    const saved = localStorage.getItem('personas');
    return saved ? JSON.parse(saved) : DEFAULT_PERSONAS;
  });

  const [activePersonaId, setActivePersonaId] = useState<string | null>(null);
  const [view, setView] = useState<'dashboard' | 'chat' | 'create'>('dashboard');
  
  // Store chat history by persona ID
  const [chatSessions, setChatSessions] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('chatSessions');
    return saved ? JSON.parse(saved) : {};
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem('personas', JSON.stringify(personas));
  }, [personas]);

  useEffect(() => {
    localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
  }, [chatSessions]);

  // Handlers
  const handleSelectPersona = (id: string) => {
    setActivePersonaId(id);
    setView('chat');
  };

  const handleCreatePersona = (newPersona: Omit<Persona, 'id'>) => {
    const persona: Persona = {
      ...newPersona,
      id: Date.now().toString(),
    };
    setPersonas([...personas, persona]);
    setActivePersonaId(persona.id);
    setView('chat');
  };

  const handleUpdateMessages = (personaId: string, messages: Message[]) => {
    setChatSessions(prev => ({
      ...prev,
      [personaId]: messages
    }));
  };

  const activePersona = personas.find(p => p.id === activePersonaId);

  // Render Content based on View
  const renderContent = () => {
    if (view === 'create') {
      return (
        <CreatePersona 
          onSave={handleCreatePersona}
          onCancel={() => setView('dashboard')}
        />
      );
    }

    if (view === 'chat' && activePersona) {
      return (
        <ChatInterface 
          key={activePersona.id} // Force re-mount on persona switch
          persona={activePersona}
          initialMessages={chatSessions[activePersona.id] || []}
          onUpdateMessages={handleUpdateMessages}
        />
      );
    }

    // Dashboard View
    return (
      <div className="p-6 md:p-12 overflow-y-auto h-full">
        <div className="max-w-5xl mx-auto">
          <header className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
              Welcome to PersonaAI
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Select a persona to start chatting, or create your own custom AI companion tailored to your specific needs.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create New Card */}
            <button 
              onClick={() => setView('create')}
              className="group flex flex-col items-center justify-center p-8 bg-primary/10 border-2 border-dashed border-primary/30 rounded-2xl hover:bg-primary/20 hover:border-primary transition-all cursor-pointer h-64"
            >
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Create Custom Persona</h3>
              <p className="text-sm text-center text-slate-400">Design a unique personality from scratch</p>
            </button>

            {/* Persona Cards */}
            {personas.map(persona => (
              <div 
                key={persona.id}
                onClick={() => handleSelectPersona(persona.id)}
                className="bg-card border border-slate-700 rounded-2xl p-6 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all cursor-pointer group flex flex-col h-64 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <ArrowRight className="text-primary" />
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={persona.avatarUrl} 
                    alt={persona.name} 
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-700 group-hover:ring-primary transition-all"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{persona.name}</h3>
                    <span className="inline-block px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 border border-slate-700">
                      {persona.category}
                    </span>
                  </div>
                </div>
                
                <p className="text-slate-400 text-sm line-clamp-3 mb-4 flex-1">
                  {persona.description}
                </p>

                <div className="pt-4 border-t border-slate-700/50 flex items-center gap-2 text-xs text-slate-500 font-medium uppercase tracking-wider">
                  <MessageSquare size={12} />
                  <span>Start Chat</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout
      personas={personas}
      activePersonaId={view === 'chat' ? activePersonaId : null}
      onSelectPersona={handleSelectPersona}
      onGoHome={() => {
        setView('dashboard');
        setActivePersonaId(null);
      }}
      onCreateNew={() => {
        setView('create');
        setActivePersonaId(null);
      }}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
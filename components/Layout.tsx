import React, { useState } from 'react';
import { Menu, X, MessageSquare, Plus, Github, User, LogOut } from 'lucide-react';
import { Persona, PersonaCategory } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  personas: Persona[];
  activePersonaId: string | null;
  onSelectPersona: (id: string) => void;
  onGoHome: () => void;
  onCreateNew: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  personas, 
  activePersonaId, 
  onSelectPersona,
  onGoHome,
  onCreateNew
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Group personas by category
  const groupedPersonas = personas.reduce((acc, persona) => {
    if (!acc[persona.category]) {
      acc[persona.category] = [];
    }
    acc[persona.category].push(persona);
    return acc;
  }, {} as Record<PersonaCategory, Persona[]>);

  return (
    <div className="flex h-screen bg-darker text-slate-200">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-card/90 backdrop-blur-md border-b border-slate-700 z-50 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          PersonaAI
        </h1>
        <button onClick={toggleSidebar} className="p-2 text-slate-300 hover:text-white">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-card border-r border-slate-700 transform transition-transform duration-300 ease-in-out flex flex-col
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-700 hidden md:flex items-center gap-2 cursor-pointer" onClick={onGoHome}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <MessageSquare size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">PersonaAI</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
           <button 
            onClick={() => {
              onGoHome();
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${!activePersonaId ? 'bg-primary/20 text-primary border border-primary/30' : 'hover:bg-slate-700/50 text-slate-400'}`}
          >
            <User size={20} />
            <span className="font-medium">Dashboard</span>
          </button>

          <button 
            onClick={() => {
              onCreateNew();
              setIsSidebarOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
          >
            <Plus size={20} />
            <span className="font-bold">Create Persona</span>
          </button>

          {Object.entries(groupedPersonas).map(([category, items]) => (
            <div key={category}>
              <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {category}
              </h3>
              <div className="space-y-1">
                {items.map(persona => (
                  <button
                    key={persona.id}
                    onClick={() => {
                      onSelectPersona(persona.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm group
                      ${activePersonaId === persona.id 
                        ? 'bg-slate-700 text-white border-l-4 border-primary' 
                        : 'text-slate-400 hover:bg-slate-700/30 hover:text-slate-200'
                      }
                    `}
                  >
                    <img 
                      src={persona.avatarUrl} 
                      alt={persona.name} 
                      className={`w-8 h-8 rounded-full object-cover ring-2 ring-slate-700 group-hover:ring-slate-600 ${activePersonaId === persona.id ? 'ring-primary' : ''}`}
                    />
                    <div className="flex-1 text-left truncate">
                      {persona.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-700">
           <div className="text-xs text-slate-500 text-center">
             Powered by Gemini 2.5 Flash
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full relative pt-16 md:pt-0 overflow-hidden bg-darker">
        {children}
      </main>
    </div>
  );
};
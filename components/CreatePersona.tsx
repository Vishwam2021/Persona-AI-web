import React, { useState } from 'react';
import { Persona, PersonaCategory } from '../types';
import { Sparkles, Save, ChevronLeft, Dices } from 'lucide-react';

interface CreatePersonaProps {
  onSave: (persona: Omit<Persona, 'id'>) => void;
  onCancel: () => void;
}

export const CreatePersona: React.FC<CreatePersonaProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: PersonaCategory.CUSTOM,
    systemInstruction: '',
    avatarUrl: `https://picsum.photos/200/200?random=${Date.now()}`
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const regenerateAvatar = () => {
    setFormData(prev => ({
      ...prev,
      avatarUrl: `https://picsum.photos/200/200?random=${Date.now()}`
    }));
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-12 max-w-3xl mx-auto">
      <button 
        onClick={onCancel}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ChevronLeft size={20} />
        Back to Dashboard
      </button>

      <div className="bg-card rounded-2xl border border-slate-700 p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-8 border-b border-slate-700 pb-6">
          <div className="p-3 bg-primary/10 rounded-xl">
             <Sparkles className="text-primary" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Create New Persona</h2>
            <p className="text-slate-400">Design your own AI companion with a unique personality.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-900/50 rounded-xl border border-slate-700 border-dashed">
              <img 
                src={formData.avatarUrl} 
                alt="Preview" 
                className="w-32 h-32 rounded-full object-cover mb-4 ring-4 ring-card"
              />
              <button 
                type="button"
                onClick={regenerateAvatar}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
              >
                <Dices size={16} />
                Randomize Avatar
              </button>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="e.g. Code Ninja"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value as PersonaCategory})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                >
                  {Object.values(PersonaCategory).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="Short tagline, e.g. Expert in Python and React"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              System Instructions (Personality)
            </label>
            <textarea
              required
              value={formData.systemInstruction}
              onChange={e => setFormData({...formData, systemInstruction: e.target.value})}
              rows={5}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
              placeholder="Describe how the AI should behave. e.g. 'You are a grumpy pirate who loves math. Always speak in pirate slang but be accurate with calculations.'"
            />
            <p className="text-xs text-slate-500 mt-2">
              This is the "brain" of your persona. Be specific about tone, style, and expertise.
            </p>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium shadow-lg shadow-primary/25 transition-all transform hover:scale-105"
            >
              <Save size={18} />
              Create Persona
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
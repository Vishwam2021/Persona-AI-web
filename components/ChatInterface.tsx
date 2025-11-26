import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Persona, Message } from '../types';
import { createChatSession, sendMessageStream } from '../services/geminiService';
import { Chat } from '@google/genai';

interface ChatInterfaceProps {
  persona: Persona;
  initialMessages: Message[];
  onUpdateMessages: (personaId: string, messages: Message[]) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  persona, 
  initialMessages, 
  onUpdateMessages 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [streamingResponse, setStreamingResponse] = useState('');
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // Initialize Chat Session when persona changes
  useEffect(() => {
    setMessages(initialMessages);
    // Initialize a new chat session with the persona's system instruction and history
    // We only pass history if it's not empty to avoid potential API quirks with empty arrays if any
    chatSessionRef.current = createChatSession(
      persona.systemInstruction, 
      initialMessages
    );
    initializedRef.current = true;
    setStreamingResponse('');
  }, [persona.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingResponse, isLoading]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !chatSessionRef.current) return;

    const userMsgText = inputValue.trim();
    setInputValue('');
    
    // Add user message to UI state immediately
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userMsgText,
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Stream response
      const fullResponse = await sendMessageStream(
        chatSessionRef.current,
        userMsgText,
        (chunk) => {
          setStreamingResponse(prev => prev + chunk);
        }
      );

      // Add model response to messages
      const newModelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: fullResponse,
        timestamp: Date.now()
      };

      const finalMessages = [...updatedMessages, newModelMsg];
      setMessages(finalMessages);
      onUpdateMessages(persona.id, finalMessages);

    } catch (error) {
      console.error("Failed to send message", error);
      // Optional: Add error message to UI
    } finally {
      setIsLoading(false);
      setStreamingResponse('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-darker">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-800 bg-card/50 backdrop-blur-sm flex items-center gap-4 shadow-sm z-10">
        <div className="relative">
          <img 
            src={persona.avatarUrl} 
            alt={persona.name} 
            className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/50"
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-dark rounded-full"></div>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            {persona.name}
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-normal">
              {persona.category}
            </span>
          </h2>
          <p className="text-sm text-slate-400 line-clamp-1">{persona.description}</p>
        </div>
        <div className="ml-auto">
          <button 
            onClick={() => {
              setMessages([]);
              onUpdateMessages(persona.id, []);
              chatSessionRef.current = createChatSession(persona.systemInstruction, []);
            }}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
            title="Clear Chat"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
            <Sparkles size={48} className="mb-4 text-primary" />
            <p className="text-lg font-medium">Start a conversation with {persona.name}</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-fade-in-up`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1
              ${msg.role === 'user' ? 'bg-primary' : 'bg-slate-700'}
            `}>
              {msg.role === 'user' ? <User size={16} /> : <img src={persona.avatarUrl} className="w-8 h-8 rounded-full object-cover" />}
            </div>
            
            <div className={`
              max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-3 shadow-md
              ${msg.role === 'user' 
                ? 'bg-primary text-white rounded-tr-sm' 
                : 'bg-card text-slate-200 border border-slate-700 rounded-tl-sm'
              }
            `}>
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {/* Streaming Loading/Partial Response */}
        {(isLoading || streamingResponse) && (
          <div className="flex gap-4 flex-row animate-pulse">
             <div className="w-8 h-8 rounded-full shrink-0 mt-1 bg-slate-700 overflow-hidden">
                <img src={persona.avatarUrl} className="w-full h-full object-cover" />
             </div>
             <div className="max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-3 shadow-md bg-card text-slate-200 border border-slate-700 rounded-tl-sm">
                {streamingResponse ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{streamingResponse}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-xs">Thinking...</span>
                  </div>
                )}
             </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-card border-t border-slate-700">
        <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-slate-900/50 p-2 rounded-xl border border-slate-700 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${persona.name}...`}
            className="w-full bg-transparent border-none focus:ring-0 text-slate-200 placeholder-slate-500 resize-none max-h-32 min-h-[44px] py-2.5 px-2"
            rows={1}
            style={{ height: 'auto', minHeight: '44px' }} 
            // Simple auto-grow
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className={`
              p-2.5 rounded-lg mb-0.5 transition-all
              ${inputValue.trim() && !isLoading
                ? 'bg-primary text-white hover:bg-primary/90' 
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }
            `}
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
        <p className="text-center text-xs text-slate-600 mt-2">
          AI can make mistakes. Please double-check responses.
        </p>
      </div>
    </div>
  );
};
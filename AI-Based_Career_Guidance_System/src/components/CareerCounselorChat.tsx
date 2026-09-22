import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { MessageSquare, Send, Sparkles, Volume2, Languages, HelpCircle, Bot, UserCheck, MicOff } from 'lucide-react';

interface CareerCounselorChatProps {
  currentUser: User | null;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export default function CareerCounselorChat({ currentUser }: CareerCounselorChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `Hello! I am **Dr. Evelyn Carter**, your primary AI Career Counselor. 

I have evaluated your academic history and background parameters. How can I guide you today? Here is what we can do:
- 🗺️ **Generate** personalized 30/90-day learning roadmaps
- 📝 **Suggest** resume keyword and ATS adjustments
- 🎤 **Conduct** behavioral mock interviews
- 🎓 **Recommend** eligibility details for universities and scholarships

What area shall we explore first?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [sending, setSending] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const suggestionChips = [
    { label: '🗺️ Map a 90-day roadmap', query: 'Can you generate a 90-day learning roadmap milestones for my recommended career?' },
    { label: '📝 Resume keywords advice', query: 'What are the top 5 ATS keywords and skills I should add to my resume?' },
    { label: '🎤 Mock interview warmup', query: 'Give me 3 technical interview questions for an Associate AI Developer.' },
    { label: '🎓 Top scholarships info', query: 'What scholarships and placement statistics apply to Stanford or MIT courses?' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const stopActiveAudio = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (err) {
        // Safe to ignore
      }
    }
    setIsPlayingAudio(false);
  };

  // Play PCM 24kHz raw little-endian or general audio returned as Base64
  const playAudioBase64 = async (base64Data: string) => {
    stopActiveAudio();
    setIsPlayingAudio(true);
    
    try {
      if (!audioContextRef.current) {
        // Output model speech rate is 24000Hz as per skill instructions
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const ctx = audioContextRef.current;
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Let's decode or load raw PCM Little Endian Int16 array
      const buffer = bytes.buffer;
      const int16Array = new Int16Array(buffer);
      const float32Array = new Float32Array(int16Array.length);
      
      // Normalize Int16PCM to Float32 range [-1.0, 1.0]
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768;
      }
      
      const audioBuffer = ctx.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setIsPlayingAudio(false);
      
      audioSourceRef.current = source;
      source.start(0);
    } catch (err) {
      console.error('Web Speech Playback failure:', err);
      setIsPlayingAudio(false);
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || !currentUser) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);
    stopActiveAudio();

    // Map conversation logs to Express history
    const conversationHistory = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    try {
      const response = await fetch('/api/counselor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          message: trimmed,
          history: conversationHistory,
          language,
          generateSpeech: isVoiceActive
        })
      });

      const data = await response.json();
      
      const counselorMsg: ChatMessage = {
        id: `msg-${Date.now()}-model`,
        role: 'model',
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, counselorMsg]);
      
      if (data.audio && isVoiceActive) {
        playAudioBase64(data.audio);
      }
    } catch (err) {
      console.error('Error contacting counselor chat API:', err);
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-err`,
        role: 'model',
        content: 'I apologize, but my connection was temporarily interrupted. Please ask again in a moment!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl h-[calc(100vh-10rem)] p-6 gap-6" id="chat-outer-box">
      
      {/* Left Chat Window Column */}
      <div className="flex flex-1 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden text-left" id="chat-canvas">
        
        {/* Chat Control Toolbar Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 py-3">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-slate-800" />
            <div>
              <p className="text-xs font-bold text-slate-900 leading-none">Counselor Pro (Dr. Evelyn)</p>
              <p className="text-[10px] text-slate-400 mt-1">Multi-turn AI psychologist active</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="flex items-center space-x-1.5 border-r border-slate-200 pr-3">
              <Languages className="h-3.5 w-3.5 text-slate-400" />
              <button
                onClick={() => setLanguage('en')}
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  language === 'en' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  language === 'hi' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                हिं (Hindi)
              </button>
            </div>

            {/* Speech synthesis toggle */}
            <button
              onClick={() => {
                const newVal = !isVoiceActive;
                setIsVoiceActive(newVal);
                if (!newVal) stopActiveAudio();
              }}
              className={`flex items-center space-x-1 rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all ${
                isVoiceActive
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
              id="btn-voice-counselor-toggle"
            >
              <Volume2 className={`h-3.5 w-3.5 ${isPlayingAudio ? 'animate-bounce text-emerald-600' : ''}`} />
              <span>Voice AI</span>
            </button>
          </div>
        </div>

        {/* Message Panel list container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/20" id="chat-messages-container">
          {messages.map((m) => {
            const isBot = m.role === 'model';
            return (
              <div key={m.id} className={`flex items-start space-x-3 max-w-[85%] ${isBot ? '' : 'ml-auto flex-row-reverse space-x-reverse'}`}>
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                  isBot ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800'
                }`}>
                  {isBot ? <Bot className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                </div>
                
                <div className={`rounded-2xl p-4 text-xs shadow-sm ${
                  isBot ? 'bg-white border border-slate-200/60 text-slate-800' : 'bg-slate-950 text-white'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {m.content}
                  </p>
                  <span className={`block mt-1 text-[9px] text-right ${isBot ? 'text-slate-400' : 'text-white/40'}`}>
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {sending && (
            <div className="flex items-start space-x-3 max-w-[85%]">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4 text-xs shadow-sm text-slate-500">
                <div className="flex items-center space-x-2">
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"></div>
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.2s]"></div>
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Action Suggestion list row */}
        <div className="border-t border-slate-100 px-4 py-2 flex items-center space-x-2 overflow-x-auto whitespace-nowrap scrollbar-none" id="chat-suggestion-chips">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Quick:</span>
          {suggestionChips.map((c) => (
            <button
              key={c.label}
              onClick={() => handleSendMessage(c.query)}
              className="rounded-full border border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600 transition"
              id={`btn-chip-${c.label.slice(0, 10).replace(/\s+/g, '-')}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Input Bar Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="border-t border-slate-100 p-4 flex items-center space-x-3 bg-white"
          id="chat-input-form"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={language === 'hi' ? "Dr. Evelyn से कुछ भी पूछें..." : "Ask Dr. Evelyn about careers, schedules, resume advice..."}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold focus:border-slate-400 focus:outline-none"
            id="chat-input-text-field"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 shadow-md"
            id="chat-btn-submit"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </form>

      </div>

      {/* Right Column Help Info Pane */}
      <div className="hidden lg:block w-72 space-y-6 text-left" id="chat-sidebar-help">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 flex items-center">
            <Sparkles className="mr-1.5 h-4 w-4 text-slate-800" />
            Enterprise AI Voice Integration
          </h3>
          <p className="text-[11px] text-slate-500 leading-normal">
            By checking the <strong>Voice AI</strong> checkbox, Counselor Pro processes replies using text-to-speech models, enabling real auditory counseling mock reviews.
          </p>
          <div className="rounded-xl bg-slate-100/60 p-3 text-[10px] text-slate-600 border border-slate-200/50">
            <p className="font-bold">Multilingual Support (EN / HI):</p>
            <p className="mt-1 leading-normal">Toggle language inputs easily. Perfect for students seeking career directions in pure English or friendly Hinglish conversation!</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/60 bg-slate-50/50 p-5 space-y-3">
          <h4 className="text-xs font-semibold text-slate-700">Explore specific paths:</h4>
          <p className="text-[11px] text-slate-500 leading-normal">
            Your chat is fully tied to your assessment results. The AI dynamically adapts its consulting prompts to match your skills.
          </p>
        </div>
      </div>

    </div>
  );
}

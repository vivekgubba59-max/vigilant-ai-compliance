'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/components/Layout/AppContext';
import { 
  MessageSquare, 
  Send, 
  Mic, 
  MicOff, 
  Languages, 
  Sparkles, 
  Trash2, 
  Loader2,
  Volume2
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function ChatPage() {
  const { chatMessages, sendChatMessage, clearChat, isLoading, company } = useApp();
  const [input, setInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'te'>('en');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Quick prompt suggestions based on selected language
  const suggestions = {
    en: [
      { text: 'What compliances are due this month?', value: 'What compliances are due this month?' },
      { text: 'Do I require GST registration?', value: 'Do I require GST registration?' },
      { text: 'Explain Factories Act safety regulations', value: 'Explain Factories Act safety regulations' },
      { text: 'Generate my compliance checklist', value: 'Generate my compliance checklist' },
    ],
    hi: [
      { text: 'इस महीने कौन से अनुपालन पूरे करने हैं?', value: 'इस महीने कौन से अनुपालन पूरे करने हैं?' },
      { text: 'क्या मुझे जीएसटी पंजीकरण की आवश्यकता है?', value: 'क्या मुझे जीएसटी पंजीकरण की आवश्यकता है?' },
      { text: 'कारखाना अधिनियम सुरक्षा नियम क्या हैं?', value: 'कारखाना अधिनियम सुरक्षा नियम क्या हैं?' },
      { text: 'मेरी अनुपालन चेकलिस्ट बनाएं', value: 'मेरी अनुपालन चेकलिस्ट बनाएं' },
    ],
    te: [
      { text: 'ఈ నెలలో ఏ నిబంధనలు ఫైల్ చేయాలి?', value: 'ఈ నెలలో ఏ నిబంధనలు ఫైల్ చేయాలి?' },
      { text: 'నాకు జీఎస్టీ రిజిస్ట్రేషన్ అవసరమా?', value: 'నాకు జీఎస్టీ రిజిస్ట్రేషన్ అవసరమా?' },
      { text: 'ఫ్యాక్టరీల చట్టం భద్రతా నియమాలు ఏమిటి?', value: 'ఫ్యాక్టరీల చట్టం భద్రతా నియమాలు ఏమిటి?' },
      { text: 'నా అనుకూల చెక్‌లిస్ట్‌ను సృష్టించండి', value: 'నా అనుకూల చెక్‌లిస్ట్‌ను సృష్టించండి' },
    ],
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isLoading]);

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(prev => prev + ' ' + transcript);
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    // Set speech recognition language based on selection
    if (selectedLanguage === 'hi') {
      recognitionRef.current.lang = 'hi-IN';
    } else if (selectedLanguage === 'te') {
      recognitionRef.current.lang = 'te-IN';
    } else {
      recognitionRef.current.lang = 'en-IN';
    }

    try {
      setIsListening(true);
      recognitionRef.current.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const query = input;
    setInput('');
    await sendChatMessage(query);
  };

  const handleSuggestionClick = async (promptValue: string) => {
    if (isLoading) return;
    setInput('');
    await sendChatMessage(promptValue);
  };

  const handleSpeak = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Cancel active speaking
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text.replace(/[#*_-]/g, ''));
      if (selectedLanguage === 'hi') {
        utterance.lang = 'hi-IN';
      } else if (selectedLanguage === 'te') {
        utterance.lang = 'te-IN';
      } else {
        utterance.lang = 'en-IN';
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col border border-border bg-card rounded-xl overflow-hidden shadow-sm relative">
      {/* Chat Header */}
      <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-4 bg-secondary/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              Gemini Compliance Copilot
              <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            </h1>
            <p className="text-[10px] text-muted-foreground">
              Auditing under GST, PF Act, ESIC, PCB, and Factories Act
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-background border border-border rounded-lg p-1">
            <Languages className="w-3.5 h-3.5 text-muted-foreground ml-1.5" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as any)}
              className="bg-transparent border-none text-[10px] font-bold text-foreground focus:outline-none pr-1"
            >
              <option value="en">English (EN)</option>
              <option value="hi">हिंदी (HI)</option>
              <option value="te">తెలుగు (TE)</option>
            </select>
          </div>

          {/* Reset History */}
          <button
            onClick={clearChat}
            className="p-2 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all border border-border"
            title="Clear Chat Logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggestion Feed overlay if conversation is empty */}
      {chatMessages.length <= 1 && (
        <div className="px-6 py-4 border-b border-border/40 bg-secondary/10 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-500" /> Suggested Prompts:
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestions[selectedLanguage].map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(sug.value)}
                className="text-[10px] font-medium px-2.5 py-1 rounded-full border border-border bg-background hover:bg-blue-600/5 hover:border-blue-500/30 text-muted-foreground hover:text-foreground transition-all text-left"
              >
                {sug.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Workspace */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {chatMessages.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3.5 max-w-3xl ${isAi ? '' : 'ml-auto flex-row-reverse'}`}
            >
              {/* Avatar Icon */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-md ${
                isAi 
                  ? 'bg-blue-600' 
                  : 'bg-slate-700'
              }`}>
                {isAi ? 'AI' : 'US'}
              </div>

              {/* Message Bubble */}
              <div className="space-y-1">
                <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  isAi
                    ? 'bg-secondary/40 border border-border/80 text-foreground'
                    : 'bg-blue-600 text-white shadow-lg shadow-blue-500/10'
                }`}>
                  {/* Process message text with simple markdown support */}
                  <div className="space-y-2 whitespace-pre-wrap">
                    {msg.message.split('\n').map((line, idx) => {
                      if (line.startsWith('### ')) {
                        return <h3 key={idx} className="font-bold text-sm text-foreground pt-1.5">{line.replace('### ', '')}</h3>;
                      }
                      if (line.startsWith('## ')) {
                        return <h2 key={idx} className="font-bold text-sm text-foreground pt-2">{line.replace('## ', '')}</h2>;
                      }
                      if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) {
                        const checked = line.startsWith('- [x] ');
                        return (
                          <div key={idx} className="flex items-center gap-2 mt-1">
                            <input type="checkbox" checked={checked} disabled className="rounded border-border" />
                            <span className="text-[11px] text-muted-foreground">{line.replace(/- \[[ x]\] /, '')}</span>
                          </div>
                        );
                      }
                      if (line.startsWith('* ') || line.startsWith('- ')) {
                        return <li key={idx} className="list-disc ml-4 text-[11px]">{line.replace(/^[*+-]\s+/, '')}</li>;
                      }
                      return <p key={idx}>{line}</p>;
                    })}
                  </div>
                </div>

                {/* Footer Speech & Date */}
                <div className={`flex items-center gap-2 text-[9px] text-muted-foreground ${isAi ? '' : 'justify-end'}`}>
                  <span>{formatDate(msg.created_at)}</span>
                  {isAi && (
                    <button
                      onClick={() => handleSpeak(msg.message)}
                      className="p-1 rounded hover:bg-secondary hover:text-foreground text-muted-foreground transition-all"
                      title="Listen"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3.5 max-w-2xl">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs animate-pulse">
              AI
            </div>
            <div className="p-4 rounded-2xl bg-secondary/40 border border-border flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span>Analyzing regulations for {company.name}...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Tray */}
      <form onSubmit={handleSend} className="p-4 border-t border-border bg-secondary/15 flex items-center gap-3">
        {/* Voice Trigger */}
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          className={`p-2.5 rounded-lg border transition-all relative ${
            isListening
              ? 'bg-rose-500 border-rose-500 text-white animate-pulse'
              : 'border-border bg-background text-muted-foreground hover:text-foreground'
          }`}
          title={isListening ? 'Stop Listening' : 'Speak Obligation Question'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? 'Listening... Speak now...' : `Ask compliance questions in ${selectedLanguage === 'hi' ? 'Hindi' : selectedLanguage === 'te' ? 'Telugu' : 'English'}...`}
          className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />

        {/* Dispatch Button */}
        <button
          type="submit"
          className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          disabled={!input.trim() || isLoading}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChat } from '@ai-sdk/react';

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Chatbot({ isOpen, onClose }: ChatbotProps) {
  const { messages, status, error, sendMessage, setMessages } = useChat({});
  
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isLoading = status === "submitted" || status === "streaming";

  // Load chat history from localStorage on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bi_chatbot_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && typeof setMessages === 'function') {
          setMessages(parsed);
        }
      }
    } catch (e) {
      console.error("Gagal memuat riwayat chat dari localStorage:", e);
    }
  }, [setMessages]);

  // Persist chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages && messages.length > 0) {
      try {
        localStorage.setItem('bi_chatbot_messages', JSON.stringify(messages));
      } catch (e) {
        console.error("Gagal menyimpan riwayat chat:", e);
      }
    }
  }, [messages]);

  const handleClearHistory = () => {
    if (confirm("Hapus seluruh riwayat percakapan?")) {
      try {
        localStorage.removeItem('bi_chatbot_messages');
        if (typeof setMessages === 'function') {
          setMessages([]);
        }
      } catch (e) {
        console.error("Gagal menghapus riwayat chat:", e);
      }
    }
  };

  // Helper to safely extract text content from AI SDK message
  const getMessageText = (m: any): string => {
    if (typeof m.content === 'string' && m.content) return m.content;
    if (Array.isArray(m.parts)) {
      return m.parts
        .filter((p: any) => p.type === 'text')
        .map((p: any) => p.text)
        .join('');
    }
    return '';
  };

  // Custom parser to cleanly format Markdown text (bold, lists, headings) without raw asterisks
  const renderFormattedText = (text: string) => {
    if (!text) return null;

    // Clean up double asterisk & bullet symbol anomalies like "* **Text**:" -> "**Text**:"
    let cleaned = text.replace(/\*\s+\*\*/g, '**');

    const lines = cleaned.split('\n');

    return (
      <div className="space-y-1.5 leading-relaxed text-xs sm:text-sm">
        {lines.map((line, lineIdx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={lineIdx} className="h-1" />;

          // Check if line is a bullet item (* or -)
          const isBullet = /^[*\-]\s+/.test(trimmed);
          const isNumbered = /^\d+\.\s+/.test(trimmed);

          let displayContent = trimmed;
          if (isBullet) {
            displayContent = trimmed.replace(/^[*\-]\s+/, '');
          } else if (isNumbered) {
            displayContent = trimmed.replace(/^\d+\.\s+/, '');
          }

          // Parse inline **bold text**
          const parseBold = (str: string) => {
            const parts = str.split(/(\*\*.*?\*\*)/g);
            return parts.map((part, pIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={pIdx} className="font-bold text-gray-900">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return part;
            });
          };

          if (isBullet) {
            return (
              <div key={lineIdx} className="flex items-start gap-2 pl-1 my-1">
                <span className="text-primary font-bold text-xs mt-0.5">•</span>
                <span className="flex-1">{parseBold(displayContent)}</span>
              </div>
            );
          }

          if (isNumbered) {
            const numMatch = trimmed.match(/^(\d+)\.\s+/);
            const num = numMatch ? numMatch[1] : '';
            return (
              <div key={lineIdx} className="flex items-start gap-2 pl-1 my-1">
                <span className="font-bold text-primary text-xs shrink-0">{num}.</span>
                <span className="flex-1">{parseBold(displayContent)}</span>
              </div>
            );
          }

          return <p key={lineIdx}>{parseBold(displayContent)}</p>;
        })}
      </div>
    );
  };

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, status]);

  const handleCustomSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input || input.trim() === "" || isLoading) return;
    const textToSend = input.trim();
    setInput("");
    
    try {
      if (typeof sendMessage === 'function') {
        await sendMessage({ text: textToSend });
      }
    } catch (err: any) {
      console.error("Gagal mengirim pesan:", err);
    }
  };

  const handleQuickPrompt = async (promptText: string) => {
    if (isLoading) return;
    try {
      if (typeof sendMessage === 'function') {
        await sendMessage({ text: promptText });
      }
    } catch (err: any) {
      console.error("Gagal mengirim prompt cepat:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] pointer-events-none flex items-end justify-center sm:justify-end p-4 sm:p-6 sm:bottom-20">
      {/* Backdrop overlay for mobile dismiss */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs sm:hidden pointer-events-auto z-0" 
        onClick={onClose}
      ></div>

      {/* Chat Window Container */}
      <div className="pointer-events-auto bg-white w-full max-w-[420px] h-[78vh] max-h-[580px] sm:h-[540px] shadow-[0_20px_50px_rgba(0,51,102,0.3)] rounded-3xl overflow-hidden flex flex-col border-2 border-primary/20 relative z-10 transition-all duration-300">
        
        {/* Header (Navy Primary + Songket Motif) */}
        <div className="bg-primary text-white p-4 sm:p-5 flex justify-between items-center relative overflow-hidden shrink-0 border-b-2 border-accent-yellow shadow-md">
          {/* Header Motif Element */}
          <div 
            className="absolute inset-0 w-full h-full opacity-20 pointer-events-none mix-blend-overlay bg-cover bg-center"
            style={{ backgroundImage: 'url(/images/element/1.png)' }}
          ></div>

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border border-yellow-400 shrink-0">
              <i className="fa-solid fa-robot text-primary text-xl"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white leading-tight">BI Assistant</h3>
                <span className="bg-accent-yellow text-primary text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">AI</span>
              </div>
              <p className="text-blue-100 text-xs flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Online • BI Mengajar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            {messages && messages.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                title="Hapus percakapan"
                className="text-white/80 hover:text-white transition-colors w-8 h-8 rounded-full bg-white/10 hover:bg-red-500/80 flex items-center justify-center cursor-pointer border border-white/20"
              >
                <i className="fa-solid fa-trash-can text-xs"></i>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer border border-white/20"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
          {(!messages || messages.length === 0) && (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 gap-3 px-4 my-auto">
              <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center text-3xl shadow-inner border border-blue-100 mb-1">
                <i className="fa-solid fa-comments"></i>
              </div>
              <h4 className="font-bold text-gray-800 text-base">Halo! Saya BI Assistant 🏛️</h4>
              <p className="text-xs text-gray-500 leading-relaxed max-w-[280px]">
                Ada yang bisa saya bantu terkait program <b>BI Mengajar</b>, edukasi Rupiah, atau layanan kas <b>Titik Temu</b>?
              </p>
              
              {/* Quick Prompt Chips */}
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {[
                  "Apa itu BI Mengajar?",
                  "Cara daftar pengajuan?",
                  "Apa itu Titik Temu?",
                  "Tips merawat Rupiah"
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickPrompt(chip)}
                    className="text-[11px] font-semibold bg-white border border-gray-200 text-primary hover:bg-primary hover:text-white px-3 py-1.5 rounded-full transition-all shadow-xs cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {messages && messages.map((m: any, idx: number) => {
            const textContent = getMessageText(m);
            if (!textContent) return null;
            return (
              <div
                key={m.id || `msg-${idx}`}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl ${
                    m.role === "user"
                      ? "bg-primary text-white shadow-md rounded-tr-none border border-blue-900 text-xs sm:text-sm leading-relaxed"
                      : "bg-white text-gray-800 shadow-sm rounded-tl-none border border-gray-200"
                  }`}
                >
                  {m.role === "user" ? (
                    <div style={{ whiteSpace: "pre-wrap" }}>{textContent}</div>
                  ) : (
                    renderFormattedText(textContent)
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] p-3.5 rounded-2xl shadow-sm text-xs bg-white border border-gray-200 text-gray-700 rounded-tl-none flex gap-1.5 items-center">
                <span className="text-gray-400 font-medium mr-1 text-xs">BI Assistant mengetik...</span>
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-xs p-2.5 text-center border-t border-red-200 font-medium flex items-center justify-center gap-1.5">
            <i className="fa-solid fa-circle-exclamation"></i>
            {error.message || "Gagal menghubungkan ke server AI."}
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={handleCustomSend} className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik pertanyaan Anda..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-primary focus:bg-white transition-all text-gray-800 placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={!input || input.trim() === '' || isLoading}
            className="bg-accent-red text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-700 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-b-2 border-red-800 shrink-0"
          >
            <i className="fa-solid fa-paper-plane text-xs"></i>
          </button>
        </form>

      </div>
    </div>
  );
}

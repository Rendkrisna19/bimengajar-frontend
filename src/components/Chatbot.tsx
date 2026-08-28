"use client";

import React, { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Chatbot({ isOpen, onClose }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiErrorMsg, setApiErrorMsg] = useState<string>('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Trigger floating toast notification
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Load chat history from localStorage on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bi_chatbot_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (e) {
      console.error("Gagal memuat riwayat chat dari localStorage:", e);
    }
  }, []);

  // Save chat history to localStorage on change
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
    try {
      localStorage.removeItem('bi_chatbot_messages');
      setMessages([]);
      setShowConfirmDelete(false);
      triggerToast('Riwayat chat berhasil dihapus!');
    } catch (e) {
      console.error("Gagal menghapus riwayat chat:", e);
    }
  };

  // Custom parser to cleanly format Markdown text (bold, lists, headings) without raw asterisks
  const renderFormattedText = (text: string) => {
    if (!text) return null;

    let cleaned = text.replace(/\*\s+\*\*/g, '**');
    const lines = cleaned.split('\n');

    return (
      <div className="space-y-1.5 leading-relaxed text-xs sm:text-sm">
        {lines.map((line, lineIdx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={lineIdx} className="h-1" />;

          const isBullet = /^[*\-]\s+/.test(trimmed);
          const isNumbered = /^\d+\.\s+/.test(trimmed);

          let displayContent = trimmed;
          if (isBullet) {
            displayContent = trimmed.replace(/^[*\-]\s+/, '');
          } else if (isNumbered) {
            displayContent = trimmed.replace(/^\d+\.\s+/, '');
          }

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend || !textToSend.trim() || isLoading) return;

    const trimmedText = textToSend.trim();
    setApiErrorMsg('');
    setIsLoading(true);

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmedText,
    };

    const assistantMsgId = `assistant-${Date.now()}`;
    const initialAssistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
    };

    const updatedMessages = [...messages, userMsg];
    setMessages([...updatedMessages, initialAssistantMsg]);

    try {
      // 1. Realistic 1.5 second typing delay (displays "BI Assistant mengetik...")
      await new Promise((res) => setTimeout(res, 1500));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP Error ${response.status}`);
      }

      const payload = await response.text();
      let fullText = "";

      const lines = payload.split('\n');
      for (const line of lines) {
        if (line.startsWith('0:')) {
          try {
            fullText += JSON.parse(line.slice(2));
          } catch {
            fullText += line.slice(2);
          }
        } else if (!line.startsWith('e:') && !line.startsWith('d:') && line.trim()) {
          fullText += line;
        }
      }

      if (!fullText) {
        fullText = "Maaf, terjadi kesalahan memuat jawaban.";
      }

      // 2. Smooth typing animation effect (types 4 characters every 20ms)
      let currentText = "";
      const chunkSize = 4;
      for (let i = 0; i < fullText.length; i += chunkSize) {
        currentText += fullText.slice(i, i + chunkSize);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, content: currentText }
              : msg
          )
        );
        await new Promise((r) => setTimeout(r, 20));
      }

    } catch (err: any) {
      console.error("[Chatbot] Error:", err);
      setApiErrorMsg(err?.message || 'Gagal terhubung ke server AI.');
      setMessages((prev) => prev.filter((msg) => msg.id !== assistantMsgId || msg.content.trim().length > 0));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input || input.trim() === "" || isLoading) return;
    const text = input;
    setInput("");
    await handleSendMessage(text);
  };

  const handleQuickPrompt = async (promptText: string) => {
    if (isLoading) return;
    await handleSendMessage(promptText);
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
        
        {/* Custom Confirmation Modal */}
        {showConfirmDelete && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 transition-all">
            <div className="bg-white rounded-2xl p-5 w-full max-w-[320px] shadow-2xl border border-gray-100 flex flex-col items-center text-center space-y-3 animate-in fade-in zoom-in duration-200">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xl shadow-inner border border-red-200">
                <i className="fa-solid fa-trash-can"></i>
              </div>
              <div>
                <h4 className="font-extrabold text-gray-900 text-base">Hapus Percakapan?</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Seluruh riwayat chat Anda dengan BI Assistant akan dihapus secara permanen.
                </p>
              </div>
              <div className="flex gap-2.5 w-full pt-1">
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  className="flex-1 px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="flex-1 px-4 py-2 text-xs font-bold text-white bg-accent-red hover:bg-red-700 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer border-b-2 border-red-800"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Floating Toast Notification */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-emerald-500 animate-in slide-in-from-top duration-300">
            <i className="fa-solid fa-circle-check text-sm"></i>
            <span>{toastMessage}</span>
          </div>
        )}

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
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Online • PLAT-BK
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            {messages && messages.length > 0 && (
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
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
                Ada yang bisa saya bantu terkait program <b>PLAT-BK</b>, edukasi Rupiah, atau layanan kas <b>Titik Temu</b>?
              </p>
              
              {/* Quick Prompt Chips */}
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {[
                  "Apa itu PLAT-BK?",
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
          
          {messages && messages.map((m) => {
            if (!m.content && m.role === 'assistant' && !isLoading) return null;
            return (
              <div
                key={m.id}
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
                    <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
                  ) : m.content ? (
                    renderFormattedText(m.content)
                  ) : (
                    <div className="flex gap-1.5 items-center text-xs text-gray-400">
                      <span>BI Assistant mengetik...</span>
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
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

        {apiErrorMsg && (
          <div className="bg-red-50 text-red-600 text-xs p-3 border-t border-red-200 font-medium flex items-start gap-2">
            <i className="fa-solid fa-circle-exclamation mt-0.5 shrink-0"></i>
            <span className="leading-relaxed">
              {apiErrorMsg}
            </span>
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

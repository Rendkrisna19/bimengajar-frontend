"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChat } from '@ai-sdk/react';

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Chatbot({ isOpen, onClose }: ChatbotProps) {
  // @ai-sdk/react's useChat hook in this version returns status and sendMessage instead of isLoading and handleSubmit
  const { messages, error, status, sendMessage } = useChat({});
  
  // Create local state for input
  const [input, setInput] = useState("");
  
  const isLoading = status !== "ready" && status !== "error";
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input || input.trim() === "") {
      return;
    }
    
    const textToSend = input;
    setInput(""); // Clear input early for good UX
    
    try {
      if (sendMessage) {
        // @ts-expect-error - AI SDK version mismatch on UIMessage type
        await sendMessage({ role: 'user', content: textToSend } as any);
      } else {
        alert("Fungsi sendMessage tidak ditemukan pada AI SDK.");
      }
    } catch (err: any) {
      alert("Error saat mengirim pesan: " + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 z-[100] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] shadow-2xl rounded-2xl overflow-hidden flex flex-col border border-gray-100 mb-4 transition-all duration-300 ease-in-out">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner">
                <i className="fa-solid fa-robot text-blue-600 text-xl"></i>
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">BI Assistant</h3>
                <p className="text-blue-100 text-xs">Selalu siap membantu Anda</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors w-8 h-8 rounded-full hover:bg-blue-700 flex items-center justify-center"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-4">
            {(!messages || messages.length === 0) && (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 gap-3">
                <i className="fa-solid fa-messages text-4xl text-gray-300"></i>
                <p className="text-sm">Halo! Saya adalah AI Assistant BI Mengajar.<br/>Ada yang bisa saya bantu hari ini?</p>
              </div>
            )}
            
            {messages && messages.map((m: any) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl shadow-sm text-sm ${
                    m.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-sm"
                      : "bg-white border border-gray-100 text-gray-700 rounded-tl-sm"
                  }`}
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] p-3 rounded-2xl shadow-sm text-sm bg-white border border-gray-100 text-gray-700 rounded-tl-sm flex gap-1 items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div className="bg-red-100 text-red-600 text-xs p-2 text-center border-t border-red-200">
              {error.message || "Terjadi kesalahan saat menghubungi server."}
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSend(e as any);
                }
              }}
              placeholder="Tanyakan sesuatu..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-700"
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-md cursor-pointer"
            >
              <i className="fa-solid fa-paper-plane text-sm ml-[-2px]"></i>
            </button>
          </div>
        </div>
      )}

      {/* No Floating Button since it's controlled by FloatingAction */}
    </div>
  );
}

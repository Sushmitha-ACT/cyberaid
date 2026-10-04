"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Button } from "@/components/ui/button";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function GlobalChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // ai v7 / @ai-sdk/react v4 API:
  // - useChat returns { messages, status, sendMessage, error }
  // - messages[].parts (array of TextUIPart etc.) instead of .content (string)
  // - status: 'ready' | 'submitted' | 'streaming' | 'error'
  const { messages, status, sendMessage, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    onError: (err) => {
      console.error("Chat error:", err);
    },
  });

  const isLoading = status === 'submitted' || status === 'streaming';
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;
    sendMessage({ text: trimmed });
    setInputValue("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Extract plain text from a message's parts array
  const getMessageText = (m: (typeof messages)[number]): string => {
    const msg = m as any;
    if (msg.content) return msg.content;
    if (msg.parts) {
      return msg.parts
        .filter((p: any) => p.type === 'text')
        .map((p: any) => p.text)
        .join("");
    }
    return "";
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className={`h-14 w-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 transition-transform hover:scale-105 ${isOpen ? 'hidden' : 'flex'}`}
        >
          <MessageCircle className="h-6 w-6 text-primary-foreground" />
        </Button>
      </div>

      {/* Chat Interface Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[350px] sm:w-[400px] h-[500px] bg-panel border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary/10 border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-primary" />
                <span className="font-heading font-bold text-foreground">CyberAid Assistant</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="hover:bg-primary/20 hover:text-primary">
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground space-y-3 opacity-60">
                  <Bot className="h-12 w-12" />
                  <p className="text-sm px-4">I&apos;m your AI digital response assistant. Ask me any quick questions about cyber security or recovery!</p>
                </div>
              ) : (
                messages.map(m => (
                  <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {m.role === 'assistant' && (
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div className={`p-3 rounded-xl max-w-[80%] text-sm ${
                      m.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'bg-muted text-foreground rounded-tl-sm'
                    }`}>
                      {m.role === 'user' ? (
                        getMessageText(m)
                      ) : (
                        <div className="prose prose-sm prose-invert break-words max-w-full leading-relaxed">
                          <ReactMarkdown remarkPlugins={[remarkGfm as any]}>
                            {getMessageText(m)}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                    {m.role === 'user' && (
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <User className="h-5 w-5 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))
              )}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3 justify-start">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div className="p-3 rounded-xl bg-muted text-foreground rounded-tl-sm text-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
              {error && (
                <div className="flex gap-3 justify-start">
                  <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/20">
                    <strong>Error:</strong> {error.message || "Failed to reach AI. Please wait a moment and try again."}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-border bg-background/50">
              <div className="flex items-center gap-2 relative">
                <input
                  className="w-full bg-background border border-border rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  value={inputValue}
                  placeholder="Ask a security question..."
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={onKeyDown}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  size="icon"
                  disabled={!inputValue.trim() || isLoading}
                  onClick={handleSend}
                  className="absolute right-1 top-1 h-9 w-9 rounded-full z-10"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/*
 * Copyright 2026 Sharexpress Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, Bot, HelpCircle, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../api/api";
import Button from "./ui/Button";

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I am **AssetFlow AI**, your system assistant. Ask me anything about live assets, reservations, maintenance tickets, or audit logs."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const handleResetChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hello! I am **AssetFlow AI**, your system assistant. Ask me anything about live assets, reservations, maintenance tickets, or audit logs."
      }
    ]);
    setActiveSuggestions([
      "What assets are under maintenance?",
      "Who has overdue returns?",
      "Show recent activity logs",
      "Are there active bookings?"
    ]);
    setInput("");
    setLoading(false);
  };

  const [activeSuggestions, setActiveSuggestions] = useState([
    "What assets are under maintenance?",
    "Who has overdue returns?",
    "Show recent activity logs",
    "Are there active bookings?"
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    
    const userMessage = { role: "user", content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setActiveSuggestions([]); // Clear current suggestions during generation

    try {
      const response = await api.post("/ai/chat", { message: text });
      const botMessage = {
        role: "assistant",
        content: response.data?.answer || "I could not generate an answer."
      };
      setMessages(prev => [...prev, botMessage]);
      setActiveSuggestions(response.data?.suggestions || []);
    } catch (error) {
      const errorMessage = {
        role: "assistant",
        content: `Error connecting to AI backend: ${error}`
      };
      setMessages(prev => [...prev, errorMessage]);
      setActiveSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Basic helper to convert markdown elements to simple styled HTML/JSX
  const renderMessageContent = (text) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Check for bullet lists
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs mt-1">
            {parseInlineMarkdown(line.substring(2))}
          </li>
        );
      }
      // Check for headings
      if (line.startsWith("### ")) {
        return <h4 key={idx} className="text-xs font-bold text-text-primary mt-3 mb-1">{line.substring(4)}</h4>;
      }
      if (line.startsWith("## ")) {
        return <h3 key={idx} className="text-xs font-bold text-text-primary mt-4 mb-1">{line.substring(3)}</h3>;
      }
      // Standard line
      return <p key={idx} className="text-xs mt-1 leading-relaxed">{parseInlineMarkdown(line)}</p>;
    });
  };

  const parseInlineMarkdown = (line) => {
    // Bold parsing
    const parts = line.split("**");
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-bold text-text-primary">{part}</strong>;
      }
      // Code tags parsing
      const subparts = part.split("`");
      return subparts.map((sub, j) => {
        if (j % 2 === 1) {
          return <code key={j} className="bg-bg-secondary border border-border-primary rounded px-1 text-[10px] font-mono text-accent-purple">{sub}</code>;
        }
        return sub;
      });
    });
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-purple text-white shadow-lg cursor-pointer border border-white/10"
        >
          <Sparkles className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Slide-out Sidebar Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop cover overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black z-40 cursor-pointer"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-[380px] bg-bg-card border-l border-border-primary shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-border-primary/80 flex items-center justify-between bg-bg-secondary/40 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-purple text-white shadow-sm">
                    <Bot className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-text-primary tracking-tight">AssetFlow Assistant</h3>
                    <span className="text-[9px] text-text-muted font-medium uppercase tracking-wider">RAG AI Agent</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleResetChat}
                    className="p-1 hover:bg-bg-secondary text-text-muted hover:text-text-primary rounded-md transition-colors cursor-pointer"
                    title="Start New Chat"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-bg-secondary text-text-muted hover:text-text-primary rounded-md transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Chat messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={index}
                      className={`flex gap-2.5 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : ""}`}
                    >
                      {!isUser && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-bg-secondary border border-border-primary text-accent-purple shrink-0 mt-0.5">
                          <Bot className="h-3.5 w-3.5" />
                        </div>
                      )}
                      
                      <div
                        className={`p-3 rounded-xl border text-xs text-text-secondary ${
                          isUser
                            ? "bg-accent-purple text-white border-accent-purple/20"
                            : "bg-bg-secondary/35 border-border-primary"
                        }`}
                      >
                        {isUser ? <p className="leading-relaxed">{msg.content}</p> : renderMessageContent(msg.content)}
                      </div>
                    </div>
                  );
                })}

                {/* Loading state indicator */}
                {loading && (
                  <div className="flex gap-2.5 max-w-[85%]">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-bg-secondary border border-border-primary text-accent-purple shrink-0 mt-0.5 animate-pulse">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                    <div className="p-3.5 bg-bg-secondary/35 border border-border-primary rounded-xl flex items-center gap-1">
                      <span className="h-1.5 w-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-1.5 w-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-1.5 w-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions Panel */}
              {activeSuggestions.length > 0 && !loading && (
                <div className="px-4 py-2 space-y-2 shrink-0 border-t border-border-primary/40 bg-bg-secondary/10">
                  <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider flex items-center gap-1">
                    <HelpCircle className="h-3 w-3" /> Suggested Follow-ups
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeSuggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(s)}
                        className="text-[10px] bg-bg-secondary hover:bg-bg-card border border-border-primary text-text-secondary hover:text-text-primary px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-left font-medium"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Form Footer */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(input);
                }}
                className="p-4 border-t border-border-primary/80 bg-bg-secondary/40 shrink-0 flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about assets, repairs, logs..."
                  disabled={loading}
                  className="flex-1 bg-bg-card border border-border-primary text-xs text-text-primary rounded-lg px-3 py-2 focus:border-accent-purple/80 focus:ring-2 focus:ring-accent-purple/20 outline-none transition-all disabled:opacity-50"
                />
                
                <Button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="py-2 px-3 shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

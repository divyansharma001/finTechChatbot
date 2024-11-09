"use client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const response = await fetch("https://fintechchatbot.onrender.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in chat route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// types/chat.ts
export type Message = {
  id: string;
  content: string;
  type: "user" | "bot";
  timestamp: Date;
};

// components/AiChatbot.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";

export function AiChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const placeholders = [
    "What's the best way to start investing?",
    "How do I diversify my investment portfolio?",
    "Can you explain the difference between stocks and bonds?",
    "What are the tax implications of selling investments?",
    "How can I plan for retirement using PathVest?",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (message: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(msg => ({
              role: msg.type === "user" ? "user" : "assistant",
              content: msg.content
            })),
            { role: "user", content: message }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: data.response || data.message,
        type: "bot",
        timestamp: new Date()
      }]);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.querySelector('input') as HTMLInputElement;
    const message = input.value.trim();
    
    if (!message) return;

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      content: message,
      type: "user",
      timestamp: new Date()
    }]);

    await sendMessage(message);
  };

  return (
    <div className="h-[40rem] flex flex-col justify-start items-center px-4 w-full max-w-4xl mx-auto">
      <h2 className="mb-6 sm:mb-10 text-xl text-center sm:text-5xl dark:text-white text-black">
        Ask PathVest AI Anything
      </h2>
      
      <div className="w-full flex-1 overflow-y-auto mb-6 rounded-lg bg-white dark:bg-zinc-900 shadow-lg">
        <div className="p-4 space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === "user"
                      ? "bg-black text-white dark:bg-zinc-800"
                      : "bg-gray-100 dark:bg-zinc-700"
                  }`}
                >
                  {message.content}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex justify-start"
              >
                <div className="bg-gray-100 dark:bg-zinc-700 p-3 rounded-lg flex space-x-2">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                </div>
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-red-500 text-sm text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="w-full">
        <PlaceholdersAndVanishInput
          placeholders={placeholders}
          onChange={(e) => {
            // Handle input change if needed
          }}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
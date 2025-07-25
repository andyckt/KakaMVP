"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { v0Api } from "@/lib/v0-api";

interface Message {
  type: "claude_message" | "tool_use" | "tool_result" | "progress" | "error" | "complete";
  content?: string;
  name?: string;
  input?: any;
  result?: any;
  message?: string;
  previewUrl?: string;
  sandboxId?: string;
  chatId?: string;
}

export default function GenerateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const prompt = searchParams.get("prompt") || "";
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);
  const [followUpInput, setFollowUpInput] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio element
  useEffect(() => {
    notificationSoundRef.current = new Audio('/notification-sound.mp3');
  }, []);
  
  // Function to play notification sound
  const playNotificationSound = () => {
    if (notificationSoundRef.current) {
      notificationSoundRef.current.currentTime = 0; // Reset to start
      notificationSoundRef.current.play().catch(err => {
        console.error("Failed to play notification sound:", err);
      });
    }
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    if (!prompt) {
      router.push("/");
      return;
    }
    
    // Prevent double execution in StrictMode
    if (hasStartedRef.current) {
      return;
    }
    hasStartedRef.current = true;
    
    setIsGenerating(true);
    generateWebsite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt, router]);
  
  const generateWebsite = async () => {
    try {
      // Using v0 direct mode
      const endpoint = "/api/generate-v0-direct";
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate website with v0");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              setIsGenerating(false);
              break;
            }

            try {
              const message = JSON.parse(data) as Message;
              
              if (message.type === "error") {
                throw new Error(message.message);
              } else if (message.type === "complete") {
                setPreviewUrl(message.previewUrl || null);
                if (message.chatId) {
                  setChatId(message.chatId);
                }
                setIsGenerating(false);
                // Play notification sound when generation completes
                playNotificationSound();
              } else {
                setMessages((prev) => [...prev, message]);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (err: any) {
      console.error("Error generating website with v0:", err);
      setError(err.message || "An error occurred");
      setIsGenerating(false);
    }
  };

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!followUpInput.trim() || !chatId || isGenerating) return;
    
    try {
      setIsGenerating(true);
      
      // Store the input before clearing it
      const messageText = followUpInput;
      
      // Clear input immediately after submission
      setFollowUpInput("");
      
      // Add user message to the chat
      const userMessage: Message = {
        type: "claude_message",
        content: messageText,
      };
      setMessages(prev => [...prev, userMessage]);
      
      // Get API key from server
      const apiKeyResponse = await fetch("/api/get-v0-key");
      if (!apiKeyResponse.ok) {
        throw new Error("Failed to get API key");
      }
      const { apiKey } = await apiKeyResponse.json();
      
      // Create v0 API service
      const v0Service = v0Api(apiKey);
      
      // Add progress message
      setMessages(prev => [...prev, {
        type: "progress",
        message: "Sending follow-up message..."
      }]);
      
      // Send follow-up message to v0 API
      const updatedChat = await v0Service.addMessage(chatId, messageText);
      
      // Extract and display assistant messages
      const assistantMessages = v0Service.extractAssistantMessages(updatedChat);
      if (assistantMessages.length > 0) {
        // Get the latest message (the response to our follow-up)
        const latestMessage = assistantMessages[assistantMessages.length - 1];
        
        setMessages(prev => [...prev, {
          type: "claude_message",
          content: latestMessage
        }]);
      }
      
      // Update preview URL if it changed
      if (updatedChat.demo && updatedChat.demo !== previewUrl) {
        setPreviewUrl(updatedChat.demo);
      }
      
      // Play notification sound when follow-up response is received
      playNotificationSound();
      
    } catch (err: any) {
      console.error("Error sending follow-up message:", err);
      setError(err.message || "Failed to send follow-up message");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const formatToolInput = (input: any) => {
    if (!input) return "";
    
    // Extract key information based on tool type
    if (input.file_path) {
      return `File: ${input.file_path}`;
    } else if (input.command) {
      return `Command: ${input.command}`;
    } else if (input.pattern) {
      return `Pattern: ${input.pattern}`;
    } else if (input.prompt) {
      return `Prompt: ${input.prompt.substring(0, 100)}...`;
    }
    
    // For other cases, show first meaningful field
    const keys = Object.keys(input);
    if (keys.length > 0) {
      const firstKey = keys[0];
      const value = input[firstKey];
      if (typeof value === 'string' && value.length > 100) {
        return `${firstKey}: ${value.substring(0, 100)}...`;
      }
      return `${firstKey}: ${value}`;
    }
    
    return JSON.stringify(input).substring(0, 100) + "...";
  };

  return (
    <main className="h-screen bg-white flex flex-col overflow-hidden relative">
      {/* Header with logo - minimal padding */}
      <div className="glass-effect py-1.3 px-4 border-b border-gray-200 flex items-center">
        <Link href="/" className="flex items-center">
          <div className="relative w-8 h-8">
            <Image
              src="/kaka.png"
              alt="卡卡科技 Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>
        <div className="flex-1"></div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left side - Chat */}
        <div className="w-[30%] flex flex-col border-r border-gray-200 bg-white">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center">
              {/* Header title removed as requested */}
            </div>
            <p className="text-gray-600 text-sm mt-1 break-words">{prompt}</p>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 overflow-x-hidden scrollbar-hide bg-gray-50">
            {messages.map((message, index) => (
              <div key={index}>
                {message.type === "claude_message" && (
                  <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 relative">
                        <Image
                          src="/kaka.png"
                          alt="卡卡 Logo"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                )}
                
                {message.type === "tool_use" && (
                  <div className="bg-white/80 rounded-3xl p-3 border border-gray-200 overflow-hidden shadow-sm">
                    <div className="flex items-start gap-2 text-sm">
                      <span className="brand-gradient-text flex-shrink-0">🔧 {message.name}</span>
                      <span className="text-gray-600 break-all">{formatToolInput(message.input)}</span>
                    </div>
                  </div>
                )}
                
                {message.type === "progress" && (
                  <div className="text-gray-600 text-sm font-mono break-all">
                    {message.message}
                  </div>
                )}
              </div>
            ))}
            
            {isGenerating && (
              <div className="flex items-center gap-2 text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                <span>处理中...</span>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-3xl p-4">
                <p className="text-red-500">{error}</p>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Bottom input area */}
          <div className="p-4 bg-white">
            <div className="relative group">
              <div className="absolute -inset-1 brand-gradient rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-white rounded-3xl border border-gray-200 shadow-xl">
                <form onSubmit={handleFollowUpSubmit} className="flex items-center p-2">
                  <input
                    type="text"
                    placeholder="你想提升哪个部份?"
                    className="flex-1 px-4 py-3 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none resize-none rounded-3xl"
                    disabled={isGenerating || !chatId}
                    value={followUpInput}
                    onChange={(e) => setFollowUpInput(e.target.value)}
                    style={{ fontFamily: "'Times New Roman', serif" }}
                  />
                  <button 
                    type="submit"
                    disabled={isGenerating || !followUpInput.trim() || !chatId}
                    className="flex-shrink-0 mr-2 p-3 brand-gradient hover:opacity-90 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group shadow-lg hover:shadow-xl btn-hover-effect"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Preview */}
        <div className="w-[70%] bg-gray-50 flex items-center justify-center">
          {!previewUrl && isGenerating && (
            <div className="text-center">
              <p className="text-gray-600" style={{ fontFamily: "'Times New Roman', serif" }}>预览加载中...</p>
            </div>
          )}
          
          {previewUrl && (
            <iframe
              src={previewUrl}
              className="w-full h-full border-none"
              title="预览"
            />
          )}
          
          {!previewUrl && !isGenerating && (
            <div className="text-center">
              <p className="text-gray-600" style={{ fontFamily: "'Times New Roman', serif" }}>预览将在此处显示</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 
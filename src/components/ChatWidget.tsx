"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuSendHorizontal } from "react-icons/lu";
import Image from "next/image";
import LoadingSpinner from "./LoadingSpinner";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  direction: "ltr" | "rtl";
}

// Hebrew character detection regex
const HEBREW_REGEX = /[\u0590-\u05FF]/;

const detectTextDirection = (text: string): "ltr" | "rtl" => {
  return HEBREW_REGEX.test(text.charAt(0)) ? "rtl" : "ltr";
};

// Function to render text with clickable links
const renderMessageWithLinks = (text: string, isUserMessage: boolean = false) => {
  // Enhanced URL regex pattern that matches http/https URLs and www URLs
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
  
  // Split text by URLs while keeping the URLs in the result
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    // Check if this part is a URL
    if (urlRegex.test(part)) {
      // Clean up the URL (remove trailing punctuation that might not be part of the URL)
      const cleanUrl = part.replace(/[.,;!?]+$/, '');
      const trailingPunctuation = part.slice(cleanUrl.length);
      
      // Add protocol if missing for www URLs
      let href = cleanUrl;
      if (cleanUrl.startsWith('www.')) {
        href = `https://${cleanUrl}`;
      }
      
      // Create a display text for very long URLs
      const displayText = cleanUrl.length > 50 
        ? `${cleanUrl.substring(0, 30)}...${cleanUrl.substring(cleanUrl.length - 15)}`
        : cleanUrl;
      
      return (
        <span key={index}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`underline hover:no-underline transition-colors font-medium inline-flex items-center gap-1 ${
              isUserMessage 
                ? "text-blue-100 hover:text-white" 
                : "text-blue-600 hover:text-blue-800"
            }`}
            onClick={(e) => {
              e.stopPropagation();
            }}
            title={`Open ${cleanUrl} in new tab`}
          >
            {displayText}
            <svg 
              className="w-3 h-3 opacity-70" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
              />
            </svg>
          </a>
          {trailingPunctuation}
        </span>
      );
    }
    
    // Regular text
    return <span key={index}>{part}</span>;
  });
};

export default function ChatWidget() {
  const [userName, setUserName] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [inputDirection, setInputDirection] = useState<"ltr" | "rtl">("ltr");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Listen for agent messages forwarded from parent via postMessage
  useEffect(() => {
    const handleParentMessage = (event: MessageEvent) => {
      
      // Accept messages from the widget service origin or null (for iframe postMessage)
      const isValidOrigin = event.origin === window.location.origin || event.origin === 'null' || event.origin === '';
      if (!isValidOrigin) {
        return;
      }

      if (event.data?.type === 'CHAT_WIDGET_AGENT_MESSAGE') {
        
        // Add the agent message to the chat
        const agentMessage: Message = {
          id: Date.now().toString() + "-agent",
          text: event.data.message,
          sender: "bot",
          timestamp: new Date(),
          direction: detectTextDirection(event.data.message),
        };
        
        setMessages((prev) => [...prev, agentMessage]);
      }
    };

    window.addEventListener('message', handleParentMessage);
    
    return () => {
      window.removeEventListener('message', handleParentMessage);
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle name submission
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      setUserName(nameInput.trim());

      // Add first welcome message when user first enters their name
      const firstWelcomeMessage: Message = {
        id: Date.now().toString() + "-welcome-1",
        text: `Hello ${
          nameInput.trim().charAt(0).toUpperCase() + nameInput.trim().slice(1)
        }! 👋 Welcome to Ersona Chat!`,
        sender: "bot",
        timestamp: new Date(),
        direction: "ltr",
      };

      setMessages([firstWelcomeMessage]);

      // Add second welcome message with a delay
      setTimeout(() => {
        const secondWelcomeMessage: Message = {
          id: Date.now().toString() + "-welcome-2",
          text: "I'm here to help you with any questions you might have. Feel free to ask me anything!",
          sender: "bot",
          timestamp: new Date(),
          direction: "ltr",
        };

        setMessages((prev) => [...prev, secondWelcomeMessage]);
      }, 1500);
    }
  };

  // Send message to API and get bot response
  const sendMessageToAPI = async (
    message: string,
    userName: string
  ): Promise<Message | null> => {
    try {
      // Use the widget messaging system for iframe communication
      if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
        
        // Use postMessage for iframe-to-parent communication
        window.parent.postMessage({
          type: 'CHAT_WIDGET_SEND_MESSAGE',
          message: message,
          userName: userName
        }, '*');
        
        // Don't return a placeholder message - real response will come via Pusher
        return null; // Signal that we handled this via widget system
      }

      // If not in iframe, show error message
      return {
        id: Date.now().toString() + "-bot-error",
        text: "Chat widget must be embedded in a website to function properly.",
        sender: "bot",
        timestamp: new Date(),
        direction: "ltr",
      };
    } catch (error) {
      console.error("Error sending message:", error);
      // Fallback response in case of error
      return {
        id: Date.now().toString() + "-bot-error",
        text: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
        direction: "ltr",
      };
    }
  };

  // Handle message submission
  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const direction = detectTextDirection(inputMessage);
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      sender: "user",
      timestamp: new Date(),
      direction,
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = inputMessage.trim();
    setInputMessage("");
    setInputDirection("ltr");
    setIsLoading(true);

    // Send message to API and get bot response
    const botReply = await sendMessageToAPI(messageText, userName);
    if (botReply) {
      // Only add bot reply if it's not null (null means handled via widget system)
      setMessages((prev) => [...prev, botReply]);
    }
    setIsLoading(false);
  };

  // Handle input change with direction detection
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputMessage(value);

    if (value.length > 0) {
      setInputDirection(detectTextDirection(value));
    } else {
      setInputDirection("ltr");
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleMessageSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  // Reset chat
  const resetChat = () => {
    setUserName("");
    setMessages([]);
    setNameInput("");
    setIsLoading(false);
  };


  // Name input screen
  if (!userName) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 bg-transparent text-gray-900 rounded-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <h2 className="text-2xl font-bold text-center mb-6">
            Welcome to Chat!
          </h2>
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Please enter your name:
              </label>
              <input
                id="name"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl 
                         bg-white text-gray-900 focus:outline-none focus:ring-0"
                placeholder="Your name..."
                autoFocus
              />
            </div>
            <motion.button
              type="submit"
              className="w-full bg-ersonaBlue hover:bg-blue-600 text-slate-900 font-medium py-2 px-4 border border-gray-300
                        rounded-xl transition-colors"
            >
              Start Chat
            </motion.button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Chat interface
  return (
    <div className="flex flex-col h-full text-gray-900 bg-transparent rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between py-2 px-4 bg-white/40 rounded-t-2xl chat-header shadow-lg shadow-black/10">
        <h3 className="font-medium flex items-center gap-1 text-gray-800 text-sm">
          <div className="rounded-full bg-gray-100 p-1 flex items-end justify-end">
            <Image
              src="/ersona-logo.svg"
              priority={true}
              alt="Ersona Logo"
              width={20}
              height={20}
              className="object-bottom w-5 h-5"
            />
          </div>
          <span className="mb-0.5">Ersona Agent</span>
        </h3>
        <button
          onClick={resetChat}
          className="text-sm text-gray-600 hover:text-gray-700 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/50">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                dir={message.direction}
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl ${
                  message.sender === "user"
                    ? "bg-ersonaBlue text-white chat-message-user shadow-sm"
                    : "bg-white text-gray-900 shadow-sm border border-gray-200 chat-message-bot"
                }`}
              >
                <div className="text-sm">
                  {renderMessageWithLinks(message.text, message.sender === "user")}
                </div>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </motion.div>
          ))}
          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              // initial={{ opacity: 0, y: 20 }}
              // animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <LoadingSpinner />
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="pt-4 px-4 pb-1 bg-white/80">
        <form onSubmit={handleMessageSubmit} className="flex">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            dir={inputDirection}
            disabled={isLoading}
            className="flex-1 px-2 py-2 border border-r-0 border-gray-300 rounded-l-xl 
                     bg-white/80 text-gray-900 focus:outline-none focus:ring-0 
                     text-sm placeholder:text-gray-500 placeholder:text-sm chat-input
                     disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder={
              isLoading ? "Waiting for response..." : "Ask me anything..."
            }
          />
          <motion.button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="bg-ersonaBlue hover:bg-blue-500 text-white font-medium py-2 px-4 
                     rounded-r-xl transition-colors text-sm flex items-center justify-center chat-button-send border border-gray-300
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-ersonaBlue"
          >
            <LuSendHorizontal className="w-5 h-5" />
          </motion.button>
        </form>
      </div>
      <div className="pb-1 px-2 bg-white/80 text-center rounded-b-2xl">
        <p className="text-[12px] text-gray-500">
          Powered by{" "}
          <a 
            href="https://ersona.co" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-500 hover:text-blue-600 transition-colors"
          >
            Ersona
          </a>
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuSendHorizontal } from "react-icons/lu";
import Image from "next/image";
interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  direction: "ltr" | "rtl";
}

interface ChatWidgetProps {
  userId?: string;
  lang?: string;
}

const STORAGE_KEY = "chat-widget-data";

// Hebrew character detection regex
const HEBREW_REGEX = /[\u0590-\u05FF]/;

const detectTextDirection = (text: string): "ltr" | "rtl" => {
  return HEBREW_REGEX.test(text.charAt(0)) ? "rtl" : "ltr";
};

export default function ChatWidget({ userId, lang }: ChatWidgetProps) {
  const [userName, setUserName] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [inputDirection, setInputDirection] = useState<"ltr" | "rtl">("ltr");
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const { userName: savedName, messages: savedMessages } =
          JSON.parse(savedData);
        if (savedName) {
          setUserName(savedName);
          setMessages(
            savedMessages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }))
          );
        }
      } catch (error) {
        console.error("Error loading saved data:", error);
      }
    }

    setIsInitialized(true);

    // Log query parameters if provided
    if (userId) console.log("User ID:", userId);
    if (lang) console.log("Language:", lang);
  }, [userId, lang]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          userName,
          messages,
        })
      );
    }
  }, [userName, messages, isInitialized]);

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

  // Simulate bot reply
  const generateBotReply = (userMessage: string, userName: string): Message => {
    const botReplies = [
      `Thanks for your message, ${userName}!`,
      `Hello ${userName}, how can I help you today?`,
      `I received your message "${userMessage}", ${userName}!`,
      `Great to hear from you, ${userName}!`,
      `${userName}, I'm here to assist you!`,
    ];

    const randomReply =
      botReplies[Math.floor(Math.random() * botReplies.length)];
    const direction = detectTextDirection(randomReply);

    return {
      id: Date.now().toString() + "-bot",
      text: randomReply,
      sender: "bot",
      timestamp: new Date(),
      direction,
    };
  };

  // Handle message submission
  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const direction = detectTextDirection(inputMessage);
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      sender: "user",
      timestamp: new Date(),
      direction,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setInputDirection("ltr");

    // Generate bot reply after 1 second
    setTimeout(() => {
      const botReply = generateBotReply(userMessage.text, userName);
      setMessages((prev) => [...prev, botReply]);
    }, 1000);
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
      handleMessageSubmit(e as any);
    }
  };

  // Reset chat
  const resetChat = () => {
    setUserName("");
    setMessages([]);
    setNameInput("");
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </motion.div>
          ))}
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
            className="flex-1 px-2 py-2 border border-r-0 border-gray-300 rounded-l-xl 
                     bg-white/80 text-gray-900 focus:outline-none focus:ring-0 
                     text-sm placeholder:text-gray-500 placeholder:text-sm chat-input"
            placeholder="Ask me anything..."
          />
          <motion.button
            type="submit"
            className="bg-ersonaBlue hover:bg-blue-500 text-white font-medium py-2 px-4 
                     rounded-r-xl transition-colors text-sm flex items-center justify-center chat-header border border-gray-300"
          >
            <LuSendHorizontal className="w-5 h-5" />
          </motion.button>
        </form>
      </div>
      <div className="pb-1 px-2 bg-white/80 text-center rounded-b-2xl">
        <p className="text-[12px] text-gray-500">
          Powered by{" "}
          <a href="https://ersona.co" className="text-blue-500">
            Ersona
          </a>
        </p>
      </div>
    </div>
  );
}

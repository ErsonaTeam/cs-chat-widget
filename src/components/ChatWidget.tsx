'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  direction: 'ltr' | 'rtl';
}

interface ChatWidgetProps {
  userId?: string;
  lang?: string;
}

const STORAGE_KEY = 'chat-widget-data';

// Hebrew character detection regex
const HEBREW_REGEX = /[\u0590-\u05FF]/;

const detectTextDirection = (text: string): 'ltr' | 'rtl' => {
  return HEBREW_REGEX.test(text.charAt(0)) ? 'rtl' : 'ltr';
};

export default function ChatWidget({ userId, lang }: ChatWidgetProps) {
  const [userName, setUserName] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [inputDirection, setInputDirection] = useState<'ltr' | 'rtl'>('ltr');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const { userName: savedName, messages: savedMessages } = JSON.parse(savedData);
        if (savedName) {
          setUserName(savedName);
          setMessages(savedMessages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })));
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
    setIsInitialized(true);

    // Log query parameters if provided
    if (userId) console.log('User ID:', userId);
    if (lang) console.log('Language:', lang);
  }, [userId, lang]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        userName,
        messages
      }));
    }
  }, [userName, messages, isInitialized]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle name submission
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      setUserName(nameInput.trim());
    }
  };

  // Simulate bot reply
  const generateBotReply = (userMessage: string, userName: string): Message => {
    const botReplies = [
      `Thanks for your message, ${userName}!`,
      `Hello ${userName}, how can I help you today?`,
      `I received your message "${userMessage}", ${userName}!`,
      `Great to hear from you, ${userName}!`,
      `${userName}, I'm here to assist you!`
    ];
    
    const randomReply = botReplies[Math.floor(Math.random() * botReplies.length)];
    const direction = detectTextDirection(randomReply);
    
    return {
      id: Date.now().toString() + '-bot',
      text: randomReply,
      sender: 'bot',
      timestamp: new Date(),
      direction
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
      sender: 'user',
      timestamp: new Date(),
      direction
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setInputDirection('ltr');

    // Generate bot reply after 1 second
    setTimeout(() => {
      const botReply = generateBotReply(userMessage.text, userName);
      setMessages(prev => [...prev, botReply]);
    }, 1000);
  };

  // Handle input change with direction detection
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputMessage(value);
    
    if (value.length > 0) {
      setInputDirection(detectTextDirection(value));
    } else {
      setInputDirection('ltr');
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleMessageSubmit(e as any);
    }
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
      <div className="flex flex-col items-center justify-center h-full p-6 bg-background text-foreground">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <h2 className="text-2xl font-bold text-center mb-6">Welcome to Chat!</h2>
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
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-800 text-foreground focus:outline-none focus:ring-2 
                         focus:ring-blue-500"
                placeholder="Your name..."
                autoFocus
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 
                       rounded-lg transition-colors"
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
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold">Chat with {userName}</h3>
        <button
          onClick={() => {
            setUserName('');
            setMessages([]);
            setNameInput('');
          }}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 
                   dark:hover:text-gray-200 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                dir={message.direction}
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-foreground'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleMessageSubmit} className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            dir={inputDirection}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-foreground focus:outline-none focus:ring-2 
                     focus:ring-blue-500"
            placeholder="Type your message..."
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 
                     rounded-lg transition-colors"
          >
            Send
          </motion.button>
        </form>
      </div>
    </div>
  );
} 
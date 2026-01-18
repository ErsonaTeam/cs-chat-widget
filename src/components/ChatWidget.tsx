"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuSendHorizontal } from "react-icons/lu";
import Image from "next/image";
import Markdown from "react-markdown";
import LoadingSpinner from "./LoadingSpinner";
import { ChatWidgetMessageType, RoomOption, RoomOptionDetail, FattalHotel, FattalRoom, FattalRoomPackage, FattalPackagePrice } from "@/types/message-types";
import RoomCarousel from "./RoomCarousel";
import RoomOptionsView from "./RoomOptionsView";
import HotelCarousel from "./HotelCarousel";
import FattalRoomCarousel from "./FattalRoomCarousel";
import FattalRoomDetailView from "./FattalRoomDetailView";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  direction: "ltr" | "rtl";
  roomOptions?: RoomOption[];
  hotelOptions?: FattalHotel[];
  roomSearchResults?: FattalRoom[];
}

// Hebrew character detection regex
const HEBREW_REGEX = /[\u0590-\u05FF]/;

const detectTextDirection = (text: string): "ltr" | "rtl" => {
  return HEBREW_REGEX.test(text.charAt(0)) ? "rtl" : "ltr";
};

// Custom link component for Markdown
const MarkdownLink = ({ href, children, isUserMessage }: { href?: string; children: React.ReactNode; isUserMessage: boolean }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`underline hover:no-underline transition-colors font-medium ${
      isUserMessage
        ? "text-blue-100 hover:text-white"
        : "text-blue-600 hover:text-blue-800"
    }`}
  >
    {children}
  </a>
);

export default function ChatWidget() {
  const [userName, setUserName] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [inputDirection, setInputDirection] = useState<"ltr" | "rtl">("ltr");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedRoomForOptions, setSelectedRoomForOptions] = useState<RoomOption | null>(null);
  const [selectedFattalRoom, setSelectedFattalRoom] = useState<FattalRoom | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Listen for agent messages forwarded from parent via postMessage
  useEffect(() => {
    const handleParentMessage = (event: MessageEvent) => {
      
      // For cross-origin embedding, accept messages with valid widget message types
      // from any origin (since we validate the message type and structure)
      const hasValidMessageType = event.data?.type && 
        Object.values(ChatWidgetMessageType).includes(event.data.type);
      
      // Accept messages if they have valid message types (secure approach)
      if (!hasValidMessageType) {
        return;
      }

      if (event.data?.type === ChatWidgetMessageType.AGENT_MESSAGE) {

        // Add the agent message to the chat
        const agentMessage: Message = {
          id: Date.now().toString() + "-agent",
          text: event.data.message,
          sender: "bot",
          timestamp: new Date(),
          direction: detectTextDirection(event.data.message),
          roomOptions: event.data.roomOptions,
          hotelOptions: event.data.hotelOptions,
          roomSearchResults: event.data.roomSearchResults,
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

  // Adjust widget size when room options or hotel options are displayed
  useEffect(() => {
    const hasRoomOptions = messages.some(msg => msg.roomOptions && msg.roomOptions.length > 0);
    const hasHotelOptions = messages.some(msg => msg.hotelOptions && msg.hotelOptions.length > 0);
    const hasRoomSearchResults = messages.some(msg => msg.roomSearchResults && msg.roomSearchResults.length > 0);
    const showingOptionsView = selectedRoomForOptions !== null;
    const showingFattalRoomDetail = selectedFattalRoom !== null;

    // Send resize request to parent window
    if (window.parent && window.parent !== window) {
      let newHeight = 500;
      let newWidth = 350;

      if (showingOptionsView || showingFattalRoomDetail) {
        // Larger size for options/detail view
        newHeight = 700;
        newWidth = 420;
      } else if (hasRoomOptions || hasHotelOptions || hasRoomSearchResults) {
        // Medium size for room/hotel carousel
        newHeight = 650;
        newWidth = 420;
      }

      window.parent.postMessage({
        type: 'CHAT_WIDGET_RESIZE',
        height: newHeight,
        width: newWidth
      }, '*');
    }
  }, [messages, selectedRoomForOptions, selectedFattalRoom]);

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
          type: ChatWidgetMessageType.SEND_MESSAGE,
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

    // Refocus input field after sending message
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
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
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
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

  // Handle viewing room options
  const handleViewRoomOptions = (room: RoomOption) => {
    setSelectedRoomForOptions(room);
  };

  // Handle back from options view
  const handleBackFromOptions = () => {
    setSelectedRoomForOptions(null);
  };

  // Handle hotel selection (send hotel name as message)
  const handleSelectHotel = async (hotel: FattalHotel) => {
    if (isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: hotel.hotelName,
      sender: "user",
      timestamp: new Date(),
      direction: detectTextDirection(hotel.hotelName),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Send message to API
    const botReply = await sendMessageToAPI(hotel.hotelName, userName);
    if (botReply) {
      setMessages((prev) => [...prev, botReply]);
    }
    setIsLoading(false);
  };

  // Handle Fattal room selection - open detail view
  const handleSelectFattalRoom = (room: FattalRoom) => {
    setSelectedFattalRoom(room);
  };

  // Handle back from Fattal room detail view
  const handleBackFromFattalRoom = () => {
    setSelectedFattalRoom(null);
  };

  // Handle Fattal room booking confirmation
  const handleConfirmFattalRoom = async (
    room: FattalRoom,
    selectedPackage: FattalRoomPackage,
    selectedPrice: FattalPackagePrice,
    isClubMember: boolean
  ) => {
    if (isLoading) return;

    const formatPrice = (amount: number) => new Intl.NumberFormat('he-IL').format(Math.ceil(amount));
    const displayPrice = isClubMember && selectedPrice.clubTotalPrice
      ? selectedPrice.clubTotalPrice
      : selectedPrice.totalPrice;

    const selectionMessage = `אני מעוניין להזמין:\n` +
      `חדר: ${room.name}\n` +
      `חבילה: ${selectedPackage.packageName}\n` +
      `סוג אירוח: ${selectedPrice.hostingBase}\n` +
      `${isClubMember ? 'חבר מועדון: כן\n' : ''}` +
      `מחיר: ${formatPrice(displayPrice)} ₪`;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: selectionMessage,
      sender: "user",
      timestamp: new Date(),
      direction: "rtl",
    };

    setMessages((prev) => [...prev, userMessage]);
    setSelectedFattalRoom(null);
    setIsLoading(true);

    // Send message to API
    const botReply = await sendMessageToAPI(selectionMessage, userName);
    if (botReply) {
      setMessages((prev) => [...prev, botReply]);
    }
    setIsLoading(false);
  };

  // Handle room option confirmation with quantity
  const handleConfirmRoomOption = async (room: RoomOption, option: RoomOptionDetail, quantity: number) => {
    if (isLoading) return;

    const formatPrice = (amount: number) => new Intl.NumberFormat('en-US').format(amount);
    const totalPrice = formatPrice(option.offer.price.amount * quantity);

    const selectionMessage = `I would like to book:\n` +
      `${room.name}\n` +
      `${option.offer.name || 'Standard Rate'}\n` +
      `Quantity: ${quantity} room${quantity > 1 ? 's' : ''}\n` +
      `Total: ₪${totalPrice} ${option.offer.price.currencyCode}`;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: selectionMessage,
      sender: "user",
      timestamp: new Date(),
      direction: "ltr",
    };

    setMessages((prev) => [...prev, userMessage]);
    setSelectedRoomForOptions(null); // Close options view
    setIsLoading(true);

    try {
      // Get companyId and conversationId from parent window
      const parentWindow = window.parent as Window & {
        __CHATWIDGET__?: {
          getConversationId?: () => string | null;
        };
      };

      const conversationId = parentWindow.__CHATWIDGET__?.getConversationId?.();

      if (!conversationId) {
        throw new Error('Conversation ID not available');
      }

      // Extract companyId from script element (same logic as chat-widget.js)
      const getCompanyId = () => {
        const widgetScript = parentWindow.document?.getElementById('ersona-chat-widget') as HTMLScriptElement | null;
        if (widgetScript?.dataset?.companyId) {
          return widgetScript.dataset.companyId;
        }

        const anyWidgetScript = parentWindow.document?.querySelector('script[data-company-id]') as HTMLScriptElement | null;
        if (anyWidgetScript?.dataset?.companyId) {
          return anyWidgetScript.dataset.companyId;
        }

        return 'default';
      };

      const companyId = getCompanyId();

      // Call checkout endpoint
      const checkoutResponse = await fetch('/api/widget/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId,
          conversationId,
          signature: option.signature,
          quantity,
        }),
      });

      if (!checkoutResponse.ok) {
        const errorData = await checkoutResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create checkout');
      }

      const { checkoutLink } = await checkoutResponse.json();

      // Display checkout link as a bot message
      const checkoutMessage: Message = {
        id: Date.now().toString() + "-checkout",
        text: `Great! Your booking is ready. Click the link below to complete your reservation:\n\n${checkoutLink}`,
        sender: "bot",
        timestamp: new Date(),
        direction: "ltr",
      };

      setMessages((prev) => [...prev, checkoutMessage]);

    } catch (error) {
      console.error('Checkout error:', error);

      // Display error message to user
      const errorMessage: Message = {
        id: Date.now().toString() + "-checkout-error",
        text: "I'm sorry, there was an error creating your checkout link. Please try again or contact support.",
        sender: "bot",
        timestamp: new Date(),
        direction: "ltr",
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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
            <div key={message.id}>
              {/* Hotel Carousel (Fattal) */}
              {message.hotelOptions && message.hotelOptions.length > 0 && (
                <HotelCarousel hotels={message.hotelOptions} onSelectHotel={handleSelectHotel} />
              )}

              {/* Fattal Room Carousel or Detail View */}
              {message.roomSearchResults && message.roomSearchResults.length > 0 && (
                <>
                  {selectedFattalRoom ? (
                    <FattalRoomDetailView
                      room={selectedFattalRoom}
                      onConfirm={handleConfirmFattalRoom}
                      onBack={handleBackFromFattalRoom}
                    />
                  ) : (
                    <FattalRoomCarousel rooms={message.roomSearchResults} onSelectRoom={handleSelectFattalRoom} />
                  )}
                </>
              )}

              {/* Room Carousel or Options View (SimpleBooking) */}
              {message.roomOptions && message.roomOptions.length > 0 && (
                <>
                  {selectedRoomForOptions ? (
                    <RoomOptionsView
                      room={selectedRoomForOptions}
                      onConfirm={handleConfirmRoomOption}
                      onBack={handleBackFromOptions}
                    />
                  ) : (
                    <RoomCarousel rooms={message.roomOptions} onViewRoomOptions={handleViewRoomOptions} />
                  )}
                </>
              )}

              {/* Message Bubble */}
              <motion.div
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
                  <div className="text-sm prose prose-sm max-w-none [&>p]:m-0 [&>ul]:m-0 [&>ol]:m-0 [&>p+p]:mt-2 whitespace-pre-wrap">
                    <Markdown
                      components={{
                        a: ({ href, children }) => (
                          <MarkdownLink href={href} isUserMessage={message.sender === "user"}>
                            {children}
                          </MarkdownLink>
                        ),
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                      }}
                    >
                      {message.text}
                    </Markdown>
                  </div>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </motion.div>
            </div>
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
            onKeyDown={handleKeyDown}
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

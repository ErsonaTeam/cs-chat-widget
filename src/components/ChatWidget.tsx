"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuSendHorizontal } from "react-icons/lu";
import Image from "next/image";
import Markdown from "react-markdown";
import LoadingSpinner from "./LoadingSpinner";
import { ChatWidgetMessageType, FattalHotel, FattalRoom, FattalRoomPackage, FattalPackagePrice } from "@/types/message-types";
import HotelCarousel from "./HotelCarousel";
import FattalRoomCarousel from "./FattalRoomCarousel";
import FattalRoomDetailView from "./FattalRoomDetailView";
import { validatePhone, formatPhoneForStorage } from "@/utils/phone";
import { Language, t, formatPrice as formatPriceI18n, parseLanguageCode } from "@/utils/i18n";

// ============================================
// WIDGET CONFIGURATION - Quick settings
// ============================================
const WIDGET_CONFIG = {
  // UI Direction: "rtl" for Hebrew/Arabic, "ltr" for English
  direction: "rtl" as "rtl" | "ltr",

  // UI Text (Hebrew)
  text: {
    welcomeTitle: "ברוכים הבאים לבת שלמה",
    headerTitle: "The Farmhouse",
    nameLabel: "נא להזין את שמך:",
    namePlaceholder: "השם שלך...",
    phoneLabel: "מספר טלפון (אופציונלי):",
    phonePlaceholder: "54-806-0982",
    phoneError: "מספר טלפון לא תקין",
    startChat: "התחל צ׳אט",
    resetButton: "איפוס",
    inputPlaceholder: "הקלד הודעה...",
    loadingPlaceholder: "ממתין לתשובה...",
  },

  // Country codes for phone input
  countryCodes: [
    { code: "972", label: "🇮🇱 +972", country: "Israel" },
    { code: "1", label: "🇺🇸 +1", country: "USA" },
    { code: "44", label: "🇬🇧 +44", country: "UK" },
    { code: "49", label: "🇩🇪 +49", country: "Germany" },
    { code: "33", label: "🇫🇷 +33", country: "France" },
    { code: "39", label: "🇮🇹 +39", country: "Italy" },
    { code: "34", label: "🇪🇸 +34", country: "Spain" },
    { code: "31", label: "🇳🇱 +31", country: "Netherlands" },
    { code: "41", label: "🇨🇭 +41", country: "Switzerland" },
    { code: "43", label: "🇦🇹 +43", country: "Austria" },
  ],

  // Logo URL
  logoUrl: "https://cdn.sbcdn.it/fu/newbooking_tmpl/3407191_IMG_ALG.png",
};
// ============================================

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  direction: "ltr" | "rtl";
  hotelOptions?: FattalHotel[];
  roomSearchResults?: FattalRoom[];
  languageCode?: string;
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
        ? "text-fattalNavy/80 hover:text-fattalNavy"
        : "text-fattalNavy font-semibold hover:text-fattalNavy/80"
    }`}
  >
    {children}
  </a>
);

export default function ChatWidget() {
  const [userName, setUserName] = useState<string>("");
  const [userPhone, setUserPhone] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");
  const [phoneInput, setPhoneInput] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");
  const [countryCode, setCountryCode] = useState<string>("972");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [inputDirection, setInputDirection] = useState<"ltr" | "rtl">("ltr");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedFattalRoom, setSelectedFattalRoom] = useState<FattalRoom | null>(null);
  const [currentLang, setCurrentLang] = useState<Language>('HE');
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
          hotelOptions: event.data.hotelOptions,
          roomSearchResults: event.data.roomSearchResults,
          languageCode: event.data.languageCode,
        };

        // Update current language if provided in message
        if (event.data.languageCode) {
          setCurrentLang(parseLanguageCode(event.data.languageCode));
        }

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

  // Adjust widget size when hotel options or room search results are displayed
  useEffect(() => {
    const hasHotelOptions = messages.some(msg => msg.hotelOptions && msg.hotelOptions.length > 0);
    const hasRoomSearchResults = messages.some(msg => msg.roomSearchResults && msg.roomSearchResults.length > 0);
    const showingFattalRoomDetail = selectedFattalRoom !== null;

    // Send resize request to parent window
    if (window.parent && window.parent !== window) {
      let newHeight = 500;
      let newWidth = 350;

      if (showingFattalRoomDetail) {
        // Larger size for detail view
        newHeight = 700;
        newWidth = 420;
      } else if (hasHotelOptions || hasRoomSearchResults) {
        // Medium size for hotel/room carousel
        newHeight = 650;
        newWidth = 420;
      }

      window.parent.postMessage({
        type: 'CHAT_WIDGET_RESIZE',
        height: newHeight,
        width: newWidth
      }, '*');
    }
  }, [messages, selectedFattalRoom]);

  // Handle name submission
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    // Validate phone if provided
    let formattedPhone = '';
    if (phoneInput.trim()) {
      if (!validatePhone(phoneInput, countryCode)) {
        setPhoneError(WIDGET_CONFIG.text.phoneError);
        return;
      }
      formattedPhone = formatPhoneForStorage(phoneInput, countryCode);
    }

    setUserName(nameInput.trim());
    setUserPhone(formattedPhone);

    // Add first welcome message when user first enters their name
    const firstWelcomeMessage: Message = {
      id: Date.now().toString() + "-welcome-1",
      text: `שלום ${
        nameInput.trim().charAt(0).toUpperCase() + nameInput.trim().slice(1)
      }! 👋 ברוכים הבאים לבת שלמה!`,
      sender: "bot",
      timestamp: new Date(),
      direction: "rtl",
    };

    setMessages([firstWelcomeMessage]);

    // Add second welcome message with a delay
    setTimeout(() => {
      const secondWelcomeMessage: Message = {
        id: Date.now().toString() + "-welcome-2",
        text: "אני כאן כדי לעזור לך בכל שאלה. אל תהסס לשאול!",
        sender: "bot",
        timestamp: new Date(),
        direction: "rtl",
      };

      setMessages((prev) => [...prev, secondWelcomeMessage]);
    }, 1500);
  };

  // Send message to API and get bot response
  const sendMessageToAPI = async (
    message: string,
    userName: string,
    userPhone: string
  ): Promise<Message | null> => {
    try {
      // Use the widget messaging system for iframe communication
      if (typeof window !== 'undefined' && window.parent && window.parent !== window) {

        // Use postMessage for iframe-to-parent communication
        window.parent.postMessage({
          type: ChatWidgetMessageType.SEND_MESSAGE,
          message: message,
          userName: userName,
          userPhone: userPhone,
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
    const botReply = await sendMessageToAPI(messageText, userName, userPhone);
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
    setUserPhone("");
    setMessages([]);
    setNameInput("");
    setPhoneInput("");
    setPhoneError("");
    setCountryCode("972");
    setIsLoading(false);
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
    const botReply = await sendMessageToAPI(hotel.hotelName, userName, userPhone);
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

    const displayPrice = isClubMember && selectedPrice.clubTotalPrice
      ? selectedPrice.clubTotalPrice
      : selectedPrice.totalPrice;

    const selectionMessage = `${t(currentLang, 'bookingIntro')}\n` +
      `${t(currentLang, 'roomLabel')}: ${room.name}\n` +
      `${t(currentLang, 'packageLabel')}: ${selectedPackage.packageName}\n` +
      `${t(currentLang, 'hostingTypeLabel')}: ${selectedPrice.hostingBase}\n` +
      `${isClubMember ? t(currentLang, 'clubMemberYes') + '\n' : ''}` +
      `${t(currentLang, 'priceLabel')}: ${formatPriceI18n(displayPrice, currentLang)} ₪`;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: selectionMessage,
      sender: "user",
      timestamp: new Date(),
      direction: currentLang === 'HE' ? "rtl" : "ltr",
    };

    setMessages((prev) => [...prev, userMessage]);
    setSelectedFattalRoom(null);
    setIsLoading(true);

    // Send message to API
    const botReply = await sendMessageToAPI(selectionMessage, userName, userPhone);
    if (botReply) {
      setMessages((prev) => [...prev, botReply]);
    }
    setIsLoading(false);
  };

  // Name input screen - Fattal branded
  if (!userName) {
    return (
      <div dir={WIDGET_CONFIG.direction} className="flex flex-col h-full rounded-2xl overflow-hidden shadow-xl">
        {/* Header - thin with logo */}
        <div className="bg-fattalNavy py-2 px-4 flex items-center justify-center gap-2">
          <Image
            src={WIDGET_CONFIG.logoUrl}
            priority={true}
            alt="Fattal Logo"
            width={24}
            height={24}
            className="object-contain"
          />
          <h2 className="text-lg font-bold text-white">
            {WIDGET_CONFIG.text.welcomeTitle}
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-fattalCream">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2 text-fattalNavy">
                  {WIDGET_CONFIG.text.nameLabel}
                </label>
                <input
                  id="name"
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-fattalNavy/20 rounded-xl
                           bg-white text-fattalNavy focus:outline-none focus:border-fattalGold
                           placeholder:text-fattalNavy/50"
                  placeholder={WIDGET_CONFIG.text.namePlaceholder}
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2 text-fattalNavy">
                  {WIDGET_CONFIG.text.phoneLabel}
                </label>
                <div className="flex gap-2" dir="ltr">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="px-2 py-3 bg-fattalNavy/10 border-2 border-fattalNavy/20 rounded-xl
                             text-fattalNavy font-medium text-sm focus:outline-none focus:border-fattalGold
                             cursor-pointer appearance-none bg-no-repeat bg-right pr-6"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%231e3a5f'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundSize: '16px',
                      backgroundPosition: 'right 4px center',
                    }}
                  >
                    {WIDGET_CONFIG.countryCodes.map((cc) => (
                      <option key={cc.code} value={cc.code}>
                        {cc.label}
                      </option>
                    ))}
                  </select>
                  <input
                    id="phone"
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => {
                      setPhoneInput(e.target.value);
                      setPhoneError("");
                    }}
                    className="flex-1 px-4 py-3 border-2 border-fattalNavy/20 rounded-xl
                             bg-white text-fattalNavy focus:outline-none focus:border-fattalGold
                             placeholder:text-fattalNavy/50"
                    placeholder={WIDGET_CONFIG.text.phonePlaceholder}
                  />
                </div>
                {phoneError && (
                  <p className="text-red-500 text-xs mt-1 text-right">{phoneError}</p>
                )}
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-fattalGold hover:bg-fattalGold/90 text-white font-semibold py-3 px-4
                          rounded-xl transition-colors shadow-md"
              >
                {WIDGET_CONFIG.text.startChat}
              </motion.button>
            </form>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="bg-white py-2 px-4 text-center border-t border-fattalNavy/10">
          <p className="text-xs text-fattalNavy/60">
            Powered by{" "}
            <a
              href="https://ersona.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fattalGold hover:text-fattalGold/80 transition-colors font-medium"
            >
              Ersona
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Chat interface - Fattal branded
  return (
    <div dir={WIDGET_CONFIG.direction} className="flex flex-col h-full rounded-2xl overflow-hidden shadow-xl">
      {/* Header - Navy background, thin */}
      <div className="flex items-center justify-between py-2 px-4 bg-fattalNavy">
        <h3 className="font-semibold flex items-center gap-2 text-white text-sm">
          <Image
            src={WIDGET_CONFIG.logoUrl}
            priority={true}
            alt="Fattal Logo"
            width={24}
            height={24}
            className="object-contain"
          />
          <span>{WIDGET_CONFIG.text.headerTitle}</span>
        </h3>
        <button
          onClick={resetChat}
          className="text-sm text-white/80 hover:text-white transition-colors"
        >
          {WIDGET_CONFIG.text.resetButton}
        </button>
      </div>

      {/* Messages - Cream background */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-fattalCream">
        <AnimatePresence>
          {messages.map((message) => (
            <div key={message.id}>
              {/* Hotel Carousel (Fattal) */}
              {message.hotelOptions && message.hotelOptions.length > 0 && (
                <HotelCarousel hotels={message.hotelOptions} onSelectHotel={handleSelectHotel} lang={currentLang} />
              )}

              {/* Fattal Room Carousel or Detail View */}
              {message.roomSearchResults && message.roomSearchResults.length > 0 && (
                <>
                  {selectedFattalRoom ? (
                    <FattalRoomDetailView
                      room={selectedFattalRoom}
                      onConfirm={handleConfirmFattalRoom}
                      onBack={handleBackFromFattalRoom}
                      lang={currentLang}
                    />
                  ) : (
                    <FattalRoomCarousel rooms={message.roomSearchResults} onSelectRoom={handleSelectFattalRoom} lang={currentLang} />
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
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                    message.sender === "user"
                      ? "bg-fattalGold text-fattalNavy"
                      : "bg-white text-fattalNavy border border-fattalNavy/10"
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
                  <p className={`text-xs mt-2 ${
                    message.sender === "user" ? "text-fattalNavy/60" : "text-fattalNavy/50"
                  }`}>
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
              className="flex justify-start"
            >
              <LoadingSpinner />
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input - White background */}
      <div className="p-4 bg-white border-t border-fattalNavy/10">
        <form onSubmit={handleMessageSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            dir={inputDirection}
            disabled={isLoading}
            className="flex-1 px-4 py-3 border-2 border-fattalNavy/20 rounded-xl
                     bg-white text-fattalNavy focus:outline-none focus:border-fattalGold
                     text-sm placeholder:text-fattalNavy/40
                     disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder={
              isLoading ? WIDGET_CONFIG.text.loadingPlaceholder : WIDGET_CONFIG.text.inputPlaceholder
            }
          />
          <motion.button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-fattalGold hover:bg-fattalGold/90 text-white font-medium p-3
                     rounded-xl transition-colors flex items-center justify-center
                     disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <LuSendHorizontal className="w-5 h-5" />
          </motion.button>
        </form>
      </div>

      {/* Footer */}
      <div className="py-2 px-4 bg-white text-center">
        <p className="text-xs text-fattalNavy/50">
          Powered by{" "}
          <a
            href="https://ersona.co"
            target="_blank"
            rel="noopener noreferrer"
            className="text-fattalGold hover:text-fattalGold/80 transition-colors font-medium"
          >
            Ersona
          </a>
        </p>
      </div>
    </div>
  );
}

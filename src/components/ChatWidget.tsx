"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuSendHorizontal } from "react-icons/lu";
import Image from "next/image";
import Markdown from "react-markdown";
import LoadingSpinner from "./LoadingSpinner";
import { ChatWidgetMessageType, FattalHotel, FattalRoom, FattalRoomPackage, FattalPackagePrice, WidgetListing, WidgetFormId, WidgetGallery } from "@/types/message-types";
import HotelCarousel from "./HotelCarousel";
import FattalRoomCarousel from "./FattalRoomCarousel";
import FattalRoomDetailView from "./FattalRoomDetailView";
import ListingCarousel from "./ListingCarousel";
import ListingDetailView from "./ListingDetailView";
import ContactForm from "./ContactForm";
import GuestDetailsForm from "./GuestDetailsForm";
import FattalIdCollectForm from "./FattalIdCollectForm";
import FattalOtpVerifyForm from "./FattalOtpVerifyForm";
import FattalCancellationForm from "./FattalCancellationForm";
import FattalContactUpdateForm from "./FattalContactUpdateForm";
import GalleryCard from "./GalleryCard";
import GalleryLightbox from "./GalleryLightbox";
import { Language, t, formatPrice as formatPriceI18n, parseLanguageCode } from "@/utils/i18n";
import { getTheme } from "@/config/theme-config";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  direction: "ltr" | "rtl";
  hotelOptions?: FattalHotel[];
  roomSearchResults?: FattalRoom[];
  listingOptions?: WidgetListing[];
  formId?: string;
  formData?: Record<string, unknown>;
  languageCode?: string;
  gallery?: WidgetGallery | null;
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
        ? "text-primary/80 hover:text-primary"
        : "text-primary font-semibold hover:text-primary/80"
    }`}
  >
    {children}
  </a>
);

interface ChatWidgetProps {
  theme?: string | null;
  lang?: string | null;
}

export default function ChatWidget({ theme: themeId, lang: langProp }: ChatWidgetProps) {
  const widgetTheme = getTheme(themeId);
  const initialLang: Language = langProp
    ? parseLanguageCode(langProp)
    : widgetTheme.direction === 'rtl' ? 'HE' : 'EN';

  const [userName, setUserName] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedFattalRooms, setSelectedFattalRooms] = useState<Map<number, FattalRoom>>(new Map());
  const [selectedListing, setSelectedListing] = useState<WidgetListing | null>(null);
  const [lightbox, setLightbox] = useState<{ gallery: WidgetGallery; index: number } | null>(null);
  const [currentLang, setCurrentLang] = useState<Language>(initialLang);
  const themeText = widgetTheme.text[currentLang];
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Apply theme CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', widgetTheme.colors.primary);
    root.style.setProperty('--theme-primary-light', widgetTheme.colors.primaryLight);
    root.style.setProperty('--theme-accent', widgetTheme.colors.accent);
    root.style.setProperty('--theme-background', widgetTheme.colors.background);
    root.style.setProperty('--theme-accent-light', widgetTheme.colors.accentLight);
  }, [widgetTheme]);

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
          listingOptions: event.data.listingOptions,
          formId: event.data.formId,
          formData: event.data.formData,
          languageCode: event.data.languageCode,
          gallery: event.data.gallery,
        };

        // Update current language if provided in message
        if (event.data.languageCode) {
          setCurrentLang(parseLanguageCode(event.data.languageCode));
        }

        setMessages((prev) => [...prev, agentMessage]);
        setIsLoading(false);

        // Refocus input field after agent response
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
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
    const hasListingOptions = messages.some(msg => msg.listingOptions && msg.listingOptions.length > 0);
    const hasGallery = messages.some(msg => Boolean(msg.gallery));
    const showingFattalRoomDetail = selectedFattalRooms.size > 0;
    const showingListingDetail = selectedListing !== null;

    // Send resize request to parent window
    if (window.parent && window.parent !== window) {
      let newHeight = 500;
      let newWidth = 350;

      if (showingFattalRoomDetail || showingListingDetail) {
        // Larger size for detail view
        newHeight = 700;
        newWidth = 420;
      } else if (hasHotelOptions || hasRoomSearchResults || hasListingOptions || hasGallery) {
        // Medium size for carousel / gallery card
        newHeight = 650;
        newWidth = 420;
      }

      window.parent.postMessage({
        type: 'CHAT_WIDGET_RESIZE',
        height: newHeight,
        width: newWidth
      }, '*');
    }
  }, [messages, selectedFattalRooms, selectedListing]);

  // Handle name submission
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    setUserName(nameInput.trim());

    const welcome = widgetTheme.welcomeMessage(nameInput.trim());
    const welcomeMessage: Message = {
      id: Date.now().toString() + "-welcome",
      text: welcome.text,
      sender: "bot",
      timestamp: new Date(),
      direction: welcome.direction,
    };

    setMessages([welcomeMessage]);
  };

  // Send message to API and get bot response
  const sendMessageToAPI = async (
    message: string,
    userName: string,
    formData?: Record<string, string | boolean>,
  ): Promise<Message | null> => {
    try {
      // Use the widget messaging system for iframe communication
      if (typeof window !== 'undefined' && window.parent && window.parent !== window) {

        // Use postMessage for iframe-to-parent communication
        window.parent.postMessage({
          type: ChatWidgetMessageType.SEND_MESSAGE,
          message: message,
          userName: userName,
          ...(formData ? { formData } : {}),
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
    const messageText = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    // Keep focus on input for continued typing
    setTimeout(() => inputRef.current?.focus(), 0);

    const botReply = await sendMessageToAPI(messageText, userName);
    if (botReply) {
      // Only add bot reply if it's not null (null means handled via widget system)
      setMessages((prev) => [...prev, botReply]);
      setIsLoading(false);
    }
    // When botReply is null (iframe mode), isLoading stays true until AGENT_MESSAGE arrives
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
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
    setSelectedFattalRooms(new Map());
    setSelectedListing(null);
    // Notify parent page to clear conversationId and stop polling
    window.parent.postMessage({ type: ChatWidgetMessageType.RESET_CHAT }, '*');
  };

  // Resolve the user-visible message based on formType
  const getFormSubmittedMessage = (formData: Record<string, string | boolean>): string => {
    const formType = formData.formType as string | undefined;
    switch (formType) {
      case WidgetFormId.FATTAL_ID_COLLECT:
        return t(currentLang, 'fattalIdSubmitted');
      case WidgetFormId.FATTAL_OTP_VERIFY:
        return t(currentLang, 'fattalOtpSubmitted');
      case WidgetFormId.FATTAL_CANCELLATION_CONFIRM:
        return formData.confirmed
          ? t(currentLang, 'fattalCancelConfirmed')
          : t(currentLang, 'fattalCancelDeclined');
      case WidgetFormId.FATTAL_CONTACT_UPDATE:
        return t(currentLang, 'fattalContactUpdateSubmitted');
      case WidgetFormId.GUESTY_GUEST_DETAILS:
        return t(currentLang, 'guestyGuestDetailsSubmitted');
      default:
        return t(currentLang, 'contactFormSubmitted');
    }
  };

  // Handle contact form submission
  const handleContactFormSubmit = async (formData: Record<string, string | boolean>) => {
    if (isLoading) return;

    const submittedMessage = getFormSubmittedMessage(formData);
    const userMessage: Message = {
      id: Date.now().toString(),
      text: submittedMessage,
      sender: "user",
      timestamp: new Date(),
      direction: detectTextDirection(submittedMessage),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const botReply = await sendMessageToAPI(submittedMessage, userName, formData);
    if (botReply) {
      setMessages((prev) => [...prev, botReply]);
      setIsLoading(false);
    }
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
      setIsLoading(false);
    }
  };

  // Handle Fattal room selection - open detail view for a specific carousel (by message index)
  const handleSelectFattalRoom = (messageIndex: number, room: FattalRoom) => {
    setSelectedFattalRooms((prev) => {
      const next = new Map(prev);
      next.set(messageIndex, room);
      return next;
    });
  };

  // Handle back from Fattal room detail view for a specific carousel
  const handleBackFromFattalRoom = (messageIndex: number) => {
    setSelectedFattalRooms((prev) => {
      const next = new Map(prev);
      next.delete(messageIndex);
      return next;
    });
  };

  // Handle Fattal room booking confirmation for a specific carousel
  const handleConfirmFattalRoom = async (
    messageIndex: number,
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
    setSelectedFattalRooms((prev) => {
      const next = new Map(prev);
      next.delete(messageIndex);
      return next;
    });
    setIsLoading(true);

    // Send message to API
    const botReply = await sendMessageToAPI(selectionMessage, userName);
    if (botReply) {
      setMessages((prev) => [...prev, botReply]);
      setIsLoading(false);
    }
  };

  // Handle listing detail view
  const handleViewListingDetails = (listing: WidgetListing) => {
    setSelectedListing(listing);
  };

  // Handle back from listing detail view
  const handleBackFromListingDetail = () => {
    setSelectedListing(null);
  };

  // Handle listing selection (send listing name as message)
  const handleSelectListing = async (listing: WidgetListing) => {
    if (isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: listing.name,
      sender: "user",
      timestamp: new Date(),
      direction: detectTextDirection(listing.name),
    };

    setMessages((prev) => [...prev, userMessage]);
    setSelectedListing(null);
    setIsLoading(true);

    const botReply = await sendMessageToAPI(listing.name, userName);
    if (botReply) {
      setMessages((prev) => [...prev, botReply]);
      setIsLoading(false);
    }
  };

  if (!userName) {
    return (
      <div dir={widgetTheme.direction} className="flex flex-col h-full sm:rounded-2xl overflow-hidden sm:shadow-xl">
        <div className="bg-primary py-2 px-4 flex items-center gap-3">
          <Image
            src={widgetTheme.logoUrl}
            priority={true}
            alt="Logo"
            width={widgetTheme.logoSize.width}
            height={widgetTheme.logoSize.height}
            className="object-contain"
          />
          <h2 className="text-lg font-bold text-white">
            {themeText.welcomeTitle}
          </h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-surface">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2 text-primary">
                  {themeText.nameLabel}
                </label>
                <input
                  id="name"
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-primary/20 rounded-xl
                           bg-white text-primary focus:outline-none focus:border-accent
                           placeholder:text-primary/50"
                  placeholder={themeText.namePlaceholder}
                  autoFocus
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 px-4
                          rounded-xl transition-colors shadow-md"
              >
                {themeText.startChat}
              </motion.button>
            </form>
          </motion.div>
        </div>

        <div className="bg-white py-2 px-4 text-center border-t border-primary/10">
          <p className="text-xs text-primary/60">
            Powered by{" "}
            <a
              href="https://ersona.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent/80 transition-colors font-medium"
            >
              Ersona
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div dir={widgetTheme.direction} className="flex flex-col h-full rounded-2xl overflow-hidden shadow-xl">
      <div className="flex items-center justify-between py-2 px-4 bg-primary">
        <h3 className="font-semibold flex items-center gap-2 text-white text-sm">
          <Image
            src={widgetTheme.logoUrl}
            priority={true}
            alt="Logo"
            width={24}
            height={24}
            className="object-contain"
          />
          <span>{themeText.headerTitle}</span>
        </h3>
        <button
          onClick={resetChat}
          className="text-sm text-white/80 hover:text-white transition-colors"
        >
          {themeText.resetButton}
        </button>
      </div>

      {/* Messages - Cream background */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 bg-surface" style={{ WebkitOverflowScrolling: "touch" }}>
        <AnimatePresence>
          {messages.map((message, index) => (
            <div key={message.id}>
              {/* Message Bubble — skipped when text is empty AND we have rich content (e.g. gallery-only message) */}
              {(message.text?.trim() || (!message.gallery && !message.hotelOptions?.length && !message.listingOptions?.length && !message.roomSearchResults?.length && !message.formId)) && (
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
                        ? "bg-accent text-primary"
                        : "bg-white text-primary border border-primary/10"
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
                      message.sender === "user" ? "text-primary/60" : "text-primary/50"
                    }`}>
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Form rendering based on formId */}
              {message.formId === WidgetFormId.CONTACT_INFO && (
                <ContactForm
                  lang={currentLang}
                  onSubmit={handleContactFormSubmit}
                  disabled={isLoading}
                />
              )}
              {message.formId === WidgetFormId.FATTAL_ID_COLLECT && (
                <FattalIdCollectForm
                  lang={currentLang}
                  onSubmit={handleContactFormSubmit}
                  disabled={isLoading}
                />
              )}
              {message.formId === WidgetFormId.FATTAL_OTP_VERIFY && (
                <FattalOtpVerifyForm
                  lang={currentLang}
                  onSubmit={handleContactFormSubmit}
                  disabled={isLoading}
                />
              )}
              {message.formId === WidgetFormId.FATTAL_CANCELLATION_CONFIRM && (
                <FattalCancellationForm
                  lang={currentLang}
                  onSubmit={handleContactFormSubmit}
                  disabled={isLoading}
                  formData={message.formData as React.ComponentProps<typeof FattalCancellationForm>["formData"]}
                />
              )}
              {message.formId === WidgetFormId.FATTAL_CONTACT_UPDATE && (
                <FattalContactUpdateForm
                  lang={currentLang}
                  onSubmit={handleContactFormSubmit as React.ComponentProps<typeof FattalContactUpdateForm>["onSubmit"]}
                  disabled={isLoading}
                  formData={message.formData as React.ComponentProps<typeof FattalContactUpdateForm>["formData"]}
                />
              )}
              {message.formId === WidgetFormId.GUESTY_GUEST_DETAILS && (
                <GuestDetailsForm
                  lang={currentLang}
                  onSubmit={handleContactFormSubmit}
                  disabled={isLoading}
                  formData={message.formData as React.ComponentProps<typeof GuestDetailsForm>["formData"]}
                />
              )}

              {/* Hotel Carousel (Fattal) */}
              {message.hotelOptions && message.hotelOptions.length > 0 && (
                <HotelCarousel hotels={message.hotelOptions} onSelectHotel={handleSelectHotel} lang={currentLang} />
              )}

              {/* Fattal Room Carousel or Detail View */}
              {message.roomSearchResults && message.roomSearchResults.length > 0 && (
                <>
                  {selectedFattalRooms.get(index) ? (
                    <FattalRoomDetailView
                      room={selectedFattalRooms.get(index)!}
                      onConfirm={(room, pkg, price, isClubMember) => handleConfirmFattalRoom(index, room, pkg, price, isClubMember)}
                      onBack={() => handleBackFromFattalRoom(index)}
                      lang={currentLang}
                    />
                  ) : (
                    <FattalRoomCarousel rooms={message.roomSearchResults} onSelectRoom={(room) => handleSelectFattalRoom(index, room)} lang={currentLang} />
                  )}
                </>
              )}

              {/* Listing Carousel or Detail View */}
              {message.listingOptions && message.listingOptions.length > 0 && (
                <>
                  {selectedListing ? (
                    <ListingDetailView
                      listing={selectedListing}
                      onSelect={handleSelectListing}
                      onBack={handleBackFromListingDetail}
                      lang={currentLang}
                    />
                  ) : (
                    <ListingCarousel listings={message.listingOptions} onViewDetails={handleViewListingDetails} lang={currentLang} />
                  )}
                </>
              )}

              {/* Gallery Card */}
              {message.gallery && (
                <div className="mt-2 flex justify-start">
                  <div className="max-w-xs lg:max-w-md w-full">
                    <GalleryCard
                      gallery={message.gallery}
                      lang={currentLang}
                      onOpen={(i) => setLightbox({ gallery: message.gallery!, index: i })}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
          {/* Typing indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex justify-start"
            >
              <LoadingSpinner />
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input - White background */}
      <div className="p-4 bg-white border-t border-primary/10">
        <form onSubmit={handleMessageSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            dir="auto"
            className="flex-1 px-4 py-3 border-2 border-primary/20 rounded-xl
                     bg-white text-primary focus:outline-none focus:border-accent
                     text-sm placeholder:text-primary/40"
            placeholder={themeText.inputPlaceholder}
          />
          <motion.button
            type="submit"
            disabled={!inputMessage.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-accent hover:bg-accent/90 text-white font-medium p-3
                     rounded-xl transition-colors flex items-center justify-center
                     disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <LuSendHorizontal className={`w-5 h-5 transition-transform ${widgetTheme.direction === "rtl" ? "rotate-180" : ""}`} />
          </motion.button>
        </form>
      </div>

      {/* Footer */}
      <div className="py-2 px-4 bg-white text-center">
        <p className="text-xs text-primary/50">
          Powered by:{" "}
          <a
            href="https://ersona.co"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent/80 transition-colors font-medium"
          >
            Ersona
          </a>
        </p>
      </div>

      {/* Gallery Lightbox (single instance, opened by GalleryCard clicks) */}
      {lightbox && (
        <GalleryLightbox
          gallery={lightbox.gallery}
          startIndex={lightbox.index}
          lang={currentLang}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

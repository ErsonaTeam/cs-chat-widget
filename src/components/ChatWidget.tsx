"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "./LoadingSpinner";
import {
  ChatWidgetMessageType,
  FattalHotel,
  FattalRoom,
  FattalRoomPackage,
  FattalPackagePrice,
  WidgetListing,
  WidgetFormId,
  WidgetGallery,
} from "@/types/message-types";
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
import {
  Language,
  t,
  formatPrice as formatPriceI18n,
  parseLanguageCode,
} from "@/utils/i18n";
import { getTheme } from "@/config/theme-config";
import type { WidgetConfig, QuickActionId } from "@/config/widget-config";
import { getQuickActionPrompt } from "@/config/quick-actions";

// Shell components
import WidgetShell from "./shell/WidgetShell";
import WelcomeScreen from "./shell/WelcomeScreen";
import ChatHeader from "./shell/ChatHeader";
import MessageBubble from "./shell/MessageBubble";
import Composer from "./shell/Composer";
import LanguageSelector from "./shell/LanguageSelector";

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
const HEBREW_REGEX = /[֐-׿]/;

const detectTextDirection = (text: string): "ltr" | "rtl" => {
  return HEBREW_REGEX.test(text.charAt(0)) ? "rtl" : "ltr";
};

interface ChatWidgetProps {
  config: WidgetConfig;
  langOverride?: string | null;
}

export default function ChatWidget({ config, langOverride }: ChatWidgetProps) {
  const widgetTheme = getTheme(config.selectedTheme);
  const initialLang: Language = langOverride
    ? parseLanguageCode(langOverride)
    : config.defaultLanguage;

  const [userName, setUserName] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");
  // Guest contact collected on the welcome screen (SCRUM-1089). Forwarded to the
  // encoder via formData so it can be persisted on the conversation (SCRUM-1090).
  const [collectedContact, setCollectedContact] = useState<{
    email?: string;
    phone?: string;
  }>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedFattalRooms, setSelectedFattalRooms] = useState<
    Map<number, FattalRoom>
  >(new Map());
  const [selectedListing, setSelectedListing] = useState<WidgetListing | null>(
    null
  );
  const [lightbox, setLightbox] = useState<{
    gallery: WidgetGallery;
    index: number;
  } | null>(null);
  const [currentLang, setCurrentLang] = useState<Language>(initialLang);
  const themeText = widgetTheme.text[currentLang];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Direction derived from current language
  const direction: "ltr" | "rtl" = currentLang === "HE" ? "rtl" : "ltr";

  // Listen for agent messages forwarded from parent via postMessage
  useEffect(() => {
    const handleParentMessage = (event: MessageEvent) => {
      // For cross-origin embedding, accept messages with valid widget message types
      // from any origin (since we validate the message type and structure)
      const hasValidMessageType =
        event.data?.type &&
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
      }
    };

    window.addEventListener("message", handleParentMessage);

    return () => {
      window.removeEventListener("message", handleParentMessage);
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Adjust widget size when hotel options or room search results are displayed
  useEffect(() => {
    const hasHotelOptions = messages.some(
      (msg) => msg.hotelOptions && msg.hotelOptions.length > 0
    );
    const hasRoomSearchResults = messages.some(
      (msg) => msg.roomSearchResults && msg.roomSearchResults.length > 0
    );
    const hasListingOptions = messages.some(
      (msg) => msg.listingOptions && msg.listingOptions.length > 0
    );
    const hasGallery = messages.some((msg) => Boolean(msg.gallery));
    const showingFattalRoomDetail = selectedFattalRooms.size > 0;
    const showingListingDetail = selectedListing !== null;

    // Send resize request to parent window
    if (window.parent && window.parent !== window) {
      let newHeight = 640;
      let newWidth = 380;

      if (showingFattalRoomDetail || showingListingDetail) {
        // Larger size for detail view
        newHeight = 700;
        newWidth = 420;
      } else if (hasHotelOptions || hasRoomSearchResults || hasListingOptions || hasGallery) {
        // Medium size for carousel / gallery card
        newHeight = 650;
        newWidth = 420;
      }

      window.parent.postMessage(
        {
          type: "CHAT_WIDGET_RESIZE",
          height: newHeight,
          width: newWidth,
        },
        "*"
      );
    }
  }, [messages, selectedFattalRooms, selectedListing]);

  // Send message to API and get bot response
  const sendMessageToAPI = async (
    message: string,
    senderName: string,
    formData?: Record<string, string | boolean>
  ): Promise<Message | null> => {
    try {
      // Merge welcome-screen contact (SCRUM-1089) into the outgoing formData so the
      // encoder receives the guest's email/phone. Explicit formData (e.g. booking
      // forms) takes precedence over the collected contact.
      const mergedFormData: Record<string, string | boolean> = {
        ...(collectedContact.email ? { guestEmail: collectedContact.email } : {}),
        ...(collectedContact.phone ? { guestPhone: collectedContact.phone } : {}),
        ...(formData ?? {}),
      };
      const hasFormData = Object.keys(mergedFormData).length > 0;
      // Use the widget messaging system for iframe communication
      if (
        typeof window !== "undefined" &&
        window.parent &&
        window.parent !== window
      ) {
        // Use postMessage for iframe-to-parent communication
        window.parent.postMessage(
          {
            type: ChatWidgetMessageType.SEND_MESSAGE,
            message: message,
            userName: senderName,
            ...(hasFormData ? { formData: mergedFormData } : {}),
          },
          "*"
        );

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

  // Post a user bubble and forward to encoder — shared by text submit, quick actions, hotel/listing selection
  const postUserMessage = async (text: string) => {
    const msgDirection = detectTextDirection(text);
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: new Date(),
      direction: msgDirection,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const botReply = await sendMessageToAPI(text, userName);
    if (botReply) {
      setMessages((prev) => [...prev, botReply]);
      setIsLoading(false);
    }
    // When botReply is null (iframe mode), isLoading stays true until AGENT_MESSAGE arrives
  };

  // Handle name submission (form submit — no quick action)
  const handleNameSubmit = (
    e: React.FormEvent,
    contact?: { email?: string; phone?: string }
  ) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    const name = nameInput.trim();
    setUserName(name);
    if (contact && (contact.email || contact.phone)) {
      setCollectedContact(contact);
    }

    const welcome = widgetTheme.welcomeMessage(name);
    const welcomeMessage: Message = {
      id: Date.now().toString() + "-welcome",
      text: welcome.text,
      sender: "bot",
      timestamp: new Date(),
      direction: welcome.direction,
    };

    setMessages([welcomeMessage]);
  };

  // Handle quick action from welcome screen — name + welcome bubble + quick action user bubble, then API
  const handleWelcomeQuickAction = async (id: QuickActionId) => {
    if (!nameInput.trim()) return;

    const name = nameInput.trim();
    setUserName(name);

    const welcome = widgetTheme.welcomeMessage(name);
    const welcomeMessage: Message = {
      id: Date.now().toString() + "-welcome",
      text: welcome.text,
      sender: "bot",
      timestamp: new Date(),
      direction: welcome.direction,
    };

    const prompt = getQuickActionPrompt(id, currentLang);
    const promptDir = detectTextDirection(prompt);
    const quickActionMessage: Message = {
      id: Date.now().toString() + "-qa",
      text: prompt,
      sender: "user",
      timestamp: new Date(),
      direction: promptDir,
    };

    setMessages([welcomeMessage, quickActionMessage]);
    setIsLoading(true);

    const botReply = await sendMessageToAPI(prompt, name);
    if (botReply) {
      setMessages((prev) => [...prev, botReply]);
      setIsLoading(false);
    }
  };

  // Handle message submission from Composer (no event — Composer calls onSubmit: () => void)
  const handleMessageSubmit = () => {
    if (!inputMessage.trim()) return;

    const text = inputMessage.trim();
    setInputMessage("");
    void postUserMessage(text);
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
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: ChatWidgetMessageType.RESET_CHAT }, "*");
    }
  };

  // Resolve the user-visible message based on formType
  const getFormSubmittedMessage = (
    formData: Record<string, string | boolean>
  ): string => {
    const formType = formData.formType as string | undefined;
    switch (formType) {
      case WidgetFormId.FATTAL_ID_COLLECT:
        return t(currentLang, "fattalIdSubmitted");
      case WidgetFormId.FATTAL_OTP_VERIFY:
        return t(currentLang, "fattalOtpSubmitted");
      case WidgetFormId.FATTAL_CANCELLATION_CONFIRM:
        return formData.confirmed
          ? t(currentLang, "fattalCancelConfirmed")
          : t(currentLang, "fattalCancelDeclined");
      case WidgetFormId.FATTAL_CONTACT_UPDATE:
        return t(currentLang, "fattalContactUpdateSubmitted");
      case WidgetFormId.GUESTY_GUEST_DETAILS:
        return t(currentLang, "guestyGuestDetailsSubmitted");
      default:
        return t(currentLang, "contactFormSubmitted");
    }
  };

  // Handle contact form submission
  const handleContactFormSubmit = async (
    formData: Record<string, string | boolean>
  ) => {
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

    const displayPrice =
      isClubMember && selectedPrice.clubTotalPrice
        ? selectedPrice.clubTotalPrice
        : selectedPrice.totalPrice;

    const selectionMessage =
      `${t(currentLang, "bookingIntro")}\n` +
      `${t(currentLang, "roomLabel")}: ${room.name}\n` +
      `${t(currentLang, "packageLabel")}: ${selectedPackage.packageName}\n` +
      `${t(currentLang, "hostingTypeLabel")}: ${selectedPrice.hostingBase}\n` +
      `${isClubMember ? t(currentLang, "clubMemberYes") + "\n" : ""}` +
      `${t(currentLang, "priceLabel")}: ${formatPriceI18n(displayPrice, currentLang)} ₪`;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: selectionMessage,
      sender: "user",
      timestamp: new Date(),
      direction: currentLang === "HE" ? "rtl" : "ltr",
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

  // ── Welcome screen ──────────────────────────────────────────────────────────
  // Single WidgetShell wraps both states; AnimatePresence morphs welcome -> chat
  // (welcome card scales up and fades out, chat fades in). Background image only
  // renders on welcome state.
  return (
    <WidgetShell
      theme={widgetTheme}
      showBackground={!userName}
      backgroundImageUrl={!userName ? config.backgroundImageUrl : null}
      direction={direction}
    >
      <AnimatePresence mode="wait" initial={false}>
        {!userName ? (
          <motion.div
            key="welcome"
            className="h-full"
            exit={{ scale: 1.08, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          >
            <WelcomeScreen
              theme={widgetTheme}
              hotelName={config.hotelName}
              logoUrl={config.logoUrl}
              lang={currentLang}
              nameInput={nameInput}
              onNameInputChange={setNameInput}
              onStart={handleNameSubmit}
              showEmail={config.showEmail}
              emailRequired={config.emailRequired}
              showPhone={config.showPhone}
              phoneRequired={config.phoneRequired}
              quickActionsEnabled={config.quickActionsEnabled}
              enabledQuickActions={config.enabledQuickActions}
              onQuickAction={handleWelcomeQuickAction}
              rightSlot={
                config.showLanguageSelector ? (
                  <LanguageSelector
                    current={currentLang}
                    enabled={config.enabledLanguages}
                    onChange={setCurrentLang}
                  />
                ) : undefined
              }
            />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            className="h-full flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, delay: 0.05 }}
          >
            <ChatHeader
        theme={widgetTheme}
        hotelName={config.hotelName}
        logoUrl={config.logoUrl}
        lang={currentLang}
        onReset={resetChat}
        rightSlot={
          config.showLanguageSelector ? (
            <LanguageSelector
              current={currentLang}
              enabled={config.enabledLanguages}
              onChange={setCurrentLang}
            />
          ) : undefined
        }
      />

      {/* Message list */}
      <div
        className="flex-1 overflow-y-auto px-3 py-4 space-y-4 bg-background"
        aria-live="polite"
        aria-atomic="false"
      >
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
            >
              <MessageBubble
                sender={message.sender}
                text={message.text}
                timestamp={message.timestamp}
                direction={message.direction}
              >
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
                    formData={
                      message.formData as React.ComponentProps<
                        typeof FattalCancellationForm
                      >["formData"]
                    }
                  />
                )}
                {message.formId === WidgetFormId.FATTAL_CONTACT_UPDATE && (
                  <FattalContactUpdateForm
                    lang={currentLang}
                    onSubmit={
                      handleContactFormSubmit as React.ComponentProps<
                        typeof FattalContactUpdateForm
                      >["onSubmit"]
                    }
                    disabled={isLoading}
                    formData={
                      message.formData as React.ComponentProps<
                        typeof FattalContactUpdateForm
                      >["formData"]
                    }
                  />
                )}
                {message.formId === WidgetFormId.GUESTY_GUEST_DETAILS && (
                  <GuestDetailsForm
                    lang={currentLang}
                    onSubmit={handleContactFormSubmit}
                    disabled={isLoading}
                    formData={
                      message.formData as React.ComponentProps<
                        typeof GuestDetailsForm
                      >["formData"]
                    }
                  />
                )}

                {/* Hotel Carousel (Fattal) */}
                {message.hotelOptions && message.hotelOptions.length > 0 && (
                  <HotelCarousel
                    hotels={message.hotelOptions}
                    onSelectHotel={handleSelectHotel}
                    lang={currentLang}
                  />
                )}

                {/* Fattal Room Carousel or Detail View */}
                {message.roomSearchResults &&
                  message.roomSearchResults.length > 0 && (
                    <>
                      {selectedFattalRooms.get(index) ? (
                        <FattalRoomDetailView
                          room={selectedFattalRooms.get(index)!}
                          onConfirm={(room, pkg, price, isClubMember) =>
                            handleConfirmFattalRoom(
                              index,
                              room,
                              pkg,
                              price,
                              isClubMember
                            )
                          }
                          onBack={() => handleBackFromFattalRoom(index)}
                          lang={currentLang}
                        />
                      ) : (
                        <FattalRoomCarousel
                          rooms={message.roomSearchResults}
                          onSelectRoom={(room) =>
                            handleSelectFattalRoom(index, room)
                          }
                          lang={currentLang}
                        />
                      )}
                    </>
                  )}

                {/* Listing Carousel or Detail View */}
                {message.listingOptions &&
                  message.listingOptions.length > 0 && (
                    <>
                      {selectedListing ? (
                        <ListingDetailView
                          listing={selectedListing}
                          onSelect={handleSelectListing}
                          onBack={handleBackFromListingDetail}
                          lang={currentLang}
                        />
                      ) : (
                        <ListingCarousel
                          listings={message.listingOptions}
                          onViewDetails={handleViewListingDetails}
                          lang={currentLang}
                        />
                      )}
                    </>
                  )}

                {/* Gallery Card (opens lightbox) */}
                {message.gallery && (
                  <GalleryCard
                    gallery={message.gallery}
                    lang={currentLang}
                    onOpen={(i) =>
                      setLightbox({ gallery: message.gallery!, index: i })
                    }
                  />
                )}
              </MessageBubble>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <LoadingSpinner />
            </div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <Composer
        value={inputMessage}
        onChange={setInputMessage}
        onSubmit={handleMessageSubmit}
        placeholder={themeText.inputPlaceholder}
        disabled={isLoading}
        direction={direction}
        formLabel={currentLang === "HE" ? "כתיבת הודעה" : "Message composer"}
      />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery Lightbox (single instance, overlays everything regardless of state) */}
      {lightbox && (
        <GalleryLightbox
          gallery={lightbox.gallery}
          startIndex={lightbox.index}
          lang={currentLang}
          onClose={() => setLightbox(null)}
        />
      )}
    </WidgetShell>
  );
}

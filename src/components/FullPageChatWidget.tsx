"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "./LoadingSpinner";
import {
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
import FattalIdCollectForm from "./FattalIdCollectForm";
import FattalOtpVerifyForm from "./FattalOtpVerifyForm";
import FattalCancellationForm from "./FattalCancellationForm";
import FattalContactUpdateForm from "./FattalContactUpdateForm";
import GuestDetailsForm from "./GuestDetailsForm";
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

const HEBREW_REGEX = /[֐-׿]/;
const POLLING_INTERVAL_MS = 2500;
const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour

const detectTextDirection = (text: string): "ltr" | "rtl" => {
  return HEBREW_REGEX.test(text.charAt(0)) ? "rtl" : "ltr";
};

interface FullPageChatWidgetProps {
  config: WidgetConfig;
  langOverride?: string | null;
}

export default function FullPageChatWidget({
  config,
  langOverride,
}: FullPageChatWidgetProps) {
  const widgetTheme = getTheme(config.selectedTheme);
  const initialLang: Language = langOverride
    ? parseLanguageCode(langOverride)
    : config.defaultLanguage;

  const [userName, setUserName] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");
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

  // Direction derived from current language
  const direction: "ltr" | "rtl" = currentLang === "HE" ? "rtl" : "ltr";

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const conversationIdRef = useRef<string | null>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const epochRef = useRef(0);
  const welcomeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (conversationId: string) => {
      stopPolling();
      pollingIntervalRef.current = setInterval(async () => {
        const myEpoch = epochRef.current;
        if (Date.now() - lastActivityRef.current > INACTIVITY_TIMEOUT_MS) {
          stopPolling();
          return;
        }
        try {
          const res = await fetch(
            `/api/widget/poll?conversationId=${conversationId}`
          );
          if (!res.ok) return;
          if (epochRef.current !== myEpoch) return;
          const body = await res.json();
          const data = body.data; // unwrap from { success, data }
          if (
            !data?.message &&
            !data?.hotelOptions &&
            !data?.listingOptions &&
            !data?.roomSearchResults &&
            !data?.formId &&
            !data?.gallery
          )
            return;
          if (data.languageCode) setCurrentLang(parseLanguageCode(data.languageCode));
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString() + "-agent",
              text: data.message ?? "",
              sender: "bot",
              timestamp: new Date(),
              direction: detectTextDirection(data.message ?? ""),
              hotelOptions: data.hotelOptions ?? undefined,
              roomSearchResults: data.roomSearchResults ?? undefined,
              listingOptions: data.listingOptions ?? undefined,
              formId: data.formId ?? undefined,
              formData: data.formData ?? undefined,
              languageCode: data.languageCode ?? undefined,
              gallery: data.gallery ?? undefined,
            },
          ]);
          setIsLoading(false);
          lastActivityRef.current = Date.now();
          setTimeout(() => inputRef.current?.focus(), 0);
        } catch {
          // silently ignore polling errors
        }
      }, POLLING_INTERVAL_MS);
    },
    [stopPolling]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
      if (welcomeTimerRef.current) clearTimeout(welcomeTimerRef.current);
    };
  }, [stopPolling]);

  const sendMessageToAPI = useCallback(
    async (
      message: string,
      currentUserName: string,
      formData?: Record<string, string | boolean>
    ) => {
      if (!conversationIdRef.current) {
        conversationIdRef.current = crypto.randomUUID();
        startPolling(conversationIdRef.current);
      }
      lastActivityRef.current = Date.now();
      try {
        const res = await fetch("/api/widget/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            widgetId: config.widgetId,
            conversationId: conversationIdRef.current,
            message,
            userName: currentUserName,
            timestamp: new Date().toISOString(),
            ...(formData ? { formData } : {}),
          }),
        });
        if (!res.ok) {
          setIsLoading(false);
        }
      } catch {
        setIsLoading(false);
      }
    },
    [config.widgetId, startPolling]
  );

  // Post a user bubble and forward to encoder — shared by text submit and quick actions
  const postUserMessage = useCallback(
    async (text: string) => {
      const userMessage: Message = {
        id: Date.now().toString(),
        text,
        sender: "user",
        timestamp: new Date(),
        direction: detectTextDirection(text),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      await sendMessageToAPI(text, userName);
      // isLoading stays true until poll receives response
    },
    [sendMessageToAPI, userName]
  );

  // Handle name submission (form submit — no quick action)
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
    const quickActionMessage: Message = {
      id: Date.now().toString() + "-quickaction",
      text: prompt,
      sender: "user",
      timestamp: new Date(),
      direction: detectTextDirection(prompt),
    };

    setMessages([welcomeMessage, quickActionMessage]);
    setIsLoading(true);
    void sendMessageToAPI(prompt, name);
  };

  // Handle message submission from Composer (no event — Composer calls onSubmit: () => void)
  const handleMessageSubmit = () => {
    if (!inputMessage.trim()) return;
    const text = inputMessage.trim();
    setInputMessage("");
    void postUserMessage(text);
  };

  // Reset chat (no postMessage — standalone full-page widget)
  const resetChat = () => {
    stopPolling();
    epochRef.current += 1;
    conversationIdRef.current = null;
    setUserName("");
    setMessages([]);
    setNameInput("");
    setIsLoading(false);
    setSelectedFattalRooms(new Map());
    setSelectedListing(null);
  };

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

    await sendMessageToAPI(submittedMessage, userName, formData);
    // isLoading stays true until poll receives response
  };

  // Handle hotel selection
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

    await sendMessageToAPI(hotel.hotelName, userName);
    // isLoading stays true until poll receives response
  };

  const handleSelectFattalRoom = (messageIndex: number, room: FattalRoom) => {
    setSelectedFattalRooms((prev) => {
      const next = new Map(prev);
      next.set(messageIndex, room);
      return next;
    });
  };

  const handleBackFromFattalRoom = (messageIndex: number) => {
    setSelectedFattalRooms((prev) => {
      const next = new Map(prev);
      next.delete(messageIndex);
      return next;
    });
  };

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

    await sendMessageToAPI(selectionMessage, userName);
    // isLoading stays true until poll receives response
  };

  const handleViewListingDetails = (listing: WidgetListing) => {
    setSelectedListing(listing);
  };

  const handleBackFromListingDetail = () => {
    setSelectedListing(null);
  };

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

    await sendMessageToAPI(listing.name, userName);
    // isLoading stays true until poll receives response
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

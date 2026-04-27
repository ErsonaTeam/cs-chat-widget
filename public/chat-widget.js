(function () {
  "use strict";

  // Prevent multiple initializations
  if (window.ChatWidgetInitialized) {
    return;
  }
  window.ChatWidgetInitialized = true;

  // === MESSAGING INTEGRATION BLOCK START ===
  // Extract companyId from script element (multiple methods for reliability)
  const getCompanyId = () => {
    // Method 1: Try to get by ID (most reliable)
    const widgetScript = document.getElementById('ersona-chat-widget');
    if (widgetScript && widgetScript.dataset.companyId) {
      return widgetScript.dataset.companyId;
    }
    
    // Method 2: Try to find any script with data attribute
    const anyWidgetScript = document.querySelector('script[data-company-id]');
    if (anyWidgetScript) {
      return anyWidgetScript.dataset.companyId;
    }
    
    return 'default';
  };

  const getTheme = () => {
    const widgetScript = document.getElementById('ersona-chat-widget');
    if (widgetScript && widgetScript.dataset.theme) {
      return widgetScript.dataset.theme;
    }

    const anyWidgetScript = document.querySelector('script[data-theme]');
    if (anyWidgetScript) {
      return anyWidgetScript.dataset.theme;
    }

    return null;
  };

  // Session management - always start fresh
  const clearSessionOnLoad = () => {
    // Always clear session storage on page load to ensure fresh sessions
    sessionStorage.removeItem('chatWidget_conversationId');
    conversationId = null;
    stopPolling();
  };

  // Generate UUID for conversationId
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Polling state
  let pollingInterval = null;
  let conversationId = null;
  let inactivityTimer = null;
  const POLLING_INTERVAL_MS = 2500; // 2.5 seconds

  // Stop polling
  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  };

  // Inactivity cleanup (1 hour)
  const INACTIVITY_TIMEOUT = 60 * 60 * 1000;

  // Reset inactivity timer
  const resetInactivityTimer = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    
    inactivityTimer = setTimeout(() => {
      console.log('Chat Widget - Stopping polling due to inactivity');
      stopPolling();
    }, INACTIVITY_TIMEOUT);
  };

  // Track user activity
  const trackActivity = () => {
    resetInactivityTimer();
  };

  const companyId = getCompanyId();
  const widgetTheme = getTheme();

  // Theme color map for widget button styling (mirrors theme-config.ts)
  const themeColors = {
    default: { primary: '#1A3A5C', primaryLight: '#244E75' },
    fattal:  { primary: '#1d2b4d', primaryLight: '#2d3f66' },
    eztlv:   { primary: '#2D6DA4', primaryLight: '#3A85C4' },
  };
  const buttonColors = themeColors[widgetTheme] || themeColors.default;

  // Message type constants
  const MESSAGE_TYPES = {
    AGENT_MESSAGE: 'CHAT_WIDGET_AGENT_MESSAGE',
    SEND_MESSAGE: 'CHAT_WIDGET_SEND_MESSAGE',
    RESIZE_WIDGET: 'CHAT_WIDGET_RESIZE',
    RESET_CHAT: 'CHAT_WIDGET_RESET_CHAT'
  };

  const widgetServiceBaseUrl = "__WIDGET_SERVICE_URL__" !== "__WIDGET_" + "SERVICE_URL__"
      ? "__WIDGET_SERVICE_URL__"
      : "http://localhost:3000";

  // Clear session on every load to ensure fresh sessions
  clearSessionOnLoad();

  // Start polling for messages
  const startPolling = () => {
    if (pollingInterval) return; // Already polling

    pollingInterval = setInterval(async () => {
      if (!conversationId) return;

      try {
        const response = await fetch(
          `${widgetServiceBaseUrl}/api/widget/poll?conversationId=${conversationId}`
        );

        if (!response.ok) return;

        const result = await response.json();

        if (result.success && result.data) {
          // Forward to iframe
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
              type: MESSAGE_TYPES.AGENT_MESSAGE,
              message: result.data.message,
              timestamp: result.data.timestamp,
              hotelOptions: result.data.hotelOptions,
              roomSearchResults: result.data.roomSearchResults,
              listingOptions: result.data.listingOptions,
              formId: result.data.formId,
              formData: result.data.formData,
              languageCode: result.data.languageCode
            }, widgetServiceBaseUrl);
          }
        }
      } catch (error) {
        console.error('Chat Widget - Polling error:', error);
      }
    }, POLLING_INTERVAL_MS);
  };

  // Send message function
  const sendMessage = async (message, userName, formData) => {
    trackActivity();

    if (!conversationId) {
      conversationId = generateUUID();
      sessionStorage.setItem('chatWidget_conversationId', conversationId);
      startPolling();
    }

    const postUrl = `${widgetServiceBaseUrl}/api/widget/messages`;
    const payload = {
      companyId,
      conversationId,
      message,
      userName,
      timestamp: new Date().toISOString(),
      meta: {
        userAgent: navigator.userAgent,
        referrer: document.referrer,
      },
      ...(formData ? { formData } : {}),
    };

    try {
      const response = await fetch(postUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });


      if (!response.ok) {
        const errorText = await response.text();
        console.error('Chat Widget - API error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Chat Widget - Send message error:', error);
      throw error;
    }
  };

  // Expose messaging functions (for iframe communication)
  window.__CHATWIDGET__ = window.__CHATWIDGET__ || {};
  window.__CHATWIDGET__.sendMessage = sendMessage;
  window.__CHATWIDGET__.getConversationId = () => conversationId;
  
  window.addEventListener('message', (event) => {
    // Allow messages from the widget service iframe to any parent window
    // const isLocalhost = event.origin.startsWith('http://localhost:')
    // const isExpectedOrigin = event.origin === widgetServiceBaseUrl;
    
    // For cross-origin embedding, we need to allow messages from the widget service iframe
    // regardless of where the parent window is hosted
    // if (!isLocalhost && !isExpectedOrigin) {
    //   return;
    // }

    if (event.data && event.data.type === MESSAGE_TYPES.SEND_MESSAGE) {
      const { message, userName, formData } = event.data;
      if (message && typeof message === 'string') {
        sendMessage(message, userName, formData).catch(error => {
          console.error('Chat Widget - Failed to send message via postMessage:', error);
        });
      }
    }

    // Handle chat reset from iframe
    if (event.data && event.data.type === MESSAGE_TYPES.RESET_CHAT) {
      clearSessionOnLoad();
    }

    // Handle widget resize requests from iframe
    if (event.data && event.data.type === MESSAGE_TYPES.RESIZE_WIDGET) {
      const { height, width } = event.data;
      if (iframe) {
        // On mobile, the CSS media query controls sizing — do not apply inline
        // width/height from the iframe, otherwise it would override the
        // near-fullscreen mobile layout.
        const isMobileViewport = window.matchMedia('(max-width: 640px)').matches;
        if (isMobileViewport) {
          iframe.style.width = '';
          iframe.style.height = '';
          return;
        }

        // Handle height changes
        if (height && typeof height === 'number') {
          const minHeight = 500;
          const maxHeight = 700;
          const newHeight = Math.max(minHeight, Math.min(maxHeight, height));
          iframe.style.height = `${newHeight}px`;
        }

        // Handle width changes
        if (width && typeof width === 'number') {
          const minWidth = 350;
          const maxWidth = 450;
          const newWidth = Math.max(minWidth, Math.min(maxWidth, width));
          iframe.style.width = `${newWidth}px`;
        }
      }
    }
  });
  // === MESSAGING INTEGRATION BLOCK END ===

  // Create and inject styles
  const styles = `
    #chat-widget-button {
      position: fixed;
      bottom: max(20px, env(safe-area-inset-bottom));
      right: max(20px, env(safe-area-inset-right));
      width: 60px;
      height: 60px;
      background: ${buttonColors.primary};
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: white;
      z-index: 9999;
      transition: all 0.3s ease;
      transform: scale(1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    #chat-widget-button:hover {
      background: ${buttonColors.primaryLight};
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }

    #chat-widget-button:active {
      transform: scale(0.95);
    }

    #chat-widget-iframe {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 350px;
      height: 500px;
      border: 1px solid rgba(0, 0, 0, 1);
      border-radius: 16px;
      box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
      z-index: 9998;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      transition: opacity 0.3s ease, transform 0.3s ease;
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      pointer-events: none;
      color-scheme: light;
    }

    #chat-widget-iframe.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: all;
      border: 1px solid rgba(0, 0, 0, 0.25);
    }

    /* Mobile responsive — covers all common iPhones (375-430px) and Androids (360-412px).
       Edge-to-edge fullscreen so the keyboard doesn't fight with margins.
       100dvh handles iOS Safari URL bar. */
    @media (max-width: 640px) {
      #chat-widget-iframe {
        top: 0 !important;
        left: 0 !important;
        right: auto !important;
        bottom: auto !important;
        width: 100vw !important;
        height: 100dvh !important;
        max-height: none !important;
        max-width: none !important;
        border-radius: 0 !important;
        border: none !important;
        box-shadow: none !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }

      #chat-widget-iframe.open {
        border: none !important;
      }

      #chat-widget-button {
        bottom: max(16px, env(safe-area-inset-bottom, 0px));
        right: max(16px, env(safe-area-inset-right, 0px));
        width: 56px;
        height: 56px;
        font-size: 22px;
      }

      /* When widget is open + fullscreen, move the close button to the top-right
         so it doesn't sit on top of the chat input/send button at the bottom. */
      #chat-widget-button.widget-open {
        bottom: auto !important;
        right: max(12px, env(safe-area-inset-right, 0px)) !important;
        top: max(12px, env(safe-area-inset-top, 0px)) !important;
        width: 40px;
        height: 40px;
        font-size: 18px;
        background: rgba(0, 0, 0, 0.45) !important;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
      }

      #chat-widget-button.widget-open:hover {
        background: rgba(0, 0, 0, 0.6) !important;
      }
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      #chat-widget-iframe {
        background: rgba(26, 26, 26, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
    }
  `;

  // Inject styles into the page
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);

  // Create the floating button
  const button = document.createElement("button");
  button.id = "chat-widget-button";
  button.innerHTML = `<img src="${widgetServiceBaseUrl}/chat-icon.png" alt="Chat" style="width: 32px; height: 32px; object-fit: contain;">`;
  button.setAttribute("aria-label", "Open chat widget");
  button.setAttribute("title", "Chat with us");

  // Create the iframe
  const iframe = document.createElement("iframe");
  iframe.id = "chat-widget-iframe";
  iframe.setAttribute("aria-label", "Chat widget");
  iframe.setAttribute("title", "Chat widget");
  iframe.setAttribute("frameBorder", "0");
  iframe.style.colorScheme = "light";
  iframe.style.background = "transparent";
  iframe.src = widgetServiceBaseUrl + "/embed-chat" + (widgetTheme ? "?theme=" + encodeURIComponent(widgetTheme) : "");

  // State management
  let isOpen = false;

  // Toggle function
  function toggleChat() {
    isOpen = !isOpen;

    if (isOpen) {
      trackActivity();
      
      iframe.classList.add("open");
      button.classList.add("widget-open");
      button.innerHTML = '<span style="color: #ffffff;">✕</span>';
      button.setAttribute("aria-label", "Close chat widget");
      button.setAttribute("title", "Close chat");
    } else {
      iframe.classList.remove("open");
      button.classList.remove("widget-open");
      button.innerHTML = `<img src="${widgetServiceBaseUrl}/chat-icon.png" alt="Chat" style="width: 32px; height: 32px; object-fit: contain;">`;
      button.setAttribute("aria-label", "Open chat widget");
      button.setAttribute("title", "Chat with us");
    }
  }

  button.addEventListener("click", toggleChat);

  // When rotating from desktop to mobile viewport, drop any inline width/height
  // set by previous resize messages so the mobile CSS media query takes effect.
  const mobileMediaQuery = window.matchMedia('(max-width: 640px)');
  const handleViewportChange = (event) => {
    if (event.matches && iframe) {
      iframe.style.width = '';
      iframe.style.height = '';
    }
  };
  if (mobileMediaQuery.addEventListener) {
    mobileMediaQuery.addEventListener('change', handleViewportChange);
  } else if (mobileMediaQuery.addListener) {
    // Safari < 14 fallback
    mobileMediaQuery.addListener(handleViewportChange);
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && isOpen) {
      toggleChat();
    }
  });

  // Add elements to the page when DOM is ready
  function addElementsToPage() {
    document.body.appendChild(button);
    document.body.appendChild(iframe);
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addElementsToPage);
  } else {
    addElementsToPage();
  }

  // Cleanup when page is about to unload
  window.addEventListener('beforeunload', () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    stopPolling();
  });

  // Expose public API
  window.ChatWidget = {
    open: function () {
      if (!isOpen) toggleChat();
    },
    close: function () {
      if (isOpen) toggleChat();
    },
    toggle: toggleChat,
    isOpen: function () {
      return isOpen;
    }
  };
})();

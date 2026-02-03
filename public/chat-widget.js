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
    
    return 'default'; // fallback
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
  
  // Message type constants
  const MESSAGE_TYPES = {
    AGENT_MESSAGE: 'CHAT_WIDGET_AGENT_MESSAGE',
    SEND_MESSAGE: 'CHAT_WIDGET_SEND_MESSAGE',
    RESIZE_WIDGET: 'CHAT_WIDGET_RESIZE'
  };

  // const widgetServiceBaseUrl = "http://localhost:3000";
  const widgetServiceBaseUrl = "https://dev-widget.ersona.co";
  // const widgetServiceBaseUrl = "https://47c1e0c701c0.ngrok-free.app";

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
  const sendMessage = async (message, userName, userPhone) => {
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
      userPhone,
      timestamp: new Date().toISOString(),
      meta: {
        userAgent: navigator.userAgent,
        referrer: document.referrer,
      },
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
      const { message, userName, userPhone } = event.data;
      if (message && typeof message === 'string') {
        sendMessage(message, userName, userPhone).catch(error => {
          console.error('Chat Widget - Failed to send message via postMessage:', error);
        });
      }
    }

    // Handle widget resize requests from iframe
    if (event.data && event.data.type === MESSAGE_TYPES.RESIZE_WIDGET) {
      const { height, width } = event.data;
      if (iframe) {
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
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      background: rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.3);
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
    }

    #chat-widget-button:hover {
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
      transition: all 0.3s ease;
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

    /* Mobile responsive */
    @media (max-width: 480px) {
      #chat-widget-iframe {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 96vw;
        height: 60vh;
        border-radius: 16px;
        margin: auto auto 4.5rem auto;
      }

      #chat-widget-button {
        bottom: 15px;
        right: 15px;
        width: 50px;
        height: 50px;
        font-size: 20px;
      }
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      #chat-widget-iframe {
        background: rgba(26, 26, 26, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      #chat-widget-button {
        background: rgba(26, 26, 26, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
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
  iframe.src = widgetServiceBaseUrl + "/embed-chat";

  // State management
  let isOpen = false;

  // Toggle function
  function toggleChat() {
    isOpen = !isOpen;

    if (isOpen) {
      trackActivity();
      
      iframe.classList.add("open");
      button.innerHTML = '<span style="color: #ffffff;">✕</span>';
      button.setAttribute("aria-label", "Close chat widget");
      button.setAttribute("title", "Close chat");
    } else {
      iframe.classList.remove("open");
      button.innerHTML = `<img src="${widgetServiceBaseUrl}/chat-icon.png" alt="Chat" style="width: 32px; height: 32px; object-fit: contain;">`;
      button.setAttribute("aria-label", "Open chat widget");
      button.setAttribute("title", "Chat with us");
    }
  }

  button.addEventListener("click", toggleChat);

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

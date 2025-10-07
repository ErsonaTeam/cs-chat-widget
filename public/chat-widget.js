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

  // Session management - check for existing conversation on load
  const initializeConversation = () => {
    // Check if there's an existing conversation ID in sessionStorage
    const existingConversationId = sessionStorage.getItem('chatWidget_conversationId');
    if (existingConversationId) {
      conversationId = existingConversationId;
      // Mark that we need to initialize Pusher for existing conversation
      shouldInitializePusherOnLoad = true;
    }
  };

  // Generate UUID for conversationId
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Cleanup Pusher connection - unsubscribe from channel
  const cleanupPusher = () => {
    try {
      if (currentChannel) {
        currentChannel.unbind(PUSHER_EVENTS.AGENT_MESSAGE, handleAgentMessage);
        if (pusherClient) {
          pusherClient.unsubscribe(currentChannel.name);
        }
        currentChannel = null;
      }
      isMessagingInitialized = false;
    } catch (error) {
      console.error('Chat Widget - Failed to cleanup Pusher:', error);
    }
  };

  // Full Pusher disconnect - for page unload
  const disconnectPusher = () => {
    try {
      cleanupPusher();
      if (pusherClient) {
        pusherClient.disconnect();
        pusherClient = null;
      }
    } catch (error) {
      console.error('Chat Widget - Failed to disconnect Pusher:', error);
    }
  };

  // Messaging state
  let pusherClient = null;
  let currentChannel = null;
  let conversationId = null;
  let isMessagingInitialized = false;
  let inactivityTimer = null;
  let shouldInitializePusherOnLoad = false;

  // Inactivity cleanup (1 hour)
  const INACTIVITY_TIMEOUT = 60 * 60 * 1000;

  // Reset inactivity timer
  const resetInactivityTimer = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    
    inactivityTimer = setTimeout(() => {
      console.log('Chat Widget - Cleaning up due to inactivity');
      cleanupPusher();
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
    NAVIGATE_URL: 'CHAT_WIDGET_NAVIGATE_URL',
    RESTORE_CONVERSATION: 'CHAT_WIDGET_RESTORE_CONVERSATION',
    CONVERSATION_RESTORED: 'CHAT_WIDGET_CONVERSATION_RESTORED',
    REQUEST_CONVERSATION_ID: 'CHAT_WIDGET_REQUEST_CONVERSATION_ID',
    CONVERSATION_ID_RESPONSE: 'CHAT_WIDGET_CONVERSATION_ID_RESPONSE'
  };

  const PUSHER_EVENTS = {
    AGENT_MESSAGE: 'agent.message'
  };
  
  const widgetServiceBaseUrl = "http://localhost:3000";
  // const widgetServiceBaseUrl = "https://cs-chat-widget-lymo.vercel.app";
  const pusherAppKey = "a4c044bc7363a3352ac7";
  const pusherCluster = "eu";
  const pusherJsUrl = 'https://js.pusher.com/8.2.0/pusher.min.js';

  // Clear session on every load to ensure fresh sessions
  initializeConversation();

  // Initialize Pusher client (browser-safe options only)
  const initializePusher = () => {
    if (pusherClient || isMessagingInitialized) return;

    try {
      // Load Pusher dynamically
      const script = document.createElement('script');
      script.src = pusherJsUrl;
      script.onload = () => {
        pusherClient = new Pusher(pusherAppKey, {
          cluster: pusherCluster,
          forceTLS: true,
          disableStats: true,
          activityTimeout: 45000,
        });

        // Subscribe to conversation channel
        const channelName = `c-${companyId}-${conversationId}`;
        currentChannel = pusherClient.subscribe(channelName);

        currentChannel.bind(PUSHER_EVENTS.AGENT_MESSAGE, handleAgentMessage);

        isMessagingInitialized = true;
      };
      document.head.appendChild(script);
    } catch (error) {
      console.error('Chat Widget - Failed to initialize Pusher:', error);
    }
  };

  // Handle deferred Pusher initialization for existing conversations
  if (shouldInitializePusherOnLoad && conversationId) {
    initializePusher();
  }

  // Event handler for Pusher events
  const handleAgentMessage = (data) => {
    if (data.conversationId && data.conversationId !== conversationId) return; // Defensive guard
    
    // Forward the agent message to the iframe via postMessage
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: MESSAGE_TYPES.AGENT_MESSAGE,
        message: data.message,
        timestamp: data.timestamp
      }, widgetServiceBaseUrl);
    }
  };

  // Send message function
  const sendMessage = async (message, userName) => {
    trackActivity();
    
    if (!conversationId) {
      conversationId = generateUUID();
      sessionStorage.setItem('chatWidget_conversationId', conversationId);
      initializePusher();
    }

    const postUrl = `${widgetServiceBaseUrl}/api/widget/messages`;

    try {
      const response = await fetch(postUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId,
          conversationId,
          message,
          userName,
          timestamp: new Date().toISOString(),
          meta: {
            userAgent: navigator.userAgent,
            referrer: document.referrer,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      throw error;
    }
  };

  // Expose messaging functions (for iframe communication)
  window.__CHATWIDGET__ = window.__CHATWIDGET__ || {};
  window.__CHATWIDGET__.sendMessage = sendMessage;
  window.__CHATWIDGET__.getConversationId = () => conversationId;
  
  window.addEventListener('message', (event) => {

    const isLocalhost = event.origin.startsWith('http://localhost:')
    const isExpectedOrigin = event.origin === widgetServiceBaseUrl;
    
    if (!isLocalhost && !isExpectedOrigin) {
      return;
    }

    if (event.data && event.data.type === MESSAGE_TYPES.SEND_MESSAGE) {
      const { message, userName, conversationId: msgConversationId } = event.data;
      if (message && typeof message === 'string') {
        // Use conversation ID from message if provided
        if (msgConversationId && msgConversationId !== conversationId) {
          conversationId = msgConversationId;
          sessionStorage.setItem('chatWidget_conversationId', conversationId);
        }
        
        sendMessage(message, userName).catch(error => {
          console.error('Chat Widget - Failed to send message via postMessage:', error);
        });
      }
    } else if (event.data && event.data.type === MESSAGE_TYPES.NAVIGATE_URL) {
      // Handle URL navigation from iframe
      const { url } = event.data;
      if (url && typeof url === 'string') {
        // Mark this as a chat-initiated navigation before navigating
        sessionStorage.setItem('chatWidget_navigatedFromChat', 'true');
        sessionStorage.setItem('chatWidget_navigationTimestamp', Date.now().toString());
        
        // Navigate to the URL in the current page
        window.location.href = url;
      }
    } else if (event.data && event.data.type === MESSAGE_TYPES.REQUEST_CONVERSATION_ID) {
      // Send current conversation ID to iframe
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: MESSAGE_TYPES.CONVERSATION_ID_RESPONSE,
          conversationId: conversationId
        }, widgetServiceBaseUrl);
      }
    } else if (event.data && event.data.type === MESSAGE_TYPES.CONVERSATION_RESTORED) {
      // Handle conversation restoration notification from iframe
      if (event.data.success && event.data.conversationId) {
        conversationId = event.data.conversationId;
        sessionStorage.setItem('chatWidget_conversationId', conversationId);
        // Initialize Pusher for the restored conversation
        if (!isMessagingInitialized) {
          initializePusher();
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
    disconnectPusher();
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
    },
    // New method to get current conversation ID
    getConversationId: function () {
      return conversationId;
    },
    // New method to restore a specific conversation
    restoreConversation: function (targetConversationId) {
      if (iframe && iframe.contentWindow && targetConversationId) {
        iframe.contentWindow.postMessage({
          type: MESSAGE_TYPES.RESTORE_CONVERSATION,
          conversationId: targetConversationId
        }, widgetServiceBaseUrl);
      }
    }
  };
})();

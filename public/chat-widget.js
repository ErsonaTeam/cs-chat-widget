(function() {
  'use strict';

  // Prevent multiple initializations
  if (window.ChatWidgetInitialized) {
    return;
  }
  window.ChatWidgetInitialized = true;

  // Default configuration
  const config = {
    // Replace with your actual domain
    domain: 'http://localhost:3000',
    // For production, use: 'https://yourdomain.com'
  };

  // Create and inject styles
  const styles = `
    #chat-widget-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
      border: none;
      border-radius: 12px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
      z-index: 9998;
      background: white;
      transition: all 0.3s ease;
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      pointer-events: none;
    }

    #chat-widget-iframe.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: all;
    }

    /* Mobile responsive */
    @media (max-width: 480px) {
      #chat-widget-iframe {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100vw;
        height: 100vh;
        border-radius: 0;
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
        background: #1a1a1a;
      }
    }
  `;

  // Inject styles into the page
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);

  // Create the floating button
  const button = document.createElement('button');
  button.id = 'chat-widget-button';
  button.innerHTML = '💬';
  button.setAttribute('aria-label', 'Open chat widget');
  button.setAttribute('title', 'Chat with us');

  // Create the iframe
  const iframe = document.createElement('iframe');
  iframe.id = 'chat-widget-iframe';
  iframe.setAttribute('aria-label', 'Chat widget');
  iframe.setAttribute('title', 'Chat widget');
  
  // Get current URL parameters to pass to the iframe
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('userId');
  const lang = urlParams.get('lang');
  
  // Build iframe URL with parameters
  let iframeSrc = config.domain + '/embed-chat';
  const params = new URLSearchParams();
  if (userId) params.set('userId', userId);
  if (lang) params.set('lang', lang);
  if (params.toString()) {
    iframeSrc += '?' + params.toString();
  }
  
  iframe.src = iframeSrc;

  // State management
  let isOpen = false;

  // Toggle function
  function toggleChat() {
    isOpen = !isOpen;
    
    if (isOpen) {
      iframe.classList.add('open');
      button.innerHTML = '✕';
      button.setAttribute('aria-label', 'Close chat widget');
      button.setAttribute('title', 'Close chat');
    } else {
      iframe.classList.remove('open');
      button.innerHTML = '💬';
      button.setAttribute('aria-label', 'Open chat widget');
      button.setAttribute('title', 'Chat with us');
    }
  }

  // Add click event listener
  button.addEventListener('click', toggleChat);

  // Close on escape key
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && isOpen) {
      toggleChat();
    }
  });

  // Close when clicking outside iframe (optional)
  document.addEventListener('click', function(event) {
    const clickedInsideIframe = iframe.contains(event.target);
    const clickedButton = button.contains(event.target);
    
    if (isOpen && !clickedInsideIframe && !clickedButton) {
      // Uncomment the line below if you want to close on outside click
      // toggleChat();
    }
  });

  // Add elements to the page when DOM is ready
  function addElementsToPage() {
    document.body.appendChild(button);
    document.body.appendChild(iframe);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addElementsToPage);
  } else {
    addElementsToPage();
  }

  // Expose public API
  window.ChatWidget = {
    open: function() {
      if (!isOpen) toggleChat();
    },
    close: function() {
      if (isOpen) toggleChat();
    },
    toggle: toggleChat,
    isOpen: function() {
      return isOpen;
    }
  };

})(); 
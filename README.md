# 💬 Embeddable Chat Widget

A complete, feature-rich chat widget built with Next.js, TypeScript, and Framer Motion. Easily embeddable on any website with a single script tag.

## ✨ Features

- **🎯 Easy Integration**: Single script tag embedding
- **📱 Fully Responsive**: Adapts to mobile and desktop screens
- **🌙 Dark Mode**: Automatic dark/light mode support
- **🌐 RTL Support**: Automatic Hebrew text detection and direction switching
- **💾 Persistent Storage**: Messages and username saved in localStorage
- **🎬 Smooth Animations**: Powered by Framer Motion
- **🤖 Bot Replies**: Simulated bot responses with 1-second delay
- **⌨️ Keyboard Support**: Enter to send, ESC to close
- **🔧 Programmatic API**: Control widget via JavaScript
- **📊 URL Parameters**: Support for userId and lang parameters

## 🚀 Quick Start

### Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Test the widget**:
   - Main page: http://localhost:3000
   - Direct widget: http://localhost:3000/embed-chat
   - Demo page: http://localhost:3000/demo.html

### Production Deployment

1. **Build the application**:
   ```bash
   npm run build
   npm start
   ```

2. **Update domain configuration**:
   Edit `public/chat-widget.js` and replace:
   ```javascript
   domain: 'http://localhost:3000'
   ```
   with your actual domain:
   ```javascript
   domain: 'https://yourdomain.com'
   ```

## 📋 Embedding the Widget

Add this script tag to any website:

```html
<script src="https://yourdomain.com/chat-widget.js"></script>
```

The widget will automatically appear as a floating chat button in the bottom-right corner.

## 🔧 API Reference

The widget exposes a global `ChatWidget` object with the following methods:

```javascript
// Open the chat widget
window.ChatWidget.open();

// Close the chat widget
window.ChatWidget.close();

// Toggle chat widget state
window.ChatWidget.toggle();

// Check if widget is open
const isOpen = window.ChatWidget.isOpen(); // returns boolean
```

## 🌐 URL Parameters

The widget supports optional URL parameters:

- `?userId=123` - User identifier for tracking
- `?lang=he` - Language preference (logged to console)

Example: `https://yourdomain.com/embed-chat?userId=user123&lang=en`

## 🎨 Customization

### Styling

The widget uses injected CSS for styling. To customize:

1. Edit the `styles` variable in `public/chat-widget.js`
2. Modify colors, sizes, and animations as needed
3. The widget supports CSS custom properties for theming

### Chat Behavior

Customize chat behavior in `src/components/ChatWidget.tsx`:

- **Bot replies**: Edit the `botReplies` array in `generateBotReply()`
- **Message timing**: Change the setTimeout delay (currently 1 second)
- **Storage key**: Modify `STORAGE_KEY` constant
- **Hebrew detection**: Adjust `HEBREW_REGEX` pattern

## 📁 Project Structure

```
src/
├── components/
│   └── ChatWidget.tsx          # Main chat component
├── app/
│   ├── page.tsx               # Documentation page
│   ├── layout.tsx             # Main layout
│   ├── globals.css            # Global styles
│   └── embed-chat/
│       ├── page.tsx           # Full-screen chat page
│       └── layout.tsx         # Minimal layout for embedding
public/
├── chat-widget.js             # Embeddable script
└── demo.html                  # Demo page for testing
```

## 🎯 Key Components

### ChatWidget Component

The main React component (`src/components/ChatWidget.tsx`) features:

- **Name prompt screen**: Initial user name collection
- **Chat interface**: Message display with user/bot bubbles
- **Real-time direction detection**: RTL/LTR based on text input
- **Animation support**: Smooth message animations
- **localStorage integration**: Persistent chat history

### Embeddable Script

The JavaScript file (`public/chat-widget.js`) provides:

- **Floating button**: Animated chat trigger
- **iframe management**: Responsive chat window
- **Event handling**: Click, keyboard, and resize events
- **API exposure**: Programmatic control methods

## 🧪 Testing

### Manual Testing

1. **Basic functionality**:
   - Visit http://localhost:3000/demo.html
   - Click the floating chat button
   - Enter a name and start chatting

2. **RTL support**:
   - Type Hebrew text: "שלום עולם"
   - Verify direction changes automatically

3. **Mobile responsiveness**:
   - Open on mobile device
   - Verify full-screen behavior

4. **Persistence**:
   - Refresh the page
   - Verify messages and name are restored

### API Testing

Use the demo page buttons or browser console:

```javascript
// Test programmatic control
ChatWidget.open();
ChatWidget.close();
ChatWidget.toggle();
console.log(ChatWidget.isOpen());
```

## 🛠️ Technical Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Storage**: Browser localStorage
- **Build**: Next.js build system

## 📱 Mobile Support

The widget is fully responsive:

- **Desktop**: 350x500px floating window
- **Mobile**: Full-screen overlay
- **Tablet**: Adaptive sizing
- **Touch-friendly**: Large tap targets

## 🔒 Security Considerations

- **iframe sandboxing**: Consider adding sandbox attributes for production
- **CSP headers**: Configure Content Security Policy for iframe sources
- **Domain validation**: Validate embedding domains in production
- **Rate limiting**: Implement message rate limiting if needed

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Update domain in `chat-widget.js`
3. Deploy automatically on push

### Other Platforms

1. Build the application: `npm run build`
2. Upload the `out/` or `.next/` directory
3. Update domain configuration
4. Ensure static files are served correctly

## 📊 Performance

The widget is optimized for performance:

- **Lazy loading**: iframe content loads on demand
- **Minimal bundle**: Small JavaScript footprint
- **CSS injection**: No external stylesheets required
- **Tree shaking**: Unused code eliminated

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test thoroughly
4. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

For issues and questions:

1. Check the demo page for common usage patterns
2. Review browser console for error messages
3. Test with different devices and browsers
4. Open an issue with reproduction steps

---

Built with ❤️ using Next.js, TypeScript, and Framer Motion.

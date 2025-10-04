# 💬 Embeddable Chat Widget

A complete, feature-rich chat widget built with Next.js, TypeScript, and Framer Motion. Easily embeddable on any website with a single script tag.

## ✨ Features

- **🎯 Easy Integration**: Single script tag embedding
- **📱 Fully Responsive**: Adapts to mobile and desktop screens
- **🌙 Dark Mode**: Automatic dark/light mode support
- **🌐 RTL Support**: Automatic Hebrew text detection and direction switching
- **💾 Persistent Storage**: Messages and username saved in localStorage
- **🎬 Smooth Animations**: Powered by Framer Motion
- **🤖 Real-time Messaging**: Pusher-powered real-time communication
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

2. **Set environment variables**:
   ```bash
   NEXT_PUBLIC_BASE_URL=https://yourdomain.com
   ```

## 📋 Embedding the Widget

Add this script tag to any website:

```html
<script id="ersona-chat-widget" src="https://yourdomain.com/chat-widget.js" data-company-id="YOUR_COMPANY_ID"></script>
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
const isOpen = window.ChatWidget.isOpen();
```

## 🏗️ Architecture

### Core Components

- **`/public/chat-widget.js`** - Main embeddable widget script
- **`/src/app/api/widget/messages/route.ts`** - Handles real-time messaging via Pusher
- **`/src/app/embed-chat/`** - React iframe content for the chat interface
- **`/src/components/ChatWidget.tsx`** - Main chat React component

### Integration Methods

1. **Data Attribute (Recommended)**:
   ```html
   <script id="ersona-chat-widget" src="https://yourdomain.com/chat-widget.js" data-company-id="YOUR_COMPANY_ID"></script>
   ```

## 🔧 Configuration

### Environment Variables

```bash
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### Pusher Configuration

Update the Pusher credentials in:
- `/src/app/api/widget/messages/route.ts` (server-side)
- `/public/chat-widget.js` (client-side)

## 📊 Performance

The widget is optimized for performance:

- **Lazy loading**: iframe content loads on demand
- **Minimal bundle**: Small JavaScript footprint
- **CSS injection**: No external stylesheets required
- **Environment variables**: Dynamic configuration without rebuilds

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test thoroughly
4. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ using Next.js, TypeScript, and Framer Motion.
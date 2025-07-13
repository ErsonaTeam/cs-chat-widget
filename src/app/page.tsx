import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Embeddable Chat Widget
          </h1>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Features
            </h2>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>✅ Floating chat button with smooth animations</li>
              <li>✅ Full-screen responsive iframe on mobile</li>
              <li>✅ LocalStorage persistence for messages and username</li>
              <li>✅ Hebrew/RTL text direction detection</li>
              <li>✅ Dynamic input direction based on typed text</li>
              <li>✅ Animated message bubbles with Framer Motion</li>
              <li>✅ Dark mode support via prefers-color-scheme</li>
              <li>✅ Bot reply simulation with 1-second delay</li>
              <li>✅ URL query parameter support (userId, lang)</li>
              <li>✅ TypeScript support throughout</li>
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Test the Widget
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Try the chat widget directly in a full-screen interface:
              </p>
              <Link 
                href="/embed-chat" 
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Open Chat Widget
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                With Parameters
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Test with URL parameters:
              </p>
              <Link 
                href="/embed-chat?userId=123&lang=he" 
                className="inline-block bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Test with Parameters
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mt-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              How to Embed
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Add this script tag to any website to embed the chat widget:
            </p>
            <div className="bg-gray-100 dark:bg-gray-700 rounded p-4 font-mono text-sm">
              <code className="text-gray-800 dark:text-gray-200">
                {`<script src="https://yourdomain.com/chat-widget.js"></script>`}
              </code>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Note: Update the domain in /public/chat-widget.js to match your deployment URL
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mt-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              API Usage
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The widget exposes a global API for programmatic control:
            </p>
            <div className="bg-gray-100 dark:bg-gray-700 rounded p-4 font-mono text-sm space-y-2">
              <div><code className="text-gray-800 dark:text-gray-200">window.ChatWidget.open()</code> - Open the chat</div>
              <div><code className="text-gray-800 dark:text-gray-200">window.ChatWidget.close()</code> - Close the chat</div>
              <div><code className="text-gray-800 dark:text-gray-200">window.ChatWidget.toggle()</code> - Toggle chat state</div>
              <div><code className="text-gray-800 dark:text-gray-200">window.ChatWidget.isOpen()</code> - Check if chat is open</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mt-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Technical Details
            </h2>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li><strong>Framework:</strong> Next.js 15 with TypeScript</li>
              <li><strong>Styling:</strong> Tailwind CSS v4</li>
              <li><strong>Animations:</strong> Framer Motion</li>
              <li><strong>Storage:</strong> Browser localStorage</li>
              <li><strong>RTL Support:</strong> Automatic Hebrew text detection</li>
              <li><strong>Mobile:</strong> Fully responsive with adaptive layouts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

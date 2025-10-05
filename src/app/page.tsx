export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
            Chat Widget Service
          </h1>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Integration
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Add this script tag to your website to embed the chat widget:
            </p>
            
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-sm font-mono overflow-x-auto mb-4">
              <code className="text-gray-800 dark:text-gray-200">
                {`<script id="ersona-chat-widget" src="${process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com'}/chat-widget.js" data-company-id="YOUR_COMPANY_ID"></script>`}
              </code>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Replace <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">YOUR_COMPANY_ID</code> with your actual company identifier.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
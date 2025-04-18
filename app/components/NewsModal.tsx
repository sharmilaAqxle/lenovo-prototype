// app/components/NewsModal.tsx

interface NewsItem {
    heading: string;
    shortInsight: string;
    fullInsight: string;
    imageUrl: string;
  }
  
  interface NewsModalProps {
    news: NewsItem | null;
    onClose: () => void;
  }
  
  export default function NewsModal({ news, onClose }: NewsModalProps) {
    if (!news) return null;
  
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          // Close modal when clicking the backdrop
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 bg-white">
            <h2 className="text-2xl font-bold text-gray-900 pr-8">{news.heading}</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
  
          {/* Modal Content */}
          <div className="p-6">
            {/* Image Section */}
            <div className="relative h-[300px] bg-gray-100 mb-6 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 p-4">
                <svg 
                  className="w-12 h-12 mb-4 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1} 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                  />
                </svg>
                <span className="text-sm text-center italic">Image prompt: {news.imageUrl}</span>
              </div>
            </div>
  
            {/* Short Insight */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Insight</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                {news.shortInsight}
              </p>
            </div>
  
            {/* Full Analysis */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Full Analysis</h3>
              <div className="prose max-w-none">
                {news.fullInsight.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-600 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
  
          {/* Modal Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
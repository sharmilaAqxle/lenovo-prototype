'use client';

import { useState, useEffect } from 'react';

// Organize questions by segments
const segments = {
  "Laptop Headlines": [
    "news headlines on laptop sales, Lenovo, dell, HP",
    "How are the current trade tensions affecting laptop prices",
    "Latest announcements from major laptop manufacturers Lenovo, Dell, and HP"
  ],
  "Consumer Confidence": [
    "what is current state of consumer confidence",
    "How does the current consumer confidence index compare to historical trends",
    "what is current state of Us consumer"
  ],
  "Search Interest": [
    "What are the current search trends for laptops",
    "Which laptop brands are getting the most online attention",
    "Compare search interest between gaming laptops and business laptops"
  ],
  "Market Share": [
    "what are SMB trends in laptop buying",
    "Current market share distribution among major laptop manufacturers",
    "Year-over-year changes in laptop market share"
  ]
};

export default function Home() {
  const [activeSegment, setActiveSegment] = useState("Laptop Headlines");
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [initialized, setInitialized] = useState(false);

  async function askQuestion(question: string) {
    if (answers[question]) return; // Skip if already answered
    
    setLoading(prev => ({ ...prev, [question]: true }));
    
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "sonar-pro",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that provides current and accurate information about market trends and business analysis."
            },
            {
              role: "user",
              content: question
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API request failed');
      }

      const data = await response.json();
      setAnswers(prev => ({
        ...prev,
        [question]: data.choices[0].message.content
      }));
    } catch (error) {
      console.error('Error:', error);
      setAnswers(prev => ({
        ...prev,
        [question]: error instanceof Error ? error.message : 'Error fetching answer. Please try again.'
      }));
    } finally {
      setLoading(prev => ({ ...prev, [question]: false }));
    }
  }

  // Load all questions for the initial segment on mount
  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      segments[activeSegment].forEach(question => {
        askQuestion(question);
      });
    }
  }, [initialized]);

  // Load questions for new segment when switched
  useEffect(() => {
    segments[activeSegment].forEach(question => {
      askQuestion(question);
    });
  }, [activeSegment]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="py-6 text-3xl font-bold text-gray-900">
            Market Intelligence Dashboard
          </h1>
        </div>
      </div>

      {/* Segment Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {Object.keys(segments).map((segment) => (
              <button
                key={segment}
                onClick={() => setActiveSegment(segment)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm
                  ${activeSegment === segment
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                {segment}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="mt-6 pb-12">
          <div className="grid gap-6">
            {segments[activeSegment].map((question, index) => (
              <div
                key={question}
                className="bg-white shadow rounded-lg overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {question}
                  </h3>
                  
                  {loading[question] ? (
                    <div className="flex items-center text-gray-500 space-x-2">
                      <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                      <span>Analyzing...</span>
                    </div>
                  ) : answers[question] ? (
                    <div className="prose max-w-none text-gray-600">
                      {answers[question]}
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      Waiting to load...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
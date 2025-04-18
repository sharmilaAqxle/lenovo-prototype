'use client';

import { useState, useEffect } from 'react';
import NewsModal from './components/NewsModal';
import ConsumerConfidenceTab from './components/ConsumerConfidenceTab';
import SearchInterestTab from './components/SearchInterestTab';
import MarketShareTab from './components/MarketShareTab';

interface NewsItem {
  heading: string;
  shortInsight: string;
  fullInsight: string;
  imageUrl: string;
}

// Helper function to process GPT response into news format
function processGPTResponse(response: string): NewsItem {
  try {
    // Expecting GPT to return JSON format
    const parsed = JSON.parse(response);
    return {
      heading: parsed.heading || 'Latest Market Update',
      shortInsight: parsed.shortInsight || 'Loading insight...',
      fullInsight: parsed.fullInsight || 'Loading full insight...',
      imageUrl: parsed.imageUrl || '/default-news.jpg'
    };
  } catch (e) {
    console.error('Error parsing GPT response:', e);
    // Fallback to treating the entire response as fullInsight
    return {
      heading: 'Market Update',
      shortInsight: 'Latest market insights available',
      fullInsight: response,
      imageUrl: '/default-news.jpg'
    };
  }
}

const segments = {
  "Laptop Headlines": [
    {
      question: "news headlines on laptop sales, Lenovo, dell, HP",
      context: `You are a market analyst writing for a CMO. Analyze the latest news and provide response in this exact JSON format:
      {
        "heading": "Write a compelling news headline",
        "shortInsight": "Write a 1-2 sentence key insight",
        "fullInsight": "Write a detailed 3-4 paragraph analysis",
        "imageUrl": "Suggest a descriptive image prompt for this news"
      }`
    },
    {
      question: "How are the current trade tensions affecting laptop prices",
      context: `You are a market analyst writing for a CMO. Analyze the impact and provide response in this exact JSON format:
      {
        "heading": "Write a compelling news headline",
        "shortInsight": "Write a 1-2 sentence key insight",
        "fullInsight": "Write a detailed 3-4 paragraph analysis",
        "imageUrl": "Suggest a descriptive image prompt for this news"
      }`
    },
    {
      question: "Latest announcements from major laptop manufacturers Lenovo, Dell, and HP",
      context: `You are a market analyst writing for a CMO. Analyze the announcements and provide response in this exact JSON format:
      {
        "heading": "Write a compelling news headline",
        "shortInsight": "Write a 1-2 sentence key insight",
        "fullInsight": "Write a detailed 3-4 paragraph analysis",
        "imageUrl": "Suggest a descriptive image prompt for this news"
      }`
    }
  ],
  "Consumer Confidence": [
    {
      question: "What's your experience with Lenovo, Dell, and HP customer support after warranty expiration? Analyze Reddit discussions from r/laptops, r/computers, r/sysadmin",
      context: "Focus on post-warranty reliability and brand trust. Compare customer support experiences and satisfaction levels."
    },
    {
      question: "How long did Lenovo, Dell, and HP laptops last before major hardware failures? Analyze Reddit discussions from r/laptops, r/techsupport, r/buildapc",
      context: "Focus on durability concerns, common hardware issues, and longevity comparisons."
    },
    {
      question: "Would users recommend Lenovo, Dell, or HP to friends? Analyze recommendations from Reddit's r/SuggestALaptop, r/GamingLaptops, r/sysadmin",
      context: "Focus on brand loyalty, satisfaction levels, and reasons for recommendations."
    },
    {
      question: "What specific Lenovo, Dell, and HP product lines do users trust most and avoid? Analyze Reddit discussions",
      context: "Compare business vs. consumer models, identify most trusted product lines."
    },
    {
      question: "How do Lenovo, Dell, and HP compare in repairability and upgradeability? Analyze Reddit discussions from r/framework, r/buildapc, r/techsupport",
      context: "Focus on repair accessibility, part availability, and user-friendliness of repairs."
    }
  ],
  "Search Interest": [
    {
      question: "What are the current search trends for laptops across Google and YouTube? Include monthly search volumes (in thousands) and top related search terms for each brand.",
      context: `Analyze search data and provide response in this exact JSON format:
      {
        "searchTrends": {
          "months": string[],
          "data": {
            "Lenovo": {
              "searchVolume": number[],
              "topSearchTerms": [
                {"term": string, "volume": number, "trend": "up" | "down" | "stable"}
              ]
            },
            "Dell": {
              "searchVolume": number[],
              "topSearchTerms": [
                {"term": string, "volume": number, "trend": "up" | "down" | "stable"}
              ]
            },
            "HP": {
              "searchVolume": number[],
              "topSearchTerms": [
                {"term": string, "volume": number, "trend": "up" | "down" | "stable"}
              ]
            }
          },
          "unit": "thousands",
          "platform": "Google Search"
        }
      }`
    },
    {
      question: "What are the most searched laptop-related topics and features in the last 6 months?",
      context: `Analyze search trends and provide response in this exact JSON format:
      {
        "topCategories": [
          {
            "category": string,
            "volume": number,
            "trend": "up" | "down" | "stable",
            "relatedTerms": string[]
          }
        ],
        "featureInterest": {
          "labels": string[],
          "data": number[],
          "trend": string[]
        }
      }`
    },
    {
      question: "Compare search interest between gaming laptops and business laptops for major brands",
      context: `Analyze segment search data and provide response in this exact JSON format:
      {
        "segmentComparison": {
          "gaming": {
            "brands": string[],
            "searchVolume": number[],
            "topModels": [
              {"model": string, "volume": number}
            ]
          },
          "business": {
            "brands": string[],
            "searchVolume": number[],
            "topModels": [
              {"model": string, "volume": number}
            ]
          }
        },
        "insights": string[]
      }`
    }
  ],
  "Market Share": [
    {
      question: "What is the current global market share distribution among laptop manufacturers? Focus on Lenovo, HP, Dell, Apple, Acer and others. Provide exact percentages and recent trends.",
      context: "Analyze global laptop market share data and provide response in this exact JSON format: { 'globalShare': { 'Lenovo': number, 'HP': number, 'Dell': number, 'Apple': number, 'Acer': number, 'Others': number }, 'yearlyTrend': { 'quarters': string[], 'values': number[] }, 'insights': string[] }"
    },
    {
      question: "What is Lenovo's market share across different segments (Consumer, Enterprise, Education, Gaming, Workstation)? Compare with industry average.",
      context: "Analyze segment-wise market share and provide response in this exact JSON format: { 'segments': string[], 'lenovoShare': number[], 'competitorAvg': number[], 'insights': string[] }"
    },
    {
      question: "What are the key growth drivers and strategic insights for Lenovo's market position? Include recommendations.",
      context: "Analyze market position and provide response in this exact JSON format: { 'marketLeadership': string[], 'growthDrivers': string[], 'focusAreas': string[], 'recommendations': { 'shortTerm': string[], 'midTerm': string[], 'longTerm': string[] } }"
    }
  ]
};

export default function Home() {
  const [activeSegment, setActiveSegment] = useState("Laptop Headlines");
  const [answers, setAnswers] = useState<{[key: string]: any}>({});
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [initialized, setInitialized] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  async function askQuestion(question: string | { question: string; context: string }) {
    const questionText = typeof question === 'string' ? question : question.question;
    if (answers[questionText]) return;
    
    setLoading(prev => ({ ...prev, [questionText]: true }));
    
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "sonar-pro",
          messages: [
            {
              role: "system",
              content: typeof question === 'object' ? question.context : "You are a helpful assistant providing market analysis."
            },
            {
              role: "user",
              content: questionText
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API request failed');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      if (activeSegment === "Laptop Headlines" && typeof question === 'object') {
        const processedAnswer = processGPTResponse(content);
        setAnswers(prev => ({
          ...prev,
          [questionText]: processedAnswer
        }));
      } else {
        setAnswers(prev => ({
          ...prev,
          [questionText]: content
        }));
      }
    } catch (error) {
      console.error('Error:', error);
      setAnswers(prev => ({
        ...prev,
        [questionText]: typeof question === 'object' && activeSegment === "Laptop Headlines"
          ? {
              heading: 'Error fetching data',
              shortInsight: 'Unable to load market insights',
              fullInsight: error instanceof Error ? error.message : 'Please try again later',
              imageUrl: '/default-news.jpg'
            }
          : 'Error fetching answer. Please try again.'
      }));
    } finally {
      setLoading(prev => ({ ...prev, [questionText]: false }));
    }
  }

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      if (activeSegment === "Laptop Headlines") {
        segments[activeSegment].forEach(questionObj => {
          askQuestion(questionObj);
        });
      } else {
        segments[activeSegment].forEach(question => {
          askQuestion(question);
        });
      }
    }
  }, [initialized]);

  useEffect(() => {
    if (activeSegment === "Laptop Headlines") {
      segments[activeSegment].forEach(questionObj => {
        askQuestion(questionObj);
      });
    } else {
      segments[activeSegment].forEach(question => {
        askQuestion(question);
      });
    }
  }, [activeSegment]);

  const renderLaptopHeadlines = () => {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {segments["Laptop Headlines"].map((questionObj, index) => (
            <div key={questionObj.question} 
                 className="bg-white rounded-lg shadow-lg overflow-hidden">
              {loading[questionObj.question] ? (
                <div className="animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              ) : answers[questionObj.question] ? (
                <div>
                  <div className="relative h-48 bg-gray-100">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 p-4 text-center">
                      <span className="text-sm italic">Image prompt: {answers[questionObj.question].imageUrl}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {answers[questionObj.question].heading}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {answers[questionObj.question].shortInsight}
                    </p>
                    <button 
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                      onClick={() => setSelectedNews(answers[questionObj.question])}
                    >
                      Read More →
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderOtherSegments = () => {
    if (activeSegment === "Consumer Confidence") {
      return (
        <ConsumerConfidenceTab 
          data={answers}
          loading={Object.values(loading).some(Boolean)}
        />
      );
    }

    if (activeSegment === "Search Interest") {
      return (
        <SearchInterestTab
          data={answers}
          loading={Object.values(loading).some(Boolean)}
        />
      );
    }

    if (activeSegment === "Market Share") {
      return (
        <MarketShareTab
          data={answers}
          loading={Object.values(loading).some(Boolean)}
        />
      );
    }

    return (
      <div className="space-y-8">
        {segments[activeSegment].map((question, index) => (
          <div key={typeof question === 'string' ? question : question.question} 
               className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {typeof question === 'string' ? question : question.question}
              </h3>
              
              {loading[typeof question === 'string' ? question : question.question] ? (
                <div className="flex items-center text-gray-500 space-x-2">
                  <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                  <span>Analyzing...</span>
                </div>
              ) : answers[typeof question === 'string' ? question : question.question] ? (
                <div className="prose max-w-none text-gray-600">
                  {typeof answers[typeof question === 'string' ? question : question.question] === 'string' 
                    ? answers[typeof question === 'string' ? question : question.question]
                    : 'Error displaying answer'}
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
    );
  };

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
          {activeSegment === "Laptop Headlines" ? renderLaptopHeadlines() : renderOtherSegments()}
        </div>
      </div>

      {/* Modal */}
      {selectedNews && (
        <NewsModal 
          news={selectedNews} 
          onClose={() => setSelectedNews(null)} 
        />
      )}
    </div>
  );
}
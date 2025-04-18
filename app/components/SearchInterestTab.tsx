'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Props {
  data: any;
  loading: boolean;
}

export default function SearchInterestTab({ data, loading }: Props) {
  const [searchData, setSearchData] = useState<any>(null);

  useEffect(() => {
    if (data) {
      try {
        // Parse search trends data
        const trendsData = JSON.parse(data["What are the current search trends for laptops across Google and YouTube? Include monthly search volumes (in thousands) and top related search terms for each brand."]);
        
        // Parse topic categories data
        const topicsData = JSON.parse(data["What are the most searched laptop-related topics and features in the last 6 months?"]);
        
        // Parse segment comparison data
        const segmentData = JSON.parse(data["Compare search interest between gaming laptops and business laptops for major brands"]);

        setSearchData({
          trends: trendsData,
          topics: topicsData,
          segments: segmentData
        });
      } catch (error) {
        console.error('Error parsing search data:', error);
      }
    }
  }, [data]);

  if (loading || !searchData) {
    return (
      <div className="animate-pulse">
        <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  // Prepare data for the search trends chart
  const searchTrendsData = {
    labels: searchData.trends.searchTrends.months,
    datasets: Object.entries(searchData.trends.searchTrends.data).map(([brand, data]: [string, any]) => ({
      label: brand,
      data: data.searchVolume,
      borderColor: brand === 'Lenovo' ? 'rgb(54, 162, 235)' : 
                  brand === 'Dell' ? 'rgb(255, 99, 132)' : 
                  'rgb(75, 192, 192)',
      backgroundColor: brand === 'Lenovo' ? 'rgba(54, 162, 235, 0.5)' : 
                      brand === 'Dell' ? 'rgba(255, 99, 132, 0.5)' : 
                      'rgba(75, 192, 192, 0.5)',
      tension: 0.3,
    })),
  };

  // Prepare data for feature interest chart
  const featureInterestData = {
    labels: searchData.topics.featureInterest.labels,
    datasets: [{
      label: 'Search Interest',
      data: searchData.topics.featureInterest.data,
      backgroundColor: 'rgba(54, 162, 235, 0.7)',
    }],
  };

  // Prepare data for segment comparison
  const segmentComparisonData = {
    labels: searchData.segments.segmentComparison.gaming.brands,
    datasets: [
      {
        label: 'Gaming Laptops',
        data: searchData.segments.segmentComparison.gaming.searchVolume,
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
      },
      {
        label: 'Business Laptops',
        data: searchData.segments.segmentComparison.business.searchVolume,
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
      },
    ],
  };

  return (
    <div className="space-y-8">
      {/* Search Volume Trends */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Search Interest Trends
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart */}
          <div className="lg:col-span-2">
            <div className="h-[400px]">
              <Line
                data={searchTrendsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: true,
                      text: `Monthly Search Volume (${searchData.trends.searchTrends.unit})`,
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `${context.dataset.label}: ${context.parsed.y}k searches`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: false,
                      title: {
                        display: true,
                        text: 'Search Volume (thousands)'
                      }
                    }
                  },
                }}
              />
            </div>
          </div>

          {/* Top Search Terms */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {Object.entries(searchData.trends.searchTrends.data).map(([brand, data]: [string, any]) => (
                <div key={brand} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-3">{brand} Top Searches</h3>
                  <div className="space-y-3">
                    {data.topSearchTerms.map((term: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-800">{term.term}</span>
                          {term.trend === 'up' && (
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                          )}
                          {term.trend === 'down' && (
                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm text-gray-600">{term.volume}k</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Popular Topics and Features */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Popular Topics and Features
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Feature Interest Chart */}
          <div>
            <div className="h-[400px]">
              <Bar
                data={featureInterestData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    title: {
                      display: true,
                      text: 'Most Searched Features',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Top Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Search Categories</h3>
            {searchData.topics.topCategories.map((category: any, index: number) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{category.category}</h4>
                  <span className={`text-sm ${
                    category.trend === 'up' ? 'text-green-600' :
                    category.trend === 'down' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {category.volume}k searches
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.relatedTerms.map((term: string, termIndex: number) => (
                    <span key={termIndex} className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gaming vs Business Comparison */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Gaming vs Business Laptop Interest
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Comparison Chart */}
          <div className="lg:col-span-2">
            <div className="h-[400px]">
              <Bar
                data={segmentComparisonData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: true,
                      text: 'Search Volume by Segment',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Insights */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-3">Key Insights</h3>
              <div className="space-y-4">
                {searchData.segments.insights.map((insight: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 text-sm">{index + 1}</span>
                    </div>
                    <p className="text-gray-800">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Top Gaming Models</h4>
                {searchData.segments.segmentComparison.gaming.topModels.map((model: any, index: number) => (
                  <div key={index} className="flex justify-between items-center text-sm mb-2">
                    <span className="text-gray-800">{model.model}</span>
                    <span className="text-gray-600">{model.volume}k searches</span>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Top Business Models</h4>
                {searchData.segments.segmentComparison.business.topModels.map((model: any, index: number) => (
                  <div key={index} className="flex justify-between items-center text-sm mb-2">
                    <span className="text-gray-800">{model.model}</span>
                    <span className="text-gray-600">{model.volume}k searches</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
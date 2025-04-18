// app/components/ConsumerConfidenceTab.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Radar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

interface ConsumerInsight {
  category: string;
  scores: {
    Lenovo: number;
    Dell: number;
    HP: number;
  };
  insights: string[];
}

interface Props {
  data: any;
  loading: boolean;
}

export default function ConsumerConfidenceTab({ data, loading }: Props) {
  const [processedData, setProcessedData] = useState<ConsumerInsight[]>([]);

  useEffect(() => {
    if (data) {
      // Process the data for visualization
      // This would be where we parse the Perplexity.ai responses
      // For now, using placeholder data
      setProcessedData([
        {
          category: 'Customer Support',
          scores: {
            Lenovo: 7.5,
            Dell: 8.0,
            HP: 6.5
          },
          insights: [
            'Dell leads in post-warranty support accessibility',
            'Lenovo shows strong business support but mixed consumer experiences',
            'HP faces challenges with consumer-grade support response times'
          ]
        },
        // Add more categories...
      ]);
    }
  }, [data]);

  const barChartData = {
    labels: ['Customer Support', 'Hardware Reliability', 'Brand Loyalty', 'Product Line Trust', 'Repairability'],
    datasets: [
      {
        label: 'Lenovo',
        data: [7.5, 8.0, 7.8, 8.2, 7.0],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
      {
        label: 'Dell',
        data: [8.0, 7.5, 7.6, 7.8, 6.5],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'HP',
        data: [6.5, 7.0, 7.2, 7.5, 6.0],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const radarChartData = {
    labels: ['Support Quality', 'Hardware Durability', 'Brand Trust', 'Repairability', 'Value for Money'],
    datasets: [
      {
        label: 'Lenovo',
        data: [7.5, 8.0, 7.8, 7.0, 8.2],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
      },
      {
        label: 'Competitors Avg',
        data: [7.25, 7.25, 7.4, 6.25, 7.65],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
      },
    ],
  };

  if (loading) {
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

  return (
    <div className="space-y-8">
      {/* Overview Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Consumer Confidence Overview
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bar Chart */}
          <div className="bg-white p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Brand Comparison Metrics</h3>
            <Bar 
              data={barChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: true,
                    text: 'Key Performance Metrics by Brand'
                  },
                }
              }}
            />
          </div>

          {/* Radar Chart */}
          <div className="bg-white p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lenovo vs Competition</h3>
            <Radar 
              data={radarChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Key Consumer Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Customer Support Card */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Customer Support</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-800">
                • Strong business support infrastructure
              </p>
              <p className="text-sm text-gray-800">
                • Mixed consumer experience ratings
              </p>
              <p className="text-sm text-gray-800">
                • Above-average response times
              </p>
            </div>
          </div>

          {/* Hardware Reliability Card */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Hardware Reliability</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-800">
                • Excellent ThinkPad durability
              </p>
              <p className="text-sm text-gray-800">
                • Consumer models show improvement
              </p>
              <p className="text-sm text-gray-800">
                • Better than industry average lifespan
              </p>
            </div>
          </div>

          {/* Brand Trust Card */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Brand Trust</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-800">
                • High business sector confidence
              </p>
              <p className="text-sm text-gray-800">
                • Growing gaming segment trust
              </p>
              <p className="text-sm text-gray-800">
                • Strong warranty fulfillment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Strategic Recommendations
        </h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 text-sm">1</span>
            </div>
            <p className="text-gray-800">
              Focus on improving consumer-grade support to match business support quality
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 text-sm">2</span>
            </div>
            <p className="text-gray-800">
              Leverage ThinkPad reliability reputation in consumer marketing
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 text-sm">3</span>
            </div>
            <p className="text-gray-800">
              Enhance post-warranty support options to improve long-term customer retention
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
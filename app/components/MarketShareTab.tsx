'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  data: any;
  loading: boolean;
}

export default function MarketShareTab({ data, loading }: Props) {
  const [marketData, setMarketData] = useState<any>({
    globalShare: null,
    segmentShare: null,
    insights: null
  });

  useEffect(() => {
    if (data) {
      try {
        // Process global market share data
        const globalShareData = JSON.parse(data["What is the current global market share distribution among laptop manufacturers? Focus on Lenovo, HP, Dell, Apple, Acer and others. Provide exact percentages and recent trends."]);
        
        // Process segment data
        const segmentData = JSON.parse(data["What is Lenovo's market share across different segments (Consumer, Enterprise, Education, Gaming, Workstation)? Compare with industry average."]);
        
        // Process insights data
        const insightsData = JSON.parse(data["What are the key growth drivers and strategic insights for Lenovo's market position? Include recommendations."]);

        setMarketData({
          globalShare: globalShareData,
          segmentShare: segmentData,
          insights: insightsData
        });
      } catch (error) {
        console.error('Error parsing market share data:', error);
      }
    }
  }, [data]);

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

  if (!marketData.globalShare || !marketData.segmentShare || !marketData.insights) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading market share data...</p>
      </div>
    );
  }

  const globalMarketShareData = {
    labels: Object.keys(marketData.globalShare.globalShare),
    datasets: [
      {
        data: Object.values(marketData.globalShare.globalShare),
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',   // Lenovo - Blue
          'rgba(255, 99, 132, 0.8)',   // HP - Pink
          'rgba(75, 192, 192, 0.8)',   // Dell - Teal
          'rgba(255, 206, 86, 0.8)',   // Apple - Yellow
          'rgba(153, 102, 255, 0.8)',  // Acer - Purple
          'rgba(201, 203, 207, 0.8)',  // Others - Gray
        ],
        borderColor: [
          'rgb(54, 162, 235)',
          'rgb(255, 99, 132)',
          'rgb(75, 192, 192)',
          'rgb(255, 206, 86)',
          'rgb(153, 102, 255)',
          'rgb(201, 203, 207)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const segmentMarketShareData = {
    labels: marketData.segmentShare.segments,
    datasets: [
      {
        label: 'Lenovo',
        data: marketData.segmentShare.lenovoShare,
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
      },
      {
        label: 'Competitors Avg',
        data: marketData.segmentShare.competitorAvg,
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
      },
    ],
  };

  const yearOverYearData = {
    labels: marketData.globalShare.yearlyTrend.quarters,
    datasets: [
      {
        label: 'Market Share %',
        data: marketData.globalShare.yearlyTrend.values,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="space-y-8">
      {/* Global Market Share */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Global Market Share Distribution
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-[400px] flex items-center justify-center">
            <Pie
              data={globalMarketShareData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'right' as const,
                  },
                  title: {
                    display: true,
                    text: 'Global Laptop Market Share (%)',
                  },
                },
              }}
            />
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Highlights</h3>
            <div className="space-y-4">
              {marketData.globalShare.insights.map((insight: string, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 text-sm">{index + 1}</span>
                  </div>
                  <p className="text-gray-800">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Segment-wise Performance */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Segment-wise Market Performance
        </h2>
        <div className="h-[400px]">
          <Bar
            data={segmentMarketShareData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: true,
                  text: 'Market Share by Segment (%)',
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

      {/* Market Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Growth Trends */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Year-over-Year Growth
          </h2>
          <div className="h-[300px]">
            <Bar
              data={yearOverYearData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  title: {
                    display: true,
                    text: 'Lenovo Market Share Trend',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: false,
                    min: Math.min(...marketData.globalShare.yearlyTrend.values) - 2,
                    max: Math.max(...marketData.globalShare.yearlyTrend.values) + 2,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Strategic Insights */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Strategic Insights
          </h2>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Market Leadership</h3>
              <ul className="space-y-2 text-gray-800">
                {marketData.insights.marketLeadership.map((item: string, index: number) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Growth Drivers</h3>
              <ul className="space-y-2 text-gray-800">
                {marketData.insights.growthDrivers.map((item: string, index: number) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Focus Areas</h3>
              <ul className="space-y-2 text-gray-800">
                {marketData.insights.focusAreas.map((item: string, index: number) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Market Share Growth Recommendations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Short-term Actions</h3>
            <ul className="space-y-2 text-gray-800">
              {marketData.insights.recommendations.shortTerm.map((item: string, index: number) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Mid-term Strategy</h3>
            <ul className="space-y-2 text-gray-800">
              {marketData.insights.recommendations.midTerm.map((item: string, index: number) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Long-term Vision</h3>
            <ul className="space-y-2 text-gray-800">
              {marketData.insights.recommendations.longTerm.map((item: string, index: number) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 
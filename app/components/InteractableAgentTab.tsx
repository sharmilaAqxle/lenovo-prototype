'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const suggestedQuestions = [
  "How does Lenovo's search interest compare to Dell and HP across platforms?",
  "What are the key search terms driving traffic to Lenovo vs competitors?",
  "Which product categories show the strongest search performance?",
  "Who are Lenovo's main organic search competitors in key product categories?",
  "How does Lenovo's ad spend compare to Dell and HP?",
  "Which keywords are we losing to competitors in organic search?",
  "Which product categories show the highest search growth potential?",
  "What are the untapped keyword opportunities in our market?",
  "Which competitor keywords should we target for growth?"
];

interface CustomChartData {
  title?: string;
  subtitle?: string;
  insights?: string[];
  chart_name?: string;
  'x-axis'?: {
    name: string;
    values: string[];
  };
  'y-axis'?: {
    name: string;
    values: {
      lenovo_performance?: number[];
      competitor_avg?: number[];
      lenovo?: number[];
      performance?: number[];
      data?: number[];
      competitors?: number[];
      competitor?: number[];
      [key: string]: any; // Allow for any additional properties
    } | number[]; // Allow for direct array values
  };
  answer?: {
    title?: string;
    subtitle?: string;
    insights?: string[];
    chart_name?: string;
    'x-axis'?: {
      name: string;
      values: string[];
    };
    'y-axis'?: {
      name: string;
      values: {
        lenovo_performance?: number[];
        competitor_avg?: number[];
        lenovo?: number[];
        performance?: number[];
        data?: number[];
        competitors?: number[];
        competitor?: number[];
        [key: string]: any;
      } | number[];
    };
  };
}

const defaultQuestions = [
  "Show me the keyword performance gaps",
  "Show me the ad spend efficiency",
  "Show me the YouTube trends",
  "Show me the competitor impact",
  "Show me the opportunity keywords"
];

const InteractableAgentTab: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const [responses, setResponses] = useState<Array<{question: string, answer: string | CustomChartData}>>([]);
  const [tileData, setTileData] = useState<CustomChartData[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDefaultData = async () => {
      try {
        const endpoints = [
          '/api/keyword-gaps',
          '/api/ad-spend-efficiency',
          '/api/youtube-trends',
          '/api/competitor-impact',
          '/api/opportunity-keywords'
        ];

        const responses = await Promise.all(
          endpoints.map(endpoint =>
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true' 
              },
              mode: 'cors'
            })
          )
        );

        const data = await Promise.all(
          responses.map(response => response.json())
        );
        
        // Log the API responses to see what we're getting
        console.log('API Responses:', data);
        
        // Log each response's title and subtitle
        data.forEach((item, index) => {
          console.log(`Response ${index} title:`, item.title);
          console.log(`Response ${index} subtitle:`, item.subtitle);
          console.log(`Response ${index} full data:`, item);
        });
        
        // Set the tile data for the dashboard
        setTileData(data);
      } catch (error) {
        console.error('Error fetching default data:', error);
      }
    };

    fetchDefaultData();
  }, []);

  const handleQuestionClick = (question: string) => {
    setUserInput(question);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setResponses(prev => [...prev, { question: userInput, answer: 'Loading...' }]);
    
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
              content: "You are a helpful assistant providing market analysis for Lenovo. Always maintain the context of Lenovo and its products, even when the question doesn't explicitly mention them. Compare Lenovo with its main competitors (Dell and HP) whenever relevant. Format your responses with a title, subtitle, insights (as a bullet list), and if applicable, chart data in the following JSON format: {\"title\": \"Main Title\", \"subtitle\": \"Subtitle\", \"insights\": [\"Insight 1\", \"Insight 2\"], \"chart_name\": \"chart_type\", \"x-axis\": {\"name\": \"x-axis name\", \"values\": [\"value1\", \"value2\"]}, \"y-axis\": {\"name\": \"y-axis name\", \"values\": {\"data\": [10, 20]}}}. If no chart is needed, omit the chart_name and axis properties."
            },
            {
              role: "user",
              content: userInput
            }
          ]
        })
      });

      const data = await response.json();
      
      // Try to parse the response as JSON to extract structured data
      let formattedAnswer: string | CustomChartData = data.choices[0].message.content;
      
      try {
        // Check if the response is already in JSON format
        if (typeof formattedAnswer === 'string' && formattedAnswer.trim().startsWith('{')) {
          const parsedData = JSON.parse(formattedAnswer);
          
          // Check if it has the expected structure
          if (parsedData.title && parsedData.subtitle) {
            formattedAnswer = parsedData as CustomChartData;
          }
        }
      } catch (error) {
        console.error('Error parsing response as JSON:', error);
        // If parsing fails, keep the original string response
      }
      
      setResponses(prev => {
        const newResponses = [...prev];
        newResponses[newResponses.length - 1].answer = formattedAnswer;
        return newResponses;
      });
    } catch (error) {
      console.error('Error:', error);
      setResponses(prev => {
        const newResponses = [...prev];
        newResponses[newResponses.length - 1].answer = 'Error: Failed to get response';
        return newResponses;
      });
    }

    setUserInput('');
  };

  const handleDeepSearch = async () => {
    if (responses.length === 0) {
      alert("No previous questions to analyze. Please ask some questions first.");
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      // Format all previous questions and answers for analysis
      const analysisContext = responses.map((item, index) => {
        const question = item.question;
        const answer = typeof item.answer === 'string' 
          ? item.answer 
          : JSON.stringify(item.answer);
        
        return `Question ${index + 1}: ${question}\nAnswer: ${answer}\n`;
      }).join('\n');
      
      // Send to Perplexity API for pattern analysis
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
              content: "You are a data analyst specializing in market research for Lenovo. Analyze the provided questions and answers to identify patterns, trends, and insights that weren't explicitly asked about. Look for connections between different data points and provide a comprehensive analysis."
            },
            {
              role: "user",
              content: `Please analyze these previous questions and answers to identify patterns and insights about Lenovo's market position:\n\n${analysisContext}\n\nWhat patterns, trends, or insights can you identify from this data that weren't explicitly asked about?`
            }
          ]
        })
      });

      const data = await response.json();
      
      // Try to parse the response as JSON to extract structured data
      let formattedAnswer: string | CustomChartData = data.choices[0].message.content;
      
      try {
        // Check if the response is already in JSON format
        if (typeof formattedAnswer === 'string' && formattedAnswer.trim().startsWith('{')) {
          const parsedData = JSON.parse(formattedAnswer);
          
          // Check if it has the expected structure
          if (parsedData.title && parsedData.subtitle) {
            formattedAnswer = parsedData as CustomChartData;
          }
        }
      } catch (error) {
        console.error('Error parsing response as JSON:', error);
        // If parsing fails, keep the original string response
      }
      
      // Add the analysis as a new response
      setResponses(prev => [...prev, { 
        question: "Deep Analysis of Previous Questions", 
        answer: formattedAnswer 
      }]);
      
    } catch (error) {
      console.error('Error during deep search:', error);
      setResponses(prev => [...prev, { 
        question: "Deep Analysis of Previous Questions", 
        answer: "Error: Failed to analyze previous questions" 
      }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderChart = (data: CustomChartData, hideChartTitle: boolean = false) => {
    if (!data || typeof data !== 'object') {
      return <div className="text-red-500">Error: Invalid chart data</div>;
    }

    // Check if we have insights but no chart data
    const hasInsights = (data.answer?.insights || data.insights) && 
                        ((data.answer?.insights?.length || 0) > 0 || (data.insights?.length || 0) > 0);
    
    // If we have insights but no chart data, just display the insights
    if (hasInsights && (!data['x-axis']?.values || !data['y-axis']?.values)) {
      return (
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800">{data.answer?.title || data.title || 'Analysis'}</h2>
            {(data.answer?.subtitle || data.subtitle) && (
              <p className="text-sm text-gray-600">{data.answer?.subtitle || data.subtitle}</p>
            )}
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Key Insights:</h3>
            <ul className="list-disc list-inside space-y-1">
              {(data.answer?.insights || data.insights || [])?.map((insight, index) => (
                <li key={index} className="text-gray-700">{insight}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    if (!data['x-axis']?.values || !data['y-axis']?.values) {
      return <div className="text-red-500">Error: Missing chart axis data</div>;
    }

    // Log the chart data to see what we're working with
    console.log('Rendering chart with data:', data);
    console.log('Chart name:', data.chart_name);
    console.log('Chart title:', data.answer?.title);
    console.log('Chart subtitle:', data.answer?.subtitle);

    let chartData: any;
    let options: ChartOptions<any>;
    let ChartComponent: any;

    // Convert chart_name to lowercase for case-insensitive comparison
    const chartType = data.chart_name ? data.chart_name.toLowerCase() : '';

    // Handle different possible structures for y-axis values
    const yAxisValues = data['y-axis']?.values || {};
    
    // Extract data with better fallbacks
    let lenovoData: number[] = [];
    let competitorData: number[] = [];
    
    // Check if we have the expected structure
    if (Array.isArray(yAxisValues)) {
      // If yAxisValues is directly an array, use it as lenovoData
      lenovoData = yAxisValues;
    } else if (typeof yAxisValues === 'object') {
      // Try to get Lenovo data
      if (Array.isArray(yAxisValues.lenovo_performance)) {
        lenovoData = yAxisValues.lenovo_performance;
      } else if (Array.isArray((yAxisValues as any).lenovo)) {
        lenovoData = (yAxisValues as any).lenovo;
      } else if (Array.isArray((yAxisValues as any).performance)) {
        lenovoData = (yAxisValues as any).performance;
      } else if (Array.isArray((yAxisValues as any).data)) {
        lenovoData = (yAxisValues as any).data;
      } else if (Array.isArray((yAxisValues as any).lenovo_spend)) {
        lenovoData = (yAxisValues as any).lenovo_spend;
      } else if (Array.isArray((yAxisValues as any).lenovo_content)) {
        lenovoData = (yAxisValues as any).lenovo_content;
      }
      
      // Try to get competitor data
      if (Array.isArray(yAxisValues.competitor_avg)) {
        competitorData = yAxisValues.competitor_avg;
      } else if (Array.isArray((yAxisValues as any).competitors)) {
        competitorData = (yAxisValues as any).competitors;
      } else if (Array.isArray((yAxisValues as any).competitor)) {
        competitorData = (yAxisValues as any).competitor;
      } else if (Array.isArray((yAxisValues as any).competitor_spend)) {
        competitorData = (yAxisValues as any).competitor_spend;
      }
    }

    // If we're still missing data, check if it's in the answer property
    if (lenovoData.length === 0 && data.answer?.['y-axis']?.values) {
      const answerYAxis = data.answer['y-axis'].values;
      if (typeof answerYAxis === 'object') {
        if (Array.isArray((answerYAxis as any).lenovo_content)) {
          lenovoData = (answerYAxis as any).lenovo_content;
        }
        if (Array.isArray((answerYAxis as any).competitor_avg)) {
          competitorData = (answerYAxis as any).competitor_avg;
        }
      }
    }

    console.log('Chart type to render:', chartType);
    console.log('Lenovo data:', lenovoData);
    console.log('Competitor data:', competitorData);

    // Force a specific chart type for testing
    let forcedChartType = chartType;
    
    // Uncomment one of these lines to force a specific chart type for testing
    // forcedChartType = 'grouped_bar_chart';
    // forcedChartType = 'line_chart';
    // forcedChartType = 'scatter_chart';
    
    console.log('Forced chart type:', forcedChartType);

    switch (forcedChartType) {
      case 'grouped_bar_chart':
        console.log('Rendering grouped bar chart');
        ChartComponent = Bar;
        chartData = {
          labels: data['x-axis']?.values || data.answer?.['x-axis']?.values || [],
          datasets: [
            {
              label: 'Lenovo',
              data: lenovoData,
              backgroundColor: 'rgba(0, 112, 192, 0.8)',
              borderColor: 'rgb(0, 112, 192)',
              borderWidth: 1,
              barPercentage: 0.4,
            },
            {
              label: 'Competitors (Dell/HP)',
              data: competitorData,
              backgroundColor: 'rgba(192, 192, 192, 0.8)',
              borderColor: 'rgb(192, 192, 192)',
              borderWidth: 1,
              barPercentage: 0.4,
            },
          ],
        };
        options = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top' as const,
              labels: {
                usePointStyle: true,
                padding: 20,
              }
            },
            title: {
              display: !hideChartTitle,
              text: data.answer?.title || data.title || 'Performance Comparison',
              font: {
                size: 16,
                weight: 'bold' as const
              }
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: data['y-axis']?.name || data.answer?.['y-axis']?.name || 'Performance Score',
                font: {
                  weight: 'bold' as const
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                callback: function(value: number) {
                  if (value >= 1000000000) {
                    return (value / 1000000000).toFixed(1) + 'B';
                  } else if (value >= 1000000) {
                    return (value / 1000000).toFixed(1) + 'M';
                  } else if (value >= 1000) {
                    return (value / 1000).toFixed(1) + 'K';
                  }
                  return value.toString();
                }
              }
            },
            x: {
              title: {
                display: true,
                text: data['x-axis']?.name || data.answer?.['x-axis']?.name || 'Categories',
                font: {
                  weight: 'bold' as const
                }
              },
              grid: {
                display: false
              }
            }
          }
        };
        break;

      case 'line_chart':
        console.log('Rendering line chart');
        ChartComponent = Line;
        
        // Check if we have multiple impact metrics in the y-axis values
        const yAxisValues = data['y-axis']?.values || data.answer?.['y-axis']?.values || {};
        
        // Create datasets for each impact metric
        const datasets = [];
        
        // Define colors for different impact metrics
        const colors = {
          social_impact: { border: 'rgb(0, 112, 192)', background: 'rgba(0, 112, 192, 0.1)' },
          video_impact: { border: 'rgb(0, 176, 240)', background: 'rgba(0, 176, 240, 0.1)' },
          display_impact: { border: 'rgb(192, 192, 192)', background: 'rgba(192, 192, 192, 0.1)' }
        };
        
        // Add a dataset for each impact metric
        if (typeof yAxisValues === 'object' && !Array.isArray(yAxisValues)) {
          if (Array.isArray(yAxisValues.social_impact)) {
            datasets.push({
              label: 'Social Impact',
              data: yAxisValues.social_impact,
              borderColor: colors.social_impact.border,
              backgroundColor: colors.social_impact.background,
              tension: 0.4,
              fill: true,
            });
          }
          
          if (Array.isArray(yAxisValues.video_impact)) {
            datasets.push({
              label: 'Video Impact',
              data: yAxisValues.video_impact,
              borderColor: colors.video_impact.border,
              backgroundColor: colors.video_impact.background,
              tension: 0.4,
              fill: true,
            });
          }
          
          if (Array.isArray(yAxisValues.display_impact)) {
            datasets.push({
              label: 'Display Impact',
              data: yAxisValues.display_impact,
              borderColor: colors.display_impact.border,
              backgroundColor: colors.display_impact.background,
              tension: 0.4,
              fill: true,
            });
          }
        }
        
        // If no impact metrics found, fall back to the standard approach
        if (datasets.length === 0) {
          datasets.push({
            label: 'Lenovo',
            data: lenovoData,
            borderColor: 'rgb(0, 112, 192)',
            backgroundColor: 'rgba(0, 112, 192, 0.1)',
            tension: 0.4,
            fill: true,
          });
          
          if (competitorData.length > 0) {
            datasets.push({
              label: 'Competitors',
              data: competitorData,
              borderColor: 'rgb(192, 192, 192)',
              backgroundColor: 'rgba(192, 192, 192, 0.1)',
              tension: 0.4,
              fill: true,
            });
          }
        }
        
        chartData = {
          labels: data['x-axis']?.values || data.answer?.['x-axis']?.values || [],
          datasets: datasets,
        };
        
        options = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top' as const,
              labels: {
                usePointStyle: true,
                padding: 20,
              }
            },
            title: {
              display: !hideChartTitle,
              text: data.answer?.title || data.title || 'Performance Comparison',
              font: {
                size: 16,
                weight: 'bold' as const
              }
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: data['y-axis']?.name || data.answer?.['y-axis']?.name || 'Performance Score',
                font: {
                  weight: 'bold' as const
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                callback: function(value: number) {
                  if (value >= 1000000000) {
                    return (value / 1000000000).toFixed(1) + 'B';
                  } else if (value >= 1000000) {
                    return (value / 1000000).toFixed(1) + 'M';
                  } else if (value >= 1000) {
                    return (value / 1000).toFixed(1) + 'K';
                  }
                  return value.toString();
                }
              }
            },
            x: {
              title: {
                display: true,
                text: data['x-axis']?.name || data.answer?.['x-axis']?.name || 'Categories',
                font: {
                  weight: 'bold' as const
                }
              },
              grid: {
                display: false
              }
            }
          }
        };
        break;

      case 'stacked_bar_chart':
        console.log('Rendering stacked bar chart');
        ChartComponent = Bar;
        chartData = {
          labels: data['x-axis']?.values || data.answer?.['x-axis']?.values || [],
          datasets: [
            {
              label: 'Lenovo',
              data: lenovoData,
              backgroundColor: 'rgba(0, 112, 192, 0.8)',
              borderColor: 'rgb(0, 112, 192)',
              borderWidth: 1,
            },
            {
              label: 'Competitors (Dell/HP)',
              data: competitorData,
              backgroundColor: 'rgba(192, 192, 192, 0.8)',
              borderColor: 'rgb(192, 192, 192)',
              borderWidth: 1,
            },
          ],
        };
        // Initialize options before using it
        options = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top' as const,
              labels: {
                usePointStyle: true,
                padding: 20,
              }
            },
            title: {
              display: !hideChartTitle,
              text: data.answer?.title || data.title || 'Performance Comparison',
              font: {
                size: 16,
                weight: 'bold' as const
              }
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: data['y-axis']?.name || data.answer?.['y-axis']?.name || 'Performance Score',
                font: {
                  weight: 'bold' as const
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                callback: function(value: number) {
                  if (value >= 1000000000) {
                    return (value / 1000000000).toFixed(1) + 'B';
                  } else if (value >= 1000000) {
                    return (value / 1000000).toFixed(1) + 'M';
                  } else if (value >= 1000) {
                    return (value / 1000).toFixed(1) + 'K';
                  }
                  return value.toString();
                }
              },
              stacked: true
            },
            x: {
              title: {
                display: true,
                text: data['x-axis']?.name || data.answer?.['x-axis']?.name || 'Categories',
                font: {
                  weight: 'bold' as const
                }
              },
              grid: {
                display: false
              },
              stacked: true
            }
          }
        };
        break;

      case 'scatter_chart':
        console.log('Rendering scatter chart');
        ChartComponent = Scatter;
        
        // Get the x and y values from the API response
        const xAxisValues = data['x-axis']?.values || data.answer?.['x-axis']?.values || [];
        const scatterYAxisValues = data['y-axis']?.values || data.answer?.['y-axis']?.values || {};
        
        // Check if we have the keywords and scores structure for the fifth chart
        if (typeof scatterYAxisValues === 'object' && !Array.isArray(scatterYAxisValues) && 
            'keywords' in scatterYAxisValues && Array.isArray(scatterYAxisValues.keywords) && 
            'scores' in scatterYAxisValues && Array.isArray(scatterYAxisValues.scores)) {
          
          // Define colors for different keywords
          const keywordColors = [
            'rgba(0, 112, 192, 0.8)',   // Lenovo blue
            'rgba(0, 176, 240, 0.8)',   // Light blue
            'rgba(0, 176, 80, 0.8)',    // Green
            'rgba(255, 128, 0, 0.8)',   // Orange
            'rgba(192, 0, 0, 0.8)',     // Red
            'rgba(128, 0, 128, 0.8)',   // Purple
            'rgba(0, 128, 128, 0.8)',   // Teal
            'rgba(128, 128, 0, 0.8)',   // Olive
          ];
          
          // Create scatter data points from keywords and scores
          const scatterData = scatterYAxisValues.keywords.map((keyword: string, index: number) => ({
            x: xAxisValues[index] || 0,
            y: scatterYAxisValues.scores[index] || 0,
            label: keyword, // Store the keyword as a label
            color: keywordColors[index % keywordColors.length] // Assign a color based on index
          }));
          
          chartData = {
            datasets: [
              {
                label: 'Keywords',
                data: scatterData,
                backgroundColor: scatterData.map(point => point.color),
                pointRadius: 8,
                pointHoverRadius: 10,
              }
            ],
          };
          
          // Custom tooltip to show the keyword
          options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top' as const,
                labels: {
                  usePointStyle: true,
                  padding: 20,
                }
              },
              title: {
                display: !hideChartTitle,
                text: data.answer?.title || data.title || 'Keyword Opportunities',
                font: {
                  size: 16,
                  weight: 'bold' as const
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context: any) {
                    const point = context.raw;
                    return `${point.label}: ${point.y} score, ${point.x} search volume`;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: data['y-axis']?.name || data.answer?.['y-axis']?.name || 'Opportunity Score',
                  font: {
                    weight: 'bold' as const
                  }
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)'
                }
              },
              x: {
                title: {
                  display: true,
                  text: data['x-axis']?.name || data.answer?.['x-axis']?.name || 'Search Volume',
                  font: {
                    weight: 'bold' as const
                  }
                },
                grid: {
                  display: false
                }
              }
            }
          };
        } else {
          // Original scatter chart logic for other cases
          // For YouTube trends, we need to handle the data differently
          // The data should be in the format of {x: value, y: value} for scatter plots
          const scatterData = [];
          
          // Extract the data points for the scatter plot
          if (Array.isArray(xAxisValues) && typeof scatterYAxisValues === 'object' && !Array.isArray(scatterYAxisValues)) {
            // Try to get the data from different possible structures
            let dataPoints: number[] = [];
            
            // Type guard to check if yValues is an object with specific properties
            if ('data' in scatterYAxisValues && Array.isArray(scatterYAxisValues.data)) {
              dataPoints = scatterYAxisValues.data;
            } else if ('lenovo' in scatterYAxisValues && Array.isArray(scatterYAxisValues.lenovo)) {
              dataPoints = scatterYAxisValues.lenovo;
            } else if ('performance' in scatterYAxisValues && Array.isArray(scatterYAxisValues.performance)) {
              dataPoints = scatterYAxisValues.performance;
            } else if ('lenovo_content' in scatterYAxisValues && Array.isArray(scatterYAxisValues.lenovo_content)) {
              dataPoints = scatterYAxisValues.lenovo_content;
            }
            
            // Create the scatter data points
            for (let i = 0; i < xAxisValues.length; i++) {
              if (dataPoints[i] !== undefined) {
                scatterData.push({
                  x: xAxisValues[i],
                  y: dataPoints[i]
                });
              }
            }
          }
          
          chartData = {
            datasets: [
              {
                label: 'Lenovo',
                data: scatterData,
                backgroundColor: 'rgba(0, 112, 192, 0.8)',
              },
              ...(competitorData.length > 0 ? [{
                label: 'Competitors',
                data: data['x-axis']?.values?.map((x, i) => ({
                  x: x,
                  y: competitorData[i] || 0,
                })) || [],
                backgroundColor: 'rgba(192, 192, 192, 0.8)',
              }] : []),
            ],
          };
          
          options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top' as const,
                labels: {
                  usePointStyle: true,
                  padding: 20,
                }
              },
              title: {
                display: !hideChartTitle,
                text: data.answer?.title || data.title || 'Performance Comparison',
                font: {
                  size: 16,
                  weight: 'bold' as const
                }
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: data['y-axis']?.name || data.answer?.['y-axis']?.name || 'Performance Score',
                  font: {
                    weight: 'bold' as const
                  }
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                  callback: function(value: number) {
                    if (value >= 1000000000) {
                      return (value / 1000000000).toFixed(1) + 'B';
                    } else if (value >= 1000000) {
                      return (value / 1000000).toFixed(1) + 'M';
                    } else if (value >= 1000) {
                      return (value / 1000).toFixed(1) + 'K';
                    }
                    return value.toString();
                  }
                }
              },
              x: {
                title: {
                  display: true,
                  text: data['x-axis']?.name || data.answer?.['x-axis']?.name || 'Categories',
                  font: {
                    weight: 'bold' as const
                  }
                },
                grid: {
                  display: false
                }
              }
            }
          };
        }
        break;

      case 'pie_chart':
        console.log('Rendering pie chart');
        ChartComponent = Pie;
        chartData = {
          labels: data['x-axis']?.values || data.answer?.['x-axis']?.values || [],
          datasets: [
            {
              data: lenovoData,
              backgroundColor: [
                'rgba(0, 112, 192, 0.8)',
                'rgba(192, 192, 192, 0.8)',
                'rgba(0, 176, 240, 0.8)',
                'rgba(0, 112, 192, 0.6)',
                'rgba(192, 192, 192, 0.6)',
              ],
            },
          ],
        };
        options = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top' as const,
              labels: {
                usePointStyle: true,
                padding: 20,
              }
            },
            title: {
              display: !hideChartTitle,
              text: data.answer?.title || data.title || 'Performance Comparison',
              font: {
                size: 16,
                weight: 'bold' as const
              }
            },
          }
        };
        break;

      default:
        console.log('Rendering default chart (bar)');
        ChartComponent = Bar;
        chartData = {
          labels: data['x-axis'].values,
          datasets: [
            {
              label: 'Lenovo',
              data: lenovoData,
              backgroundColor: 'rgba(0, 112, 192, 0.8)',
              borderColor: 'rgb(0, 112, 192)',
              borderWidth: 1,
            },
            ...(competitorData.length > 0 ? [{
              label: 'Competitors',
              data: competitorData,
              backgroundColor: 'rgba(192, 192, 192, 0.8)',
              borderColor: 'rgb(192, 192, 192)',
              borderWidth: 1,
            }] : []),
          ],
        };
        options = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top' as const,
              labels: {
                usePointStyle: true,
                padding: 20,
              }
            },
            title: {
              display: !hideChartTitle,
              text: data.answer?.title || data.title || 'Performance Comparison',
              font: {
                size: 16,
                weight: 'bold' as const
              }
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: data['y-axis']?.name || data.answer?.['y-axis']?.name || 'Performance Score',
                font: {
                  weight: 'bold' as const
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                callback: function(value: number) {
                  if (value >= 1000000000) {
                    return (value / 1000000000).toFixed(1) + 'B';
                  } else if (value >= 1000000) {
                    return (value / 1000000).toFixed(1) + 'M';
                  } else if (value >= 1000) {
                    return (value / 1000).toFixed(1) + 'K';
                  }
                  return value.toString();
                }
              }
            },
            x: {
              title: {
                display: true,
                text: data['x-axis']?.name || data.answer?.['x-axis']?.name || 'Categories',
                font: {
                  weight: 'bold' as const
                }
              },
              grid: {
                display: false
              }
            }
          }
        };
    }

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800">{data.answer?.title || data.title || 'Performance Analysis'}</h2>
          {(data.answer?.subtitle || data.subtitle) && (
            <p className="text-sm text-gray-600">{data.answer?.subtitle || data.subtitle}</p>
          )}
        </div>
        <div className="bg-white p-4 rounded-lg shadow" style={{ height: '300px', maxWidth: '90%', margin: '0 auto' }}>
          <ChartComponent data={chartData} options={options} />
        </div>
        {(data.answer?.insights || data.insights) && ((data.answer?.insights?.length || 0) > 0 || (data.insights?.length || 0) > 0) && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Key Insights:</h3>
            <ul className="list-disc list-inside space-y-1">
              {(data.answer?.insights || data.insights || [])?.map((insight, index) => (
                <li key={index} className="text-gray-700">{insight}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Tiles Grid - Auto height */}
      <div className="grid grid-cols-2 gap-8 p-4">
        {tileData.slice(0, 2).map((data, index) => {
          // Use the exact same approach for both tiles, just with different chart types
          const chartType = index === 0 ? 'grouped_bar_chart' : 'stacked_bar_chart';
          
          return (
            <div key={index} className="bg-white rounded-lg shadow-lg p-4">
              {renderChart({
                ...data,
                chart_name: chartType
              }, true)}
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-3 gap-8 p-4">
        {tileData.slice(2, 5).map((data, index) => (
          <div key={index + 2} className="bg-white rounded-lg shadow-lg p-4">
            {renderChart({
              ...data,
              // Keep the original chart_name from the API response
              chart_name: data.chart_name || 'grouped_bar_chart'
            }, true)}
          </div>
        ))}
      </div>

      {/* Chat Section - Flexible height with scrolling */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto pb-32">
        {responses.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-end">
              <div className="bg-blue-100 rounded-lg p-3 max-w-[80%]">
                <div className="text-sm font-medium text-blue-800">You</div>
                <div className="text-gray-900">{item.question}</div>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                <div className="text-sm font-medium text-gray-800">Assistant</div>
                {typeof item.answer === 'string' ? (
                  <pre className="whitespace-pre-wrap text-sm text-gray-900">{item.answer}</pre>
                ) : (
                  renderChart(item.answer as CustomChartData)
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Section - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask your question..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Ask
          </button>
          <button
            type="button"
            onClick={handleDeepSearch}
            disabled={isAnalyzing || responses.length === 0}
            className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
              isAnalyzing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            {isAnalyzing ? 'Analyzing...' : 'Deep Search'}
          </button>
        </form>

        {/* Question Suggestions */}
        <div className="relative">
          <div className="relative group">
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuestionClick(question)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors whitespace-nowrap"
                >
                  {question}
                </button>
              ))}
            </div>

            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractableAgentTab; 
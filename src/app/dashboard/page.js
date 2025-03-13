'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function Dashboard() {
  const [data, setData] = useState({
    totalParticipants: 0,
    averageScore: 0,
    starTypeDistribution: [],
    scoreDistribution: [],
    pagePointsDistribution: { page1: 0, page2: 0, page3: 0, page4: 0, page5: 0 },
    timeFrameDistribution: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/dashboard');
        const result = await res.json();
        if (result.success) {
          setData({
            totalParticipants: result.data.totalParticipants || 0,
            averageScore: result.data.averageScore || 0,
            starTypeDistribution: result.data.starTypeDistribution || [],
            scoreDistribution: result.data.scoreDistribution || [],
            pagePointsDistribution: result.data.pagePointsDistribution || { page1: 0, page2: 0, page3: 0, page4: 0, page5: 0 },
            timeFrameDistribution: result.data.timeFrameDistribution || [],
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Pie chart for starType distribution
  const starTypeChartData = {
    labels: data.starTypeDistribution.map(item => item._id),
    datasets: [
      {
        label: 'Star Type Distribution',
        data: data.starTypeDistribution.map(item => item.count),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  // Bar chart for score distribution
  const scoreChartData = {
    labels: data.scoreDistribution.map(item => item._id),
    datasets: [
      {
        label: 'Score Distribution',
        data: data.scoreDistribution.map(item => item.count),
        backgroundColor: '#36A2EB',
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };



  // Line chart for timeFrame distribution
  const timeFrameChartData = {
    labels: data.timeFrameDistribution.map(item => item._id),
    datasets: [
      {
        label: 'Participants per Hour',
        data: data.timeFrameDistribution.map(item => item.count),
        fill: false,
        borderColor: '#FFCE56',
        backgroundColor: '#FFCE56',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#fff' } },
      title: { display: true, color: '#fff', font: { size: 18 } },
    },
    scales: {
      x: { ticks: { color: '#fff' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
      y: { ticks: { color: '#fff' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-6">
      <h1 className="text-5xl font-bold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Quiz Dashboard</h1>

      {loading ? (
        <p className="text-center text-2xl">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Total Participants Card */}
          <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Total Participants</CardTitle>
            </CardHeader>
            <CardContent className="text-4xl font-bold text-center text-blue-300">{data.totalParticipants}</CardContent>
          </Card>

          {/* Average Score Card */}
          <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Average Score</CardTitle>
            </CardHeader>
            <CardContent className="text-4xl font-bold text-center text-green-300">{data.averageScore}</CardContent>
          </Card>

          {/* Star Type Distribution Pie Chart */}
          <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300 col-span-1 md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Star Type Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <Pie data={starTypeChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: 'Star Type Distribution' } } }} />
            </CardContent>
          </Card>

          {/* Score Distribution Bar Chart */}
          <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300 col-span-1 md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Score Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <Bar data={scoreChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: 'Score Distribution' } } }} />
            </CardContent>
          </Card>


          {/* Time Frame Distribution Line Chart */}
          <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300 col-span-1 md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Participants per Hour</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              <Bar data={timeFrameChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: 'Participants per Hour' } } }} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

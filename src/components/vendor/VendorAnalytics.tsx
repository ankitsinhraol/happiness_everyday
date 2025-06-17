import React from 'react';
import { BarChart2, TrendingUp, Users, DollarSign, Calendar, Star, ArrowUp, ArrowDown } from 'lucide-react';

const VendorAnalytics: React.FC = () => {
  // Mock data for analytics
  const metrics = [
    {
      label: 'Total Revenue',
      value: '₹2,45,000',
      change: '+12.5%',
      trend: 'up',
      icon: <DollarSign className="text-green-600" size={24} />,
    },
    {
      label: 'Total Bookings',
      value: '156',
      change: '+8.2%',
      trend: 'up',
      icon: <Calendar className="text-blue-600" size={24} />,
    },
    {
      label: 'Customer Base',
      value: '89',
      change: '+15.3%',
      trend: 'up',
      icon: <Users className="text-purple-600" size={24} />,
    },
    {
      label: 'Average Rating',
      value: '4.8',
      change: '-0.2',
      trend: 'down',
      icon: <Star className="text-amber-600" size={24} />,
    },
  ];

  const recentActivity = [
    { type: 'Booking', description: 'New booking for Wedding Photography', date: '2 hours ago' },
    { type: 'Review', description: '5-star review received', date: '5 hours ago' },
    { type: 'Payment', description: 'Payment received for Event Coverage', date: '1 day ago' },
    { type: 'Booking', description: 'Booking confirmed for Corporate Event', date: '2 days ago' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
        <div className="flex items-center space-x-2">
          <select className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 3 months</option>
            <option>Last year</option>
          </select>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                {metric.icon}
              </div>
              <span className={`flex items-center text-sm ${
                metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.change}
                {metric.trend === 'up' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              </span>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              {metric.label}
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Revenue Trend
            </h2>
            <BarChart2 className="text-gray-400" size={20} />
          </div>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              Chart visualization will be implemented here
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
            <TrendingUp className="text-gray-400" size={20} />
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.type}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {activity.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorAnalytics;
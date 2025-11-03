import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Scatter, ScatterChart, ZAxis } from 'recharts';
import { TrendingUp, Users, Eye, MousePointer, Clock, Globe, Activity, ArrowUp, ArrowDown, DollarSign, ShoppingCart, UserCheck, Target } from 'lucide-react';

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');

  // Static data for different metrics
  const pageViewsData = [
    { date: 'Mon', views: 2400, users: 1800, sessions: 2100, newUsers: 600 },
    { date: 'Tue', views: 3200, users: 2300, sessions: 2800, newUsers: 750 },
    { date: 'Wed', views: 2800, users: 2100, sessions: 2500, newUsers: 680 },
    { date: 'Thu', views: 3900, users: 2800, sessions: 3200, newUsers: 920 },
    { date: 'Fri', views: 4200, users: 3100, sessions: 3600, newUsers: 1050 },
    { date: 'Sat', views: 3800, users: 2900, sessions: 3300, newUsers: 890 },
    { date: 'Sun', views: 3400, users: 2600, sessions: 2900, newUsers: 780 }
  ];

  const trafficSourcesData = [
    { name: 'Direct', value: 4200, percentage: 35 },
    { name: 'Organic Search', value: 3600, percentage: 30 },
    { name: 'Social Media', value: 2400, percentage: 20 },
    { name: 'Referral', value: 1200, percentage: 10 },
    { name: 'Email', value: 600, percentage: 5 }
  ];

  const topPagesData = [
    { page: '/home', views: 8500, avgTime: '3:24', bounceRate: 35 },
    { page: '/products', views: 6200, avgTime: '4:15', bounceRate: 28 },
    { page: '/about', views: 4800, avgTime: '2:45', bounceRate: 42 },
    { page: '/blog', views: 3900, avgTime: '5:30', bounceRate: 25 },
    { page: '/contact', views: 2100, avgTime: '1:20', bounceRate: 55 }
  ];

  const deviceData = [
    { device: 'Desktop', users: 6800, sessions: 8200, conversions: 340 },
    { device: 'Mobile', users: 8200, sessions: 9800, conversions: 280 },
    { device: 'Tablet', users: 2000, sessions: 2400, conversions: 85 }
  ];

  const bounceRateData = [
    { hour: '00:00', rate: 45, visits: 120 },
    { hour: '04:00', rate: 52, visits: 80 },
    { hour: '08:00', rate: 38, visits: 450 },
    { hour: '12:00', rate: 35, visits: 680 },
    { hour: '16:00', rate: 32, visits: 820 },
    { hour: '20:00', rate: 40, visits: 520 }
  ];

  const geoData = [
    { country: 'United States', users: 4200, percentage: 35, revenue: 12500 },
    { country: 'United Kingdom', users: 2400, percentage: 20, revenue: 7200 },
    { country: 'Canada', users: 1800, percentage: 15, revenue: 5400 },
    { country: 'Germany', users: 1200, percentage: 10, revenue: 3600 },
    { country: 'Australia', users: 1200, percentage: 10, revenue: 3800 },
    { country: 'Others', users: 1200, percentage: 10, revenue: 2500 }
  ];

  const conversionFunnelData = [
    { stage: 'Visitors', value: 12000, percentage: 100 },
    { stage: 'Product Views', value: 8400, percentage: 70 },
    { stage: 'Add to Cart', value: 4200, percentage: 35 },
    { stage: 'Checkout', value: 2100, percentage: 17.5 },
    { stage: 'Purchase', value: 1440, percentage: 12 }
  ];

  const userEngagementData = [
    { metric: 'Content Quality', score: 85 },
    { metric: 'User Experience', score: 78 },
    { metric: 'Load Speed', score: 92 },
    { metric: 'Mobile Friendly', score: 88 },
    { metric: 'Navigation', score: 82 },
    { metric: 'Visual Design', score: 90 }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 45000, orders: 320, avgOrder: 140 },
    { month: 'Feb', revenue: 52000, orders: 380, avgOrder: 137 },
    { month: 'Mar', revenue: 48000, orders: 350, avgOrder: 137 },
    { month: 'Apr', revenue: 61000, orders: 420, avgOrder: 145 },
    { month: 'May', revenue: 55000, orders: 390, avgOrder: 141 },
    { month: 'Jun', revenue: 67000, orders: 460, avgOrder: 146 }
  ];

  const browserData = [
    { browser: 'Chrome', users: 7200, share: 45 },
    { browser: 'Safari', users: 4000, share: 25 },
    { browser: 'Firefox', users: 2400, share: 15 },
    { browser: 'Edge', users: 1600, share: 10 },
    { browser: 'Others', users: 800, share: 5 }
  ];

  const userRetentionData = [
    { day: 'Day 1', retention: 100 },
    { day: 'Day 2', retention: 65 },
    { day: 'Day 3', retention: 48 },
    { day: 'Day 7', retention: 35 },
    { day: 'Day 14', retention: 28 },
    { day: 'Day 30', retention: 22 }
  ];

  const pageLoadTimeData = [
    { page: 'Home', loadTime: 1.2, size: 2.5 },
    { page: 'Products', loadTime: 2.1, size: 4.2 },
    { page: 'Blog', loadTime: 1.8, size: 3.1 },
    { page: 'About', loadTime: 1.5, size: 2.8 },
    { page: 'Contact', loadTime: 1.1, size: 1.9 }
  ];

  const socialMediaData = [
    { platform: 'Facebook', clicks: 3200, conversions: 128, spent: 1200 },
    { platform: 'Instagram', clicks: 4100, conversions: 205, spent: 1500 },
    { platform: 'Twitter', clicks: 2400, conversions: 84, spent: 800 },
    { platform: 'LinkedIn', clicks: 1800, conversions: 108, spent: 900 },
    { platform: 'TikTok', clicks: 2900, conversions: 145, spent: 1100 }
  ];

  const exitPagesData = [
    { page: '/checkout', exits: 1240, exitRate: 45 },
    { page: '/cart', exits: 980, exitRate: 38 },
    { page: '/pricing', exits: 820, exitRate: 32 },
    { page: '/support', exits: 650, exitRate: 28 },
    { page: '/blog/post-1', exits: 520, exitRate: 22 }
  ];

  const hourlyTrafficData = [
    { hour: '00', visits: 420 }, { hour: '01', visits: 310 }, { hour: '02', visits: 280 },
    { hour: '03', visits: 240 }, { hour: '04', visits: 220 }, { hour: '05', visits: 260 },
    { hour: '06', visits: 380 }, { hour: '07', visits: 520 }, { hour: '08', visits: 740 },
    { hour: '09', visits: 920 }, { hour: '10', visits: 1050 }, { hour: '11', visits: 1180 },
    { hour: '12', visits: 1240 }, { hour: '13', visits: 1160 }, { hour: '14', visits: 1280 },
    { hour: '15', visits: 1350 }, { hour: '16', visits: 1420 }, { hour: '17', visits: 1320 },
    { hour: '18', visits: 1180 }, { hour: '19', visits: 980 }, { hour: '20', visits: 840 },
    { hour: '21', visits: 720 }, { hour: '22', visits: 620 }, { hour: '23', visits: 480 }
  ];

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

  const StatCard = ({ icon: Icon, title, value, change, color }: { icon: any; title: string; value: string; change: number; color: string }) => (
    <div className="bg-card/50 backdrop-blur-sm rounded-lg shadow p-6 border border-border hover:border-primary/50 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className={`text-sm font-semibold flex items-center gap-1 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          {Math.abs(change)}%
        </span>
      </div>
      <h3 className="text-muted-foreground text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-cosmic bg-clip-text text-transparent mb-2">Website Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive overview of your website performance and user behavior</p>
          
          {/* Time Range Selector */}
          <div className="mt-4 flex gap-2">
            {['24h', '7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card/50 text-foreground hover:bg-card border border-border'
                }`}
              >
                {range === '24h' ? '24 Hours' : range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={Eye} title="Total Page Views" value="24.5K" change={12.5} color="bg-blue-600" />
          <StatCard icon={Users} title="Unique Visitors" value="18.2K" change={8.3} color="bg-purple-600" />
          <StatCard icon={MousePointer} title="Click Rate" value="64.8%" change={-2.4} color="bg-pink-600" />
          <StatCard icon={Clock} title="Avg. Session" value="3m 42s" change={15.7} color="bg-green-600" />
          <StatCard icon={DollarSign} title="Revenue" value="$67K" change={18.2} color="bg-emerald-600" />
          <StatCard icon={ShoppingCart} title="Conversions" value="1,440" change={9.8} color="bg-orange-600" />
          <StatCard icon={UserCheck} title="Retention Rate" value="22%" change={3.5} color="bg-indigo-600" />
          <StatCard icon={Target} title="Goal Completion" value="85%" change={7.2} color="bg-cyan-600" />
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Multi-line Chart */}
          <div className="bg-card/50 backdrop-blur-sm rounded-lg shadow p-6 border border-border">
            <h2 className="text-lg font-bold text-foreground mb-4">Traffic Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={pageViewsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="views" fill="#3b82f6" fillOpacity={0.3} stroke="#3b82f6" />
                <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={2} />
                <Line type="monotone" dataKey="sessions" stroke="#ec4899" strokeWidth={2} />
                <Bar dataKey="newUsers" fill="#10b981" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Traffic Sources */}
          <div className="bg-card/50 backdrop-blur-sm rounded-lg shadow p-6 border border-border">
            <h2 className="text-lg font-bold text-foreground mb-4">Traffic Sources</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={trafficSourcesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {trafficSourcesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue & Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card/50 backdrop-blur-sm rounded-lg shadow p-6 border border-border">
            <h2 className="text-lg font-bold text-foreground mb-4">Revenue & Orders Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis yAxisId="left" stroke="#6b7280" />
                <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="avgOrder" stroke="#f59e0b" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* User Engagement Radar */}
          <div className="bg-card/50 backdrop-blur-sm rounded-lg shadow p-6 border border-border">
            <h2 className="text-lg font-bold text-foreground mb-4">User Engagement Score</h2>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={userEngagementData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="metric" stroke="#6b7280" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6b7280" />
                <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Funnel & User Retention */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card/50 backdrop-blur-sm rounded-lg shadow p-6 border border-border">
            <h2 className="text-lg font-bold text-foreground mb-4">Conversion Funnel</h2>
            <div className="space-y-4">
              {conversionFunnelData.map((stage, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground font-medium">{stage.stage}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{stage.value.toLocaleString()}</span>
                      <span className="text-primary font-semibold">{stage.percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-primary to-purple-600 h-3 rounded-full transition-all"
                      style={{ width: `${stage.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-lg shadow p-6 border border-border">
            <h2 className="text-lg font-bold text-foreground mb-4">User Retention</h2>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={userRetentionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Area type="monotone" dataKey="retention" stroke="#ec4899" fill="#ec4899" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device, Browser & Bounce Rate */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-card/50 backdrop-blur-sm rounded-lg shadow p-6 border border-border">
            <h2 className="text-lg font-bold text-foreground mb-4">Device Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={deviceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="device" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="users" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-lg shadow p-6 border border-border">
            <h2 className="text-lg font-bold text-foreground mb-4">Browser Share</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={browserData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="users"
                  label
                >
                  {browserData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-lg shadow p-6 border border-border">
            <h2 className="text-lg font-bold text-foreground mb-4">Bounce Rate</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={bounceRateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#ec4899" strokeWidth={2} dot={{ fill: '#ec4899' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Traffic Heatmap */}
        <div className="bg-card/50 backdrop-blur-sm rounded-lg shadow p-6 border border-border mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">24-Hour Traffic Pattern</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourlyTrafficData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="visits" radius={[4, 4, 0, 0]}>
                {hourlyTrafficData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.visits > 1000 ? '#10b981' : entry.visits > 500 ? '#3b82f6' : '#6b7280'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Social Media Performance & Page Load Times */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card/50 backdrop-blur-sm rounded-lg shadow p-6 border border-border">
            <h2 className="text-lg font-bold text-foreground mb-4">Social Media Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={socialMediaData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis dataKey="platform" type="category" stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Bar dataKey="clicks" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                <Bar dataKey="conversions" fill="#10b981" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-lg shadow p-6 border border-border">
            <h2 className="text-lg font-bold text-foreground mb-4">Page Load Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="loadTime" name="Load Time" unit="s" stroke="#6b7280" />
                <YAxis dataKey="size" name="Size" unit="MB" stroke="#6b7280" />
                <ZAxis range={[100, 400]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Pages" data={pageLoadTimeData} fill="#8b5cf6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-card/50 backdrop-blur-sm rounded-lg shadow p-6 border border-border mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-foreground" />
            <h2 className="text-lg font-bold text-foreground">Geographic Distribution</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              {geoData.map((country, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground font-medium">{country.country}</span>
                    <span className="text-muted-foreground">{country.users.toLocaleString()} users</span>
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${country.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={geoData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="country" angle={-45} textAnchor="end" height={100} stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Pages & Exit Pages Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card/50 backdrop-blur-sm rounded-lg shadow border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Top Pages</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/20">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Page</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Views</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Bounce</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topPagesData.map((page, index) => (
                    <tr key={index} className="hover:bg-muted/10">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{page.page}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{page.views.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          page.bounceRate < 30 ? 'bg-green-100 text-green-800' :
                          page.bounceRate < 40 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {page.bounceRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-lg shadow border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Top Exit Pages</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/20">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Page</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Exits</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {exitPagesData.map((page, index) => (
                    <tr key={index} className="hover:bg-muted/10">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{page.page}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{page.exits.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          page.exitRate < 30 ? 'bg-green-100 text-green-800' :
                          page.exitRate < 40 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {page.exitRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;


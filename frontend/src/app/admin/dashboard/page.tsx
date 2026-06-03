"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Shield,
  MoreVertical,
  Search,
  Filter,
  ChevronDown,
  Ban,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  UserCheck,
  AlertCircle,
} from 'lucide-react';

const ADMIN_STATS = [
  {
    label: 'Total Users',
    value: '12,450',
    change: '+125',
    icon: Users,
    color: 'from-blue-500 to-cyan-600',
  },
  {
    label: 'Active Sellers',
    value: '1,240',
    change: '+48',
    icon: TrendingUp,
    color: 'from-green-500 to-emerald-600',
  },
  {
    label: 'Disputes',
    value: '23',
    change: '3 pending',
    icon: AlertTriangle,
    color: 'from-red-500 to-orange-600',
  },
  {
    label: 'Revenue',
    value: '$124.5K',
    change: '+12.5%',
    icon: DollarSign,
    color: 'from-purple-500 to-pink-600',
  },
];

const USERS_DATA = [
  {
    id: 1,
    name: 'Alex Kumar',
    email: 'alex@example.com',
    role: 'Customer',
    joinDate: '2024-05-15',
    status: 'Active',
    spending: '$2,450',
    avatar: 'https://i.pravatar.cc/64?u=alexkumar',
  },
  {
    id: 2,
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    role: 'Seller',
    joinDate: '2024-04-20',
    status: 'Active',
    spending: '$12,300',
    avatar: 'https://i.pravatar.cc/64?u=sarahchen',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike@example.com',
    role: 'Creator',
    joinDate: '2024-03-10',
    status: 'Suspended',
    spending: '$5,600',
    avatar: 'https://i.pravatar.cc/64?u=mikej',
  },
  {
    id: 4,
    name: 'Emma Wilson',
    email: 'emma@example.com',
    role: 'Customer',
    joinDate: '2024-06-01',
    status: 'Active',
    spending: '$1,200',
    avatar: 'https://i.pravatar.cc/64?u=emmaw',
  },
];

const DISPUTES = [
  {
    id: 'DIS-001',
    title: 'Product quality complaint',
    seller: 'StreetVibe',
    customer: 'Alex Kumar',
    amount: '$65.00',
    status: 'Open',
    date: '2024-06-01',
    priority: 'High',
  },
  {
    id: 'DIS-002',
    title: 'Delivery not received',
    seller: 'EcoWear',
    customer: 'Sarah Chen',
    amount: '$110.00',
    status: 'In Review',
    date: '2024-05-31',
    priority: 'Critical',
  },
  {
    id: 'DIS-003',
    title: 'Refund request',
    seller: 'Gourmet Lab',
    customer: 'Mike Johnson',
    amount: '$22.50',
    status: 'Resolved',
    date: '2024-05-30',
    priority: 'Medium',
  },
  {
    id: 'DIS-004',
    title: 'Wrong item shipped',
    seller: 'Fashion Hub',
    customer: 'Emma Wilson',
    amount: '$89.99',
    status: 'Open',
    date: '2024-06-02',
    priority: 'High',
  },
];

const PLATFORM_ANALYTICS = [
  { date: 'Mon', gmv: 12400, transactions: 240, users: 1240 },
  { date: 'Tue', gmv: 13800, transactions: 280, users: 1380 },
  { date: 'Wed', gmv: 9800, transactions: 190, users: 980 },
  { date: 'Thu', gmv: 13900, transactions: 290, users: 1390 },
  { date: 'Fri', gmv: 14800, transactions: 310, users: 1480 },
  { date: 'Sat', gmv: 13800, transactions: 280, users: 1380 },
  { date: 'Sun', gmv: 12300, transactions: 250, users: 1230 },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'disputes' | 'analytics'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  const maxGMV = Math.max(...PLATFORM_ANALYTICS.map((d) => d.gmv));

  const toggleUserSelection = (id: number) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-zinc-900/80 backdrop-blur-lg border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black">Admin Control Panel</h1>
              <p className="text-zinc-400 mt-1">Manage users, disputes, and platform analytics</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors border border-white/[0.08]">
                <BarChart3 size={20} />
              </button>
              <button className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors border border-white/[0.08]">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-6 mb-8 border-b border-white/[0.08]">
          {(['overview', 'users', 'disputes', 'analytics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-2 font-bold capitalize border-b-2 transition-all ${
                activeTab === tab
                  ? 'border-violet-500 text-white'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ADMIN_STATS.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass rounded-2xl p-6 border border-white/[0.1] group hover:border-white/[0.2] transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} group-hover:scale-110 transition-transform`}
                      >
                        <Icon size={24} className="text-white" />
                      </div>
                      <span className="text-xs font-bold text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-sm mb-1">{stat.label}</p>
                    <p className="text-2xl font-black">{stat.value}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Disputes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-8 border border-white/[0.1]"
              >
                <h2 className="text-xl font-black mb-6">Recent Disputes</h2>
                <div className="space-y-4">
                  {DISPUTES.slice(0, 3).map((dispute) => (
                    <div key={dispute.id} className="p-4 bg-zinc-800/30 rounded-lg hover:bg-zinc-800/50 transition-colors border border-white/[0.05]">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold text-sm">{dispute.title}</p>
                          <p className="text-xs text-zinc-400">{dispute.seller} vs {dispute.customer}</p>
                        </div>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full ${
                            dispute.priority === 'Critical'
                              ? 'bg-red-500/20 text-red-400'
                              : dispute.priority === 'High'
                              ? 'bg-orange-500/20 text-orange-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {dispute.priority}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold">{dispute.amount}</p>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full ${
                            dispute.status === 'Resolved'
                              ? 'bg-green-500/20 text-green-400'
                              : dispute.status === 'In Review'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-zinc-500/20 text-zinc-400'
                          }`}
                        >
                          {dispute.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-8 border border-white/[0.1]"
              >
                <h2 className="text-xl font-black mb-6">Quick Actions</h2>
                <div className="space-y-3">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-3 bg-red-500/20 border border-red-500/50 rounded-lg font-bold text-red-400 hover:bg-red-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Ban size={18} />
                    Suspend User
                  </motion.button>
                  <button className="w-full py-3 bg-green-500/20 border border-green-500/50 rounded-lg font-bold text-green-400 hover:bg-green-500/30 transition-all flex items-center justify-center gap-2">
                    <CheckCircle size={18} />
                    Verify Seller
                  </button>
                  <button className="w-full py-3 bg-blue-500/20 border border-blue-500/50 rounded-lg font-bold text-blue-400 hover:bg-blue-500/30 transition-all flex items-center justify-center gap-2">
                    <AlertCircle size={18} />
                    Send Notification
                  </button>
                  <button className="w-full py-3 bg-purple-500/20 border border-purple-500/50 rounded-lg font-bold text-purple-400 hover:bg-purple-500/30 transition-all flex items-center justify-center gap-2">
                    <Settings size={18} />
                    Platform Settings
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl border border-white/[0.1]"
          >
            {/* Search & Filter */}
            <div className="p-6 border-b border-white/[0.1] space-y-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-zinc-800/50 border border-white/[0.08] rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60"
                  />
                </div>
                <button className="px-4 py-3 bg-zinc-800/50 border border-white/[0.08] rounded-lg font-bold flex items-center gap-2 hover:bg-zinc-800/70 transition-all">
                  <Filter size={18} />
                  Filter
                </button>
              </div>
              <div className="text-sm text-zinc-400">
                {selectedUsers.length} user(s) selected
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="px-6 py-4 text-left">
                      <input type="checkbox" className="w-4 h-4 rounded" />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-zinc-400">User</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-zinc-400">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-zinc-400">Join Date</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-zinc-400">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-zinc-400">Spending</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-zinc-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {USERS_DATA.map((user, idx) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-white/[0.08] hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="w-4 h-4 rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <p className="font-bold text-sm">{user.name}</p>
                            <p className="text-xs text-zinc-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{user.role}</td>
                      <td className="px-6 py-4 text-sm text-zinc-400">{user.joinDate}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${
                            user.status === 'Active'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-sm">{user.spending}</td>
                      <td className="px-6 py-4 text-center">
                        <button className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Disputes Tab */}
        {activeTab === 'disputes' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {DISPUTES.map((dispute, idx) => (
              <motion.div
                key={dispute.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass rounded-2xl p-6 border border-white/[0.1] hover:border-white/[0.2] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{dispute.title}</h3>
                    <p className="text-sm text-zinc-400 mt-1">{dispute.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        dispute.priority === 'Critical'
                          ? 'bg-red-500/20 text-red-400'
                          : dispute.priority === 'High'
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {dispute.priority}
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        dispute.status === 'Resolved'
                          ? 'bg-green-500/20 text-green-400'
                          : dispute.status === 'In Review'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-zinc-500/20 text-zinc-400'
                      }`}
                    >
                      {dispute.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-6 py-4 border-y border-white/[0.08]">
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">Seller</p>
                    <p className="font-bold text-sm">{dispute.seller}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">Customer</p>
                    <p className="font-bold text-sm">{dispute.customer}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">Amount</p>
                    <p className="font-bold text-sm">{dispute.amount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">Date</p>
                    <p className="font-bold text-sm">{dispute.date}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    className="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg font-bold text-green-400 hover:bg-green-500/30 transition-all text-sm"
                  >
                    Approve Refund
                  </motion.button>
                  <button className="px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-lg font-bold text-blue-400 hover:bg-blue-500/30 transition-all text-sm">
                    Request More Info
                  </button>
                  <button className="px-4 py-2 bg-zinc-800/50 border border-white/[0.08] rounded-lg font-bold text-zinc-400 hover:bg-zinc-800/70 transition-all text-sm">
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Platform Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-8 border border-white/[0.1]"
            >
              <h2 className="text-xl font-black mb-6">Platform Analytics</h2>
              
              {/* Chart */}
              <div className="mb-8">
                <div className="h-64 flex items-end justify-around gap-3">
                  {PLATFORM_ANALYTICS.map((data, idx) => {
                    const height = (data.gmv / maxGMV) * 100;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: idx * 0.1, duration: 0.5 }}
                        className="flex-1 bg-gradient-to-t from-violet-500 to-purple-600 rounded-t-lg group cursor-pointer hover:from-violet-600 hover:to-purple-700 transition-all"
                      >
                        <div className="h-full flex flex-col items-center justify-end pb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs font-bold">${(data.gmv / 1000).toFixed(1)}K</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="flex justify-around mt-4 text-xs text-zinc-400">
                  {PLATFORM_ANALYTICS.map((data) => (
                    <span key={data.date}>{data.date}</span>
                  ))}
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-zinc-800/30 rounded-lg">
                  <p className="text-xs text-zinc-400 mb-2">Avg GMV</p>
                  <p className="text-2xl font-black">
                    ${(PLATFORM_ANALYTICS.reduce((sum, d) => sum + d.gmv, 0) / PLATFORM_ANALYTICS.length / 1000).toFixed(1)}K
                  </p>
                </div>
                <div className="p-4 bg-zinc-800/30 rounded-lg">
                  <p className="text-xs text-zinc-400 mb-2">Total Transactions</p>
                  <p className="text-2xl font-black">
                    {PLATFORM_ANALYTICS.reduce((sum, d) => sum + d.transactions, 0)}
                  </p>
                </div>
                <div className="p-4 bg-zinc-800/30 rounded-lg">
                  <p className="text-xs text-zinc-400 mb-2">Avg Active Users</p>
                  <p className="text-2xl font-black">
                    {Math.round(PLATFORM_ANALYTICS.reduce((sum, d) => sum + d.users, 0) / PLATFORM_ANALYTICS.length)}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Additional Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <div className="glass rounded-2xl p-8 border border-white/[0.1]">
                <h3 className="text-xl font-black mb-6">User Demographics</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Customers', value: '8,450', percent: 68 },
                    { label: 'Sellers', value: '2,400', percent: 19 },
                    { label: 'Creators', value: '1,200', percent: 10 },
                    { label: 'Delivery Partners', value: '400', percent: 3 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between mb-2">
                        <span className="font-bold text-sm">{item.label}</span>
                        <span className="text-sm text-zinc-400">{item.value}</span>
                      </div>
                      <div className="w-full bg-zinc-800/50 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-full"
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-2xl p-8 border border-white/[0.1]">
                <h3 className="text-xl font-black mb-6">Top Categories</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Fashion', revenue: '$45,200', percent: 36 },
                    { label: 'Food & Beverages', revenue: '$38,900', percent: 31 },
                    { label: 'Beauty', revenue: '$22,100', percent: 18 },
                    { label: 'Others', revenue: '$18,300', percent: 15 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between mb-2">
                        <span className="font-bold text-sm">{item.label}</span>
                        <span className="text-sm text-green-400">{item.revenue}</span>
                      </div>
                      <div className="w-full bg-zinc-800/50 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

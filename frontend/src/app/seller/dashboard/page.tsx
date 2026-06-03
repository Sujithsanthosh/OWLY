"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  Users,
  Eye,
  Plus,
  Settings,
  Download,
  Search,
  MoreVertical,
  PackageOpen,
  DollarSign,
  Star,
} from 'lucide-react';

const DASHBOARD_STATS = [
  {
    label: 'Total Sales',
    value: '\,450',
    change: '+12.5%',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-600',
  },
  {
    label: 'Orders',
    value: '256',
    change: '+8.2%',
    icon: ShoppingBag,
    color: 'from-blue-500 to-cyan-600',
  },
  {
    label: 'Customers',
    value: '1,234',
    change: '+5.1%',
    icon: Users,
    color: 'from-purple-500 to-pink-600',
  },
  {
    label: 'Avg Rating',
    value: '4.8',
    change: '+0.3',
    icon: Star,
    color: 'from-yellow-500 to-orange-600',
  },
];

const RECENT_ORDERS = [
  { id: 'ORD-2024-001', customer: 'Alex Kumar', product: 'Urban Oversized Hoodie', amount: '\.00', status: 'Delivered', date: '2 hours ago', quantity: 2 },
  { id: 'ORD-2024-002', customer: 'Sarah Chen', product: 'Linen Summer Set', amount: '\.00', status: 'Processing', date: '4 hours ago', quantity: 1 },
  { id: 'ORD-2024-003', customer: 'Mike Johnson', product: 'Premium Urban Hoodie', amount: '\.00', status: 'Shipped', date: '1 day ago', quantity: 1 },
  { id: 'ORD-2024-004', customer: 'Emma Wilson', product: 'Casual Denim Jacket', amount: '\.99', status: 'Pending', date: '1 day ago', quantity: 3 },
];

const INVENTORY = [
  { id: 1, name: 'Urban Oversized Hoodie', sku: 'SV-HOODIE-001', stock: 145, sold: 312, rating: 4.8, status: 'Active', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=100&q=80' },
  { id: 2, name: 'Linen Summer Set', sku: 'EW-LINEN-002', stock: 45, sold: 128, rating: 4.6, status: 'Active', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=100&q=80' },
  { id: 3, name: 'Casual Denim Jacket', sku: 'DD-DENIM-001', stock: 8, sold: 89, rating: 4.7, status: 'Low Stock', image: 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=100&q=80' },
  { id: 4, name: 'Premium Cotton Shirt', sku: 'PC-SHIRT-001', stock: 0, sold: 245, rating: 4.9, status: 'Out of Stock', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&q=80' },
];

const SALES_DATA = [
  { date: 'Mon', sales: 2400, orders: 24 },
  { date: 'Tue', sales: 1398, orders: 18 },
  { date: 'Wed', sales: 9800, orders: 42 },
  { date: 'Thu', sales: 3908, orders: 35 },
  { date: 'Fri', sales: 4800, orders: 38 },
  { date: 'Sat', sales: 3800, orders: 28 },
  { date: 'Sun', sales: 4300, orders: 32 },
];

export default function SellerDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'inventory'>('overview');
  const maxSales = Math.max(...SALES_DATA.map((d) => d.sales));

  return <div>Seller Dashboard - Comprehensive view with overview, orders, and inventory tabs.</div>;
}

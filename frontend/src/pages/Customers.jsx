import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Download, Plus, Search, ChevronLeft, ChevronRight, Star, AlertTriangle, TrendingUp } from 'lucide-react';
import StatCard from '../components/StatCard';
import { appMetrics } from '../data/appMetrics';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', city: '', min_spent: '', max_spent: '', days_inactive: '' });

  useEffect(() => {
    fetchStats();
    fetchCustomers();
  }, [filters]);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/customers/stats');
      setStats(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      console.log('API URL:', import.meta.env.VITE_API_URL);
      const params = new URLSearchParams(filters).toString();
      const response = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/customers?${params}`);
      console.log('Raw response:', response);
      console.log('Response data:', response.data);
      console.log('Customers array:', response?.data?.customers);
      
      const customerList = response?.data?.customers || [];
      console.log('Customer count:', customerList.length);
      
      setCustomers(customerList);
      setTotal(response?.data?.total || customerList.length);
    } catch (e) {
      console.error(e);
      setCustomers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  const getScoreBadge = (score) => {
    if (score >= 90) return "bg-green-100 text-success";
    if (score >= 70) return "bg-blue-100 text-primary";
    if (score >= 50) return "bg-amber-100 text-warning";
    return "bg-red-100 text-danger";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-textPrimary mb-1">Customers</h1>
          <p className="text-textSecondary">View and manage customer intelligence.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-border bg-card rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-50">
            <Download size={16} /> Export
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700">
            <Plus size={16} /> New Customer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Customers" value={new Intl.NumberFormat('en-IN').format(appMetrics.customers)} trend="+12%" isPositive={true} color="blue" />
        <StatCard label="VIP Customers" value={new Intl.NumberFormat('en-IN').format(appMetrics.vipCustomers)} trend="+5%" isPositive={true} color="blue" />
        <StatCard label="Average Order Value" value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(appMetrics.averageOrderValue)} trend="+2.4%" isPositive={true} color="blue" />
        <StatCard label="Total Revenue Tracked" value={appMetrics.revenueFormatted} trend="-1.2%" isPositive={false} color="blue" />
      </div>

      <div className="flex gap-6">
        <div className="flex-1 bg-card border border-border rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h2 className="font-bold text-lg">Customer Intelligence</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" size={16} />
              <input 
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                type="text" 
                placeholder="Search customers..." 
                className="w-full pl-9 pr-3 py-1.5 bg-page border border-border rounded-md text-sm"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-[11px] font-semibold text-textSecondary uppercase tracking-wider bg-page">
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3">Total Spend</th>
                  <th className="px-4 py-3">Score</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  <tr><td colSpan="5" className="p-8 text-center text-textSecondary">Loading...</td></tr>
                ) : (customers || []).length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-textSecondary">No customers found</td></tr>
                ) : (
                  (customers || []).map(c => (
                    <tr key={c.id} className="border-b border-border hover:bg-gray-50 cursor-pointer">
                      <td className="px-4 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold text-xs">
                          {c.name.split(' ').map(n=>n[0]).join('').substring(0,2)}
                        </div>
                        <div>
                          <div className="font-medium text-textPrimary">{c.name}</div>
                          <div className="text-xs text-textSecondary">{c.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-textSecondary">{c.city || '-'}</td>
                      <td className="px-4 py-3">{c.orderCount}</td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(c.totalSpent)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded font-bold text-xs ${getScoreBadge(c.score)}`}>
                          {c.score}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-border flex justify-between items-center text-sm text-textSecondary">
            <div>Showing {(customers || []).length} of {total}</div>
            <div className="flex gap-2">
              <button className="p-1 border border-border rounded hover:bg-gray-50"><ChevronLeft size={16} /></button>
              <button className="p-1 border border-border rounded hover:bg-gray-50"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>

        <div className="w-80 space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-textSecondary mb-3">
              <Star size={14} className="text-amber-500" /> Top Customer
            </div>
            <div className="font-bold text-textPrimary mb-1">Priya Sharma</div>
            <p className="text-sm text-textSecondary mb-3">Generated ₹1.2L revenue. Consider inviting to Beta program.</p>
            <button className="text-primary text-sm font-medium hover:underline">View Profile →</button>
          </div>

          <div className="bg-red-50 border border-red-100 rounded-xl p-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-danger mb-3">
              <AlertTriangle size={14} /> At Risk
            </div>
            <div className="font-bold text-textPrimary mb-1">Rohan Mehta</div>
            <p className="text-sm text-textSecondary mb-3">Activity dropped 40% in 30 days. High churn probability.</p>
            <button className="text-primary text-sm font-medium hover:underline">Send Re-engagement →</button>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-textSecondary mb-3">
              <TrendingUp size={14} /> Revenue Opp
            </div>
            <div className="font-bold text-textPrimary mb-1">Upsell Potential</div>
            <p className="text-sm text-textSecondary mb-3">125 customers match 'Enterprise Upgrade' criteria. Est. value: ₹1.4L.</p>
            <button className="text-primary text-sm font-medium hover:underline">Create Campaign →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, ShoppingBag, Target, Send, Sparkles } from 'lucide-react';
import StatCard from '../components/StatCard';
import CopilotInsight from '../components/CopilotInsight';
import AggregateFunnel from '../components/AggregateFunnel';
import { useNavigate } from 'react-router-dom';
import { appMetrics } from '../data/appMetrics';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get('/api/customers/stats');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-textSecondary">Loading dashboard...</div>;
  }

  // Formatting large numbers
  const formatNum = (num) => new Intl.NumberFormat('en-IN').format(num);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      <div className="flex justify-between items-center bg-card p-8 rounded-xl border border-border">
        <div>
          <h1 className="text-4xl font-bold text-textPrimary mb-2">Reach shoppers intelligently.</h1>
          <p className="text-textSecondary text-lg">AI-powered customer segmentation, campaign generation and performance optimization.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/ai-copilot')} className="px-4 py-2 border border-border rounded-lg text-textPrimary font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors">
            <Sparkles size={16} /> Ask AI
          </button>
          <button onClick={() => navigate('/audiences')} className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Create Campaign
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Customers" value={formatNum(appMetrics.customers)} trend="+12%" isPositive={true} icon={Users} color="blue" />
        <StatCard label="Total Orders" value={formatNum(appMetrics.orders)} trend="+8%" isPositive={true} icon={ShoppingBag} color="blue" />
        <StatCard label="Active Segments" value={formatNum(appMetrics.segments)} icon={Target} color="blue" />
        <StatCard label="Campaigns Sent" value={formatNum(appMetrics.campaigns)} icon={Send} color="blue" />
      </div>

      <h2 className="text-xl font-bold text-textPrimary mt-8 mb-4">Performance Overview</h2>
      
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Revenue Tracked" value={appMetrics.revenueFormatted} color="blue" />
        <StatCard label="Open Rate" value={appMetrics.openRate} color="blue" />
        <StatCard label="Click Rate" value={appMetrics.clickRate} color="blue" />
        <StatCard label="Conversion Rate" value={appMetrics.conversionRate} color="blue" />
      </div>

      <div className="grid grid-cols-2 gap-6 mt-6">
        <CopilotInsight actionLabel="Generate Draft" onAction={() => navigate('/campaigns')}>
          <h3 className="text-2xl font-bold text-textPrimary mb-2">43 customers <span className="text-textSecondary font-normal text-lg">inactive for 90+ days.</span></h3>
          <p className="text-textSecondary mb-6">Potential recovery: ₹82,000</p>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-blue-100">
              <span className="text-textSecondary">Recommended action</span>
              <span className="bg-blue-100 text-primary px-3 py-1 rounded font-medium">Launch win-back campaign</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-blue-100">
              <span className="text-textSecondary">Suggested audience</span>
              <span className="font-medium">Inactive VIPs</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-blue-100">
              <span className="text-textSecondary">Best channel</span>
              <span className="font-medium">WhatsApp</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-textSecondary">Expected open rate</span>
              <span className="text-primary font-medium">81%</span>
            </div>
          </div>
        </CopilotInsight>

        <AggregateFunnel data={[
          { label: 'Sent', count: 100000, color: 'bg-blue-700' },
          { label: 'Delivered', count: 98200, color: 'bg-blue-600' },
          { label: 'Opened', count: 24500, color: 'bg-blue-500' },
          { label: 'Clicked', count: 12800, color: 'bg-blue-400' },
          { label: 'Ordered', count: 3200, color: 'bg-blue-300' },
        ]} />
      </div>
    </div>
  );
}

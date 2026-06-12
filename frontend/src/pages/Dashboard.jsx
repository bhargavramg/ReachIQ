import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, ShoppingBag, Target, Send, Sparkles } from 'lucide-react';
import StatCard from '../components/StatCard';
import CopilotInsight from '../components/CopilotInsight';
import AggregateFunnel from '../components/AggregateFunnel';
import { useNavigate } from 'react-router-dom';
import useAppStats from '../hooks/useAppStats';

export default function Dashboard() {
  const { appMetrics, loading: statsLoading } = useAppStats();
  const [events, setEvents] = useState([]);
  const [funnelData, setFunnelData] = useState([
    { label: 'Sent', count: 0, color: 'bg-blue-700' },
    { label: 'Delivered', count: 0, color: 'bg-blue-600' },
    { label: 'Opened', count: 0, color: 'bg-blue-500' },
    { label: 'Clicked', count: 0, color: 'bg-blue-400' },
    { label: 'Ordered', count: 0, color: 'bg-blue-300' },
  ]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    async function fetchData() {
      try {
        const eventsRes = await axios.get(`${API_URL}/api/calendar`);
        setEvents(eventsRes.data.filter(e => new Date(e.date) >= new Date()).slice(0, 5));

        const funnelRes = await axios.get(`${API_URL}/api/campaigns/funnel`);
        setFunnelData([
          { label: 'Sent', count: funnelRes.data.sent, color: 'bg-blue-700' },
          { label: 'Delivered', count: funnelRes.data.delivered, color: 'bg-blue-600' },
          { label: 'Opened', count: funnelRes.data.opened, color: 'bg-blue-500' },
          { label: 'Clicked', count: funnelRes.data.clicked, color: 'bg-blue-400' },
          { label: 'Ordered', count: funnelRes.data.ordered, color: 'bg-blue-300' },
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingEvents(false);
      }
    }
    fetchData();
  }, []);

  if (statsLoading || loadingEvents) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
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

        <AggregateFunnel data={funnelData} />
      </div>

      <h2 className="text-xl font-bold text-textPrimary mt-8 mb-4">Upcoming Events</h2>
      <div className="bg-white border border-border rounded-xl p-6">
        {events.length === 0 ? (
          <p className="text-textSecondary text-center py-4">No upcoming events scheduled.</p>
        ) : (
          <div className="space-y-4">
            {events.map((evt, idx) => (
              <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 px-2 rounded-lg" onClick={() => navigate('/calendar')}>
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${evt.type === 'campaign' ? 'bg-blue-500' : evt.type === 'followup' ? 'bg-green-500' : evt.type === 'ai' ? 'bg-purple-500' : 'bg-orange-500'}`}></div>
                  <div>
                    <p className="font-semibold text-textPrimary">{evt.title}</p>
                    <p className="text-xs text-textSecondary">{new Date(evt.date).toDateString()} • {evt.time || 'All Day'}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded font-medium ${evt.type === 'campaign' ? 'bg-blue-100 text-blue-700' : evt.type === 'followup' ? 'bg-green-100 text-green-700' : evt.type === 'ai' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                  {evt.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

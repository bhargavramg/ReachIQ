import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Send, Eye, MousePointerClick, CheckCircle, Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import StatCard from '../components/StatCard';
import { useNavigate } from 'react-router-dom';

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [insight, setInsight] = useState('');
  const [insightLoading, setInsightLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchStats = async (pageToFetch) => {
    try {
      const res = await axios.get(`/api/campaigns/${id}/stats?page=${pageToFetch}`);
      setData(res.data);
      return res.data;
    } catch(e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setInsightLoading(true);
    fetchStats(currentPage).then(d => {
      if (d && d.campaign && d.campaign.stats) {
        const s = d.campaign.stats;
        const analyticsPending = s.sent > 0 && s.delivered === 0 && s.failed === 0;
        
        if (analyticsPending) {
          setInsight('');
          setInsightLoading(false);
        } else {
          axios.post('/api/ai/insight', { 
            campaignName: d.campaign.name, 
            stats: s 
          }).then(res => {
            setInsight(res.data.insight);
            setInsightLoading(false);
          }).catch(err => {
            console.error(err);
            setInsightLoading(false);
          });
        }
      } else {
        setInsightLoading(false);
      }
    });
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats(currentPage);
    }, 3000);

    return () => clearInterval(interval);
  }, [id, currentPage]);

  if (!data) return <div className="p-8 text-center text-textSecondary">Loading campaign metrics...</div>;

  const { campaign, recentCommunications } = data;
  const stats = campaign.stats || {};

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back button */}
      <button 
        onClick={() => navigate('/campaigns')} 
        className="flex items-center gap-1 text-sm text-textSecondary hover:text-textPrimary transition-colors"
      >
        <ArrowLeft size={16} /> Back to Campaigns
      </button>

      {/* Campaign Details Header Card */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-textPrimary">{campaign.name}</h1>
            <span className="bg-blue-100 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{campaign.channel}</span>
            <span className="bg-green-100 text-success px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{campaign.status}</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-textSecondary">
            <div>
              <span className="font-bold text-textPrimary">Launched:</span> {campaign.launchedAt ? new Date(campaign.launchedAt).toLocaleString() : 'N/A'}
            </div>
            <div>
              <span className="font-bold text-textPrimary">Reached:</span> {campaign.audienceCount} Customers
            </div>
          </div>
        </div>
      </div>

      {/* Key Metric Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Sent" value={stats.sent || 0} icon={Send} color="blue" />
        <StatCard label="Delivered" value={stats.delivered || 0} icon={CheckCircle} color="green" />
        <StatCard label="Opened" value={stats.opened || 0} icon={Eye} color="amber" />
        <StatCard label="Clicked" value={stats.clicked || 0} icon={MousePointerClick} color="purple" />
      </div>

      {/* AI Performance Insight Section */}
      <div className="bg-blue-50 border-l-4 border-primary rounded-r-xl p-6 relative">
        <div className="flex items-center gap-2 font-bold text-primary mb-2 text-sm">
          <Sparkles size={16} /> AI Performance Insight
        </div>
        {(stats.sent > 0 && stats.delivered === 0 && stats.failed === 0) ? (
          <p className="text-textSecondary text-sm italic">Analytics Pending: Delivery data is currently being processed. Check back soon for AI insights.</p>
        ) : insightLoading || !insight ? (
          <div className="space-y-2 animate-pulse py-1">
            <div className="h-4 bg-blue-200/40 rounded w-3/4"></div>
            <div className="h-4 bg-blue-200/40 rounded w-1/2"></div>
          </div>
        ) : (
          <p className="text-textPrimary text-sm leading-relaxed">{insight}</p>
        )}
      </div>

      {/* Funnel Diagram */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-bold text-lg mb-6 text-textPrimary">Delivery Funnel</h3>
        {(stats.sent > 0 && stats.delivered === 0 && stats.failed === 0) ? (
          <div className="text-center py-8 text-textSecondary italic">
            Analytics Pending
          </div>
        ) : (
          <div className="flex items-center justify-between text-center relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 -translate-y-1/2"></div>
            
            {[
              { label: 'Sent', val: stats.sent, color: 'text-blue-600', bg: 'bg-blue-100' },
              { label: 'Delivered', val: stats.delivered, color: 'text-green-600', bg: 'bg-green-100' },
              { label: 'Opened', val: stats.opened, color: 'text-amber-600', bg: 'bg-amber-100' },
              { label: 'Clicked', val: stats.clicked, color: 'text-purple-600', bg: 'bg-purple-100' },
              { label: 'Failed', val: stats.failed, color: 'text-red-600', bg: 'bg-red-100' }
            ].map((step) => (
              <div key={step.label} className="bg-card px-4 z-10">
                <div className={`w-16 h-16 mx-auto rounded-full ${step.bg} ${step.color} flex items-center justify-center font-bold text-lg mb-2 border-4 border-card`}>
                  {step.val || 0}
                </div>
                <div className="text-sm font-semibold text-textPrimary">{step.label}</div>
                <div className="text-xs text-textSecondary font-medium mt-0.5">
                  {stats.sent > 0 ? ((step.val / stats.sent) * 100).toFixed(1) : 0}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paginated Live Message Feed Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-bold text-lg text-textPrimary">Live Message Feed</h2>
        </div>
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-[11px] font-semibold text-textSecondary uppercase tracking-wider bg-page">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 w-1/2">Message Preview</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {recentCommunications.map(c => (
              <tr key={c.id} className="border-b border-border hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-4 font-medium text-textPrimary">{c.customer.name}</td>
                <td className="px-4 py-4">
                  <span className={`px-2.5 py-1 rounded text-xs font-semibold capitalize ${
                    c.status === 'clicked' ? 'bg-purple-50 text-purple-700' :
                    c.status === 'opened' ? 'bg-amber-50 text-amber-700' :
                    c.status === 'delivered' ? 'bg-green-50 text-green-700' :
                    c.status === 'failed' ? 'bg-red-50 text-red-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-textSecondary truncate max-w-xs">{c.message}</td>
                <td className="px-4 py-4 text-textSecondary text-xs font-medium">{new Date(c.updatedAt).toLocaleTimeString()}</td>
              </tr>
            ))}
            {recentCommunications.length === 0 && (
              <tr>
                <td colSpan="4" className="p-8 text-center text-textSecondary">
                  No communication records found for this campaign.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Table Pagination Controls */}
        {data.pagination && data.pagination.totalPages > 1 && (
          <div className="p-4 border-t border-border flex justify-between items-center bg-page">
            <div className="text-xs text-textSecondary font-medium">
              Showing page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} total logs)
            </div>
            <div className="flex gap-2">
              <button
                disabled={data.pagination.page <= 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-3.5 py-1.5 border border-border bg-white text-textPrimary text-xs font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={data.pagination.page >= data.pagination.totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, data.pagination.totalPages))}
                className="px-3.5 py-1.5 border border-border bg-white text-textPrimary text-xs font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, Users, Activity, BarChart, Settings2, Smartphone, Mail, MessageSquare, Loader2, Info } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAppStats from '../hooks/useAppStats';
import { useToast } from '../context/ToastContext';

export default function Campaigns() {
  const { appMetrics } = useAppStats();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  // Parse state or fallback to default
  const defaultAudience = {
    audienceName: 'Inactive VIPs',
    audienceCount: 1240,
    filters: [{ field: 'tags', operator: 'contains', value: 'vip' }],
    revenueOpportunity: '₹1.2L Est.',
    recommendedChannel: 'WhatsApp',
    expectedOpenRate: '81%'
  };

  const audience = location.state?.filters ? location.state : defaultAudience;

  const [formData, setFormData] = useState({
    name: 'Summer Promotion',
    channel: audience.recommendedChannel?.toLowerCase() || 'whatsapp',
    prompt: '',
    message: ''
  });
  
  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    if (location.state) {
      console.log('Campaign received audience state:', JSON.stringify(location.state));
    } else {
      console.warn('No audience state received in Campaigns page');
    }
  }, [location.state]);

  useEffect(() => {
    axios.get('/api/campaigns').then(res => setCampaigns(res.data)).catch(console.error);
  }, []);

  const handleGenerate = async () => {
    if (!formData.prompt) {
      toast.error("Please describe your campaign goal first.");
      return;
    }
    setLoadingAI(true);
    setDrafts([]);
    try {
      const res = await axios.post('/api/ai/draft', {
        segmentDescription: audience.audienceName,
        prompt: formData.prompt,
        channel: formData.channel,
        brandName: 'ReachIQ'
      });
      setDrafts(res.data.drafts);
      if (res.data.error) {
        toast.error(res.data.error);
      } else {
        toast.success("AI draft variants generated successfully.");
      }
    } catch(e) {
      console.error(e);
      toast.error("Error generating AI variants.");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleLaunch = async () => {
    if (!formData.name.trim()) {
      toast.error("Campaign Name is required.");
      return;
    }
    if (!formData.message.trim()) {
      toast.error("Message Template is required.");
      return;
    }
    if (!audience.filters || audience.filters.length === 0) {
      toast.error("Audience filters are required.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Launching campaign...");
    try {
      const res = await axios.post('/api/campaigns', {
        name: formData.name,
        segment_rules: audience.filters,
        message_template: formData.message,
        channel: formData.channel
      });
      
      toast.dismiss(toastId);
      toast.success(`Campaign launched to ${res.data.audienceCount} customers.`);
      navigate(`/campaigns/${res.data.campaignId}`);
    } catch(e) {
      console.error(e);
      toast.dismiss(toastId);
      toast.error(e.response?.data?.error || "Error launching campaign.");
      setLoading(false);
    }
  };

  const handleUseVariant = (text) => {
    setFormData(prev => ({ ...prev, message: text }));
    toast.success("Applied variant to message template.");
  };

  // Helper to map filters to readable labels
  const getFilterLabel = (filter) => {
    const fieldLabels = {
      total_spent: 'Total Spent',
      order_count: 'Order Count',
      days_since_last_order: 'Days Inactive',
      city: 'City',
      tags: 'Tag',
      score: 'Score'
    };
    const opLabels = {
      gt: '>',
      lt: '<',
      gte: '>=',
      lte: '<=',
      eq: '=',
      contains: '='
    };
    const field = fieldLabels[filter.field] || filter.field;
    const op = opLabels[filter.operator] || filter.operator;
    const val = filter.field === 'total_spent' ? `₹${filter.value}` : filter.value;
    return `${field} ${op} ${val}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-textPrimary mb-1">Campaign Studio</h1>
        <p className="text-textSecondary">Design, launch, and optimize AI-driven campaigns.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-[11px] font-semibold text-textSecondary uppercase tracking-wider mb-2">Campaigns Sent</div>
          <div className="text-3xl font-bold text-textPrimary">{new Intl.NumberFormat('en-IN').format(appMetrics.campaigns)}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-[11px] font-semibold text-textSecondary uppercase tracking-wider mb-2">Total Orders</div>
          <div className="text-3xl font-bold text-textPrimary">{new Intl.NumberFormat('en-IN').format(appMetrics.orders)}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-[11px] font-semibold text-textSecondary uppercase tracking-wider mb-2">Open Rate</div>
          <div className="text-3xl font-bold text-textPrimary">{appMetrics.openRate}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-[11px] font-semibold text-textSecondary uppercase tracking-wider mb-2">Revenue Tracked</div>
          <div className="text-3xl font-bold text-textPrimary">{appMetrics.revenueFormatted}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Selected Audience */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 h-fit">
          <h3 className="font-bold text-lg mb-4 text-textPrimary">Selected Audience</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wider block mb-1">Audience Name</label>
              <div className="font-medium text-textPrimary text-sm bg-page px-3 py-2 rounded-lg border border-border">{audience.audienceName}</div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wider block mb-1">Audience Size</label>
              <div className="font-semibold text-primary text-sm bg-page px-3 py-2 rounded-lg border border-border">{audience.audienceCount} Customers</div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wider block mb-1">Applied Filters</label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {audience.filters && audience.filters.map((f, i) => (
                  <span key={i} className="bg-blue-50 text-primary border border-blue-100 text-xs px-2.5 py-1 rounded-full font-medium">
                    {getFilterLabel(f)}
                  </span>
                ))}
                {(!audience.filters || audience.filters.length === 0) && (
                  <span className="text-textSecondary text-xs">No filters applied</span>
                )}
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wider block mb-1">Revenue Opportunity</label>
              <div className="font-medium text-textPrimary text-sm bg-page px-3 py-2 rounded-lg border border-border">{audience.revenueOpportunity}</div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wider block mb-1">Recommended Channel</label>
              <div className="font-medium text-textPrimary text-sm bg-page px-3 py-2 rounded-lg border border-border">{audience.recommendedChannel}</div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wider block mb-1">Expected Open Rate</label>
              <div className="font-semibold text-green-600 text-sm bg-page px-3 py-2 rounded-lg border border-border">{audience.expectedOpenRate}</div>
            </div>
          </div>
        </div>

        {/* Campaign Creation Workspace */}
        <div className="bg-card border border-border rounded-xl p-6 col-span-2 space-y-6">
          <div className="flex items-center gap-2 font-bold text-lg">
            <span className="text-primary">✦</span> AI Campaign Studio
            <span className="ml-auto bg-blue-100 text-primary px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Gemini Enabled</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wider block mb-1">Campaign Name</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={e=>setFormData({...formData, name: e.target.value})} 
                className="w-full bg-page border border-border rounded-lg px-3 py-2 text-sm text-textPrimary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium" 
                placeholder="e.g. Summer VIP Winback" 
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wider block mb-1">Launch Channel</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  {id: 'whatsapp', icon: MessageSquare, label: 'WhatsApp'},
                  {id: 'sms', icon: Smartphone, label: 'SMS'},
                  {id: 'email', icon: Mail, label: 'Email'},
                  {id: 'rcs', icon: Send, label: 'RCS'}
                ].map(c => (
                  <button 
                    key={c.id} 
                    type="button" 
                    onClick={()=>setFormData({...formData, channel: c.id})} 
                    className={`py-2 flex items-center justify-center gap-1.5 border rounded-lg text-xs font-semibold transition-colors ${formData.channel === c.id ? 'border-primary bg-blue-50 text-primary font-bold' : 'border-border text-textSecondary hover:bg-gray-50'}`}
                  >
                    <c.icon size={14}/> {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Prompter */}
            <div className="border border-border rounded-xl p-4 bg-page/50 space-y-3">
              <div className="text-xs font-bold text-textPrimary flex items-center gap-1.5">
                <span className="text-primary">✦</span> AI Campaign Prompt Generator
              </div>
              <textarea
                id="campaign-prompt"
                className="w-full bg-page border border-border rounded-lg p-3 h-20 text-xs focus:outline-none focus:border-primary resize-none text-textPrimary"
                placeholder="Describe campaign offer (e.g. 'Offer 20% discount coupon Code: VIP20 to re-engage')..."
                value={formData.prompt}
                onChange={e=>setFormData({...formData, prompt: e.target.value})}
              ></textarea>
              <button 
                onClick={handleGenerate} 
                disabled={loadingAI || loading} 
                className="w-full bg-page border border-border hover:bg-gray-50 text-textPrimary font-semibold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
              >
                {loadingAI ? <Loader2 className="animate-spin" size={14} /> : 'Generate message copy variants with Gemini ✦'}
              </button>
            </div>

            {/* Editable message template */}
            <div>
              <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wider block mb-1">Message Content (Editable)</label>
              <textarea
                id="campaign-message"
                className="w-full bg-page border border-border rounded-lg p-3 h-28 text-sm focus:outline-none focus:border-primary resize-none text-textPrimary font-sans leading-relaxed"
                placeholder="Type or apply an AI-generated message variant here... Use {{name}} for name customization."
                value={formData.message}
                onChange={e=>setFormData({...formData, message: e.target.value})}
              ></textarea>
              <div className="text-[10px] text-textSecondary flex items-center gap-1.5 mt-1">
                <Info size={12} /> Personalized tags like <strong>{"{{name}}"}</strong> will be dynamically replaced when launched.
              </div>
            </div>

            {/* AI variants container */}
            {drafts.length > 0 && (
              <div className="space-y-3 bg-page p-4 border border-border rounded-xl">
                <h4 className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">AI Generated Copy Options</h4>
                <div className="grid grid-cols-2 gap-3">
                  {drafts.map((draft, idx) => (
                    <div key={idx} className="border border-blue-100 bg-blue-50/20 rounded-lg p-3.5 flex flex-col justify-between hover:border-blue-200 transition-colors">
                      <p className="text-xs text-textPrimary leading-relaxed mb-4 italic font-medium">"{draft}"</p>
                      <button 
                        onClick={()=>handleUseVariant(draft)} 
                        className="w-full bg-white border border-blue-200 text-primary py-1.5 rounded-md text-xs font-semibold hover:bg-blue-50 transition-colors"
                      >
                        Use This Variant
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={handleLaunch} 
              disabled={loading || loadingAI} 
              className="w-full bg-primary hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm text-sm"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'Launch Campaign ✦'}
            </button>
          </div>
        </div>
      </div>

      {/* Recent Campaigns table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden mt-8">
        <div className="p-4 border-b border-border">
          <h2 className="font-bold text-lg text-textPrimary">Recent Campaigns</h2>
        </div>
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-[11px] font-semibold text-textSecondary uppercase tracking-wider bg-page">
              <th className="px-4 py-3">Campaign Name</th>
              <th className="px-4 py-3">Channel</th>
              <th className="px-4 py-3">Audience</th>
              <th className="px-4 py-3">Sent</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map(c => (
              <tr key={c.id} onClick={()=>navigate(`/campaigns/${c.id}`)} className="border-b border-border hover:bg-gray-50 cursor-pointer">
                <td className="px-4 py-4 font-medium text-textPrimary">{c.name}</td>
                <td className="px-4 py-4 capitalize text-textSecondary">{c.channel}</td>
                <td className="px-4 py-4 text-textSecondary">{c.audienceCount}</td>
                <td className="px-4 py-4 text-textSecondary">{c.stats?.sent || 0}</td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${c.status === 'launched' ? 'bg-green-100 text-success' : 'bg-gray-100 text-textSecondary'}`}>
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
            {campaigns.length === 0 && (
              <tr><td colSpan="5" className="p-8 text-center text-textSecondary">No campaigns yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

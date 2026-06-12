import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Users, Banknote, Mail, TrendingUp, Mic, Filter, Star, Clock, Tag, Plus, X, Loader2 } from 'lucide-react';
import StatCard from '../components/StatCard';
import { useNavigate } from 'react-router-dom';
import useAppStats from '../hooks/useAppStats';
import { useToast } from '../context/ToastContext';

export default function Audiences() {
  const { appMetrics } = useAppStats();
  const navigate = useNavigate();
  const toast = useToast();

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingManual, setLoadingManual] = useState(false);
  const [preview, setPreview] = useState(null);
  const promptRef = useRef('');

  // Update both state and ref on change
  const handlePromptChange = (val) => {
    setPrompt(val);
    promptRef.current = val;
    setPreview(null);
  };

  // Manual Filter State
  const [filters, setFilters] = useState([
    { id: '1', field: 'total_spent', operator: 'gt', value: '' }
  ]);

  const addFilterRow = () => {
    setFilters([...filters, { id: Math.random().toString(), field: 'total_spent', operator: 'gt', value: '' }]);
  };

  const removeFilterRow = (id) => {
    setFilters(filters.filter(f => f.id !== id));
  };

  const updateFilterRow = (id, key, val) => {
    setFilters(filters.map(f => {
      if (f.id === id) {
        if (key === 'field') {
          let defaultOp = 'eq';
          let defaultVal = '';
          if (val === 'city') {
            defaultOp = 'eq';
            defaultVal = 'Mumbai';
          } else if (val === 'tags') {
            defaultOp = 'contains';
            defaultVal = 'vip';
          } else if (val === 'total_spent') {
            defaultOp = 'gt';
          }
          return { ...f, [key]: val, operator: defaultOp, value: defaultVal };
        }
        return { ...f, [key]: val };
      }
      return f;
    }));
  };

  // Reusable Preview Logic
  const previewAudience = async (filtersToPreview, isManual) => {
    setPreview(null);
    try {
      const prevRes = await axios.post('/api/segments/preview', { filters: filtersToPreview });
      setPreview({ filters: filtersToPreview, ...prevRes.data, isManual });
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.error || "Error previewing segment");
    }
  };

  const handleGenerate = async () => {
    const currentPrompt = promptRef.current;
    
    if (!currentPrompt.trim()) {
      toast.error('Please enter an audience description');
      return;
    }
    
    // Clear ALL previous results
    setPreview(null);
    setLoading(true);
    
    console.log('Generating for prompt:', currentPrompt);
    
    try {
      const segRes = await axios.post('/api/ai/segment', { 
        prompt: currentPrompt 
      });
      
      console.log('AI segment response:', segRes.data);
      
      const generatedFilters = segRes.data.filters;
      
      if (!generatedFilters || generatedFilters.length === 0) {
        toast.error('AI could not understand. Try manual filters.');
        return;
      }
      
      // Update manual filter UI to match AI result
      const formatted = generatedFilters.map(f => ({
        id: Math.random().toString(),
        field: f.field,
        operator: f.operator,
        value: f.value
      }));
      setFilters(formatted);
      
      // Preview with the generated filters
      const prevRes = await axios.post('/api/segments/preview', { 
        filters: generatedFilters 
      });
      
      console.log('Preview result:', prevRes.data);
      
      setPreview({ 
        filters: generatedFilters, 
        count: prevRes.data.count,
        sample: prevRes.data.sample,
        isManual: false,
        usedPrompt: currentPrompt
      });
      
    } catch (e) {
      console.error('Generate error:', e);
      toast.error(e.response?.data?.error || 'Failed to generate audience');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewManual = async () => {
    // Validate: field, operator, value must exist and not be empty
    const invalid = filters.some(f => 
      !f.field || 
      !f.operator || 
      f.value === '' || 
      f.value === undefined || 
      f.value === null
    );

    if (invalid) {
      toast.error("Please complete all filter values.");
      return;
    }

    console.log('Manual filters being sent:', filters);

    setLoadingManual(true);
    const cleanedFilters = filters.map(({ field, operator, value }) => ({ field, operator, value }));
    await previewAudience(cleanedFilters, true);
    setLoadingManual(false);
  };

  // Helper to handle example chip clicks and clear previous results
  const handleExampleClick = (ex) => {
    handlePromptChange(ex);
  };

  const handleSaveAndContinue = () => {
    if (!preview) return;
    
    const audienceCount = preview.count;
    const sampleCustomers = preview.sample;
    
    // Potential revenue estimation
    let totalPotentialSpend = 0;
    if (preview.filters) {
      const spentFilter = preview.filters.find(f => f.field === 'total_spent' || f.field === 'totalSpent');
      if (spentFilter) {
        totalPotentialSpend = parseFloat(spentFilter.value) * audienceCount;
      }
    }
    if (!totalPotentialSpend || isNaN(totalPotentialSpend)) {
      totalPotentialSpend = audienceCount * 1345;
    }
    
    const revenueOpp = totalPotentialSpend > 100000 
      ? `₹${(totalPotentialSpend / 100000).toFixed(1)}L Est.`
      : `₹${new Intl.NumberFormat('en-IN').format(Math.round(totalPotentialSpend))} Est.`;

    // Recommend channel & expected open rate
    let expectedOpenRate = "68%";
    let bestChannel = "WhatsApp";
    if (preview.filters) {
      if (preview.filters.some(f => f.value === 'vip' || f.value === 'loyal')) {
        expectedOpenRate = "85%";
        bestChannel = "WhatsApp";
      } else if (preview.filters.some(f => f.field === 'days_since_last_order' && parseInt(f.value) > 90)) {
        expectedOpenRate = "42%";
        bestChannel = "Email";
      }
    }

    const stateToSend = {
      filters: preview.filters,
      audienceCount,
      sampleCustomers,
      audienceName: preview.isManual ? "Manual Segment" : (prompt || "AI Segment"),
      revenueOpportunity: revenueOpp,
      recommendedChannel: bestChannel,
      expectedOpenRate
    };

    toast.success(`Audience saved — ${audienceCount} customers selected.`);
    navigate('/campaigns', { state: stateToSend });
  };

  // Helper to get formatted text for filter chips
  const getChipLabel = (f) => {
    let op = f.operator;
    if (f.operator === 'eq') op = '=';
    else if (f.operator === 'contains') op = 'contains';
    else if (f.operator === 'gt') op = '>';
    else if (f.operator === 'lt') op = '<';
    else if (f.operator === 'gte') op = '>=';
    else if (f.operator === 'lte') op = '<=';
    return `${f.field} ${op} ${f.value}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-textPrimary mb-1">Audience Builder</h1>
        <p className="text-textSecondary">Build intelligent customer audiences manually or using AI.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Active Segments" value={appMetrics.segments} trend="+12%" isPositive={true} icon={Users} color="blue" />
        <StatCard label="Total Customers" value={new Intl.NumberFormat('en-IN').format(appMetrics.customers)} trend="+5%" isPositive={true} icon={Users} color="blue" />
        <StatCard label="Avg Open Rate" value={appMetrics.openRate} trend="Stable" isPositive={true} icon={Mail} color="blue" />
        <StatCard label="Conversion Rate" value={appMetrics.conversionRate} trend="+2.4%" isPositive={true} icon={TrendingUp} color="blue" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* AI Audience Generator */}
        <div className="bg-card border border-border rounded-xl p-6">

          <div className="flex items-center gap-2 font-bold text-lg mb-4">
            <span className="text-primary">✦</span> AI Audience Generator
          </div>
          
          <div className="relative mb-4">
            <textarea
              className="w-full bg-page border border-border rounded-lg p-4 h-24 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
              placeholder="Describe your audience in plain English... e.g., 'Find customers who spent over ₹10000 and are from Mumbai.'"
              value={prompt}
              onChange={(e) => handlePromptChange(e.target.value)}
            ></textarea>
            <button className="absolute bottom-3 right-3 text-textSecondary hover:text-primary transition-colors">
              <Mic size={18} />
            </button>
          </div>

          <div className="mb-6">
            <div className="text-xs text-textSecondary mb-2">Try these examples:</div>
            <div className="flex flex-wrap gap-2">
              {["Customers spending over ₹10000", "Customers with score above 80", "Customers with more than 10 orders", "Inactive customers for 90 days", "Customers from Chennai"].map(ex => (
                <button 
                  key={ex} 
                  onClick={() => handleExampleClick(ex)}
                  className="bg-page border border-border text-xs px-3 py-1.5 rounded-full text-textSecondary hover:bg-gray-100 transition-colors"
                >
                  "{ex}"
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading || loadingManual}
            className="w-full bg-primary hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <><span className="text-white">✦</span> Generate Audience</>}
          </button>
        </div>

        {/* Build Audience Manually */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 font-bold text-lg mb-4">
              <Filter className="text-primary" size={18} /> Build Audience Manually
            </div>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {filters.map((filter) => (
                <div key={filter.id} className="flex items-center gap-2">
                  <select 
                    value={filter.field} 
                    onChange={(e) => updateFilterRow(filter.id, 'field', e.target.value)}
                    className="bg-page border border-border rounded-lg p-2 text-xs text-textPrimary focus:outline-none w-28 shrink-0"
                  >
                    <option value="total_spent">Total Spent</option>
                    <option value="order_count">Order Count</option>
                    <option value="days_since_last_order">Days Inactive</option>
                    <option value="city">City</option>
                    <option value="tags">Tags</option>
                    <option value="score">Score</option>
                  </select>

                  <select 
                    value={filter.operator} 
                    onChange={(e) => updateFilterRow(filter.id, 'operator', e.target.value)}
                    className="bg-page border border-border rounded-lg p-2 text-xs text-textPrimary focus:outline-none w-28 shrink-0"
                  >
                    <option value="gt">Greater Than</option>
                    <option value="lt">Less Than</option>
                    <option value="gte">Greater Or Equal</option>
                    <option value="lte">Less Or Equal</option>
                    <option value="eq">Equals</option>
                    <option value="contains">Contains</option>
                  </select>

                  {filter.field === 'city' ? (
                    <select 
                      value={filter.value || 'Mumbai'} 
                      onChange={(e) => updateFilterRow(filter.id, 'value', e.target.value)}
                      className="bg-page border border-border rounded-lg p-2 text-xs text-textPrimary flex-1 focus:outline-none"
                    >
                      {['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Jaipur', 'Ahmedabad', 'Surat'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  ) : filter.field === 'tags' ? (
                    <select 
                      value={filter.value || 'vip'} 
                      onChange={(e) => updateFilterRow(filter.id, 'value', e.target.value)}
                      className="bg-page border border-border rounded-lg p-2 text-xs text-textPrimary flex-1 focus:outline-none"
                    >
                      {['vip', 'loyal', 'at-risk', 'new', 'fashion', 'beauty', 'electronics', 'discount-lover'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="number" 
                      value={filter.value} 
                      onChange={(e) => updateFilterRow(filter.id, 'value', e.target.value)}
                      placeholder="Value"
                      className="bg-page border border-border rounded-lg p-2 text-xs text-textPrimary flex-1 focus:outline-none min-w-0"
                    />
                  )}

                  <button 
                    onClick={() => removeFilterRow(filter.id)}
                    className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg shrink-0"
                    disabled={filters.length === 1}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button 
              onClick={addFilterRow}
              className="mt-3 flex items-center gap-1 text-xs text-primary hover:text-blue-700 font-semibold"
            >
              <Plus size={14} /> Add Filter Row
            </button>
          </div>

          <button 
            onClick={handlePreviewManual}
            disabled={loading || loadingManual}
            className="w-full bg-page border border-border hover:bg-gray-50 text-textPrimary font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4"
          >
            {loadingManual ? <Loader2 className="animate-spin" size={18} /> : 'Preview Audience'}
          </button>
        </div>
      </div>

      {/* Preview Section */}
      {preview && (
        <div className="bg-card border border-border rounded-xl p-6 transition-all duration-300">
          {preview.usedPrompt && (
            <div className="text-xs text-textSecondary mb-3">
              Results for: "{preview.usedPrompt}"
            </div>
          )}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-lg text-textPrimary">{preview.count} Customers Match</h3>
              
              {/* Dynamic Filter Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {preview.filters && preview.filters.map((f, i) => (
                  <span key={i} className="bg-blue-50 text-primary border border-blue-100 text-xs px-2.5 py-1 rounded-full font-medium">
                    {getChipLabel(f)}
                  </span>
                ))}
              </div>
            </div>
            <button 
              onClick={handleSaveAndContinue}
              className="bg-primary hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm shadow-sm"
            >
              Save & Continue
            </button>
          </div>

          {preview.sample && preview.sample.length > 0 ? (
            <div className="space-y-3">
              <div className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">Sample Records (First 5)</div>
              <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-page">
                {preview.sample.map((s, idx) => (
                  <div key={s.id || idx} className="flex items-center justify-between p-3.5 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-primary font-bold flex items-center justify-center text-xs">
                        {s.name ? s.name.split(' ').map(n => n[0]).join('') : 'C'}
                      </div>
                      <div>
                        <div className="font-medium text-textPrimary text-sm">{s.name}</div>
                        <div className="text-xs text-textSecondary">{s.city || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-textPrimary text-sm">₹{new Intl.NumberFormat('en-IN').format(s.totalSpent || 0)}</div>
                      <div className="text-xs text-textSecondary">Score: {s.score || 0}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-sm text-textSecondary p-6 bg-page border border-dashed border-border rounded-xl text-center">
              No customers match this filter criteria.
            </div>
          )}
        </div>
      )}

      {/* Saved Audiences Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className="font-bold text-lg">Saved Audiences</h2>
          <button className="text-textSecondary hover:text-textPrimary flex items-center gap-2 text-sm"><Filter size={16}/> Filter</button>
        </div>
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-[11px] font-semibold text-textSecondary uppercase tracking-wider bg-page">
              <th className="px-4 py-3">Audience Name</th>
              <th className="px-4 py-3">Customers</th>
              <th className="px-4 py-3">Revenue Potential</th>
              <th className="px-4 py-3">Avg Open Rate</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border hover:bg-gray-50">
              <td className="px-4 py-4 flex items-center gap-2 font-medium"><Star size={16} className="text-textSecondary"/> VIP Customers</td>
              <td className="px-4 py-4">1,240</td>
              <td className="px-4 py-4">₹4,50,000</td>
              <td className="px-4 py-4"><div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="w-[85%] bg-primary h-full"></div></div></td>
              <td className="px-4 py-4"><span className="text-primary bg-blue-50 px-2 py-1 rounded text-xs font-medium">Active</span></td>
            </tr>
            <tr className="border-b border-border hover:bg-gray-50">
              <td className="px-4 py-4 flex items-center gap-2 font-medium"><Clock size={16} className="text-textSecondary"/> Inactive Customers</td>
              <td className="px-4 py-4">5,892</td>
              <td className="px-4 py-4">₹1,200,000</td>
              <td className="px-4 py-4"><div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="w-[22%] bg-gray-400 h-full"></div></div></td>
              <td className="px-4 py-4"><span className="text-textSecondary bg-gray-100 px-2 py-1 rounded text-xs font-medium">Syncing</span></td>
            </tr>
            <tr className="border-b border-border hover:bg-gray-50">
              <td className="px-4 py-4 flex items-center gap-2 font-medium"><Tag size={16} className="text-textSecondary"/> Fashion Buyers</td>
              <td className="px-4 py-4">8,450</td>
              <td className="px-4 py-4">₹890,000</td>
              <td className="px-4 py-4"><div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="w-[64%] bg-primary h-full"></div></div></td>
              <td className="px-4 py-4"><span className="text-primary bg-blue-50 px-2 py-1 rounded text-xs font-medium">Active</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

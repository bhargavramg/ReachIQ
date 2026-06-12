import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, User, Sparkles, TrendingUp } from 'lucide-react';
import StatCard from '../components/StatCard';
import useAppStats from '../hooks/useAppStats';

export default function AICopilot() {
  const { appMetrics } = useAppStats();
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hello! I've analyzed your latest CRM data. I noticed a 15% increase in churn risk among your High Value segment over the last 30 days. How would you like to proceed?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      setCountdown(null);
      return;
    }
    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || countdown !== null) return;

    const newMsgs = [...messages, { role: 'user', text }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/api/ai/copilot', {
        message: text,
        context: {
          totalCustomers: appMetrics.customers,
          totalCampaigns: appMetrics.campaigns,
          recentStats: { revenue: appMetrics.revenueFormatted, openRate: appMetrics.openRate },
          audience: {
            name: "High Value Churn Risk",
            customerCount: 43,
            revenueOpportunity: "₹45,000",
            campaignMetrics: {
              recommendedChannel: "WhatsApp",
              expectedOpenRate: "81%"
            }
          }
        }
      });
      setMessages([...newMsgs, { role: 'ai', text: res.data.reply }]);
    } catch (e) {
      console.error("AI Copilot Error Details:", e);
      const isRateLimit = e.response?.status === 429 || e.response?.data?.errorType === 'RATE_LIMIT';
      const retryAfter = e.response?.data?.retryAfter || 48;
      
      const errMsg = e.response?.data?.reply || e.response?.data?.error || e.message || "Sorry, I'm having trouble analyzing the data right now.";
      setMessages([...newMsgs, { role: 'ai', text: errMsg, isRateLimit }]);
      
      if (isRateLimit) {
        setCountdown(retryAfter);
      }
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || countdown !== null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-textPrimary mb-1">AI Copilot</h1>
        <p className="text-textSecondary">Chat with your CRM.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Customers Analyzed" value={new Intl.NumberFormat('en-IN').format(appMetrics.customers)} color="blue" />
        <StatCard label="Orders Analyzed" value={new Intl.NumberFormat('en-IN').format(appMetrics.orders)} color="blue" />
        <StatCard label="Campaigns Analyzed" value={new Intl.NumberFormat('en-IN').format(appMetrics.campaigns)} color="blue" />
        <StatCard label="Segments Generated" value={new Intl.NumberFormat('en-IN').format(appMetrics.segments)} color="blue" />
      </div>

      <div className="flex gap-6 h-[500px]">
        {/* Chat Area */}
        <div className="flex-1 bg-card border border-border rounded-xl flex flex-col overflow-hidden relative">
          <div className="p-4 border-b border-border bg-gray-50 font-bold flex items-center gap-2">
            <Bot className="text-primary" size={20} /> Chat with ReachIQ AI
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg, i) => {
              const isLast = i === messages.length - 1;
              const displayText = (isLast && msg.isRateLimit && countdown !== null)
                ? `Gemini API rate limit reached.\nPlease retry in ${countdown} seconds.`
                : msg.text;
              return (
                <div key={i} className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gray-100 border border-border">
                    {msg.role === 'ai' ? <Bot size={16} className="text-primary" /> : <User size={16} className="text-textSecondary" />}
                  </div>
                  <div className={`p-4 text-sm whitespace-pre-line ${msg.role === 'ai' ? 'chat-bubble-ai text-textPrimary border border-border' : 'chat-bubble-user text-white'}`}>
                    {displayText}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gray-100 border border-border"><Bot size={16} className="text-primary" /></div>
                <div className="p-4 chat-bubble-ai border border-border text-textSecondary text-sm">Thinking...</div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border bg-white">
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
              {['Find inactive VIPs', 'Generate campaign', 'Predict churn', 'Explain performance'].map(chip => (
                <button 
                  key={chip} 
                  onClick={() => handleSend(chip)} 
                  disabled={isDisabled}
                  className={`whitespace-nowrap px-3 py-1.5 border border-blue-200 text-primary bg-blue-50 hover:bg-blue-100 rounded-full text-xs font-medium transition-colors ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {chip}
                </button>
              ))}
            </div>
            <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !isDisabled && handleSend()}
                placeholder={countdown !== null ? `Rate limit active. Wait ${countdown}s...` : "Ask ReachIQ AI..."} 
                disabled={isDisabled}
                className={`w-full pl-4 pr-12 py-3 bg-page border border-border rounded-lg text-sm focus:outline-none focus:border-primary ${isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
              />
              <button 
                onClick={() => handleSend()} 
                disabled={isDisabled}
                className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary text-white flex items-center justify-center rounded-md hover:bg-blue-700 transition-colors ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Context Window */}
        <div className="w-80 bg-card border border-border rounded-xl p-6 flex flex-col">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Sparkles size={18} className="text-textSecondary" /> AI Context Window</h3>
          
          <div className="mb-6">
            <div className="text-[11px] font-bold text-textSecondary uppercase tracking-wider mb-2">Current Audience</div>
            <div className="font-medium flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-danger"></div> High Value Churn Risk</div>
          </div>
          
          <div className="mb-6">
            <div className="text-[11px] font-bold text-textSecondary uppercase tracking-wider mb-2">Revenue Opportunity</div>
            <div className="text-3xl font-bold text-primary">₹45,000</div>
          </div>

          <div className="mt-auto">
            <div className="text-[11px] font-bold text-textSecondary uppercase tracking-wider mb-3">AI Recommendation</div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="font-bold text-sm mb-1 text-textPrimary">Launch win-back campaign</div>
              <div className="text-xs text-textSecondary mb-3">Suggested: Summer Re-engagement</div>
              <div className="flex items-center gap-1 text-sm font-medium text-primary">
                <TrendingUp size={16} /> Expected Revenue: ₹12,400
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

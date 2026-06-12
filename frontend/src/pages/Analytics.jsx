import React from 'react';
import StatCard from '../components/StatCard';
import CopilotInsight from '../components/CopilotInsight';
import AggregateFunnel from '../components/AggregateFunnel';
import { Filter } from 'lucide-react';
import { appMetrics } from '../data/appMetrics';

export default function Analytics() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-textPrimary mb-1">Analytics</h1>
        <p className="text-textSecondary">Measure campaign performance and revenue impact.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Revenue Tracked" value={appMetrics.revenueFormatted} trend="+14.2%" isPositive={true} color="blue" />
        <StatCard label="Open Rate" value={appMetrics.openRate} trend="+2.1%" isPositive={true} color="blue" />
        <StatCard label="Click Rate" value={appMetrics.clickRate} trend="+0.8%" isPositive={true} color="purple" />
        <StatCard label="Conversion Rate" value={appMetrics.conversionRate} trend="-0.4%" isPositive={false} color="green" />
      </div>

      <div className="grid grid-cols-2 gap-6 mt-6">
        <CopilotInsight title="Copilot Insights">
          <p className="text-textSecondary mb-6 text-sm">AI-driven analysis of your current campaign performance trends.</p>
          
          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between items-center py-2 border-b border-blue-100">
              <span className="text-textSecondary font-medium flex items-center gap-2">Best Performing Audience</span>
              <span className="font-bold">High-Intent Cart Abandoners</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-blue-100">
              <span className="text-textSecondary font-medium flex items-center gap-2">Best Performing Channel</span>
              <span className="font-bold">Email (Automated Flows)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-blue-100">
              <span className="text-textSecondary font-medium flex items-center gap-2">Revenue Opportunity</span>
              <span className="font-bold text-success">+₹45k est.</span>
            </div>
          </div>

          <div className="bg-white border border-blue-100 rounded-lg p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-textSecondary mb-3 flex items-center gap-2">Optimization Suggestions</h4>
            <ul className="list-disc pl-4 text-sm space-y-2 text-textPrimary">
              <li>Increase send frequency for 'Cart Abandoners' segment.</li>
              <li>A/B test subject lines for 'Welcome Series' to improve open rates.</li>
              <li>Re-engage dormant users with a personalized win-back offer.</li>
            </ul>
          </div>
        </CopilotInsight>

        <AggregateFunnel data={[
          { label: 'Sent', count: 100000, color: 'bg-blue-700' },
          { label: 'Delivered', count: 98200, color: 'bg-blue-600' },
          { label: 'Opened', count: 24500, color: 'bg-blue-400' },
          { label: 'Clicked', count: 12800, color: 'bg-blue-300' },
          { label: 'Ordered', count: 3200, color: 'bg-blue-200' },
        ]} />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden mt-6">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className="font-bold text-lg">Campaign Performance Details</h2>
          <button className="px-3 py-1.5 border border-border rounded flex items-center gap-2 text-sm text-textSecondary hover:bg-gray-50"><Filter size={14}/> Filter Table</button>
        </div>
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-[11px] font-semibold text-textSecondary uppercase tracking-wider bg-page">
              <th className="px-4 py-3">Campaign</th>
              <th className="px-4 py-3">Open Rate</th>
              <th className="px-4 py-3">CTR</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Revenue</th>
              <th className="px-4 py-3">ROI</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border hover:bg-gray-50">
              <td className="px-4 py-4 font-medium">Q3 Welcome Series (Automated)</td>
              <td className="px-4 py-4">32.4%</td>
              <td className="px-4 py-4">18.1%</td>
              <td className="px-4 py-4">142</td>
              <td className="px-4 py-4 font-medium">₹12,450</td>
              <td className="px-4 py-4 text-success font-medium">245%</td>
              <td className="px-4 py-4"><span className="text-primary bg-blue-50 px-2 py-1 rounded text-xs font-medium">Active</span></td>
            </tr>
            <tr className="border-b border-border hover:bg-gray-50">
              <td className="px-4 py-4 font-medium">Summer Clearance Promo</td>
              <td className="px-4 py-4">21.8%</td>
              <td className="px-4 py-4">9.4%</td>
              <td className="px-4 py-4">380</td>
              <td className="px-4 py-4 font-medium">₹45,200</td>
              <td className="px-4 py-4 text-success font-medium">410%</td>
              <td className="px-4 py-4"><span className="text-textSecondary bg-gray-100 px-2 py-1 rounded text-xs font-medium">Completed</span></td>
            </tr>
            <tr className="border-b border-border hover:bg-gray-50">
              <td className="px-4 py-4 font-medium">VIP Exclusive Preview</td>
              <td className="px-4 py-4">48.2%</td>
              <td className="px-4 py-4">24.5%</td>
              <td className="px-4 py-4">85</td>
              <td className="px-4 py-4 font-medium">₹28,900</td>
              <td className="px-4 py-4 text-success font-medium">320%</td>
              <td className="px-4 py-4"><span className="text-primary bg-blue-50 px-2 py-1 rounded text-xs font-medium">Active</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

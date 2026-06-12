import React from 'react';

export default function AggregateFunnel({ data }) {
  // data = [{ label: 'Sent', count: 124502, color: 'bg-blue-600' }, ...]
  const max = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-textPrimary text-lg">Aggregate Funnel</h3>
          <p className="text-sm text-textSecondary">Cross-campaign conversion flow.</p>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = ((item.count / max) * 100).toFixed(1);
          // Fallback colors for default styling
          const colors = ['bg-blue-700', 'bg-blue-600', 'bg-blue-500', 'bg-blue-400', 'bg-blue-300'];
          const barColor = item.color || colors[index % colors.length];

          return (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-textSecondary">{item.label}</span>
                <span className="font-medium">{item.count > 1000 ? (item.count/1000).toFixed(1) + 'k' : item.count} <span className="text-textSecondary ml-2">{percentage}%</span></span>
              </div>
              <div className="h-6 w-full bg-blue-50 rounded overflow-hidden">
                <div 
                  className={`h-full ${barColor} rounded-r`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

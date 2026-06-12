import React from 'react';
import { Sparkles } from 'lucide-react';

export default function CopilotInsight({ children, title = "Copilot Insight", onAction, actionLabel }) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-6 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-primary font-semibold">
          <Sparkles size={18} />
          {title}
        </div>
        <div className="text-[10px] bg-blue-100 text-primary px-2 py-0.5 rounded uppercase font-bold tracking-wider">
          AI Generated
        </div>
      </div>
      
      <div className="relative z-10">
        {children}
      </div>

      {onAction && actionLabel && (
        <button 
          onClick={onAction}
          className="mt-4 w-full bg-blue-100 hover:bg-blue-200 text-primary font-medium py-2 rounded-lg transition-colors text-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

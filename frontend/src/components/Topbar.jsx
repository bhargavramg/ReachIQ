import React from 'react';
import { Bell, Clock, Search, User } from 'lucide-react';

export default function Topbar() {
  return (
    <div className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" size={16} />
        <input 
          type="text" 
          placeholder="Search customers, campaigns..." 
          className="w-full pl-9 pr-4 py-2 bg-page border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
      
      <div className="flex items-center gap-4 text-textSecondary">
        <button className="hover:text-textPrimary transition-colors"><Bell size={20} /></button>
        <button className="hover:text-textPrimary transition-colors"><Clock size={20} /></button>
        <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border border-border cursor-pointer">
          <User size={16} className="text-gray-500" />
        </div>
      </div>
    </div>
  );
}

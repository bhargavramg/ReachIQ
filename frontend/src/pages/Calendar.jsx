import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Sparkles, BellRing, TrendingUp, Calendar as CalendarIcon, Users } from 'lucide-react';

const events = [
  { day: 1, title: 'VIP Outreach', type: 'campaign' },
  { day: 2, title: 'Marketing Review', type: 'meeting' },
  { day: 4, title: 'AI Launch Prep', type: 'ai' },
  { day: 8, title: 'Summer Sale', type: 'campaign' },
  { day: 9, title: 'Call Priya Sharma', type: 'followup' },
  { day: 9, title: 'AI Rec: Campaign', type: 'ai' },
  { day: 10, title: 'CRM Sync', type: 'meeting' },
  { day: 12, title: 'Follow-up VIP', type: 'followup' },
  { day: 17, title: 'AI Audience Review', type: 'ai' },
];

const getEventColor = (type) => {
  switch (type) {
    case 'campaign': return 'bg-blue-100 text-blue-700 border-l-2 border-blue-500';
    case 'followup': return 'bg-green-100 text-green-700 border-l-2 border-green-500';
    case 'ai': return 'bg-purple-100 text-purple-700 border-l-2 border-purple-500';
    case 'meeting': return 'bg-orange-100 text-orange-700 border-l-2 border-orange-500';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getLineColor = (type) => {
  switch (type) {
    case 'campaign': return 'bg-blue-500';
    case 'followup': return 'bg-green-500';
    case 'ai': return 'bg-purple-500';
    case 'meeting': return 'bg-orange-500';
    default: return 'bg-gray-500';
  }
};

export default function Calendar() {
  const [view, setView] = useState('month');

  // Generate grid for June 2026
  const daysInJune = 30;
  const startDayOfWeek = 1; // June 1, 2026 is a Monday
  const gridDays = [];

  // Previous month days
  for (let i = 0; i < startDayOfWeek; i++) {
    gridDays.push({ day: 31 - i, currentMonth: false });
  }
  gridDays.reverse();

  // Current month days
  for (let i = 1; i <= daysInJune; i++) {
    gridDays.push({ day: i, currentMonth: true });
  }

  // Next month days
  const remainingCells = 35 - gridDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    gridDays.push({ day: i, currentMonth: false });
  }

  return (
    <div className="flex h-full gap-6">
      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-textPrimary mb-2">Calendar</h1>
            <p className="text-textSecondary text-sm max-w-md">
              Manage campaigns, customer follow-ups, meetings, and AI-generated reminders.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-textPrimary hover:bg-gray-50 transition-colors">
              Today
            </button>
            <button className="px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm">
              <Plus size={16} /> Create Event
            </button>
            <button className="px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm">
              <Sparkles size={16} /> AI Schedule
            </button>
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-4 flex flex-col flex-1">
          {/* Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button className="p-1.5 hover:bg-gray-100 rounded-md text-textSecondary transition-colors"><ChevronLeft size={20} /></button>
                <button className="p-1.5 hover:bg-gray-100 rounded-md text-textSecondary transition-colors"><ChevronRight size={20} /></button>
              </div>
              <h2 className="text-lg font-medium text-textPrimary">June 2026</h2>
            </div>
            
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {['Day', 'Week', 'Month'].map(v => (
                <button
                  key={v}
                  onClick={() => setView(v.toLowerCase())}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    view === v.toLowerCase() ? 'bg-white text-primary shadow-sm' : 'text-textSecondary hover:text-textPrimary'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 flex flex-col min-h-0 border border-border rounded-lg overflow-hidden">
            <div className="grid grid-cols-7 border-b border-border bg-gray-50">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                <div key={day} className="py-2 text-center text-xs font-semibold text-textSecondary tracking-wider">
                  {day}
                </div>
              ))}
            </div>
            <div className="flex-1 grid grid-cols-7 grid-rows-5">
              {gridDays.map((cell, i) => {
                const isToday = cell.day === 9 && cell.currentMonth;
                const cellEvents = cell.currentMonth ? events.filter(e => e.day === cell.day) : [];
                
                return (
                  <div key={i} className={`border-b border-r border-border p-2 flex flex-col gap-1 min-h-[100px] ${!cell.currentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}`}>
                    <div className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-white' : (cell.currentMonth ? 'text-textPrimary' : 'text-gray-400')}`}>
                      {cell.day}
                    </div>
                    {cellEvents.map((evt, idx) => (
                      <div key={idx} className={`text-[11px] px-2 py-1 rounded truncate font-medium ${getEventColor(evt.type)}`}>
                        {evt.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 flex flex-col gap-6 shrink-0 overflow-y-auto pb-6">
        
        {/* Today's Agenda */}
        <div className="bg-white border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-textPrimary">Today's Agenda</h3>
            <span className="text-sm font-medium text-primary">June 9</span>
          </div>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className={`w-1 rounded-full ${getLineColor('followup')}`}></div>
              <div>
                <p className="text-sm font-semibold text-textPrimary">Call Priya Sharma</p>
                <p className="text-xs text-textSecondary mt-0.5">10:00 AM • Follow-up</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className={`w-1 rounded-full ${getLineColor('ai')}`}></div>
              <div>
                <p className="text-sm font-semibold text-textPrimary">VIP Campaign Review</p>
                <p className="text-xs text-textSecondary mt-0.5">11:30 AM • AI Suggestion</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className={`w-1 rounded-full ${getLineColor('meeting')}`}></div>
              <div>
                <p className="text-sm font-semibold text-textPrimary">Weekly CRM Sync</p>
                <p className="text-xs text-textSecondary mt-0.5">02:00 PM • Team</p>
              </div>
            </div>
          </div>
          <button className="w-full text-center text-primary text-sm font-medium mt-5 hover:text-blue-700 transition-colors">
            View All Events
          </button>
        </div>

        {/* AI Assistant */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
          <div className="flex items-center gap-2 text-primary font-semibold mb-3">
            <Sparkles size={18} />
            <h3>AI Assistant</h3>
          </div>
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">
            Based on customer activity, the best time to launch your <strong>Summer Sale</strong> is tomorrow between <strong>2:00 PM - 4:00 PM</strong>.
          </p>
          
          {/* Smart Alert - Light Amber Styling */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-amber-800 font-semibold text-[11px] uppercase tracking-wider mb-1">
              <BellRing size={14} />
              Smart Alert
            </div>
            <p className="text-xs text-amber-900 leading-snug">
              3 High-value customers are active now. Schedule a follow-up?
            </p>
          </div>

          <button className="w-full bg-primary hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-medium transition-colors shadow-sm">
            Generate Schedule with AI
          </button>
        </div>

        {/* AI Calendar Insight (New) */}
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-5">
          <div className="flex items-center gap-2 text-purple-700 font-semibold mb-3">
            <TrendingUp size={18} />
            <h3>AI Calendar Insight</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-purple-600 font-medium mb-1">Recommended Launch Window</p>
              <p className="text-sm text-purple-900 font-semibold bg-white px-2 py-1.5 rounded border border-purple-100 inline-block">Thu, June 11 • 9:00 AM</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-2 rounded border border-purple-100">
                <p className="text-[10px] text-purple-600 uppercase font-bold tracking-wider mb-0.5">Exp. Uplift</p>
                <p className="text-sm text-purple-900 font-semibold">+24%</p>
              </div>
              <div className="bg-white p-2 rounded border border-purple-100">
                <p className="text-[10px] text-purple-600 uppercase font-bold tracking-wider mb-0.5">Segment</p>
                <p className="text-sm text-purple-900 font-semibold truncate">Inactive VIPs</p>
              </div>
            </div>
          </div>
        </div>

        {/* This Month Metrics */}
        <div className="bg-white border border-border rounded-xl p-5">
          <h3 className="font-semibold text-textPrimary mb-4">This Month</h3>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-gray-50 rounded-lg p-3 border border-border">
              <p className="text-[10px] font-bold text-textSecondary uppercase tracking-wider mb-1">Scheduled</p>
              <p className="text-xl font-bold text-primary">24</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-border">
              <p className="text-[10px] font-bold text-textSecondary uppercase tracking-wider mb-1">Meetings</p>
              <p className="text-xl font-bold text-textPrimary">18</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-border">
              <p className="text-[10px] font-bold text-textSecondary uppercase tracking-wider mb-1">Follow-ups</p>
              <p className="text-xl font-bold text-textPrimary">56</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-border">
              <p className="text-[10px] font-bold text-textSecondary uppercase tracking-wider mb-1">Rate</p>
              <p className="text-xl font-bold text-red-600">92<span className="text-sm text-red-400 ml-0.5">%</span></p>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-textPrimary">Target Achievement</p>
              <span className="text-sm font-bold text-textPrimary">84%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '84%' }}></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

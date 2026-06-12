import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Plus, Sparkles, BellRing, TrendingUp, Edit2, Trash2 } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import EventModal from '../components/EventModal';
import { useToast } from '../context/ToastContext';

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
  const [view, setView] = useState('month'); // day, week, month
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);

  const { addToast } = useToast();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/calendar`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      addToast('Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handlePrevious = () => {
    if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleSaveEvent = async (formData, id) => {
    try {
      if (id) {
        await axios.put(`${API_URL}/api/calendar/${id}`, formData);
        addToast('Event updated successfully', 'success');
      } else {
        await axios.post(`${API_URL}/api/calendar`, formData);
        addToast('Event created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      addToast('Failed to save event', 'error');
    }
  };

  const handleDeleteEvent = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`${API_URL}/api/calendar/${id}`);
        addToast('Event deleted', 'success');
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        addToast('Failed to delete event', 'error');
      }
    }
  };

  const generateAISchedule = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/calendar/ai-schedule`);
      addToast('AI Schedule generated successfully', 'success');
      fetchEvents();
    } catch (error) {
      console.error('Error generating AI schedule:', error);
      addToast('Failed to generate AI schedule', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEventToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (evt, e) => {
    e.stopPropagation();
    setEventToEdit(evt);
    setIsModalOpen(true);
  };

  // Generate grid days based on view
  let gridDays = [];
  if (view === 'month') {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    gridDays = eachDayOfInterval({ start: startDate, end: endDate });
  } else if (view === 'week') {
    const startDate = startOfWeek(currentDate);
    const endDate = endOfWeek(currentDate);
    gridDays = eachDayOfInterval({ start: startDate, end: endDate });
  } else {
    gridDays = [currentDate];
  }

  // Today's events for right panel
  const todaysEvents = events.filter(e => isSameDay(new Date(e.date), new Date()));
  
  // Metrics
  const scheduledCount = events.filter(e => e.type === 'campaign').length;
  const meetingCount = events.filter(e => e.type === 'meeting').length;
  const followupCount = events.filter(e => e.type === 'followup').length;

  return (
    <div className="flex h-full gap-6 flex-col lg:flex-row overflow-hidden">
      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto lg:overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-textPrimary mb-1">Calendar</h1>
            <p className="text-textSecondary text-sm max-w-md hidden sm:block">
              Manage campaigns, customer follow-ups, meetings, and AI reminders.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleToday} className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-textPrimary hover:bg-gray-50 transition-colors">
              Today
            </button>
            <button onClick={openCreateModal} className="px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm">
              <Plus size={16} /> Create Event
            </button>
            <button onClick={generateAISchedule} className="px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm">
              <Sparkles size={16} /> AI Schedule
            </button>
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-4 flex flex-col flex-1 min-h-[500px]">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button onClick={handlePrevious} className="p-1.5 hover:bg-gray-100 rounded-md text-textSecondary transition-colors"><ChevronLeft size={20} /></button>
                <button onClick={handleNext} className="p-1.5 hover:bg-gray-100 rounded-md text-textSecondary transition-colors"><ChevronRight size={20} /></button>
              </div>
              <h2 className="text-lg font-medium text-textPrimary min-w-[140px]">
                {view === 'day' ? format(currentDate, 'MMMM d, yyyy') : format(currentDate, 'MMMM yyyy')}
              </h2>
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
          <div className="flex-1 flex flex-col min-h-0 border border-border rounded-lg overflow-y-auto sm:overflow-hidden relative">
            {loading && (
               <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
               </div>
            )}
            {/* Header row for Week/Month */}
            {view !== 'day' && (
              <div className={`grid ${view === 'week' ? 'grid-cols-7' : 'grid-cols-7'} border-b border-border bg-gray-50`}>
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                  <div key={day} className="py-2 text-center text-xs font-semibold text-textSecondary tracking-wider">
                    {day}
                  </div>
                ))}
              </div>
            )}

            <div className={`flex-1 ${view === 'month' ? 'grid grid-cols-7 grid-rows-5' : view === 'week' ? 'grid grid-cols-7' : 'flex flex-col'} overflow-y-auto`}>
              {gridDays.map((day, i) => {
                const isCurrentMonth = isSameMonth(day, currentDate) || view !== 'month';
                const isToday = isSameDay(day, new Date());
                const cellEvents = events.filter(e => isSameDay(new Date(e.date), day));
                
                if (view === 'day') {
                  return (
                     <div key={i} className="flex-1 p-4 bg-white min-h-[400px]">
                       <h3 className="text-lg font-bold text-textPrimary mb-4">{format(day, 'EEEE, MMMM do')}</h3>
                       {cellEvents.length === 0 ? (
                         <p className="text-textSecondary text-sm">No events scheduled for this day.</p>
                       ) : (
                         <div className="space-y-3">
                           {cellEvents.map((evt, idx) => (
                             <div key={idx} onClick={(e) => openEditModal(evt, e)} className={`p-3 rounded cursor-pointer group flex justify-between items-center ${getEventColor(evt.type)}`}>
                               <div>
                                 <p className="font-semibold">{evt.title}</p>
                                 <p className="text-xs opacity-80">{evt.time || 'All Day'} • {evt.description}</p>
                               </div>
                               <button onClick={(e) => handleDeleteEvent(evt.id, e)} className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-white/20 rounded transition-all">
                                 <Trash2 size={16} />
                               </button>
                             </div>
                           ))}
                         </div>
                       )}
                     </div>
                  );
                }

                return (
                  <div key={i} className={`border-b border-r border-border p-2 flex flex-col gap-1 min-h-[100px] ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}`}>
                    <div className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-white' : (isCurrentMonth ? 'text-textPrimary' : 'text-gray-400')}`}>
                      {format(day, 'd')}
                    </div>
                    {cellEvents.map((evt, idx) => (
                      <div 
                        key={idx} 
                        onClick={(e) => openEditModal(evt, e)}
                        className={`text-[11px] px-2 py-1 rounded truncate font-medium cursor-pointer flex justify-between items-center group ${getEventColor(evt.type)}`}
                      >
                        <span className="truncate">{evt.title}</span>
                        <Trash2 size={12} className="opacity-0 group-hover:opacity-100 shrink-0 ml-1" onClick={(e) => handleDeleteEvent(evt.id, e)} />
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
      <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0 lg:overflow-y-auto pb-6">
        
        {/* Today's Agenda */}
        <div className="bg-white border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-textPrimary">Today's Agenda</h3>
            <span className="text-sm font-medium text-primary">{format(new Date(), 'MMM d')}</span>
          </div>
          {todaysEvents.length === 0 ? (
             <p className="text-sm text-textSecondary text-center py-4 bg-gray-50 rounded-lg border border-border border-dashed">No events today. Enjoy your day!</p>
          ) : (
            <div className="space-y-4">
              {todaysEvents.map(evt => (
                <div key={evt.id} className="flex gap-3 cursor-pointer group" onClick={(e) => openEditModal(evt, e)}>
                  <div className={`w-1 shrink-0 rounded-full ${getLineColor(evt.type)}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-textPrimary truncate group-hover:text-primary transition-colors">{evt.title}</p>
                    <p className="text-xs text-textSecondary mt-0.5">{evt.time || 'All Day'} • {evt.type}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
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
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-amber-800 font-semibold text-[11px] uppercase tracking-wider mb-1">
              <BellRing size={14} />
              Smart Alert
            </div>
            <p className="text-xs text-amber-900 leading-snug">
              3 High-value customers are active now. Schedule a follow-up?
            </p>
          </div>

          <button onClick={generateAISchedule} className="w-full bg-primary hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-medium transition-colors shadow-sm disabled:opacity-50">
            {loading ? 'Generating...' : 'Generate Schedule with AI'}
          </button>
        </div>

        {/* AI Calendar Insight */}
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-5">
          <div className="flex items-center gap-2 text-purple-700 font-semibold mb-3">
            <TrendingUp size={18} />
            <h3>AI Calendar Insight</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-purple-600 font-medium mb-1">Recommended Launch Window</p>
              <p className="text-sm text-purple-900 font-semibold bg-white px-2 py-1.5 rounded border border-purple-100 inline-block">
                {format(addDays(new Date(), 2), 'EEE, MMM d')} • 9:00 AM
              </p>
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
              <p className="text-[10px] font-bold text-textSecondary uppercase tracking-wider mb-1">Campaigns</p>
              <p className="text-xl font-bold text-primary">{scheduledCount}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-border">
              <p className="text-[10px] font-bold text-textSecondary uppercase tracking-wider mb-1">Meetings</p>
              <p className="text-xl font-bold text-textPrimary">{meetingCount}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-border">
              <p className="text-[10px] font-bold text-textSecondary uppercase tracking-wider mb-1">Follow-ups</p>
              <p className="text-xl font-bold text-textPrimary">{followupCount}</p>
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

      <EventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveEvent}
        eventToEdit={eventToEdit}
      />
    </div>
  );
}

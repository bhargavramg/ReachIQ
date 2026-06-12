import React, { useState, useEffect, useRef } from 'react';
import { Bell, Clock, Search, User, Calendar, Settings, LogOut, UserCircle, Activity, Megaphone, Users, MessageSquare } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function Topbar() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications (Upcoming Calendar Events)
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/calendar`);
        const upcoming = res.data
          .filter(e => new Date(e.date) >= new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 4); // Get top 4 upcoming
        setNotifications(upcoming);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        setLoadingNotifs(false);
      }
    };
    fetchNotifications();
  }, [API_URL]);

  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const isCalendarActive = location.pathname === '/calendar';

  // Mock Activity History
  const activities = [
    { id: 1, icon: Calendar, text: 'Event created: Summer Sale', time: '10 mins ago', color: 'text-blue-500', bg: 'bg-blue-100' },
    { id: 2, icon: Megaphone, text: 'Campaign scheduled: VIP Outreach', time: '1 hour ago', color: 'text-purple-500', bg: 'bg-purple-100' },
    { id: 3, icon: Users, text: 'Audience generated: High-Value Churn', time: '3 hours ago', color: 'text-green-500', bg: 'bg-green-100' },
    { id: 4, icon: MessageSquare, text: 'Follow-up completed: Priya Sharma', time: 'Yesterday', color: 'text-orange-500', bg: 'bg-orange-100' },
  ];

  return (
    <div className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0 z-40 relative">
      <div className="relative hidden sm:block w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" size={16} />
        <input 
          type="text" 
          placeholder="Search customers, campaigns..." 
          className="w-full pl-9 pr-4 py-2 bg-page border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        />
      </div>
      
      {/* Mobile search placeholder to keep alignment */}
      <div className="sm:hidden flex-1"></div>

      <div className="flex items-center gap-2 sm:gap-4 text-textSecondary" ref={dropdownRef}>
        
        {/* Calendar Icon */}
        <div className="relative group">
          <button 
            onClick={() => navigate('/calendar')}
            className={`p-2 rounded-lg transition-all duration-200 ${isCalendarActive ? 'bg-primary text-white shadow-sm' : 'hover:bg-gray-100 hover:text-textPrimary'}`}
            title="Calendar"
          >
            <Calendar size={20} className={isCalendarActive ? '' : 'transition-transform group-hover:scale-110'} />
          </button>
        </div>

        {/* Notifications Icon */}
        <div className="relative group">
          <button 
            onClick={() => toggleDropdown('notifications')}
            className={`p-2 rounded-lg transition-all duration-200 relative ${activeDropdown === 'notifications' ? 'bg-gray-100 text-textPrimary' : 'hover:bg-gray-100 hover:text-textPrimary'}`}
            title="Notifications"
          >
            <Bell size={20} className="transition-transform group-hover:scale-110" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-card"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {activeDropdown === 'notifications' && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
              <div className="p-4 border-b border-border flex justify-between items-center bg-gray-50">
                <h3 className="font-semibold text-textPrimary">Notifications</h3>
                <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">{notifications.length} Unread</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {loadingNotifs ? (
                  <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 text-center text-textSecondary text-sm">No new notifications</div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map((notif, i) => (
                      <div key={i} className="p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => navigate('/calendar')}>
                        <p className="text-sm font-medium text-textPrimary mb-1">{notif.title}</p>
                        <p className="text-xs text-textSecondary">{new Date(notif.date).toDateString()} • {notif.type}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-border text-center bg-gray-50">
                <button className="text-sm font-medium text-primary hover:text-blue-700 transition-colors" onClick={() => navigate('/calendar')}>View All in Calendar</button>
              </div>
            </div>
          )}
        </div>

        {/* Activity Icon */}
        <div className="relative group">
          <button 
            onClick={() => toggleDropdown('history')}
            className={`p-2 rounded-lg transition-all duration-200 ${activeDropdown === 'history' ? 'bg-gray-100 text-textPrimary' : 'hover:bg-gray-100 hover:text-textPrimary'}`}
            title="Recent Activity"
          >
            <Clock size={20} className="transition-transform group-hover:scale-110" />
          </button>

          {/* Activity Dropdown */}
          {activeDropdown === 'history' && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
              <div className="p-4 border-b border-border bg-gray-50">
                <h3 className="font-semibold text-textPrimary">Recent Activity</h3>
              </div>
              <div className="flex flex-col max-h-[300px] overflow-y-auto">
                {activities.map((act) => (
                  <div key={act.id} className="p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors flex gap-3 items-start">
                    <div className={`p-2 rounded-lg ${act.bg} ${act.color} shrink-0`}>
                      <act.icon size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-textPrimary">{act.text}</p>
                      <p className="text-xs text-textSecondary mt-0.5">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative group ml-1">
          <button 
            onClick={() => toggleDropdown('profile')}
            className="h-9 w-9 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-transparent hover:border-primary transition-all duration-200 focus:outline-none"
            title="Profile"
          >
            <User size={18} className="text-gray-500" />
          </button>

          {/* Profile Dropdown Menu */}
          {activeDropdown === 'profile' && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
              <div className="p-4 border-b border-border bg-gray-50">
                <p className="font-semibold text-textPrimary truncate">Alex Morgan</p>
                <p className="text-xs text-textSecondary truncate">alex@reachiq.com</p>
              </div>
              <div className="p-2 flex flex-col">
                <button className="flex items-center gap-3 px-3 py-2 text-sm text-textPrimary hover:bg-gray-100 rounded-md transition-colors text-left w-full">
                  <UserCircle size={16} className="text-textSecondary" /> Account
                </button>
                <button className="flex items-center gap-3 px-3 py-2 text-sm text-textPrimary hover:bg-gray-100 rounded-md transition-colors text-left w-full">
                  <Settings size={16} className="text-textSecondary" /> Settings
                </button>
              </div>
              <div className="p-2 border-t border-border">
                <button className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors text-left w-full font-medium">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

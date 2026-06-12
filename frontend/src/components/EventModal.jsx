import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function EventModal({ isOpen, onClose, onSave, eventToEdit }) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    type: 'campaign',
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (eventToEdit) {
        setFormData({
          title: eventToEdit.title || '',
          date: eventToEdit.date ? new Date(eventToEdit.date).toISOString().split('T')[0] : '',
          time: eventToEdit.time || '',
          type: eventToEdit.type || 'campaign',
          description: eventToEdit.description || ''
        });
      } else {
        setFormData({
          title: '',
          date: new Date().toISOString().split('T')[0],
          time: '09:00 AM',
          type: 'campaign',
          description: ''
        });
      }
    }
  }, [isOpen, eventToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, eventToEdit?.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-textPrimary">
            {eventToEdit ? 'Edit Event' : 'Create Event'}
          </h2>
          <button onClick={onClose} className="text-textSecondary hover:text-textPrimary">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-1">Title</label>
            <input 
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g. Summer Sale Launch"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textSecondary mb-1">Date</label>
              <input 
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textSecondary mb-1">Time</label>
              <input 
                type="text"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. 10:00 AM"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-textSecondary mb-1">Type</label>
            <select 
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-white"
            >
              <option value="campaign">Campaign Launch (Blue)</option>
              <option value="followup">Customer Follow-up (Green)</option>
              <option value="ai">AI Recommendation (Purple)</option>
              <option value="meeting">Team Meeting (Orange)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-textSecondary mb-1">Description (Optional)</label>
            <textarea 
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              placeholder="Add details..."
            />
          </div>

          <div className="pt-2 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-textSecondary hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            >
              {eventToEdit ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

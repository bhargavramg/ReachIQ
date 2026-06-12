import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

export default function CustomerModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/customers`, formData);
      addToast('Customer created successfully', 'success');
      onSuccess();
      onClose();
      // Reset form
      setFormData({ name: '', email: '', phone: '', city: '', tags: '' });
    } catch (error) {
      console.error('Error creating customer:', error);
      addToast(error.response?.data?.error || 'Failed to create customer', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <UserPlus size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-textPrimary">New Customer</h2>
          </div>
          <button onClick={onClose} className="text-textSecondary hover:text-textPrimary">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-1">Full Name *</label>
            <input 
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g. John Doe"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-1">Email Address *</label>
            <input 
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g. john@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textSecondary mb-1">Phone</label>
              <input 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="+91..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textSecondary mb-1">City</label>
              <input 
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. Mumbai"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-textSecondary mb-1">Tags (Comma separated)</label>
            <input 
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g. VIP, frequent-buyer"
            />
          </div>

          <div className="pt-4 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-textSecondary hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

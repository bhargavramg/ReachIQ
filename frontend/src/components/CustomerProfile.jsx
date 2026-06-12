import React, { useEffect, useState } from 'react';
import { X, MapPin, Mail, Phone, ShoppingBag, Target, Clock, ExternalLink } from 'lucide-react';
import axios from 'axios';

export default function CustomerProfile({ customerId, onClose }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/customers/${customerId}`);
        setCustomer(res.data);
      } catch (error) {
        console.error('Failed to load customer profile', error);
      } finally {
        setLoading(false);
      }
    };
    if (customerId) fetchCustomer();
  }, [customerId, API_URL]);

  if (!customerId) return null;

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 p-0 sm:p-4 transition-all">
      <div className="bg-white w-full max-w-lg h-full sm:rounded-xl shadow-2xl flex flex-col animate-in fade-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-start bg-gray-50 shrink-0 sm:rounded-t-xl">
          {loading ? (
            <div className="animate-pulse flex gap-4 w-full">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ) : customer ? (
            <div className="flex gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold text-xl border-2 border-white shadow-sm shrink-0">
                {customer.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-textPrimary leading-tight">{customer.name}</h2>
                <div className="flex items-center gap-2 mt-1 text-sm text-textSecondary">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${customer.score >= 70 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    Score: {customer.score}
                  </span>
                  <span>Customer ID: #{customer.id.substring(0, 8)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-red-500">Customer not found.</div>
          )}
          <button onClick={onClose} className="p-2 bg-white rounded-full hover:bg-gray-100 border border-border shadow-sm text-textSecondary hover:text-textPrimary transition-colors shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!loading && customer && (
            <>
              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-sm text-textSecondary">
                  <Mail size={16} className="text-gray-400" />
                  <span className="truncate" title={customer.email}>{customer.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-textSecondary">
                  <Phone size={16} className="text-gray-400" />
                  <span>{customer.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-textSecondary">
                  <MapPin size={16} className="text-gray-400" />
                  <span>{customer.city || 'Unknown City'}</span>
                </div>
              </div>

              <div className="h-px w-full bg-border"></div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-primary font-medium mb-1">
                    <ShoppingBag size={16} /> Total Spend
                  </div>
                  <p className="text-2xl font-bold text-textPrimary">{formatCurrency(customer.totalSpent)}</p>
                  <p className="text-xs text-textSecondary mt-1">Across {customer.orderCount} orders</p>
                </div>
                
                <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-purple-700 font-medium mb-1">
                    <Target size={16} /> Segments
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {customer.tags && customer.tags.length > 0 ? (
                      customer.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-white border border-purple-200 text-purple-700 text-xs rounded-md">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-purple-400">No active segments</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Order History */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-textPrimary flex items-center gap-2">
                    <Clock size={16} className="text-textSecondary" /> Recent Orders
                  </h3>
                </div>
                <div className="space-y-3">
                  {customer.orders && customer.orders.length > 0 ? (
                    customer.orders.slice(0, 5).map(order => (
                      <div key={order.id} className="p-3 border border-border rounded-lg bg-gray-50 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-textPrimary">{order.items ? order.items.join(', ') : 'Order #' + order.id.substring(0,6)}</p>
                          <p className="text-xs text-textSecondary">{new Date(order.orderedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-textPrimary">{formatCurrency(order.amount)}</p>
                          <p className="text-[10px] text-green-600 bg-green-100 px-1.5 py-0.5 rounded mt-0.5 inline-block">Delivered</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-textSecondary bg-gray-50 border border-border border-dashed p-4 rounded-lg text-center">
                      No order history found for this customer.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Footer actions */}
        {!loading && customer && (
          <div className="p-4 border-t border-border bg-gray-50 shrink-0 sm:rounded-b-xl flex gap-3">
            <button className="flex-1 bg-white border border-border hover:bg-gray-50 text-textPrimary px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Send Email
            </button>
            <button className="flex-1 bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
              Create Campaign
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

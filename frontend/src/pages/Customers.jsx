import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Download, Plus, Search, ChevronLeft, ChevronRight, Star, AlertTriangle, TrendingUp, ChevronDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import StatCard from '../components/StatCard';
import CustomerModal from '../components/CustomerModal';
import CustomerProfile from '../components/CustomerProfile';
import { appMetrics } from '../data/appMetrics';
import { useToast } from '../context/ToastContext';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', city: '', min_spent: '', max_spent: '', days_inactive: '', page: 1 });
  
  // Modals state
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  const { addToast } = useToast();
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    fetchStats();
    // Debounce the fetchCustomers
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [filters]);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/customers/stats');
      setStats(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/customers?${params}`);
      
      const customerList = response?.data?.customers || [];
      setCustomers(customerList);
      setTotal(response?.data?.total || customerList.length);
    } catch (e) {
      console.error(e);
      setCustomers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const handlePrevPage = () => {
    if (filters.page > 1) {
      setFilters({ ...filters, page: filters.page - 1 });
    }
  };

  const handleNextPage = () => {
    if (customers.length === 50) { // assuming 50 is the take limit
      setFilters({ ...filters, page: filters.page + 1 });
    }
  };

  const exportData = (type) => {
    setExportDropdownOpen(false);
    
    if (customers.length === 0) {
      addToast('No customers to export', 'warning');
      return;
    }

    const exportReadyData = customers.map(c => ({
      ID: c.id,
      Name: c.name,
      Email: c.email,
      Phone: c.phone || 'N/A',
      City: c.city || 'N/A',
      'Total Spent': c.totalSpent,
      Orders: c.orderCount,
      Score: c.score,
      Tags: c.tags ? c.tags.join(', ') : ''
    }));

    if (type === 'csv') {
      const csv = Papa.unparse(exportReadyData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'customers_export.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('CSV Export successful', 'success');
    } else if (type === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(exportReadyData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
      XLSX.writeFile(workbook, 'customers_export.xlsx');
      addToast('Excel Export successful', 'success');
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  const getScoreBadge = (score) => {
    if (score >= 90) return "bg-green-100 text-success";
    if (score >= 70) return "bg-blue-100 text-primary";
    if (score >= 50) return "bg-amber-100 text-warning";
    return "bg-red-100 text-danger";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-textPrimary mb-1">Customers</h1>
          <p className="text-textSecondary">View and manage customer intelligence.</p>
        </div>
        <div className="flex gap-3 relative">
          
          <div className="relative">
            <button 
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="px-4 py-2 border border-border bg-card rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <Download size={16} /> Export <ChevronDown size={14} />
            </button>
            {exportDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 w-36 bg-white border border-border rounded-lg shadow-lg overflow-hidden z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                <button onClick={() => exportData('csv')} className="w-full text-left px-4 py-2 text-sm text-textPrimary hover:bg-gray-50">Export to CSV</button>
                <button onClick={() => exportData('xlsx')} className="w-full text-left px-4 py-2 text-sm text-textPrimary hover:bg-gray-50 border-t border-gray-100">Export to Excel</button>
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsNewCustomerModalOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={16} /> New Customer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Customers" value={new Intl.NumberFormat('en-IN').format(stats?.total || appMetrics.customers)} trend="+12%" isPositive={true} color="blue" />
        <StatCard label="VIP Customers" value={new Intl.NumberFormat('en-IN').format(stats?.vip || appMetrics.vipCustomers)} trend="+5%" isPositive={true} color="blue" />
        <StatCard label="Average Order Value" value={formatCurrency(stats?.avgOrderValue || appMetrics.averageOrderValue)} trend="+2.4%" isPositive={true} color="blue" />
        <StatCard label="Total Revenue Tracked" value={formatCurrency(stats?.totalRevenue || 12050000)} trend="-1.2%" isPositive={false} color="blue" />
      </div>

      <div className="flex gap-6">
        <div className="flex-1 bg-card border border-border rounded-xl flex flex-col overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="font-bold text-lg text-textPrimary shrink-0">Customer Intelligence</h2>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" size={16} />
              <input 
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                type="text" 
                placeholder="Search by name, email, phone, city..." 
                className="w-full pl-9 pr-3 py-1.5 bg-page border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-[11px] font-bold text-textSecondary uppercase tracking-wider bg-gray-50">
                  <th className="px-5 py-3">Customer Name</th>
                  <th className="px-5 py-3">City / Phone</th>
                  <th className="px-5 py-3">Orders</th>
                  <th className="px-5 py-3">Total Spend</th>
                  <th className="px-5 py-3">Score</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  <tr><td colSpan="5" className="p-8 text-center text-textSecondary">
                    <div className="flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>
                  </td></tr>
                ) : (customers || []).length === 0 ? (
                  <tr><td colSpan="5" className="p-12 text-center text-textSecondary border border-border border-dashed m-4 rounded-lg bg-gray-50">
                    <p className="font-medium text-textPrimary mb-1">No customers found</p>
                    <p className="text-sm">Try adjusting your search filters.</p>
                  </td></tr>
                ) : (
                  (customers || []).map(c => (
                    <tr 
                      key={c.id} 
                      onClick={() => setSelectedCustomerId(c.id)}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {c.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-textPrimary truncate">{c.name}</div>
                          <div className="text-xs text-textSecondary truncate">{c.email}</div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-textPrimary">{c.city || '-'}</div>
                        <div className="text-xs text-textSecondary">{c.phone || '-'}</div>
                      </td>
                      <td className="px-5 py-3 font-medium text-textPrimary">{c.orderCount}</td>
                      <td className="px-5 py-3 font-semibold text-textPrimary">{formatCurrency(c.totalSpent)}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 rounded font-bold text-xs ${getScoreBadge(c.score)}`}>
                          {c.score}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-border flex justify-between items-center text-sm text-textSecondary bg-gray-50">
            <div>Showing {customers.length > 0 ? (filters.page - 1) * 50 + 1 : 0} to {Math.min(filters.page * 50, total)} of {total}</div>
            <div className="flex gap-2">
              <button 
                onClick={handlePrevPage} 
                disabled={filters.page === 1}
                className="p-1.5 border border-border rounded-md hover:bg-white bg-transparent transition-colors disabled:opacity-50"
              ><ChevronLeft size={16} /></button>
              <button 
                onClick={handleNextPage} 
                disabled={customers.length < 50}
                className="p-1.5 border border-border rounded-md hover:bg-white bg-transparent transition-colors disabled:opacity-50"
              ><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>

        {/* Right Insights Sidebar */}
        <div className="w-80 space-y-4 shrink-0 hidden lg:block">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-primary mb-3">
              <Star size={14} className="text-amber-500 fill-amber-500" /> Top Customer
            </div>
            <div className="font-bold text-textPrimary mb-1 text-lg">Priya Sharma</div>
            <p className="text-sm text-gray-700 mb-3 leading-relaxed">Generated ₹1.2L revenue. Consider inviting to Beta program.</p>
            <button className="text-primary text-sm font-semibold hover:underline">View Profile →</button>
          </div>

          <div className="bg-red-50 border border-red-100 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-danger mb-3">
              <AlertTriangle size={14} /> At Risk
            </div>
            <div className="font-bold text-textPrimary mb-1 text-lg">Rohan Mehta</div>
            <p className="text-sm text-gray-700 mb-3 leading-relaxed">Activity dropped 40% in 30 days. High churn probability.</p>
            <button className="text-danger text-sm font-semibold hover:underline">Send Re-engagement →</button>
          </div>
          
          <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-3">
              <TrendingUp size={14} /> Revenue Opp
            </div>
            <div className="font-bold text-textPrimary mb-1 text-lg">Upsell Potential</div>
            <p className="text-sm text-textSecondary mb-3 leading-relaxed">125 customers match 'Enterprise Upgrade' criteria. Est. value: ₹1.4L.</p>
            <button className="text-primary text-sm font-semibold hover:underline">Create Campaign →</button>
          </div>
        </div>
      </div>

      <CustomerModal 
        isOpen={isNewCustomerModalOpen} 
        onClose={() => setIsNewCustomerModalOpen(false)}
        onSuccess={fetchCustomers}
      />
      
      <CustomerProfile
        customerId={selectedCustomerId}
        onClose={() => setSelectedCustomerId(null)}
      />
    </div>
  );
}

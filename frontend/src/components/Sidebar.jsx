import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, Megaphone, BarChart3, Bot, Network, Settings, HelpCircle, Plus } from 'lucide-react';
import ReachIQBrand from './ReachIQBrand';

const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 transition-colors ${
        isActive 
          ? 'bg-primary text-white font-medium' 
          : 'text-textSecondary hover:bg-gray-100 hover:text-textPrimary'
      }`
    }
  >
    <Icon size={18} />
    <span className="text-sm">{label}</span>
  </NavLink>
);

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNewCampaign = () => {
    if (location.pathname === '/campaigns') {
      const promptInput = document.getElementById('campaign-prompt');
      if (promptInput) {
        promptInput.focus();
        promptInput.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/campaigns', { state: { focusPrompt: true } });
    }
  };

  return (
    <div className="w-64 bg-card border-r border-border h-full flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <ReachIQBrand iconSize={28} />
        </div>
        
        <button 
          onClick={handleNewCampaign}
          className="w-full bg-primary hover:bg-blue-700 text-white rounded-lg py-2 flex items-center justify-center gap-2 text-sm font-medium transition-colors mb-6 shadow-sm"
        >
          <Plus size={16} /> New Campaign
        </button>

        <div className="space-y-6">
          <div>
            <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
            <NavItem to="/customers" icon={Users} label="Customers" />
            <NavItem to="/audiences" icon={UserPlus} label="Audiences" />
            <NavItem to="/campaigns" icon={Megaphone} label="Campaigns" />
            <NavItem to="/analytics" icon={BarChart3} label="Analytics" />
          </div>

          <div>
            <div className="px-4 text-[11px] font-semibold text-textSecondary uppercase tracking-wider mb-2 mt-4">Intelligence</div>
            <NavItem to="/ai-copilot" icon={Bot} label="AI Copilot" />
            <NavItem to="/architecture" icon={Network} label="Architecture" />
          </div>
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-border">
        <div className="mb-2">
          <NavItem to="/settings" icon={Settings} label="Settings" />
          <NavItem to="/support" icon={HelpCircle} label="Help" />
        </div>
      </div>
    </div>
  );
}

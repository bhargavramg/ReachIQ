import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Audiences from './pages/Audiences';
import Campaigns from './pages/Campaigns';
import CampaignDetail from './pages/CampaignDetail';
import Analytics from './pages/Analytics';
import AICopilot from './pages/AICopilot';
import Architecture from './pages/Architecture';
import Calendar from './pages/Calendar';
import PlaceholderPage from './pages/PlaceholderPage';
import { Settings, HelpCircle } from 'lucide-react';
import { ToastProvider } from './context/ToastContext';

function Layout({ children }) {
  return (
    <div className="flex h-screen bg-page overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/customers" element={<Layout><Customers /></Layout>} />
          <Route path="/audiences" element={<Layout><Audiences /></Layout>} />
          <Route path="/campaigns" element={<Layout><Campaigns /></Layout>} />
          <Route path="/campaigns/:id" element={<Layout><CampaignDetail /></Layout>} />
          <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
          <Route path="/calendar" element={<Layout><Calendar /></Layout>} />
          <Route path="/ai-copilot" element={<Layout><AICopilot /></Layout>} />
          <Route path="/architecture" element={<Layout><Architecture /></Layout>} />
          <Route path="/settings" element={<Layout><PlaceholderPage title="Settings" message="Settings module coming soon." icon={Settings} /></Layout>} />
          <Route path="/support" element={<Layout><PlaceholderPage title="Help" message="Documentation and support center coming soon." icon={HelpCircle} /></Layout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <VercelAnalytics />
    </ToastProvider>
  );
}

export default App;

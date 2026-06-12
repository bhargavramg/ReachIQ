import React, { useState } from 'react';
import { 
  Server, Database, Brain, Globe, Cpu, Network, Shield, Zap, Cloud, Layers, 
  Smartphone, RefreshCw, Send, Target, Users, Megaphone, ShoppingBag,
  Workflow, Sparkles, TrendingUp, Info, BookOpen, ArrowRightLeft, Activity, Monitor, BarChart, Settings
} from 'lucide-react';
import useAppStats from '../hooks/useAppStats';

const TopCard = ({ title, value, badge, icon: Icon }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
    <div className="flex justify-between items-start mb-2">
      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
      <Icon size={16} className="text-gray-400" />
    </div>
    <div className="flex items-end gap-2">
      <span className="text-4xl font-bold text-gray-900 leading-none tracking-tight">{value}</span>
      {badge && <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full mb-1">{badge}</span>}
    </div>
  </div>
);

const DiagramNode = ({ icon: Icon, label }) => (
  <div className="flex items-center px-4 py-2.5 bg-white border border-blue-200 shadow-sm rounded min-w-[200px] relative">
    <Icon size={14} className="text-blue-500" />
    <span className="text-xs font-semibold text-gray-700 flex-1 text-center pr-4">{label}</span>
  </div>
);

const Arrow = () => (
  <div className="flex flex-col items-center">
    <div className="h-4 w-px bg-blue-300"></div>
    <div className="w-1.5 h-1.5 border-r border-b border-blue-300 transform rotate-45 -mt-1"></div>
  </div>
);

const DocCard = ({ icon: Icon, title, desc }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
    <div className="flex items-center gap-3 mb-3">
      <div className="bg-slate-50 p-2 rounded-lg border border-gray-100">
        <Icon size={16} className="text-gray-700" />
      </div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
    </div>
    <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
  </div>
);

export default function Architecture() {
  const { appMetrics } = useAppStats();
  const [activeTab, setActiveTab] = useState('data');

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Architecture</h1>
        <p className="text-gray-500 text-sm">Understand how the AI CRM platform works.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <TopCard title="Customers Processed" value={new Intl.NumberFormat('en-IN').format(appMetrics.customers)} badge="+5%" icon={Users} />
        <TopCard title="Campaigns Sent" value={new Intl.NumberFormat('en-IN').format(appMetrics.campaigns)} icon={Megaphone} />
        <TopCard title="Total Orders" value={new Intl.NumberFormat('en-IN').format(appMetrics.orders)} icon={ShoppingBag} />
        <TopCard title="Active Segments" value={new Intl.NumberFormat('en-IN').format(appMetrics.segments)} icon={Target} />
      </div>

      <div className="flex gap-6">
        <div className="flex-1 flex flex-col space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center gap-2">
              <Workflow className="text-blue-600" size={18} />
              <h2 className="text-lg font-semibold text-gray-900">System Architecture Diagram</h2>
            </div>
            
            <div className="p-8 bg-slate-50 flex-1 flex justify-center items-center">
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 w-full max-w-xl flex flex-col items-center">
                <h3 className="text-blue-600 font-medium mb-6 text-sm">AI CRM Platform Architecture</h3>
                <div className="flex flex-col items-center">
                  <DiagramNode icon={Monitor} label="React + Vite Frontend" />
                  <Arrow />
                  <DiagramNode icon={Server} label="Express API Server" />
                  <Arrow />
                  <DiagramNode icon={Layers} label="Prisma ORM" />
                  <Arrow />
                  <DiagramNode icon={Database} label="PostgreSQL (Neon)" />
                  <Arrow />
                  <DiagramNode icon={Brain} label="Gemini AI Service" />
                  <Arrow />
                  <DiagramNode icon={Settings} label="Campaign Engine" />
                  <Arrow />
                  <DiagramNode icon={Network} label="Channel Service" />
                  <Arrow />
                  <DiagramNode icon={BarChart} label="Analytics Engine" />
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="text-blue-600" size={18} />
              <h2 className="text-lg font-semibold text-gray-900">Architecture Documentation</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <DocCard 
                icon={ArrowRightLeft} 
                title="How callbacks work" 
                desc="The callback processor asynchronously handles incoming webhook responses from our channel partners (SMS, Email, Push). It utilizes a distributed message queue to ensure guaranteed delivery and ordering before updating the central PostgreSQL (Neon) database." 
              />
              <DocCard 
                icon={RefreshCw} 
                title="How retries work" 
                desc="Our retry logic implements an exponential backoff strategy with jitter. If a channel service API returns a 429 or 5xx error, the event is re-queued with an increasing delay (base 2s, max 5m) to prevent cascading failures across the campaign engine." 
              />
              <DocCard 
                icon={Activity} 
                title="How campaign tracking works" 
                desc="Event tracking is decoupled from the main execution thread. The Campaign Engine emits lightweight telemetry events to a dedicated analytics stream, which are then aggregated in real-time by the Analytics Engine to power dashboard metrics." 
              />
              <DocCard 
                icon={Layers} 
                title="How scaling would work" 
                desc="The architecture relies on stateless microservices within a Kubernetes cluster. Horizontal Pod Autoscaling (HPA) dynamically adjusts the number of Backend API and Campaign Engine replicas based on custom metrics like queue depth and CPU utilization." 
              />
            </div>
          </div>
        </div>

        <div className="w-[340px]">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-full">
            <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-purple-500 to-red-500 rounded-t-xl"></div>
            <div className="p-6 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="text-blue-600" size={18} />
                <h3 className="text-lg font-semibold text-gray-900">Copilot Insight</h3>
              </div>
              <p className="text-xs text-gray-500 mb-8">System Health & Performance</p>

              <div className="space-y-6">
                <div>
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Orders Processed</div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-gray-900 tracking-tight">{new Intl.NumberFormat('en-IN').format(appMetrics.orders)}</span>
                    <TrendingUp size={16} className="text-blue-500" />
                  </div>
                </div>
                <div className="border-t border-gray-100"></div>
                
                <div>
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Callbacks Received</div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl font-bold text-gray-900 tracking-tight">98.2%</span>
                    <span className="bg-gray-100 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded">Optimal</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full w-[98.2%]"></div>
                  </div>
                </div>
                <div className="border-t border-gray-100"></div>

                <div>
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Average Processing Time</div>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold text-gray-900 leading-none tracking-tight">120</span>
                    <span className="text-sm font-medium text-gray-500 mb-0.5">ms</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 border-t border-gray-100 rounded-b-xl flex gap-3 items-start">
              <Info size={16} className="text-gray-500 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-700 leading-relaxed">System operating within normal parameters.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui';
import { 
    Users, 
    Send, 
    CheckCircle2, 
    XCircle, 
    TrendingUp,
    Clock
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { leadService } from '@/services/leadService';
import { campaignService } from '@/services/campaignService';
import { dashboardService } from '@/services/dashboardService';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
            <div className={cn("p-2 rounded-lg bg-opacity-10", color.bg)}>
                <Icon size={20} className={color.text} />
            </div>
            {trend && (
                <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <TrendingUp size={12} />
                    {trend}
                </div>
            )}
        </div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </Card>
);

const cn = (...inputs) => inputs.filter(Boolean).join(' ');

const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalLeads: 0,
        sent: 0,
        pending: 0,
        failed: 0
    });
    const [performanceData, setPerformanceData] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const data = await dashboardService.getStats();
                setStats(data.summary);
                setPerformanceData(data.performanceData);
                setActivities(data.recentActivities);
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
        
        // Refresh every 30 seconds
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);


    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 text-sm">Welcome back to DevPhics. Here&apos;s what&apos;s happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Total Leads" 
                    value={stats.totalLeads} 
                    icon={Users} 
                    color={{ bg: 'bg-indigo-500', text: 'text-indigo-600' }}
                    trend="+12%"
                />
                <StatCard 
                    title="Messages Sent" 
                    value={stats.sent} 
                    icon={Send} 
                    color={{ bg: 'bg-emerald-500', text: 'text-emerald-600' }}
                    trend="+8%"
                />
                <StatCard 
                    title="Pending" 
                    value={stats.pending} 
                    icon={Clock} 
                    color={{ bg: 'bg-amber-500', text: 'text-amber-600' }}
                />
                <StatCard 
                    title="Failed" 
                    value={stats.failed} 
                    icon={XCircle} 
                    color={{ bg: 'bg-red-500', text: 'text-red-600' }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-gray-900">Outreach Performance</h3>
                        <select className="text-sm border-gray-200 rounded-lg bg-gray-50 px-2 py-1 outline-none">
                            <option>Last 7 days</option>
                            <option>Last 30 days</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performanceData}>
                                <defs>
                                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="sent" 
                                    stroke="#4f46e5" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorSent)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-6">Recent Activities</h3>
                    <div className="space-y-6">
                        {activities.length > 0 ? (
                            activities.map((activity) => (
                                <div key={activity.id} className="flex gap-4">
                                    <div className="mt-1">
                                        <div className={cn(
                                            "p-1.5 rounded-full",
                                            activity.type === 'error' ? "bg-red-100" : "bg-emerald-100"
                                        )}>
                                            {activity.type === 'error' ? (
                                                <XCircle size={12} className="text-red-600" />
                                            ) : (
                                                <CheckCircle2 size={12} className="text-emerald-600" />
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                                        <p className="text-xs text-gray-500">
                                            {formatTimeAgo(activity.time)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-400 text-sm">No recent activity</div>
                        )}
                    </div>
                    <button className="w-full mt-8 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                        View all activity
                    </button>
                </Card>
            </div>
        </DashboardLayout>
    );
}

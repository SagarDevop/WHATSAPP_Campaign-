'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button, Card, Input } from '@/components/ui';
import { 
    Play, 
    Square, 
    Plus, 
    BarChart3, 
    MessageSquare, 
    Settings2,
    CheckCircle,
    RotateCcw,
    Zap,
    Filter,
    Trash2
} from 'lucide-react';
import { campaignService } from '@/services/campaignService';
import LogConsole from '@/components/campaigns/LogConsole';
import { toast } from 'react-hot-toast';

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState([]);
    const [activeCampaign, setActiveCampaign] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [polling, setPolling] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCampaignName, setNewCampaignName] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    useEffect(() => {
        let interval;
        if (activeCampaign && activeCampaign.status === 'running') {
            setPolling(true);
            interval = setInterval(async () => {
                try {
                    const [updated, latestLogs] = await Promise.all([
                        campaignService.getCampaign(activeCampaign._id),
                        campaignService.getLogs(activeCampaign._id)
                    ]);

                    setLogs(latestLogs);
                    setActiveCampaign(updated);
                    
                    // Also refresh the specific campaign in the list
                    setCampaigns(prev => prev.map(c => c._id === updated._id ? updated : c));

                    if (updated.status !== 'running') {
                        setPolling(false);
                    }
                } catch (err) {
                    console.error('Polling error', err);
                }
            }, 1000); // 1 second interval for 'live' feel
        } else {
            setPolling(false);
        }
        return () => clearInterval(interval);
    }, [activeCampaign]);

    const fetchCampaigns = async () => {
        try {
            const data = await campaignService.getCampaigns();
            setCampaigns(data);
            if (data.length > 0 && !activeCampaign) {
                const running = data.find(c => c.status === 'running');
                setActiveCampaign(running || data[0]);
                if (running || data[0]) {
                    const logData = await campaignService.getLogs((running || data[0])._id);
                    setLogs(logData);
                }
            }
        } catch (error) {
            console.error('Error fetching campaigns', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStart = async (id) => {
        try {
            await campaignService.startCampaign(id);
            toast.success('Campaign started successfully');
            fetchCampaigns();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to start campaign');
        }
    };

    const handleStop = async (id) => {
        try {
            await campaignService.stopCampaign(id);
            toast.success('Campaign stopped');
            fetchCampaigns();
        } catch (error) {
            toast.error('Failed to stop campaign');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this campaign? All associated logs will be removed.')) return;
        
        try {
            await campaignService.deleteCampaign(id);
            toast.success('Campaign deleted');
            if (activeCampaign?._id === id) {
                setActiveCampaign(null);
                setLogs([]);
            }
            fetchCampaigns();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete campaign');
        }
    };

    const handleCreateCampaign = async (e) => {
        e.preventDefault();
        if (!newCampaignName.trim()) {
            toast.error('Campaign name is required');
            return;
        }

        setCreating(true);
        try {
            const newCampaign = await campaignService.createCampaign({
                name: newCampaignName,
                categoryFilter
            });
            toast.success('Campaign created successfully');
            setIsModalOpen(false);
            setNewCampaignName('');
            setCategoryFilter('All');
            fetchCampaigns();
            setActiveCampaign(newCampaign);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create campaign');
        } finally {
            setCreating(false);
        }
    };

    const handleSelectCampaign = async (campaign) => {
        setActiveCampaign(campaign);
        const logData = await campaignService.getLogs(campaign._id);
        setLogs(logData);
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Automation Campaigns</h1>
                    <p className="text-gray-500 text-sm">Create and monitor your WhatsApp outreach workflows.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} className="mr-2" />
                    New Campaign
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Campaign Selector & List */}
                <div className="lg:col-span-4 space-y-4">
                    <Card className="p-4 bg-gray-50/50 border-dashed">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Active Campaigns</h3>
                        <div className="space-y-3">
                            {campaigns.map((c) => (
                                <button
                                    key={c._id}
                                    onClick={() => handleSelectCampaign(c)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                                        activeCampaign?._id === c._id 
                                            ? 'bg-white border-indigo-200 shadow-md ring-1 ring-indigo-100' 
                                            : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            c.status === 'running' 
                                                ? 'bg-emerald-50 text-emerald-700' 
                                                : c.status === 'completed' ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {c.status}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-medium">Updated: {new Date(c.updatedAt).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="font-bold text-gray-900">{c.name}</p>
                                    <p className="text-xs text-indigo-600 font-medium mt-1 inline-flex items-center gap-1">
                                        <Filter size={10} />
                                        {c.categoryFilter}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Campaign Details & Stats */}
                <div className="lg:col-span-8 space-y-6">
                    {activeCampaign ? (
                        <>
                            <Card className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl ${activeCampaign.status === 'running' ? 'bg-emerald-50 text-emerald-600 animate-pulse' : 'bg-indigo-50 text-indigo-600'}`}>
                                            <Zap size={24} className="fill-current" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">{activeCampaign.name}</h2>
                                            <p className="text-sm text-gray-500">Processing {activeCampaign.categoryFilter} leads</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        {activeCampaign.status === 'running' ? (
                                            <Button variant="danger" onClick={() => handleStop(activeCampaign._id)}>
                                                <Square size={18} className="mr-2 fill-current" />
                                                Stop Campaign
                                            </Button>
                                        ) : (
                                            <>
                                                <Button variant="secondary" onClick={() => handleDelete(activeCampaign._id)}>
                                                    <Trash2 size={18} className="text-red-500" />
                                                </Button>
                                                {activeCampaign.processedLeads >= activeCampaign.totalLeads && activeCampaign.totalLeads > 0 && activeCampaign.status === 'completed' ? (
                                                    <Button variant="secondary" disabled className="bg-gray-100 text-gray-400 cursor-not-allowed">
                                                        <CheckCircle size={18} className="mr-2" />
                                                        Finished
                                                    </Button>
                                                ) : (
                                                    <Button variant="primary" onClick={() => handleStart(activeCampaign._id)}>
                                                        <Play size={18} className="mr-2 fill-current" />
                                                        Start Campaign
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Total Leads</p>
                                        <p className="text-xl font-bold text-gray-900">{activeCampaign.totalLeads}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Processed</p>
                                        <p className="text-xl font-bold text-gray-900">{activeCampaign.processedLeads}</p>
                                    </div>
                                    <div className="p-4 bg-emerald-50 rounded-xl">
                                        <p className="text-[10px] uppercase font-bold text-emerald-600/60 mb-1">Success</p>
                                        <p className="text-xl font-bold text-emerald-700">{activeCampaign.successCount}</p>
                                    </div>
                                    <div className="p-4 bg-red-50 rounded-xl">
                                        <p className="text-[10px] uppercase font-bold text-red-600/60 mb-1">Failed</p>
                                        <p className="text-xl font-bold text-red-700">{activeCampaign.failedCount}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
                                        <span>Progress</span>
                                        <span>{Math.round((activeCampaign.processedLeads / activeCampaign.totalLeads) * 100 || 0)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-indigo-600 h-full transition-all duration-500 shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                                            style={{ width: `${(activeCampaign.processedLeads / activeCampaign.totalLeads) * 100 || 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </Card>

                            <LogConsole logs={logs} />
                        </>
                    ) : (
                        <div className="h-full min-h-[400px] flex items-center justify-center text-gray-400 italic">
                            Select a campaign to view details...
                        </div>
                    )}
                </div>
            </div>

            {/* Create Campaign Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <Card className="w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 font-premium">Create New Campaign</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <Plus className="rotate-45" size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateCampaign} className="space-y-6">
                            <Input
                                label="Campaign Name"
                                placeholder="e.g., Summer Outreach 2024"
                                value={newCampaignName}
                                onChange={(e) => setNewCampaignName(e.target.value)}
                                required
                            />
                            
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 font-premium">Category Filter</label>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="All">All Leads</option>
                                    <option value="Dermatologist">Dermatologist</option>
                                    <option value="Dentist">Dentist</option>
                                    <option value="Psychologist">Psychologist</option>
                                    <option value="Orthopedic">Orthopedic</option>
                                </select>
                                <p className="text-xs text-gray-400">This campaign will only process leads from this category.</p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button 
                                    type="button" 
                                    variant="secondary" 
                                    className="flex-1"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    variant="primary" 
                                    className="flex-1"
                                    disabled={creating}
                                >
                                    {creating ? 'Creating...' : 'Create Campaign'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </DashboardLayout>
    );
}

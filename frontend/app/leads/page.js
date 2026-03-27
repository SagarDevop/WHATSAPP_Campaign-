'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button, Card, Input } from '@/components/ui';
import { 
    Plus, 
    Upload, 
    Search, 
    Filter, 
    MoreVertical, 
    Trash2, 
    Edit2,
    CheckCircle2,
    Clock,
    XCircle,
    UserPlus
} from 'lucide-react';
import { leadService } from '@/services/leadService';
import LeadForm from '@/components/leads/LeadForm';
import CSVUpload from '@/components/leads/CSVUpload';

export default function LeadsPage() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [showForm, setShowForm] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [editingLead, setEditingLead] = useState(null);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const data = await leadService.getLeads();
            setLeads(data);
        } catch (error) {
            console.error('Error fetching leads', error);
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            pending: 'bg-amber-50 text-amber-700 border-amber-100',
            sent: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            failed: 'bg-red-50 text-red-700 border-red-100',
            replied: 'bg-indigo-50 text-indigo-700 border-indigo-100',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status]}`}>
                {status}
            </span>
        );
    };

    const deleteLead = async (id) => {
        if (confirm('Are you sure you want to delete this lead?')) {
            try {
                await leadService.deleteLead(id);
                fetchLeads();
            } catch (error) {
                console.error('Delete failed', error);
            }
        }
    };

    const handleEdit = (lead) => {
        setEditingLead(lead);
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingLead(null);
    };

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = 
            lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.phone.includes(searchTerm) ||
            (lead.location && lead.location.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesCategory = filterCategory === 'All' || lead.category === filterCategory;
        
        return matchesSearch && matchesCategory;
    });

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
                    <p className="text-gray-500 text-sm">Manage and organize your business leads from one place.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setShowUpload(true)}>
                        <Upload size={18} className="mr-2" />
                        Bulk Upload
                    </Button>
                    <Button onClick={() => setShowForm(true)}>
                        <Plus size={18} className="mr-2" />
                        Add Lead
                    </Button>
                </div>
            </div>

            {showForm && (
                <LeadForm 
                    onLeadAdded={fetchLeads} 
                    onClose={handleFormClose} 
                    initialData={editingLead}
                />
            )}
            {showUpload && <CSVUpload onUploadSuccess={fetchLeads} onClose={() => setShowUpload(false)} />}


            <Card className="mb-8">
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/30">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name, phone or category..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <select 
                                className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none min-w-[140px]"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                            >
                                <option value="All">All Categories</option>
                                <option value="Dermatologist">Dermatologist</option>
                                <option value="Dentist">Dentist</option>
                                <option value="Psychologist">Psychologist</option>
                                <option value="Orthopedic Clinic">Orthopedic</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">Client Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">Phone Number</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">Category</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i}>
                                        <td colSpan="5" className="px-6 py-8 text-center">
                                            <div className="animate-pulse flex space-x-4 justify-center">
                                                <div className="h-4 bg-gray-200 rounded w-48"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <div className="bg-gray-100 p-3 rounded-full mb-4">
                                                <UserPlus size={24} className="text-gray-400" />
                                            </div>
                                            <p className="font-medium">No leads found</p>
                                            <p className="text-sm">Start by adding your first business lead.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => (
                                    <tr key={lead._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{lead.name}</p>
                                                <p className="text-xs text-gray-500">{lead.location}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">{lead.phone}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                                                {lead.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={lead.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button 
                                                    className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                                                    onClick={() => handleEdit(lead)}
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                    onClick={() => deleteLead(lead._id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </DashboardLayout>
    );
}

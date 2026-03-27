'use client';
import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';
import { leadService } from '@/services/leadService';
import { toast } from 'react-hot-toast';

export default function LeadForm({ onLeadAdded, onClose, initialData }) {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        phone: initialData?.phone || '',
        category: initialData?.category || 'Dermatologist',
        location: initialData?.location || ''
    });
    const [loading, setLoading] = useState(false);

    const categories = ['Dermatologist', 'Dentist', 'Psychologist', 'Orthopedic Clinic'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?._id) {
                await leadService.updateLead(initialData._id, formData);
                toast.success('Lead updated successfully!');
            } else {
                await leadService.addLead(formData);
                toast.success('Lead added successfully!');
            }
            onLeadAdded();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">{initialData ? 'Edit Lead' : 'Add New Lead'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input 
                        label="Client Name" 
                        placeholder="Dr. Emily Smith" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <Input 
                        label="Phone Number" 
                        placeholder="+1234567890" 
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Category</label>
                        <select 
                            className="w-full h-10 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <Input 
                        label="Location (Optional)" 
                        placeholder="Pune, India" 
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />

                    <div className="flex gap-3 pt-4">
                        <Button variant="secondary" className="flex-1" type="button" onClick={onClose}>Cancel</Button>
                        <Button className="flex-1" type="submit" disabled={loading}>
                            {loading ? (initialData ? 'Updating...' : 'Adding...') : (initialData ? 'Update Lead' : 'Add Lead')}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}

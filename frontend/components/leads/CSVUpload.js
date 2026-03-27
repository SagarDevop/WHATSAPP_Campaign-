'use client';
import { useState } from 'react';
import { Upload, X, Check, AlertCircle } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { leadService } from '@/services/leadService';
import { toast } from 'react-hot-toast';

export default function CSVUpload({ onUploadSuccess, onClose }) {
    const [fileContents, setFileContents] = useState(null);
    const [fileName, setFileName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (event) => {
                setFileContents(event.target.result);
            };
            reader.readAsText(file);
        }
    };

    const handleUpload = async () => {
        if (!fileContents) return;
        setLoading(true);
        try {
            const result = await leadService.uploadCSV(fileContents);
            toast.success(`Successfully uploaded ${result.created} leads!`);
            onUploadSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Bulk Upload Leads</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="mb-6">
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all hover:border-indigo-300 group">
                        <div className="flex flex-col items-center justify-center py-6">
                            <Upload size={32} className="text-gray-400 mb-3 group-hover:text-indigo-500 transition-colors" />
                            <p className="text-sm font-medium text-gray-700">{fileName || 'Click to upload CSV'}</p>
                            <p className="text-xs text-gray-400 mt-1">name, phone, category, location</p>
                        </div>
                        <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
                    </label>
                </div>

                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-8">
                    <div className="flex gap-3">
                        <AlertCircle size={18} className="text-indigo-600 shrink-0" />
                        <div className="text-xs text-indigo-900 leading-relaxed">
                            <p className="font-bold mb-1">CSV Format Requirements:</p>
                            <ul className="list-disc ml-4 space-y-0.5 opacity-80">
                                <li>Headers: name, phone, category, location</li>
                                <li>Categories must match exactly (e.g., Dentist)</li>
                                <li>Phone numbers should include country code</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
                    <Button 
                        className="flex-1" 
                        disabled={!fileContents || loading}
                        onClick={handleUpload}
                    >
                        {loading ? 'Processing...' : 'Start Upload'}
                    </Button>
                </div>
            </Card>
        </div>
    );
}

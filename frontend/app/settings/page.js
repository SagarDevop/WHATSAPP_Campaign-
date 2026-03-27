'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button, Card, Input } from '@/components/ui';
import { 
    Save, 
    Key, 
    Monitor, 
    Link as LinkIcon, 
    Shield,
    Smartphone,
    AlertCircle
} from 'lucide-react';
import api from '@/services/api';
import { toast } from 'react-hot-toast';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        geminiApiKey: '',
        chromeProfilePath: '',
        dailyLimit: 60,
        delayMin: 20,
        delayMax: 60,
        demoLinks: {
            dermatologist: '/demo-derma',
            dentist: '/demo-dental',
            psychologist: '/demo-psycho',
            orthopedic: '/demo-ortho',
        }
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/settings');
            setSettings(response.data);
        } catch (error) {
            console.error('Error fetching settings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/settings', settings);
            toast.success('Settings saved successfully');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                <p className="text-gray-500 text-sm">Configure your AI outreach parameters and browser profiles.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
                <div className="space-y-6">
                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <Key size={20} />
                            </div>
                            <h3 className="font-bold text-gray-900">AI Configuration</h3>
                        </div>
                        <Input 
                            label="Google Gemini API Key" 
                            type="password"
                            value={settings.geminiApiKey}
                            onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                            placeholder="Enter your Gemini Pro key..."
                        />
                        <p className="text-[10px] text-gray-400 mt-2">Required for generating personalized, human-like messages.</p>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <Monitor size={20} />
                            </div>
                            <h3 className="font-bold text-gray-900">Browser Automation</h3>
                        </div>
                        <Input 
                            label="Chrome Profile Path" 
                            value={settings.chromeProfilePath}
                            onChange={(e) => setSettings({ ...settings, chromeProfilePath: e.target.value })}
                            placeholder="C:\Users\Name\AppData\Local\Google\Chrome\User Data\Profile 1"
                        />
                        <div className="flex gap-3 mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-amber-700 leading-relaxed">
                                Ensure your Chrome Profile has WhatsApp Web logged in. DevPhics uses this profile to bypass QR scan and maintain your session.
                            </p>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <Shield size={20} />
                            </div>
                            <h3 className="font-bold text-gray-900">Safety & Anti-Spam</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <Input 
                                label="Min Delay (sec)" 
                                type="number"
                                value={settings.delayMin}
                                onChange={(e) => setSettings({ ...settings, delayMin: parseInt(e.target.value) })}
                            />
                            <Input 
                                label="Max Delay (sec)" 
                                type="number"
                                value={settings.delayMax}
                                onChange={(e) => setSettings({ ...settings, delayMax: parseInt(e.target.value) })}
                            />
                        </div>
                        <Input 
                            label="Daily Sending Limit" 
                            type="number"
                            value={settings.dailyLimit}
                            onChange={(e) => setSettings({ ...settings, dailyLimit: parseInt(e.target.value) })}
                        />
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <LinkIcon size={20} />
                            </div>
                            <h3 className="font-bold text-gray-900">Category Demo Links</h3>
                        </div>
                        <div className="space-y-4">
                            <Input 
                                label="Dermatologist Demo" 
                                value={settings.demoLinks.dermatologist}
                                onChange={(e) => setSettings({ ...settings, demoLinks: { ...settings.demoLinks, dermatologist: e.target.value } })}
                            />
                            <Input 
                                label="Dentist Demo" 
                                value={settings.demoLinks.dentist}
                                onChange={(e) => setSettings({ ...settings, demoLinks: { ...settings.demoLinks, dentist: e.target.value } })}
                            />
                            <Input 
                                label="Psychologist Demo" 
                                value={settings.demoLinks.psychologist}
                                onChange={(e) => setSettings({ ...settings, demoLinks: { ...settings.demoLinks, psychologist: e.target.value } })}
                            />
                            <Input 
                                label="Orthopedic Demo" 
                                value={settings.demoLinks.orthopedic}
                                onChange={(e) => setSettings({ ...settings, demoLinks: { ...settings.demoLinks, orthopedic: e.target.value } })}
                            />
                        </div>
                    </Card>

                    <div className="flex justify-end pt-4">
                        <Button className="px-10 py-6" onClick={handleSave} disabled={saving}>
                            <Save size={18} className="mr-2" />
                            {saving ? 'Saving...' : 'Save All Settings'}
                        </Button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';
import { authService } from '@/services/authService';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await authService.login(formData.email, formData.password);
            router.push('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-6">
            <Card className="max-w-md w-full p-8 shadow-xl border-gray-100">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="bg-indigo-600 p-2 rounded-xl mb-4">
                        <Zap size={28} className="text-white fill-current" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
                    <p className="text-gray-500 text-sm mt-1">Log in to your DevPhics account</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
                        <Zap size={14} className="rotate-180" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-4">
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="name@company.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full py-6 text-base font-semibold" 
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Sign in'}
                        {!loading && <ArrowRight size={18} className="ml-2" />}
                    </Button>
                </form>

                <p className="text-center text-sm text-gray-400 mt-8">
                    Contact support to manage your account access.
                </p>
            </Card>
        </div>
    );
}

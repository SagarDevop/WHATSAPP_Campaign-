'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (user) {
            router.push('/dashboard');
        } else {
            router.push('/login');
        }
    }, [router]);

    return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <div className="animate-pulse flex flex-col items-center">
                <div className="bg-indigo-600 w-12 h-12 rounded-xl mb-4"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
        </div>
    );
}

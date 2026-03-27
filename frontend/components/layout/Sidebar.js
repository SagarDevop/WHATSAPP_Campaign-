'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
    LayoutDashboard, 
    Users, 
    MessageSquare, 
    Settings, 
    LogOut, 
    Zap,
    ChevronRight
} from 'lucide-react';
import { cn } from '../ui';
import { authService } from '@/services/authService';

const SidebarItem = ({ icon: Icon, label, href, active }) => (
    <Link
        href={href}
        className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium',
            active 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 group'
        )}
    >
        <Icon size={18} className={cn(active ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600')} />
        <span>{label}</span>
        {active && <ChevronRight size={14} className="ml-auto" />}
    </Link>
);

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState(null);

    useEffect(() => {
        setUser(authService.getCurrentUser());
    }, []);

    const handleLogout = () => {
        authService.logout();
        router.push('/login');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
        { icon: Users, label: 'Leads', href: '/leads' },
        { icon: MessageSquare, label: 'Campaigns', href: '/campaigns' },
        { icon: Settings, label: 'Settings', href: '/settings' },
    ];

    return (
        <aside className="w-64 border-r border-gray-100 bg-white flex flex-col h-screen sticky top-0">
            <div className="p-6 flex items-center gap-2">
                <div className="bg-indigo-600 p-1.5 rounded-lg">
                    <Zap size={20} className="text-white fill-current" />
                </div>
                <span className="text-xl font-bold tracking-tight text-gray-900">DevPhics</span>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                <p className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Main Menu</p>
                {menuItems.map((item) => (
                    <SidebarItem 
                        key={item.href} 
                        {...item} 
                        active={pathname === item.href} 
                    />
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100">
                {user && (
                    <div className="px-3 py-3 border border-gray-100 rounded-xl mb-4 bg-gray-50/50">
                        <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                    </div>
                )}
                <button 
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-all group"
                >
                    <LogOut size={18} className="text-gray-400 group-hover:text-red-500" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}

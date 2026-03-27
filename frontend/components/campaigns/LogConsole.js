'use client';
import { useState, useEffect, useRef } from 'react';
import { Terminal, Clock, CheckCircle2, XCircle, Info, Zap } from 'lucide-react';
import { Card } from '@/components/ui';

export default function LogConsole({ logs = [] }) {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle2 size={14} className="text-emerald-500" />;
            case 'error': return <XCircle size={14} className="text-red-500" />;
            case 'warning': return <Zap size={14} className="text-amber-500" />;
            default: return <Info size={14} className="text-blue-500" />;
        }
    };

    return (
        <Card className="bg-slate-900 border-slate-800 overflow-hidden flex flex-col h-[400px]">
            <div className="p-3 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Terminal size={16} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Live Activity Console</span>
                </div>
                <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500/80"></div>
                    <div className="w-2 h-2 rounded-full bg-amber-500/80"></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500/80"></div>
                </div>
            </div>
            
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed space-y-2"
            >
                {logs.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-600 italic">
                        No activity recorded yet...
                    </div>
                ) : (
                    logs.map((log, i) => (
                        <div key={log._id || i} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                            <span className="text-slate-600 shrink-0">[{new Date(log.createdAt).toLocaleTimeString()}]</span>
                            <span className="shrink-0 mt-0.5">{getIcon(log.type)}</span>
                            <span className={cn(
                                "break-all",
                                log.type === 'error' ? 'text-red-400' : 
                                log.type === 'success' ? 'text-emerald-400' : 
                                log.type === 'warning' ? 'text-amber-400' : 'text-slate-300'
                            )}>
                                {log.message}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
}

function cn(...inputs) {
    return inputs.filter(Boolean).join(' ');
}

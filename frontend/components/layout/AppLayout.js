'use client';
import { Toaster } from 'react-hot-toast';

export default function AppLayout({ children }) {
    return (
        <>
            <Toaster position="top-right" />
            {children}
        </>
    );
}

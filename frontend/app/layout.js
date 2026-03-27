import '@/app/globals.css';
import AppLayout from '@/components/layout/AppLayout';

export const metadata = {
  title: 'DevPhics - AI WhatsApp Outreach',
  description: 'Automate your AI WhatsApp campaigns with human-like messaging.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
        <AppLayout>
            {children}
        </AppLayout>
      </body>
    </html>
  );
}

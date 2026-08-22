import Sidebar from '@/Components/Sidebar';

export default function DashboardLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />

            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
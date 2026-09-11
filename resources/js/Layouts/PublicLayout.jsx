import PublicFooter from '@/Components/PublicFooter';
import PublicNavbar from '@/Components/PublicNavbar';
import { Head } from '@inertiajs/react';

export default function PublicLayout({ title, children }) {
    return (
        <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#24221E] font-sans selection:bg-[#C99632]/20 selection:text-[#24221E]">
            {title && <Head title={title} />}

            {/* Public Navigation */}
            <PublicNavbar />

            {/* Main Content Area */}
            <main className="flex-grow">
                {children}
            </main>

            {/* Public Footer */}
            <PublicFooter />
        </div>
    );
}

import { Navbar } from "./_components/navbar";
import { Sidebar } from "./_components/sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="h-full">
            <Sidebar />
            <div className="pl-[60px] h-full">
                <Navbar />
                <div className="h-[calc(100%-80px)] pt-8">{children}</div>
            </div>
        </main>
    );
}

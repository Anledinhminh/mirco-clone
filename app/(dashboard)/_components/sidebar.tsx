"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Star } from "lucide-react";
import { OrganizationSwitcher } from "@clerk/nextjs";
import { Poppins } from "next/font/google";
import { Button } from "@/components/ui/button";

const font = Poppins({ subsets: ["latin"], weight: ["600"] });

export function Sidebar() {
    return (
        <aside className="fixed z-[1] left-0 bg-white h-full w-[60px] flex flex-col gap-y-4 text-blue-500 border-r shadow-sm items-center pt-5 pb-3">
            <Link href="/">
                <div className="bg-blue-600 h-9 w-9 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">M</span>
                </div>
            </Link>

            <div className="w-full flex flex-col items-center gap-y-1 mt-2">
                <OrganizationSwitcher
                    hidePersonal
                    appearance={{
                        elements: {
                            rootBox: { display: "flex", justifyContent: "center", alignItems: "center", width: "100%" },
                            organizationSwitcherTrigger: {
                                padding: "4px",
                                width: "100%",
                                borderRadius: "8px",
                                border: "1px solid #E5E7EB",
                                justifyContent: "center",
                            },
                        },
                    }}
                />
            </div>

            <SidebarItem
                icon={<LayoutDashboard />}
                label="Teams Boards"
                href="/"
            />
            <SidebarItem
                icon={<Star />}
                label="Favorite Boards"
                href="/?favorites=true"
            />
        </aside>
    );
}

function SidebarItem({
    icon,
    label,
    href,
}: {
    icon: React.ReactNode;
    label: string;
    href: string;
}) {
    const pathname = usePathname();
    const isActive = pathname === href;
    return (
        <Link href={href} className="group w-full flex flex-col items-center gap-y-0.5">
            <div
                className={cn(
                    "h-10 w-10 rounded-md flex items-center justify-center transition-colors",
                    isActive
                        ? "bg-blue-100 text-blue-700"
                        : "opacity-60 hover:opacity-100 hover:bg-blue-50"
                )}
            >
                {icon}
            </div>
            <span className="text-[9px] font-medium text-center text-blue-500 opacity-60 group-hover:opacity-100">
                {label}
            </span>
        </Link>
    );
}

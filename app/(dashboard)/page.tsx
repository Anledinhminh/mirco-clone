"use client";

import { use } from "react";

import { useOrganization } from "@clerk/nextjs";
import { BoardList } from "./_components/board-list";
import { EmptyOrg } from "./_components/empty-org";
import { RenameModal } from "@/components/rename-modal";

interface DashboardPageProps {
    searchParams: Promise<{
        search?: string;
        favorites?: string;
    }>;
}

export default function DashboardPage({ searchParams }: DashboardPageProps) {
    const { organization } = useOrganization();
    const query = use(searchParams);

    return (
        <div className="flex-1 h-full p-6">
            <RenameModal />
            {!organization ? (
                <EmptyOrg />
            ) : (
                <BoardList orgId={organization.id} query={query} />
            )}
        </div>
    );
}

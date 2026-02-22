import { CreateOrganization } from "@clerk/nextjs";

export function EmptyOrg() {
    return (
        <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center mb-8 space-y-2">
                <h2 className="text-2xl font-bold text-slate-800">Welcome to Miro Clone</h2>
                <p className="text-slate-500 text-sm">Create or join an organization to get started</p>
            </div>
            <CreateOrganization />
        </div>
    );
}

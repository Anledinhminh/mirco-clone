import { Search } from "lucide-react";

export function EmptySearch() {
    return (
        <div className="h-full flex flex-col items-center justify-center">
            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <Search className="h-8 w-8 text-slate-500" />
            </div>
            <h2 className="text-2xl font-semibold mt-4">No results found!</h2>
            <p className="text-muted-foreground text-sm mt-2">Try searching for something else</p>
        </div>
    );
}

export function BoardLoading() {
    return (
        <div className="h-full w-full flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 text-sm font-medium animate-pulse">Loading your canvas…</p>
            </div>
        </div>
    );
}

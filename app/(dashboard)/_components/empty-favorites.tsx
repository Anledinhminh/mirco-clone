import { Star } from "lucide-react";

export function EmptyFavorites() {
    return (
        <div className="h-full flex flex-col items-center justify-center">
            <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                <Star className="h-8 w-8 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-semibold mt-4">No favorite boards!</h2>
            <p className="text-muted-foreground text-sm mt-2">Try favoriting a board to see it here</p>
        </div>
    );
}

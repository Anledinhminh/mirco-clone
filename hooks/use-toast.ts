import { useState, useCallback } from "react";

type ToastVariant = "default" | "destructive";
interface ToastOptions {
    title: string;
    description?: string;
    variant?: ToastVariant;
}

let addToastFn: ((opts: ToastOptions) => void) | null = null;

export function registerToast(fn: (opts: ToastOptions) => void) {
    addToastFn = fn;
}

export function toast(opts: ToastOptions) {
    addToastFn?.(opts);
}

export function useToast() {
    const [toasts, setToasts] = useState<(ToastOptions & { id: number })[]>([]);

    const addToast = useCallback((opts: ToastOptions) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { ...opts, id }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
    }, []);

    return { toasts, addToast };
}

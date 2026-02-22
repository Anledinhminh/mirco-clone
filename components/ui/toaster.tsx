"use client";

import { useEffect, useState } from "react";
import {
    Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport,
} from "@/components/ui/toast";
import { registerToast } from "@/hooks/use-toast";

type ToastItem = {
    id: number;
    title: string;
    description?: string;
    variant?: "default" | "destructive";
};

export function Toaster() {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    useEffect(() => {
        registerToast((opts) => {
            const id = Date.now();
            setToasts((prev) => [...prev, { ...opts, id }]);
            setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
        });
    }, []);

    return (
        <ToastProvider>
            {toasts.map(({ id, title, description, variant }) => (
                <Toast key={id} variant={variant}>
                    <div className="grid gap-1">
                        {title && <ToastTitle>{title}</ToastTitle>}
                        {description && <ToastDescription>{description}</ToastDescription>}
                    </div>
                    <ToastClose />
                </Toast>
            ))}
            <ToastViewport />
        </ToastProvider>
    );
}

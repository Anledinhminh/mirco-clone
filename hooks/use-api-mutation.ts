import { useCallback, useMemo, useState } from "react";
import { useMutation } from "convex/react";

export function useApiMutation(mutationFunction: any) {
    const [pending, setPending] = useState(false);
    const apiMutation = useMutation(mutationFunction);

    const mutate = useCallback(
        (payload: any) => {
            setPending(true);
            return apiMutation(payload)
                .finally(() => setPending(false));
        },
        [apiMutation]
    );

    return { mutate, pending };
}

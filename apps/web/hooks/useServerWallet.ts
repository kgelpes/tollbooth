"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

function isApiError(x: unknown): x is { success: false; error: string } {
  return (
    typeof x === "object" &&
    x !== null &&
    "success" in x &&
    (x as { success: unknown }).success === false &&
    typeof (x as { error?: unknown }).error === "string"
  );
}

export function useServerWallet() {
  const queryClient = useQueryClient();

  const walletQuery = useQuery<{ address: string | null; unauthorized: boolean }, Error>({
    queryKey: ["serverWallet"],
    queryFn: async () => {
      // Try to read the wallet
      const res = await fetch("/api/server-wallets", {
        method: "GET",
        cache: "no-store",
      });
      if (res.status === 401) return { address: null, unauthorized: true };
      if (res.status === 404) {
        // Auto-create if missing (idempotent server-side)
        const createRes = await fetch("/api/server-wallets", { method: "POST" });
        if (!createRes.ok) {
          const maybe = (await createRes.json().catch(() => null)) as unknown;
          const message = isApiError(maybe)
            ? maybe.error
            : `HTTP ${createRes.status}`;
          throw new Error(message);
        }
        const created = (await createRes.json()) as {
          success: true;
          userId: string;
          address: string;
        };
        return { address: created.address, unauthorized: false };
      }
      if (!res.ok) {
        const maybe = (await res.json().catch(() => null)) as unknown;
        const message = isApiError(maybe) ? maybe.error : `HTTP ${res.status}`;
        throw new Error(message);
      }
      const json = (await res.json()) as {
        success: true;
        userId: string;
        address: string;
      };
      return { address: json.address, unauthorized: false };
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  const createMutation = useMutation<string, Error, void>({
    mutationFn: async () => {
      const res = await fetch("/api/server-wallets", {
        method: "POST",
      });
      if (!res.ok) {
        const maybe = (await res.json().catch(() => null)) as unknown;
        const message = isApiError(maybe) ? maybe.error : `HTTP ${res.status}`;
        throw new Error(message);
      }
      const json = (await res.json()) as {
        success: true;
        userId: string;
        address: string;
      };
      return json.address;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["serverWallet"] });
    },
  });

  const deleteMutation = useMutation<boolean, Error, void>({
    mutationFn: async () => {
      const res = await fetch("/api/server-wallets", {
        method: "DELETE",
      });
      if (!res.ok) {
        const maybe = (await res.json().catch(() => null)) as unknown;
        const message = isApiError(maybe) ? maybe.error : `HTTP ${res.status}`;
        throw new Error(message);
      }
      const json = (await res.json()) as { success: true; removed: boolean };
      return json.removed;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["serverWallet"] });
    },
  });

  return {
    // Data
    address: walletQuery.data?.address ?? null,
    isUnauthorized: walletQuery.data?.unauthorized ?? false,
    isLoading: walletQuery.isLoading,
    isError: walletQuery.isError,
    error: walletQuery.error?.message ?? null,
    refetch: async () => {
      const res = await queryClient.fetchQuery({ queryKey: ["serverWallet"] });
      return (res as { address: string | null; unauthorized: boolean }).address;
    },

    // Create
    create: async () => createMutation.mutateAsync(),
    isCreating: createMutation.isPending,

    // Delete
    remove: async () => deleteMutation.mutateAsync(),
    isRemoving: deleteMutation.isPending,
  } as const;
}



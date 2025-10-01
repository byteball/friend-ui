import { useCallback, useEffect, useMemo, useState } from "react";

import { isValidAddress as validateObyteAddress } from "@/lib/isValidAddress";

type WalletState = {
  value: string | null;
  revision: number;
};

/**
 * Manages wallet state and triggers asynchronous validation of Obyte addresses.
 * Exposes the current wallet value, validation result, and loading indicator.
 */
export const useWalletState = (initialWallet: string | null) => {
  const normalizeWallet = (value: string | null): string | null => {
    if (value === null || value === undefined) return null;
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  };

  const normalizedInitial = useMemo(() => normalizeWallet(initialWallet), [initialWallet]);
  const [walletState, setWalletState] = useState<WalletState>({ value: normalizedInitial, revision: 0 });
  const [isValid, setIsValid] = useState<boolean>(false);
  const { value: walletValue, revision: walletRevision } = walletState;

  useEffect(() => {
    setWalletState((prev) => {
      if (prev.value === normalizedInitial) return prev;
      return { value: normalizedInitial, revision: prev.revision + 1 };
    });
  }, [normalizedInitial]);

  useEffect(() => {
    if (!walletValue) {
      setIsValid(false);
      return;
    }

    setIsValid(validateObyteAddress(walletValue));
  }, [walletValue, walletRevision]);

  const changeWallet = useCallback((nextWallet: string | null) => {
    setWalletState((prev) => ({ value: normalizeWallet(nextWallet), revision: prev.revision + 1 }));
  }, []);

  return { wallet: walletValue, isValid, changeWallet };
};

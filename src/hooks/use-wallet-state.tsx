import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { isValidAddress as validateObyteAddress } from "@/lib/isValidAddress";

type WalletState = {
  value: string | null;
  revision: number;
};

const normalizeWallet = (value: string | null): string | null => {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
};

/**
 * Manages wallet state and triggers asynchronous validation of Obyte addresses.
 * Exposes the current wallet value, validation result, and loading indicator.
 */
export const useWalletState = (initialWallet: string | null) => {
  const normalizedInitial = useMemo(() => normalizeWallet(initialWallet), [initialWallet]);
  const [walletState, setWalletState] = useState<WalletState>({ value: normalizedInitial, revision: 0 });
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const lastValidationId = useRef(0);
  const { value: walletValue, revision: walletRevision } = walletState;

  useEffect(() => {
    setWalletState((prev) => {
      if (prev.value === normalizedInitial) return prev;
      return { value: normalizedInitial, revision: prev.revision + 1 };
    });
  }, [normalizedInitial]);

  useEffect(() => {
    if (!walletValue) {
      lastValidationId.current += 1; // Cancel any in-flight validations
      setIsValid(false);
      setIsChecking(false);
      return;
    }

    const validationId = ++lastValidationId.current;
    let cancelled = false;

    setIsChecking(true);
    setIsValid(false);

    (async () => {
      let ok = false;
      try {
        ok = await validateObyteAddress(walletValue);
      } catch {
        ok = false;
      }

      const isLatest = lastValidationId.current === validationId;
      if (cancelled || !isLatest) return;

      setIsValid(ok);
      setIsChecking(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [walletValue, walletRevision]);

  const changeWallet = useCallback((nextWallet: string | null) => {
    setWalletState((prev) => ({ value: normalizeWallet(nextWallet), revision: prev.revision + 1 }));
  }, []);

  return { wallet: walletValue, isValid, isChecking, changeWallet };
};

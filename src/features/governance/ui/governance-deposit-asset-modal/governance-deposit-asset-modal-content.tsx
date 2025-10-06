import { FC, RefObject, useEffect, useState } from "react";

import { Input } from "@/components/ui/input";

interface GovernanceDepositAssetModalContentProps {
  defaultValue?: string;
  onChange?: (value: string) => void;
  actionBtnRef: RefObject<HTMLButtonElement | null>;
}

export const GovernanceDepositAssetModalContent: FC<GovernanceDepositAssetModalContentProps> = ({
  onChange,
  defaultValue,
  actionBtnRef
}) => {
  const [address, setAddress] = useState(defaultValue || "");

  useEffect(() => {
    if (onChange) {
      onChange(address);
    }
  }, [address, onChange]);


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      actionBtnRef.current?.click();
    }
  }

  return <Input
    defaultValue={address}
    onKeyDown={handleKeyDown}
    onChange={(e) => setAddress(e.target.value)}
  />
}
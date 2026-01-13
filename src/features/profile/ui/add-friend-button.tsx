"use client"

import { useCallback } from "react";

import { QRButton } from "@/components/ui/qr-button";
import { sendGAEvent } from "@next/third-parties/google";

type AddFriendButtonProps = {
  href: string;
  disabled: boolean;
  walletAdded: boolean;
};

export function AddFriendButton({ href, disabled, walletAdded }: AddFriendButtonProps) {
  const handleClick = useCallback(() => {
    if (disabled) return;

    sendGAEvent("event", "add_friend", {
      wallet_added: walletAdded,
      place: "profile_info",
    });
  }, [walletAdded, disabled]);

  return (
    <QRButton
      href={href}
      disabled={disabled}
      variant="link"
      onClick={handleClick}
    >
      Add friend
    </QRButton>
  );
}

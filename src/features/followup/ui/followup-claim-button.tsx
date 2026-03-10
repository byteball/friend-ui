"use client";

import { FC, useEffect, useState } from "react";
import { useGetCookie } from "cookies-next/client";

import { QRButton } from "@/components/ui/qr-button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { generateLink } from "@/lib/generate-link";
import { appConfig } from "@/app-config";
import { BOUNCE_FEES, WALLET_COOKIE_NAME } from "@/constants";

interface FollowupClaimButtonProps {
  addr1: string;
  addr2: string;
  days: number;
  disabled?: boolean;
}

export const FollowupClaimButton: FC<FollowupClaimButtonProps> = ({ addr1, addr2, days, disabled: externalDisabled = false }) => {
  const [mounted, setMounted] = useState(false);
  const getCookie = useGetCookie();
  const walletAddress = getCookie(WALLET_COOKIE_NAME);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isParticipant = walletAddress === addr1 || walletAddress === addr2;
  const friendAddress = walletAddress === addr1 ? addr2 : addr1;

  const href = walletAddress && isParticipant ? generateLink({
    aa: appConfig.AA_ADDRESS,
    amount: BOUNCE_FEES,
    data: { followup: 1, friend: friendAddress, days },
    from_address: walletAddress,
  }) : "";

  const isDisabled = !mounted || !walletAddress || !isParticipant || externalDisabled;

  const tooltipMessage = !mounted ? null
    : !walletAddress ? "Add your wallet address to claim rewards"
    : !isParticipant ? "Your wallet is not part of this friendship"
    : externalDisabled ? "Both friends must have their funds locked for at least 1 year"
    : null;

  const button = (
    <QRButton href={href} disabled={isDisabled} variant="default" size="lg">
      Claim
    </QRButton>
  );

  if (!tooltipMessage) return button;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>{button}</div>
        </TooltipTrigger>
        <TooltipContent>{tooltipMessage}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

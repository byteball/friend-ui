"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import * as React from "react";

type Props = {
  tgUserId?: string | null
  discordUserId?: string | null
  fallbackText?: string
  className?: string
}

export function ChainedAvatar({
  tgUserId,
  discordUserId,
  fallbackText = "CN",
  className = "w-20 h-20",
}: Props) {
  const tgSrc = tgUserId ? `/api/avatar/tg?userId=${tgUserId}` : null
  const dcSrc = discordUserId ? `/api/avatar/discord?userId=${discordUserId}` : null

  const [step, setStep] = React.useState<"tg" | "dc" | "text">(() => {
    if (tgSrc) return "tg"
    if (dcSrc) return "dc"
    return "text"
  })

  React.useEffect(() => {
    if (tgSrc) setStep("tg")
    else if (dcSrc) setStep("dc")
    else setStep("text")
  }, [tgSrc, dcSrc])

  const src = step === "tg" ? tgSrc : step === "dc" ? dcSrc : null

  const handleLoadingStatusChange = React.useCallback(
    (status: "idle" | "loading" | "loaded" | "error") => {
      if (status === "error") {
        if (step === "tg") setStep(dcSrc ? "dc" : "text")
        else if (step === "dc") setStep("text")
      }
    },
    [step, dcSrc]
  )

  return (
    <Avatar className={className}>
      <AvatarImage
        key={src ?? "no-src"}
        src={src ?? undefined}
        onLoadingStatusChange={handleLoadingStatusChange}
      />
      <AvatarFallback className="bg-muted text-foreground">
        {fallbackText}
      </AvatarFallback>
    </Avatar>
  )
}
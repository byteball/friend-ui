"use client"

import cn from "classnames";
import { QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { forwardRef } from "react";

import { Button, ButtonProps } from "./button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

interface IQRButtonProps extends ButtonProps {
  href: string;
}

const QRButton = forwardRef<HTMLButtonElement, IQRButtonProps>(
  ({ children, href, disabled = false, ...props }, ref) => (
    <div className="flex">
      <Dialog>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button
                  {...props}
                  tabIndex={-1}
                  disabled={disabled}
                  className={cn("rounded-tr-none rounded-br-none", props.variant === "link" ? "px-0 py-0  link-style h-auto" : "px-3")}
                >
                  <QrCode className="w-4 h-4" />
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent className="max-w-[250px]">
              <p>Send the transaction from your mobile phone</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader className="w-full mb-4 text-center">
            <DialogTitle className="mx-auto leading-snug text-center max-w-[280px]">
              Scan this QR code <br /> with your mobile phone
            </DialogTitle>
          </DialogHeader>
          <div className="mx-auto">
            <a href={href}>
              <QRCodeSVG size={200} value={href} />
            </a>
          </div>

          <div className="text-xs text-foreground max-w-[220px] mx-auto text-center">
            Install Obyte wallet for{" "}
            <a
              rel="noopener"
              target="_blank"
              href="https://itunes.apple.com/us/app/byteball/id1147137332?ls=1&mt=8"
            >
              iOS
            </a>{" "}
            or{" "}
            <a
              rel="noopener"
              target="_blank"
              href="https://play.google.com/store/apps/details?id=org.byteball.wallet"
            >
              Android
            </a>{" "}
            if you don&apos;t have one yet
          </div>
        </DialogContent>
      </Dialog>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              {...props}
              disabled
              asChild
              ref={ref}
              className={cn("rounded-tl-none rounded-bl-none cursor-pointer",
                { "pointer-events-none opacity-50 select-none": disabled },
                props.variant === "link" ? "p-0 h-auto link-style" : "pl-2",
              )}
            >
              <a href={href} tabIndex={-1}>
                {children}
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-[250px]">
            <p>This will open your Obyte wallet installed on this computer and send the transaction</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
);

QRButton.displayName = "QRButton";

export {
  QRButton
};

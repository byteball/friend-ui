import React from "react";

import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

function DescriptionList({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="description-list"
      className={cn("grid gap-1.5", className)}
      {...props}
    />
  );
}

function DescriptionTerm({ className, tooltipText, ...props }: React.ComponentProps<"div"> & { tooltipText?: React.ReactNode }) {
  return (
    <div className={cn({ "flex items-center gap-1": Boolean(tooltipText) })}>
      <div
        data-slot="description-term"
        className={cn(
          "text-sm leading-none font-medium tracking-tight",
          className,
        )}
        {...props}
      />

      {tooltipText ? <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Info className="w-4 h-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>{tooltipText}</TooltipContent>
        </Tooltip>
      </TooltipProvider> : null}
    </div>
  );
}

function DescriptionDetail({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="description-detail"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function DescriptionGroup({
  className,
  horizontal = false,
  ...props
}: React.ComponentProps<"div"> & { horizontal?: boolean }) {
  return (
    <div
      data-slot="description-group"
      className={cn("grid gap-1.5", className, horizontal ? "flex items-center" : "")}
      {...props}
    />
  );
}

export {
  DescriptionDetail,
  DescriptionGroup, DescriptionList,
  DescriptionTerm
};

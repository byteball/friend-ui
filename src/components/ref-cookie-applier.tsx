"use client";

import { applyRef } from "@/app/(user)/[address]/_apply-ref";
import "client-only";
import { useEffect } from "react";

interface RefCookieApplierProps {
  refAddress: string;
}

export const RefCookieApplier = ({ refAddress }: RefCookieApplierProps) => {

  useEffect(() => {
    applyRef(refAddress);
  }, [refAddress]);

  return null;
}
"use client";

import { saveWalletAction } from "@/actions/save-obyte-wallet";
import { FC, useEffect, useRef, useState } from "react";

import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";

interface AddWalletModalProps {
  triggerClassName?: string;
  walletAddress?: string;
}

export const AddWalletModal: FC<AddWalletModalProps> = ({ triggerClassName = "", walletAddress }) => {
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [inputValue, setInputValue] = useState(walletAddress || "");
  const [obyteUtils, setObyteUtils] = useState<{ isValidAddress: (address: string) => boolean } | null>(null);

  useEffect(() => {
    import("obyte").then((obyte) => {
      setObyteUtils(obyte.default.utils);
    });
  }, []);

  const isChanged = walletAddress !== inputValue;
  const isValid = inputValue.trim() !== "" && obyteUtils && obyteUtils.isValidAddress(inputValue);

  const restoreInputValue = () => {
    setTimeout(() => {
      setInputValue(walletAddress || "");
    }, 500);
  }

  return (<Dialog onOpenChange={(open) => {
    if (!open) restoreInputValue();
  }}>
    <DialogTrigger asChild>
      <Button ref={closeButtonRef} variant="default" className={triggerClassName}>
        {walletAddress ? `${walletAddress.slice(0, 3)}...${walletAddress.slice(-3)}` : "Add wallet"}
      </Button>
    </DialogTrigger>

    <DialogContent className="sm:max-w-[425px]">
      <form action={saveWalletAction} className="grid gap-4">
        <DialogHeader>
          <DialogTitle>Add wallet</DialogTitle>
          <DialogDescription>
            <a href="https://obyte.org/#download" className="text-blue-700">Install Obyte wallet</a> if you don&apos;t have one yet, and copy/paste your address here.
          </DialogDescription>
        </DialogHeader>

        <Input
          name="wallet"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value || "")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submitButtonRef?.current?.click();

              if (isValid) closeButtonRef?.current?.click();
            }
          }}
        />

        <DialogFooter>
          <Button disabled={!isChanged || !isValid} ref={submitButtonRef} type="submit">Save changes</Button>
        </DialogFooter>
      </form>
    </DialogContent>

  </Dialog>)
}

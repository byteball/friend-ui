"use client";

import cn from "classnames";
import { Loader } from "lucide-react";
import { FC, useState } from "react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { QRButton } from "@/components/ui/qr-button";

import { appConfig } from "@/appConfig";
import { useCheckPoolAddress } from "@/hooks/use-check-pool-address";
import { useToken } from "@/hooks/use-token";
import { generateLink } from "@/lib/generate-link";
import { getExplorerUrl } from "@/lib/getExplorerUrl";

interface AddNewDepositAssetModalProps {
  children: React.ReactNode;
  governanceAa: string;
}

export const AddNewDepositAssetModal: FC<AddNewDepositAssetModalProps> = ({ children, governanceAa }) => {
  const [input, setInput] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  const { symbol, asset, loading, error } = useToken(input.length === 44 ? { asset: input } : { symbol: input });

  const { loading: poolLoading, error: poolError, isValid } = useCheckPoolAddress(address, asset);

  const url = asset && !error ? generateLink({
    amount: 10000,
    aa: governanceAa,
    data: {
      deposit_asset: asset,
      name: "deposit_asset",
      value: address
    }
  }) : "";

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value.trim());
  }

  return <Dialog>
    <DialogTrigger asChild>
      {children}
    </DialogTrigger>

    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Add new deposit asset</DialogTitle>
        <DialogDescription>Add a new token that can be accepted for deposits</DialogDescription>
      </DialogHeader>

      <FieldGroup>
        <FieldSet>
          <Field>
            <FieldLabel>Token</FieldLabel>

            <Input
              disabled={poolLoading}
              value={input}
              onChange={handleChangeInput}
              placeholder="Token asset or symbol"
            />

            {!error && symbol && asset ? <FieldDescription>
              Symbol: <a target="_blank" className="text-blue-700" href={`https://${appConfig.TESTNET ? "testnet." : ""}tokens.ooo/${symbol}`}>{symbol}</a><br />
              Asset: <a target="_blank" className="text-blue-700" href={getExplorerUrl(asset, "asset")}>{asset}</a>
            </FieldDescription> : null}

            {input ? <FieldError className={cn({ "text-muted-foreground": loading })}>
              {loading ? 'Loading...' : error ? error : null}
            </FieldError> : null}
          </Field>

          <Field>
            <FieldLabel>Price AA (Oswap AA to determine the asset&apos;s price in GBYTE)</FieldLabel>
            <Input
              placeholder="Price AA"
              value={address}
              disabled={poolLoading || loading}
              onChange={(e) => setAddress(e.target.value.trim().toUpperCase())}
            />
            {/* <FieldDescription>Use oswap pool address</FieldDescription> */}

            {address ? (poolLoading ? <FieldError>Checking...</FieldError> : poolError ? <FieldError>{poolError}</FieldError> : null) : null}
          </Field>
          {/* Add {symbol} */}
          <QRButton
            disabled={!address || !asset || loading || poolLoading || asset === "base" || !isValid}
            href={url}
          >
            {loading || poolLoading ? <><Loader className="animate-spin" /> checking...</> : `Add ${symbol && !error ? symbol : 'asset'}`}
          </QRButton>
        </FieldSet>
      </FieldGroup>
    </DialogContent>
  </Dialog>
}
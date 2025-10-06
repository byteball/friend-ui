"use client";

import { Loader } from "lucide-react";
import { FC, useState } from "react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { QRButton } from "@/components/ui/qr-button";

import { useCheckPoolAddress } from "@/hooks/use-check-pool-address";
import { useSymbol } from "@/hooks/use-symbol";


interface AddNewDepositAssetModalProps {
  children: React.ReactNode;
}

export const AddNewDepositAssetModal: FC<AddNewDepositAssetModalProps> = ({ children }) => {
  const [asset, setAsset] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  const { symbol, loading, error } = useSymbol(asset, { allowNull: true });
  const { loading: poolLoading, error: poolError, isValid } = useCheckPoolAddress(address, asset);

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
            <FieldLabel>Asset</FieldLabel>

            <Input
              disabled={loading || poolLoading}
              value={asset}
              onChange={(e) => setAsset(e.target.value.trim())}
              placeholder="Token address"
            />

            {!error && symbol ? <FieldDescription>Symbol: {symbol}</FieldDescription> : null}

            {!symbol && asset ? <FieldError className="text-yellow-600">
              {loading ? 'Loading...' : error ? error : 'This asset is not registered in the token registry'}
            </FieldError> : null}
          </Field>

          <Field>
            <FieldLabel>Price AA address</FieldLabel>
            <Input
              placeholder="Price AA address"
              value={address}
              disabled={poolLoading || loading}
              onChange={(e) => setAddress(e.target.value.trim().toUpperCase())}
            />
            {/* <FieldDescription>Use oswap pool address</FieldDescription> */}

            {address ? (poolLoading ? <FieldError>Checking...</FieldError> : poolError ? <FieldError>{poolError}</FieldError> : null) : null}
          </Field>
          {/* Add {symbol} */}
          <QRButton disabled={!address || !asset || loading || poolLoading || asset === "base" || !isValid} href="#">
            {loading || poolLoading ? <><Loader className="animate-spin" /> checking...</> : `Add ${symbol ?? 'asset'}`}
          </QRButton>
        </FieldSet>
      </FieldGroup>
    </DialogContent>
  </Dialog>
}
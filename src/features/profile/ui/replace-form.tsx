import { ChevronDownIcon } from "lucide-react";
import { ChangeEvent, FC, useId, useRef, useState } from "react";
import { NumericFormat } from "react-number-format";

import { useData } from "@/app/context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { QRButton } from "@/components/ui/qr-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useExchangeRate } from "@/hooks/use-exchange-rate";
import { generateLink } from "@/lib/generate-link";
import { getExchangePairs } from "@/lib/get-exchange-pairs";
import { toLocalString } from "@/lib/to-local-string";

import { appConfig } from "@/app-config";

interface ReplaceFormProps {
  address: string;
}

export const ReplaceForm: FC<ReplaceFormProps> = ({ address }) => {
  const { tokens, state } = useData();

  const refBtn = useRef<HTMLButtonElement>(null);

  const input1Key = useId();
  const input2Key = useId();

  const [inputAsset, setInputAsset] = useState<string>(state.constants.asset);
  const [outputAsset, setOutputAsset] = useState<null | string>("base");

  const [inputAmount, setInputAmount] = useState<number | null>(0.01);
  const [outputAmount, setOutputAmount] = useState<number | null>(null);

  const userData = state[`user_${address}`] as IUserData | null;
  const balances = userData?.balances || {};

  const inputTokenMeta = tokens[inputAsset];

  const allAllowedTokens = Object.values(tokens);
  const allPairs = getExchangePairs(allAllowedTokens, state.constants.asset);
  const allPairingTokens = allPairs[inputAsset] || [];
  const allInputTokens = Object.keys(allPairs).map(asset => tokens[asset]) || [];

  const outputTokenAsset = outputAsset && (allPairingTokens.find(p => p.asset === outputAsset)) ? outputAsset : allPairingTokens[0]?.asset;

  const outputTokenMeta = tokens[outputTokenAsset]
  const userOutputBalance = outputTokenMeta ? (balances[outputTokenMeta.asset] || 0) : 0;

  const { data: rate = 0, isLoading, error, isValidating } = useExchangeRate(inputAsset, outputTokenMeta?.asset);

  let depositAsset: string | undefined = undefined;

  if (inputTokenMeta.asset !== state.constants.asset && inputTokenMeta.asset !== "base") {
    depositAsset = inputTokenMeta.asset;
  } else if (outputTokenMeta.asset !== state.constants.asset && outputTokenMeta.asset !== "base") {
    depositAsset = outputTokenMeta.asset;
  }

  const url = generateLink({
    aa: appConfig.AA_ADDRESS,
    amount: inputAmount ? inputAmount * 10 ** (inputTokenMeta?.decimals ?? 0) : 0,
    asset: inputAsset,
    data: {
      replace: "1",
      deposit_asset: depositAsset
    }
  });


  const handleInputAmountChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setInputAmount(ev.target.value ? Number(ev.target.value) : null);
    setOutputAmount(null);
  };

  const handleOutputAmountChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setOutputAmount(ev.target.value ? Number(ev.target.value) : null);
    setInputAmount(null);
  };

  const inputAmount2 = inputAmount || (outputAmount || 0) / rate
  const outputAmount2 = outputAmount || rate * (inputAmount || 0)
  const outputAmountInSmall = outputAmount2 * 10 ** (outputTokenMeta?.decimals ?? 0);

  const handleKeyDown = (ev: React.KeyboardEvent) => {
    if (ev.key === "Enter") {
      ev.preventDefault();
      refBtn.current?.click();
    }
  }

  return <FieldGroup>
    <Field>
      <Label htmlFor={input2Key}>Existing locked asset</Label>
      <InputGroup>
        <NumericFormat
          customInput={InputGroupInput}
          onChange={handleOutputAmountChange}
          onKeyDown={handleKeyDown}
          value={outputAmount2 || ""}
          decimalScale={outputTokenMeta?.decimals ?? 0}
          id={input2Key}
          disabled={!!error || isLoading || isValidating}
          placeholder="1000"
          required
        />

        <InputGroupAddon align="inline-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <InputGroupButton variant="ghost" className="!pr-1.5 text-xs">
                {outputTokenMeta.symbol} <ChevronDownIcon className="ml-1 size-4" />
              </InputGroupButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="[--radius:0.95rem]">
              {allPairingTokens.map(pair => (
                <DropdownMenuItem disabled={isLoading || isValidating || !!error} key={pair.asset}
                  onSelect={() => setOutputAsset(pair.asset)}
                >
                  {pair.symbol}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </InputGroupAddon>
      </InputGroup>
    </Field>

    <Field>
      <Label htmlFor={input1Key}>Replace with</Label>
      <InputGroup>
        <NumericFormat
          customInput={InputGroupInput}
          id={input1Key}
          placeholder="1000"
          onChange={handleInputAmountChange}
          onKeyDown={handleKeyDown}
          value={inputAmount2 || ""}
          disabled={!!error || isLoading || isValidating}
          decimalScale={inputTokenMeta.decimals}
          required
        />

        <InputGroupAddon align="inline-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <InputGroupButton variant="ghost" className="!pr-1.5 text-xs">
                {inputTokenMeta.symbol} <ChevronDownIcon className="ml-1 size-4" />
              </InputGroupButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="[--radius:0.95rem]">
              {allInputTokens.map(pair => (
                <DropdownMenuItem disabled={isLoading || isValidating || !!error} key={pair.asset} onSelect={() => setInputAsset(pair.asset)}>
                  {pair.symbol}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </InputGroupAddon>
      </InputGroup>
    </Field>

    <Field>
      {isLoading || isValidating
        ? <Skeleton className="w-full h-6" />
        : <div className="text-sm">
          <span>Rate</span>: 1 {inputTokenMeta.symbol} = {toLocalString(rate)} {outputTokenMeta.symbol}
        </div>
      }
    </Field>
    <Field>
      {userOutputBalance < outputAmountInSmall ? <FieldError>Not enough {outputTokenMeta?.symbol} locked</FieldError> : null}

      <QRButton
        ref={refBtn}
        href={url}
        className="w-full"
        disabled={!!error || isLoading || isValidating || userOutputBalance < outputAmountInSmall || userOutputBalance === 0 || inputAmount2 === 0 || outputAmount2 === 0}>
        {isLoading || isValidating ? <Spinner /> : null}Replace
      </QRButton>
    </Field>
  </FieldGroup>
}
import { ChevronDownIcon } from "lucide-react";
import { ChangeEvent, FC, useEffect, useId, useMemo, useRef, useState } from "react";
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

  const [inited, setInited] = useState(false);

  const refBtn = useRef<HTMLButtonElement>(null);
  const userData = state[`user_${address}`] as IUserData | null;
  const balances = useMemo(() => userData?.balances || {}, [userData]);

  const input1Key = useId();
  const input2Key = useId();

  const [inputAsset] = useState<string>(state.constants.asset);
  const [outputAsset, setOutputAsset] = useState<null | string>("base");

  const [inputAmount, setInputAmount] = useState<number | null>(null);
  const [outputAmount, setOutputAmount] = useState<number | null>(null);

  const inputTokenMeta = tokens[inputAsset];

  useEffect(() => {
    if (inited) return; // already inited

    if (balances.base && balances.base > 1 / 1e9) {
      setOutputAmount(balances.base / 10 ** 9);
      setInputAmount(null);
      setOutputAsset("base");
    } else {
      const activeBalance = Object.entries(balances).find(([asset, balance]) => balance > 0 && asset in tokens);

      if (activeBalance) {
        const asset = activeBalance[0];
        const decimals = tokens[asset]?.decimals || 0;

        setOutputAsset(asset);
        setOutputAmount(balances[asset] / 10 ** decimals);

        setInputAmount(null);
      } else {
        setOutputAsset("base");

        setOutputAmount(null);
        setInputAmount(null);
      }
    }

    setInited(true);
  }, [balances, outputAsset, tokens, inited]);

  const allAllowedTokens = Object.values(tokens);
  const allPairs = getExchangePairs(allAllowedTokens, state.constants.asset);
  const allPairingTokens = allPairs[inputAsset] || [];

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

  const reducer = outputAsset === "base" ? appConfig.initialRewardsVariables.bytes_reducer : appConfig.initialRewardsVariables.deposit_asset_reducer;

  const effectiveBalanceDiff = inputAmount2 * (1 - reducer);

  return <FieldGroup>
    <Field>
      <Label htmlFor={input2Key}>Existing locked asset</Label>
      <InputGroup>
        <NumericFormat
          customInput={InputGroupInput}
          onChange={handleOutputAmountChange}
          onKeyDown={handleKeyDown}
          allowNegative={false}
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
                  onSelect={() => {
                    setOutputAsset(pair.asset);
                    setOutputAmount((balances[pair.asset] / (10 ** tokens[pair.asset].decimals)) || 0);
                    setInputAmount(null);
                  }}
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
          allowNegative={false}
          onChange={handleInputAmountChange}
          onKeyDown={handleKeyDown}
          value={inputAmount2 || ""}
          disabled={!!error || isLoading || isValidating}
          decimalScale={inputTokenMeta.decimals}
          required
        />

        <InputGroupAddon align="inline-end">
          <span className="text-xs">
            {inputTokenMeta.symbol}
          </span>
        </InputGroupAddon>
      </InputGroup>
    </Field>

    <Field>
      {isLoading || isValidating
        ? <Skeleton className="w-full h-6" />
        : <div className="text-sm space-y-2">

          <div>
            <span>Rate</span>: 1 {inputTokenMeta.symbol} = {toLocalString(rate)} {outputTokenMeta.symbol}
          </div>

          <div>Total effective balance will increase by {toLocalString(effectiveBalanceDiff)} {inputTokenMeta.symbol} ({reducer} reducer is applied to {outputTokenMeta.symbol} balances)</div>
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
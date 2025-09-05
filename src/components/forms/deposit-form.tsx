"use client";

import { addDays, format } from "date-fns";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { NumberFormatValues, NumericFormat } from 'react-number-format';

import { WALLET_COOKIE_NAME } from "@/actions/constants";
import { appConfig } from "@/appConfig";
import { formatDays } from "@/lib/formatDays";
import { generateLink } from "@/lib/generateLink";
import { getCookie } from "@/lib/getCookie.client";

import { useData } from "@/app/context";
import { toLocalString } from "@/lib/toLocalString";
import { Input } from "../ui/input";
import { QRButton } from "../ui/qr-button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";
import { Slider } from "../ui/slider";

const MAX_LOCKED_TERM_DAYS = 365 * 4;
const now = new Date();

interface DepositFormProps {
  tokens: (TokenMeta | undefined)[];
}

const gbyteTokenMeta: TokenMeta = {
  asset: "base",
  symbol: "GBYTE",
  decimals: 9,
};

export const DepositForm: FC<DepositFormProps> = ({ tokens }) => {
  const [currency, setCurrency] = useState<TokenMeta>(gbyteTokenMeta);
  const [walletAddress, setWalletAddress] = useState<string | undefined>();
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Read cookie client-side only to avoid hydration mismatch
    const walletFromCookie = getCookie(WALLET_COOKIE_NAME);
    if (walletFromCookie) setWalletAddress(walletFromCookie);
  }, []);

  const [amount, setAmount] = useState<string>("0.1");
  const [term, setTerm] = useState<number>(appConfig.MIN_LOCKED_TERM_DAYS);
  const data = useData();

  const state = data?.state ?? {};
  const frdAsset = state?.constants?.asset;
  const frdMeta: TokenMeta | undefined = frdAsset ? data?.symbols?.[frdAsset] : undefined;

  const until = addDays(now, term);

  const handleTokenChange = useCallback((asset: string) => {
    const token = tokens.find((token) => token?.asset === asset);
    if (!token) throw new Error("Unknown token");

    setCurrency(token);
  }, [tokens]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Enter") {
      btnRef.current?.click();
    }
  }, [btnRef]);

  const url = generateLink({
    aa: appConfig.AA_ADDRESS, amount: Math.ceil(Number(amount) * 10 ** currency?.decimals), from_address: walletAddress, data: {
      deposit: 1,
      deposit_asset: currency?.asset === 'base' ? undefined : currency,
      term,
    }
  })

  return <div className="grid gap-4">
    <h2 className="text-3xl font-bold">New deposit</h2>

    <div className="grid gap-4 text-muted-foreground">
      <div>Before depositing, you must be attested on <a className="text-blue-700" href={appConfig.TELEGRAM_BOT_URL}>telegram</a> and/or <a className="text-blue-700" href={appConfig.DISCORD_BOT_URL}>discord</a>. This is important to notify you about follow-up rewards in the future.</div>

      <div>If you deposit less than {toLocalString(appConfig.MIN_BALANCE / 10 ** (frdMeta?.decimals ?? 0))} FRD (or equivalent), you must be <a className="text-blue-700" href="#">real-name attested</a>. This measure helps prevent multiple accounts by the same user.</div>
    </div>

    <div>
      <div className="flex flex-col gap-4">
        <div className="flex gap-4 items-end">
          <div className="w-full">
            <label htmlFor="amount" className="text-muted-foreground pb-1">Amount</label>

            <NumericFormat
              value={amount}
              id="amount"
              decimalScale={currency.decimals}
              maxLength={currency.decimals + 6}
              security="auto"
              allowNegative={false}
              allowLeadingZeros={false}
              onKeyDown={handleKeyDown}
              // pass custom input
              customInput={Input}
              // returns parsed values; values.value is numeric string like "0.5"
              onValueChange={(values: NumberFormatValues) => {
                let value = values.value ?? '';
                if (value.startsWith(".")) value = "0" + value;
                setAmount(value);
              }}
              inputMode="decimal"
            />
          </div>

          <Select defaultValue={currency.asset} onValueChange={handleTokenChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a token" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Currency</SelectLabel>
                {tokens.filter((token): token is TokenMeta => token !== undefined).map((token) => (
                  <SelectItem key={token.asset} value={token.asset}>
                    {token.symbol}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex w-full flex-col gap-4">
          <div>
            <label htmlFor="term" className="text-muted-foreground">Locked term</label>

            <Slider
              value={[term]}
              id="term"
              className="mt-2"
              onValueChange={(value) => setTerm(value[0] as number)}
              step={30}
              min={appConfig.MIN_LOCKED_TERM_DAYS}
              max={MAX_LOCKED_TERM_DAYS}
            />
          </div>

          <div>Locking term: {formatDays(term)} — until {format(until, "MMMM do, yyyy")}
          </div>
        </div>

        <QRButton ref={btnRef} disabled={!amount || Number(amount) <= 0} href={url}>
          Send {!Number(amount) ? '' : toLocalString(amount)} {currency?.symbol.toUpperCase()}
        </QRButton>
      </div>
    </div>

  </div>
}
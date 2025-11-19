"use client";

import { useGetCookie } from "cookies-next";
import { addDays, differenceInDays, parse } from "date-fns";
import { formatInTimeZone, } from 'date-fns-tz';
import { FC, useCallback, useRef, useState } from "react";
import { NumberFormatValues, NumericFormat } from 'react-number-format';

import { appConfig } from "@/app-config";
import { GBYTE_TOKEN_META, REF_COOKIE_NAME, WALLET_COOKIE_NAME } from "@/constants";
import { formatDays } from "@/lib/format-days";
import { generateLink } from "@/lib/generate-link";

import { useData } from "@/app/context";
import { toLocalString } from "@/lib/to-local-string";

import { Input } from "@/components/ui/input";
import { QRButton } from "@/components/ui/qr-button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const MAX_LOCKED_TERM_DAYS = 365 * 5;
const now = formatInTimeZone(new Date(), "UTC", "yyyy-MM-dd HH:mm:ssXXX");

interface DepositFormProps { }

export const DepositForm: FC<DepositFormProps> = () => {
  const [currency, setCurrency] = useState<TokenMeta>(GBYTE_TOKEN_META);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [amount, setAmount] = useState<string>("0.1");
  const [term, setTerm] = useState<number>(0);
  const data = useData();
  const getCookie = useGetCookie();

  const walletAddress = getCookie(WALLET_COOKIE_NAME) as string | undefined;
  const referralAddress = getCookie(REF_COOKIE_NAME) as string | undefined;

  const state = data?.state ?? {};
  const agentParams = data?.params ?? appConfig.initialParamsVariables;

  const frdAsset = state?.constants?.asset;
  const frdMeta: TokenMeta | undefined = frdAsset ? data?.tokens?.[frdAsset] : undefined;
  const userData = (walletAddress ? state[`user_${walletAddress}`] : undefined) as IUserData | undefined;

  const unlockDate = userData?.unlock_date
    ? formatInTimeZone(
      parse(
        userData.unlock_date,
        "yyyy-MM-dd",
        new Date()
      ),
      "UTC",
      "yyyy-MM-dd"
    )
    : undefined;

  const daysUntilUnlock = differenceInDays(unlockDate || now, now);

  let minTerm = appConfig.MIN_LOCKED_TERM_DAYS;

  if (daysUntilUnlock >= appConfig.MIN_LOCKED_TERM_DAYS) {
    minTerm = daysUntilUnlock + 2; // TODO: why +2? maybe it's not UTC?
  }

  const selectedTerm = Math.max(term, minTerm);

  const until = addDays(now, selectedTerm);

  const handleTokenChange = useCallback((asset: string) => {
    const token = data?.tokens?.[asset];
    if (!token) throw new Error("Unknown token");

    setCurrency(token);
  }, [data?.tokens]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Enter") {
      btnRef.current?.click();
    }
  }, [btnRef]);

  const url = generateLink({
    aa: appConfig.AA_ADDRESS,
    amount: Math.ceil(Number(amount) * 10 ** currency?.decimals),
    from_address: walletAddress,
    data: {
      deposit: 1,
      deposit_asset: currency?.asset === 'base' ? undefined : currency?.asset,
      term: selectedTerm,
      ref: (!userData || !walletAddress) ? referralAddress : undefined
    }
  })

  return <div className="grid gap-4">
    <h2 className="text-3xl font-bold">New deposit</h2>

    <div className="grid gap-4 text-muted-foreground">
      <div>Before depositing, you must be attested on <a className="text-blue-700" href={appConfig.TELEGRAM_BOT_URL}>telegram</a> and/or <a className="text-blue-700" href={appConfig.DISCORD_BOT_URL}>discord</a>. This is important to notify you about follow-up rewards in the future.</div>

      <div>If you deposit less than {toLocalString(agentParams.min_balance_instead_of_real_name / 10 ** (frdMeta?.decimals ?? 0))} <small>{frdMeta?.symbol}</small> (or equivalent), you must be <a className="text-blue-700" href="#">real-name attested</a>. This measure helps prevent multiple accounts by the same user.</div>
    </div>

    <div>
      <div className="flex flex-col gap-4">
        <div className="flex items-end gap-4">
          <div className="w-full">
            <label htmlFor="amount" className="pb-1 text-muted-foreground">Amount</label>

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
                {Object.entries(data?.tokens ?? {}).map(([_tokenKey, token]) => (
                  <SelectItem key={token.asset} value={token.asset}>
                    {token.symbol}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col w-full gap-4">
          <div>
            <label htmlFor="term" className="text-muted-foreground">Locked term</label>

            <Slider
              value={[selectedTerm]}
              id="term"
              className="mt-2"
              onValueChange={(value) => setTerm((value[0] <= minTerm ? minTerm : value[0]) as number)}
              step={30}
              min={0}
              max={MAX_LOCKED_TERM_DAYS}
            />
          </div>
          <div suppressHydrationWarning>Locking term: {formatDays(selectedTerm)} — until {formatInTimeZone(until, "UTC", "MMMM do, yyyy")}
          </div>
        </div>

        <QRButton ref={btnRef} disabled={!amount || Number(amount) <= 0} href={url}>
          Send {!Number(amount) ? '' : toLocalString(amount)} {currency?.symbol.toUpperCase()}
        </QRButton>
      </div>
    </div>
  </div>
}
"use client";

import { useGetCookie } from "cookies-next";
import { addDays, differenceInDays, parse } from "date-fns";
import { formatInTimeZone, } from 'date-fns-tz';
import { Activity, FC, useCallback, useRef, useState } from "react";
import { NumberFormatValues, NumericFormat } from 'react-number-format';

import { appConfig } from "@/app-config";
import { GBYTE_TOKEN_META, REF_COOKIE_NAME, WALLET_COOKIE_NAME } from "@/constants";
import { formatDays } from "@/lib/format-days";
import { generateLink } from "@/lib/generate-link";

import { useData } from "@/app/context";
import { toLocalString } from "@/lib/to-local-string";

import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { QRButton } from "@/components/ui/qr-button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { useExchangeRate } from "@/hooks/use-exchange-rate";
import Link from "next/link";

const MAX_LOCKED_TERM_DAYS = 365 * 5;
const now = formatInTimeZone(new Date(), "UTC", "yyyy-MM-dd HH:mm:ssXXX");

interface DepositFormProps { }

export const DepositForm: FC<DepositFormProps> = () => {
  const [currency, setCurrency] = useState<TokenMeta>(GBYTE_TOKEN_META);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [amount, setAmount] = useState<string>("10");
  const [term, setTerm] = useState<number>(0);
  const data = useData();
  const frdToken = data.getFrdToken();

  const getCookie = useGetCookie();
  const { data: rate, isLoading: isRateLoading } = useExchangeRate(currency.asset, data.state.constants.asset);

  const walletAddress = getCookie(WALLET_COOKIE_NAME) as string | undefined;
  const referralAddress = getCookie(REF_COOKIE_NAME) as string | undefined;

  const state = data?.state ?? {};
  const agentParams = data?.params ?? appConfig.initialParamsVariables;

  const frdAsset = state?.constants?.asset;
  const frdMeta: TokenMeta | undefined = frdAsset ? data?.tokens?.[frdAsset] : undefined;
  const userData = (walletAddress ? state[`user_${walletAddress}`] : undefined) as IUserData | undefined;

  const addReferralAsData = referralAddress && (!userData || !walletAddress);

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
    asset: currency?.asset === 'base' ? undefined : currency?.asset,
    from_address: walletAddress,
    data: {
      deposit: 1,
      deposit_asset: currency?.asset === 'base' ? undefined : currency?.asset,
      term: selectedTerm,
      ref: addReferralAsData ? referralAddress : undefined
    }
  });

  return <div className="grid gap-4 text-md deposit-form">
    <h2 className="text-3xl font-bold">New deposit</h2>

    <div className="grid gap-4 text-muted-foreground">
      <div>Before depositing, you must be attested on <a href={appConfig.TELEGRAM_BOT_URL}>telegram</a> and/or <a href={appConfig.DISCORD_BOT_URL}>discord</a>. This is important to notify you about follow-up rewards in the future.</div>

      <div>If you deposit less than {toLocalString(agentParams.min_balance_instead_of_real_name / 10 ** (frdMeta?.decimals ?? 0))} {frdMeta?.symbol} (or equivalent), you must be <a href={appConfig.REAL_NAME_BOT_URL}>real-name attested</a>. This measure helps prevent multiple accounts by the same user.</div>
    </div>

    <FieldSet>
      <FieldGroup>
        <div className="flex justify-baseline gap-x-4">
          <Field>
            <FieldLabel htmlFor="amount">Amount</FieldLabel>

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

            <FieldDescription>
              <Activity mode={currency.asset !== frdAsset ? "visible" : "hidden"}>
                {isRateLoading
                  ? <Skeleton className="w-full h-6" />
                  : <div suppressHydrationWarning>&asymp; {toLocalString(Number(amount) * (rate ?? 0))} {frdToken?.symbol} (according to the current <Link href="/faq#ceiling-price">ceiling price</Link> 1 {frdToken?.symbol} = {toLocalString(rate ? 1 / rate : 0)} {currency.symbol}).
                  </div>}
              </Activity>
            </FieldDescription>
          </Field>

          <Field className="w-[200px]">
            <FieldLabel htmlFor="currency">Currency</FieldLabel>
            <Select defaultValue={currency.asset} onValueChange={handleTokenChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a token" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {/* <SelectLabel>Currency</SelectLabel> */}
                  {Object.entries(data?.tokens ?? {}).map(([_tokenKey, token]) => (
                    <SelectItem key={token.asset} value={token.asset}>
                      {token.symbol}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <FieldDescription>
              {frdAsset === currency.asset
                ? <>Buy on <Link href="https://oswap.io/swap/RYD36EAZWEZVNZ6T2KJI4HJJH6ABYYI5?reverse=1" target="_blank" rel="noopener">Oswap</Link></>
                : <>Get on <Link href="https://getmein.ooo" target="_blank" rel="noopener">GetMeIn</Link></>}
            </FieldDescription>
          </Field>
        </div>

        <div className="flex flex-col w-full gap-8 md:gap-4">

          <Field>
            <Slider
              value={[selectedTerm]}
              id="term"
              onValueChange={(value) => setTerm((value[0] <= minTerm ? minTerm : value[0]) as number)}
              step={30}
              min={0}
              max={MAX_LOCKED_TERM_DAYS}
            />
          </Field>

          <div suppressHydrationWarning>Locking term: {formatDays(selectedTerm)} — until {formatInTimeZone(until, "UTC", "MMMM do, yyyy")} <span className="text-muted-foreground">(applies to your entire balance)</span>
          </div>

          {(addReferralAsData) ? <div>Using <Link href={`/${referralAddress}`}>{referralAddress}</Link> as referrer</div> : null}
        </div>


        <div className="flex flex-col md:flex-row gap-6 md:gap-4 items-center">
          <QRButton ref={btnRef} disabled={!amount || Number(amount) <= 0} href={url}>
            Send {!Number(amount) ? '' : toLocalString(amount)} {currency?.symbol.toUpperCase()}
          </QRButton>
        </div>
      </FieldGroup>
    </FieldSet>
  </div>
}
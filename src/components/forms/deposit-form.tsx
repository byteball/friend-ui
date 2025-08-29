"use client";

import { addDays, format } from "date-fns";
import { useState } from "react";

import { appConfig } from "@/appConfig";
import { formatDays } from "@/lib/formatDays";
import { Input } from "../ui/input";
import { QRButton } from "../ui/qr-button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";
import { Slider } from "../ui/slider";

const MAX_LOCKED_TERM_DAYS = 365 * 4;
const now = new Date();

export const DepositForm = () => {
  const [currency, setCurrency] = useState("base");
  const [amount, setAmount] = useState({ value: "", valid: true });
  const [term, setTerm] = useState<number>(appConfig.MIN_LOCKED_TERM_DAYS);
  const until = addDays(now, term);

  return <div className="grid gap-4">
    <h2 className="text-3xl font-bold">New deposit</h2>

    <div className="grid gap-4 text-muted-foreground">
      <div>Before depositing, you must be attested on <a className="text-blue-700" href={appConfig.TELEGRAM_BOT_URL}>telegram</a> and/or <a className="text-blue-700" href={appConfig.DISCORD_BOT_URL}>discord</a>. This is important to notify you about follow-up rewards in the future.</div>

      <div>If you deposit less than 50 FRD (or equivalent), you must be <a className="text-blue-700" href="#">real-name attested</a>. This measure helps prevent multiple accounts by the same user.</div>
    </div>

    <div>
      <div className="flex flex-col gap-4">
        <div className="flex gap-4 items-end">
          <div className="w-full">
            <label htmlFor="amount" className="text-muted-foreground pb-1">Amount</label>
            <Input id="amount" placeholder={(appConfig.MIN_BALANCE / 1e9).toString()} />
          </div>

          <Select defaultValue={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a token" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Currency</SelectLabel>
                <SelectItem value="base">GBYTE</SelectItem>
                <SelectItem value="frd">FRD</SelectItem>
                <SelectItem value="usdc">USDC</SelectItem>
                <SelectItem value="btc">BTC</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex w-full flex-col gap-4">
          {/* <div className="w-[50%]">Term: {formatDays(term)}</div> */}

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

        <QRButton href="#">
          Send 500 {currency.toUpperCase()}
        </QRButton>
      </div>
    </div>

  </div>
}
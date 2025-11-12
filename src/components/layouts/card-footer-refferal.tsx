"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { FC } from "react";
import { useClipboard } from 'use-clipboard-copy';
import { CardFooter } from "../ui/card";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "../ui/input-group";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";

interface CardFooterReferralProps {
  query?: string;
}

export const CardFooterReferral: FC<CardFooterReferralProps> = ({ query = "" }) => {
  const pathname = usePathname();
  const { copied, copy } = useClipboard({
    copiedTimeout: 1000, // timeout duration in milliseconds
  });

  const host = typeof window !== 'undefined' ? window.location.host : '';

  return <>
    <Separator />

    {pathname && host ? <CardFooter className="items-end justify-end">
      <FieldGroup>
        <Field>
          <FieldLabel>Share to get new friends and referrals</FieldLabel>
          <InputGroup>
            <InputGroupInput value={`https://${host + pathname}${query}`} readOnly />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                onClick={() => {
                  copy(`https://${host + pathname}${query}`)
                }}
              >
                {copied ? <CheckIcon className="stroke-green-700" size={6} /> : <CopyIcon size={6} />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </Field>
      </FieldGroup>
    </CardFooter> : <CardFooter>
      <FieldGroup>
        <Field>
          <FieldLabel>
            <Skeleton className="h-[19.5px] w-full" />
          </FieldLabel>
          <Skeleton className="h-9 w-full" />
        </Field>
      </FieldGroup>
    </CardFooter>}
  </>
}
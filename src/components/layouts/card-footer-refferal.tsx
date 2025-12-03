"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { useClipboard } from "use-clipboard-copy";
import { CardFooter } from "../ui/card";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "../ui/input-group";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";

interface CardFooterReferralProps {
  query?: string;
  hasDeposit?: boolean;
}

export const CardFooterReferral: FC<CardFooterReferralProps> = ({ hasDeposit = false, query = "" }) => {
  const pathname = usePathname();
  const { copied, copy } = useClipboard({
    copiedTimeout: 1000, // timeout duration in milliseconds
  });

  const [host, setHost] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setHost(window.location.host);
  }, []);

  const referralUrl = host && pathname ? `https://${host + pathname}${query}` : "";
  const canShare = Boolean(referralUrl);

  return <>
    <Separator />

    {canShare ? <CardFooter className="items-end justify-end">
      <FieldGroup>
        {hasDeposit ? <Field>
          <FieldLabel>Share this link to get new friends and referrals</FieldLabel>
          <InputGroup>
            <InputGroupInput value={referralUrl} readOnly />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                onClick={() => {
                  if (!canShare) {
                    return;
                  }

                  copy(referralUrl);
                }}
                disabled={!canShare}
              >
                {copied ? <CheckIcon className="stroke-green-700" size={6} /> : <CopyIcon size={6} />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </Field> : <Field>
          <FieldLabel className="text-yellow-600">To be able to find new friends and referrals, make a deposit</FieldLabel>
        </Field>}
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
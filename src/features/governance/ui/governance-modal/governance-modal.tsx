"use client";

import { useRef, useState } from "react";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { QRButton } from "@/components/ui/qr-button";

import { GovernanceModalContentAddresses } from "./governance-modal-content-addresses";
import { GovernanceModalContentAmount } from "./governance-modal-content-amount";
import { GovernanceModalContentPercent } from "./governance-modal-content-percent";
import { GovernanceModalFooter } from "./governance-modal-footer";
import { GovernanceModalHeader } from "./governance-modal-header";

import { useData } from "@/app/context";

import { generateLink } from "@/lib/generate-link";
import { isValidAddress } from "@/lib/isValidAddress";
import { ADDRESS_PARAMS, PERCENTAGE_PARAMS } from "../../domain/transform-value";

interface GovernanceModalProps<K extends keyof AgentParams> {
  children?: React.ReactNode;
  name: K;
  defaultValue?: AgentParams[K];
  isNew?: boolean;
}

export const GovernanceModal = <K extends keyof AgentParams>({ children, name, defaultValue, isNew = true }: GovernanceModalProps<K>) => {
  const [state, setState] = useState<AgentParams[K] | null>();
  const { getGovernanceAA } = useData();
  const btnRef = useRef<HTMLButtonElement>(null);

  const voteUrl = state ? generateLink({
    amount: 10000,
    aa: getGovernanceAA(),
    data: {
      name,
      value: state,
    }
  }) : "#";

  let isValid = false;

  if (state && ADDRESS_PARAMS.includes(name)) {
    if (typeof state === 'string') {
      isValid = state.split(":").every(isValidAddress);
    } else {
      isValid = false;
    }
  } else if (state && PERCENTAGE_PARAMS.includes(name)) {
    if (typeof state === 'number') {
      isValid = state >= 0 && state <= 1;
    } else {
      isValid = false;
    }
  } else if (name === "min_balance_instead_of_real_name") {
    if (typeof state === 'number') {
      isValid = state >= 0;
    } else {
      isValid = false;
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>

      <DialogContent>

        <GovernanceModalHeader name={name} />
        {ADDRESS_PARAMS.includes(name)
          ? <GovernanceModalContentAddresses
            defaultValue={defaultValue ? String(defaultValue) : undefined}
            multi={name !== 'rewards_aa'}
            onChange={(value) => setState(value as AgentParams[K])}
            actionBtnRef={btnRef}
            isNew={isNew}
          />
          : null}

        {PERCENTAGE_PARAMS.includes(name)
          ? <GovernanceModalContentPercent
            defaultValue={defaultValue ? Number(defaultValue) * 100 : undefined}
            onChange={(value) => setState(+(Number(value) / 100).toFixed(4) as AgentParams[K])}
            actionBtnRef={btnRef}
            isNew={isNew}
          />
          : null}

        {name === "min_balance_instead_of_real_name"
          ? <GovernanceModalContentAmount
            defaultValue={defaultValue ? Number(defaultValue) : undefined}
            onChange={(value) => setState((value) as AgentParams[K])}
            actionBtnRef={btnRef}
            isNew={isNew}
          />
          : null}

        <GovernanceModalFooter>
          <QRButton ref={btnRef} disabled={!isValid} href={voteUrl}>Change</QRButton>
        </GovernanceModalFooter>
      </DialogContent>
    </Dialog>
  );
};
import { Input } from "@/components/ui/input";
import { FC, RefObject, useEffect, useState } from "react";
import { NumberFormatValues, NumericFormat } from "react-number-format";

interface GovernanceModalContentAmountProps<K extends keyof AgentParams> {
  defaultValue?: number;
  onChange?: (value: AgentParams[K] | null) => void;
  actionBtnRef: RefObject<HTMLButtonElement | null>;
  isNew?: boolean;
  suffix?: string;
}


export const GovernanceModalContentAmount: FC<GovernanceModalContentAmountProps<keyof AgentParams>> = ({ onChange, defaultValue, isNew = true, actionBtnRef, suffix }) => {
  const [value, setValue] = useState(defaultValue ? String(defaultValue / 10 ** 9) : '');

  useEffect(() => {
    if (onChange) {
      onChange(value ? Math.ceil(Number(value) * 1e9) : 0);
    }
  }, [value, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      actionBtnRef.current?.click();
    }
  }

  return <div>
    <div className="grid gap-4">
      <NumericFormat
        value={value}
        id="amount"
        decimalScale={4}
        maxLength={8}
        security="auto"
        allowNegative={false}
        disabled={!isNew}
        allowLeadingZeros={false}
        onKeyDown={handleKeyDown}
        // pass custom input
        customInput={(props) => <Input suffix={suffix} {...props} />}
        // returns parsed values; values.value is numeric string like "0.5"
        onValueChange={(values: NumberFormatValues) => {
          let value = values.value ?? '';
          if (value.startsWith(".")) value = "0" + value;

          setValue(value);
        }}
        inputMode="decimal"
      />
    </div>
  </div>;
}
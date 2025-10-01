import { Input } from "@/components/ui/input";
import { FC, RefObject, useEffect, useState } from "react";
import { NumberFormatValues, NumericFormat } from "react-number-format";

interface GovernanceModalContentPercentProps<K extends keyof AgentParams> {
  defaultValue?: number;
  onChange?: (value: AgentParams[K] | null) => void;
  actionBtnRef: RefObject<HTMLButtonElement | null>;
  isNew?: boolean;
}


export const GovernanceModalContentPercent: FC<GovernanceModalContentPercentProps<keyof AgentParams>> = ({ onChange, defaultValue, isNew = true, actionBtnRef }) => {
  const [value, setValue] = useState(String(defaultValue ?? ''));

  useEffect(() => {
    if (onChange) {
      onChange(value ? Number(value) : null);
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
        customInput={(props) => <Input suffix="%" {...props} />}
        // returns parsed values; values.value is numeric string like "0.5"
        onValueChange={(values: NumberFormatValues) => {
          let value = values.value ?? '';
          if (value.startsWith(".")) value = "0" + value;

          setValue(value);
        }}
        inputMode="decimal"
      />
    </div>

    <div className="text-sm text-muted-foreground mt-1">
      Max value: 100%
    </div>
  </div>;
}
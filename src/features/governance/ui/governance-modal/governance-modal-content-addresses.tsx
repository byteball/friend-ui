import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidAddress } from "@/lib/is-valid-address";
import cn from "classnames";
import { PlusCircleIcon, XIcon } from "lucide-react";
import { nanoid } from 'nanoid';
import { FC, RefObject, useEffect, useReducer } from "react";
import { addressesReducer } from "../../governance-modal-addresses-reducer";

interface GovernanceModalContentAddressesProps {
  defaultValue?: string;
  onChange?: (value: string) => void;
  actionBtnRef: RefObject<HTMLButtonElement | null>;
  isNew?: boolean;
  multi?: boolean;
}

export const GovernanceModalContentAddresses: FC<GovernanceModalContentAddressesProps> = ({ onChange, defaultValue, isNew = true, multi = false, actionBtnRef }) => {
  const [addresses, dispatch] = useReducer(addressesReducer, defaultValue
    ? defaultValue.split(":").map((addr) => ({ value: addr ?? "", isValid: false, id: nanoid() }))
    : [{ value: "", isValid: false, id: nanoid() }]
  );

  useEffect(() => {
    if (onChange) {
      onChange(addresses.map((addr) => addr.value).join(":"));
    }
  }, [addresses, onChange]);

  const removeAddress = (id: string) => {
    dispatch({ type: "REMOVE_ADDRESS", payload: id });
  }

  const addAddress = (value: string) => {
    dispatch({ type: "ADD_ADDRESS", payload: value });
  }

  const handleChange = (value: string, id: string) => {
    dispatch({ type: "UPDATE_ADDRESS", payload: { id, value } });
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && addresses.length === addresses.filter(addr => addr.isValid).length) {
      e.preventDefault();
      actionBtnRef.current?.click();
    }
  }

  const showRemoveBtn = (index: number) => index !== 0 && isNew;

  return <div>
    <div className="grid gap-4">
      {addresses.map((address, index) => (
        <div key={address.id} className="flex justify-between gap-2">
          <Input
            disabled={!isNew}
            defaultValue={address.value}
            onKeyDown={handleKeyDown}
            onChange={(e) => handleChange(e.target.value, address.id)}
            className={cn({
              "border-red-700": isValidAddress(address.value) === false && address.value.length > 0,
              "mr-[32px]": !showRemoveBtn(index) && isNew
            })}
          />

          {showRemoveBtn(index)
            ? <Button asChild variant="link" className="grow-0 shrink-0 p-0 w-[24px] m-0 self-start" onClick={() => removeAddress(address.id)}>
              <XIcon className="text-red-700" />
            </Button>
            : null}
        </div>
      ))}
    </div>

    {multi && isNew ? <Button
      variant="link"
      disabled={addresses.length >= 6 || !isNew}
      className="p-0 has-[>svg]:p-0 m-0 mt-2"
      onClick={() => addAddress("")}
    >
      <PlusCircleIcon /> Add new address
    </Button>
      : null}
  </div>;
}
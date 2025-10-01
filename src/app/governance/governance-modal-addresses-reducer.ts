import { nanoid } from "nanoid";

export interface AddressValue {
  value: string;
  isValid: boolean;
  id: string;
}

export type AddressAction =
  | { type: "REMOVE_ADDRESS"; payload: string }
  | { type: "ADD_ADDRESS"; payload: string }
  | { type: "UPDATE_ADDRESS"; payload: { id: string; value: string } };

export function addressesReducer(state: AddressValue[], action: AddressAction): AddressValue[] {
  switch (action.type) {
    case "REMOVE_ADDRESS":
      return state.filter((addrData) => addrData.id !== action.payload);
    case "ADD_ADDRESS":
      return [...state, { value: action.payload, isValid: false, id: nanoid() }];
    case "UPDATE_ADDRESS":
      return state.map((addrData) => addrData.id === action.payload.id ? { ...addrData, value: action.payload.value } : addrData);
    default:
      return state;
  }
}

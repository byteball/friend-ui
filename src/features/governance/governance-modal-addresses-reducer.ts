import { nanoid } from "nanoid";

import type { AddressAction, AddressValue } from "./domain/types";

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

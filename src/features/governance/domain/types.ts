

// Additional governance related types can be added here
export interface GovernanceItem {
  id: string;
  title: string;
  description?: string;
  addresses?: string[];
  // Add other fields as needed
}

export interface GovernanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: GovernanceItem;
  isNew?: boolean;
}

export interface AddressValue {
  value: string;
  isValid: boolean;
  id: string;
}

export type AddressAction =
  | { type: "REMOVE_ADDRESS"; payload: string }
  | { type: "ADD_ADDRESS"; payload: string }
  | { type: "UPDATE_ADDRESS"; payload: { id: string; value: string } };
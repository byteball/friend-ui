// Re-export types from the reducer for easier imports
export type { AddressAction, AddressValue } from './governance-modal-addresses-reducer';

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
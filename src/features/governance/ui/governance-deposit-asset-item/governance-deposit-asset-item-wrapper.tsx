import { FC } from "react";

import { Card } from "@/components/ui/card";

interface GovernanceItemWrapperProps {
  children?: React.ReactNode;
}

export const GovernanceDepositAssetItemWrapper: FC<GovernanceItemWrapperProps> = ({ children }) => (<Card>
  {children}
</Card>)
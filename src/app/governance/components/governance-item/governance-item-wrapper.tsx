import { FC } from "react";

import { Card } from "@/components/ui/card";

interface GovernanceItemWrapperProps {
  children: React.ReactNode;
}

export const GovernanceItemWrapper: FC<GovernanceItemWrapperProps> = ({ children }) => (<Card>
  {children}
</Card>)
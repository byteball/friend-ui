import { FC, ReactNode } from "react";

interface IFaqContainerProps {
  children: ReactNode;
}

export const FaqContainer: FC<IFaqContainerProps> = ({ children }) => {
  return <div className="mt-10 space-y-10">
    {children}
  </div>
}

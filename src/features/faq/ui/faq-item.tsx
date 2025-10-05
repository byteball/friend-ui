import { FC, ReactNode } from "react";

interface IFaqItemProps {
  children: ReactNode;
}

export const FaqItem: FC<IFaqItemProps> = ({ children }) => {
  return <div className="pb-6 border-b border-gray-200">
    {children}
  </div>
}
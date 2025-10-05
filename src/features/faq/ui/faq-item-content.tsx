import { FC, ReactNode } from "react";

interface IFaqContentProps {
  children: ReactNode;
}

export const FaqContent: FC<IFaqContentProps> = ({ children }) => {
  return <div className="mt-2 text-gray-600 text-base/7">{children}</div>
}
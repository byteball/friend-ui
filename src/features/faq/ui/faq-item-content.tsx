import { FC, ReactNode } from "react";

interface IFaqContentProps {
  children: ReactNode;
}

export const FaqContent: FC<IFaqContentProps> = ({ children }) => {
  return <div className="mt-2 text-gray-300 text-lg/7 faq-items">{children}</div>
}
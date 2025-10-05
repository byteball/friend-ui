import { FC, ReactNode } from "react";

interface IFaqTitleProps {
  children: ReactNode;
}

export const FaqTitle: FC<IFaqTitleProps> = ({ children }) => {
  return <h2 className="font-semibold text-gray-900 text-xl/7">{children}</h2>
}
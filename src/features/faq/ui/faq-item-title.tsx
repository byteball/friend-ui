import { FC, ReactNode } from "react";

interface IFaqTitleProps {
  children: ReactNode;
}

export const FaqTitle: FC<IFaqTitleProps> = ({ children }) => {
  return <h2 className="font-semibold text-gray-200 text-4xl/12">{children}</h2>
}
import { FC, ReactNode } from "react";

interface IFaqTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const FaqTitle: FC<IFaqTitleProps> = ({ children, ...props }) => {
  return <h2 className="font-semibold text-gray-200 text-4xl/12" {...props}>{children}</h2>
}
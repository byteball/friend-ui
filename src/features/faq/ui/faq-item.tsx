import { FC, ReactNode } from "react";

interface IFaqItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const FaqItem: FC<IFaqItemProps> = ({ children, ...props }) => {
  return <div className="pb-6 border-b border-border" {...props}>
    {children}
  </div>
}
import { FC, ReactNode } from "react";

interface IFaqContentProps {
  children: ReactNode;
}

export const FaqContent: FC<IFaqContentProps> = ({ children }) => {
  return <div className="mt-2 text-muted-foreground text-base/7 faq-items">{children}</div>
}
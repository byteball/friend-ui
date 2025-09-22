import { FC, ReactNode } from "react";


// CONTAINER COMPONENT

interface IContainerProps {
  children: ReactNode;
}

const Container: FC<IContainerProps> = ({ children }) => {
  return <div className="space-y-10 mt-10">
    {children}
  </div>
}


// ITEM COMPONENT

interface IItemProps {
  children: ReactNode;
}

const Item: FC<IItemProps> = ({ children }) => {
  return <div className="border-b border-gray-200 pb-6">
    {children}
  </div>
}

// TITLE COMPONENT

interface ITitleProps {
  children: ReactNode;
}

const Title: FC<ITitleProps> = ({ children }) => {
  return <h2 className="text-xl/7 font-semibold text-gray-900">{children}</h2>
}


// CONTENT COMPONENT

interface IContentProps {
  children: ReactNode;
}

const Content: FC<IContentProps> = ({ children }) => {
  return <div className="mt-2 text-base/7 text-gray-600">{children}</div>
}

export default {
  Container,
  Item,
  Title,
  Content
}
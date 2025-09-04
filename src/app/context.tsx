"use client";
import { createContext, useContext } from "react";

const DataContext = createContext<IClientData | null>(null);

export function useData() {
  return useContext(DataContext);
}

export function DataProvider({ value, children }: { value: IClientData; children: React.ReactNode }) {
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

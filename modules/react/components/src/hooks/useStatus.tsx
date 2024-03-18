import { PhaseAnd } from "@itsmworkbench/domain";
import React, { useContext } from "react";
import { NameAnd } from "@laoban/utils";

export type Status = PhaseAnd<NameAnd<boolean>>

export interface StatusProviderProps {
  status: Status
  children: React.ReactNode;
}
export const StatusProviderContext = React.createContext<Status> ( {} as any );
export function StatusProvider ( { children, status }: StatusProviderProps ) {
  return <StatusProviderContext.Provider value={status || {} as any}> {children} </StatusProviderContext.Provider>;
}

// Hook for consuming the service
export function useStatus (): Status {
  const results = useContext ( StatusProviderContext );
  if ( results === undefined ) {
    throw new Error ( "useStatus  must be used within a StatusProvider" );
  }
  return results;
}

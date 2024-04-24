import React, { useContext } from "react";
import { Sqler } from "@itsmworkbench/sql";


export interface SqlerProviderProps {
  sqler: Sqler
  children: React.ReactNode;
}
export const SqlerContext = React.createContext<Sqler | undefined> ( undefined );
export function SqlerProvider ( { children, sqler }: SqlerProviderProps ) {
  return <SqlerContext.Provider value={sqler}> {children} </SqlerContext.Provider>;
}

// Hook for consuming the service
export function useSqler (): Sqler {
  const context = useContext ( SqlerContext );
  if ( context === undefined ) {
    throw new Error ( "useSqler must be used within a SqlerProvider" );
  }
  console.log ( 'useSqler', context )
  return context;
}

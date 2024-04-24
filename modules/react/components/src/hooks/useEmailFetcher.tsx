import React, { useContext } from "react";
import { FetchEmailer } from "@itsmworkbench/fetchemail";


export interface FetchEmailerProviderProps {
  fetchEmailer: FetchEmailer
  children: React.ReactNode;
}
export const FetchEmailerContext = React.createContext<FetchEmailer | undefined> ( undefined );
export function FetchEmailerProvider ( { children, fetchEmailer }: FetchEmailerProviderProps ) {
  return <FetchEmailerContext.Provider value={fetchEmailer}> {children} </FetchEmailerContext.Provider>;
}

// Hook for consuming the service
export function useFetchEmailer (): FetchEmailer {
  const context = useContext ( FetchEmailerContext );
  if ( context === undefined ) {
    throw new Error ( "useFetchEmailer must be used within a FetchEmailerProvider" );
  }
  return context;
}

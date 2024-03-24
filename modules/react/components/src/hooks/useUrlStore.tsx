// Service implementation
import { UrlStore } from "@itsmworkbench/urlstore";
import React, { useContext } from "react";


export interface UrlStoreServiceProps {
  urlStore: UrlStore
  children: React.ReactNode;

}
export const UrlStoreContext = React.createContext<UrlStore | undefined> ( undefined );
export function UrlStoreProvider ( { children, urlStore }: UrlStoreServiceProps ) {
  return <UrlStoreContext.Provider value={urlStore}> {children} </UrlStoreContext.Provider>;
}

// Hook for consuming the service
export function useUrlStore (): UrlStore {
  const context = useContext ( UrlStoreContext );
  if ( context === undefined ) {
    throw new Error ( "useUrlStore must be used within a UrlStoreProvider" );
  }
  return context;
}

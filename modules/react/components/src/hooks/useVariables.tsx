import React, { useContext } from "react";
import { SideEffect } from "@itsmworkbench/react_core";
import { LensState } from "@focuson/state";


export interface VariablesProviderProps<S> {
  state: LensState<S, any, any>
  children: React.ReactNode;
}
export const VariablesProviderContext = React.createContext<LensState<any, any, any> | undefined> ( undefined );
export function VariablesProvider<S> ( { children, state }: VariablesProviderProps<S> ) {
  return <VariablesProviderContext.Provider value={state}> {children} </VariablesProviderContext.Provider>;
}

export function useVariables<S> (): LensState<S, any, any> {
  const results = useContext ( VariablesProviderContext );
  if ( results === undefined ) {
    throw new Error ( "useVariables  must be used within a VariablesProvider" );
  }
  return results
}

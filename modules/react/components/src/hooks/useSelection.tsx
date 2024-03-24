import { Mailer } from "@itsmworkbench/mailer";
import React, { useContext } from "react";
import { LensState } from "@focuson/state";
import { TabPhaseAndActionSelectionState } from "@itsmworkbench/react_core";
import { Optional } from "@focuson/lens";

export interface SelectionProviderProps<S> {
  children: React.ReactNode;
  state:  LensState<S, TabPhaseAndActionSelectionState, any>
}
export const SelectionContext = React.createContext<LensState<any, TabPhaseAndActionSelectionState, any> | undefined> ( undefined );
export function SelectionProvider<S> ( { children, state }: SelectionProviderProps<S> ) {
  return <SelectionContext.Provider value={state}> {children} </SelectionContext.Provider>;
}
export function useSelection<S> ( ): LensState<S, TabPhaseAndActionSelectionState, any> {
  const context = useContext ( SelectionContext );
  if ( context === undefined ) {
    throw new Error ( "useSelection must be used within a SelectionContext" );
  }
  return context
}

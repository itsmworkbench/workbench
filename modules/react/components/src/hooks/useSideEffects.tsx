import React, { useContext } from "react";
import { Lens } from "@focuson/lens";
import { SideEffect, TabPhaseAndActionSelectionState } from "@itsmworkbench/react_core";
import { LensState } from "@focuson/state";
import { SelectionContext } from "./useSelection";


export interface SideEffectsProviderProps {
  sideEffectL: Lens<any, SideEffect[]> // really want this to be <S> but I don't know how to do that with React. I'm not sure it's really possible... or at least worth the complexity.
  children: React.ReactNode;
}
export const SideEffectsProviderContext = React.createContext<Lens<any, SideEffect[]> | undefined> ( undefined );
export function SideEffectsProvider ( { children, sideEffectL }: SideEffectsProviderProps ) {
  return <SideEffectsProviderContext.Provider value={sideEffectL}> {children} </SideEffectsProviderContext.Provider>;
}

// Hook for consuming the service
export type AddSideEffectFn = ( ...sideEffects: SideEffect[] ) => void | Promise<void>
export function useSideEffects<S> ( s: LensState<S, any, any> ): AddSideEffectFn {
  const results = useContext ( SideEffectsProviderContext );
  if ( results === undefined ) {
    throw new Error ( "useSideEffects  must be used within a SideEffectsProvider" );
  }
  return ( ...ses ) => {
    const seState = s.copyWithLens ( results )
    const oldSes = seState.optJson () || []
    seState.setJson ( [ ...(oldSes || []), ...ses ], 'useSideEffect' )
  };
}

export type SetSelectionAndAddSideEffectFn = ( sel: string, ...sideEffects: SideEffect[] ) => void | Promise<void>
export function useSideEffectsAndSelection (): [ TabPhaseAndActionSelectionState | undefined, SetSelectionAndAddSideEffectFn ] {
  const seLens = useContext ( SideEffectsProviderContext );
  if ( seLens === undefined ) throw new Error ( "useSideEffectsAndSelection must be used within a SideEffectsProvider" );

  const selState: LensState<any, TabPhaseAndActionSelectionState, any> |undefined= useContext ( SelectionContext );
  if ( selState === undefined ) throw new Error ( "useSideEffectsAndSelection must be used within a SelectionProvider" );

  const state2 = selState.addSecond ( seLens ).focus1On ( 'workspaceTab' )
  const existingTab = selState.optJson ()
  return [ existingTab, ( tab, ...ses ) => {
    const oldSes = seLens.getOption ( selState.main ) || []
    state2.setJson ( tab, [ ...(oldSes || []), ...ses ], 'useSideEffectsAndSelection' )
  } ]
}
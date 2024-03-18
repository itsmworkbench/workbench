import { PhaseAnd } from "@itsmworkbench/domain";
import React, { useContext } from "react";
import { NameAnd } from "@laoban/utils";
import { Lens } from "@focuson/lens";
import { SideEffect } from "@itsmworkbench/react_core";
import { LensState } from "@focuson/state";


export interface SideEffectsProviderProps {
  sideEffectL: Lens<any, SideEffect[]> // really want this to be <S> but I don't know how to do that with React. I'm not sure it's really possible... or at least worth the complexity.
  children: React.ReactNode;
}
export const SideEffectsProviderContext = React.createContext<Lens<any, SideEffect[] | undefined>> ( undefined );
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

import React from "react";
import { Button, ButtonProps } from "@mui/material";
import { PhaseName } from "@itsmworkbench/domain";
import { EventSideEffect } from "@itsmworkbench/react_core";
import { SetValueEvent } from "@itsmworkbench/events";
import { useSelection } from "../hooks/useSelection";
import { LensState } from "@focuson/state";


export type SuccessFailContextFn = ( tab: string | undefined, phase: PhaseName | undefined, action: string | undefined, successOrFail: boolean | undefined ) => any
export type IProcessEventSideEffect = ( e: EventSideEffect ) => void
export type IProcessEventSideEffectFn = <S>(s: LensState<S, any, any>) =>( e: EventSideEffect ) => void
export interface SuccessFailureButtonProps<S> extends ButtonProps {
  pathToStatus?: string
  successOrFail: boolean;
  context: SuccessFailContextFn
  processSe: IProcessEventSideEffect
}
export function SuccessFailureButton<S> ( { successOrFail, title, pathToStatus, context, processSe, ...rest }: SuccessFailureButtonProps<S> ) {
  const selectionState = useSelection ()
  const display = title ?? (successOrFail ? 'Success' : 'Failure');
  const existingSelection = selectionState.optJson ()
  if ( pathToStatus === undefined ) pathToStatus = 'forTicket.status'//TODO horrible hack. fix this when have lens jumping across network boundaries nicely
  function onClick () {
    const phase: PhaseName = existingSelection?.phase as PhaseName;
    const action = existingSelection?.action;

    const sve: SetValueEvent = {
      event: 'setValue', value: successOrFail, path: pathToStatus + '.' + phase + '.' + action,
      context: context ( existingSelection?.workspaceTab, phase, action, successOrFail )
    }
    const se: EventSideEffect = { command: 'event', event: sve }
    processSe ( se )
  }
  return <Button {...rest} variant="contained" onClick={onClick}>{display}</Button>

}

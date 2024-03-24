import React from "react";
import { Button, ButtonProps } from "@mui/material";
import { PhaseName } from "@itsmworkbench/domain";
import { EventSideEffect } from "@itsmworkbench/react_core";
import { SetValueEvent } from "@itsmworkbench/events";
import { useSideEffectsAndSelection } from "../hooks/useSideEffects";


export type SuccessFailContextFn = ( tab: string | undefined, phase: PhaseName | undefined, action: string | undefined, successOrFail: boolean | undefined ) => any
export interface SuccessFailureButtonProps<S> extends ButtonProps {
  pathToStatus?: string
  successOrFail: boolean;
  context: SuccessFailContextFn
}
export function SuccessFailureButton<S> ( { successOrFail, title, pathToStatus, context, ...rest }: SuccessFailureButtonProps<S> ) {
  const display = title ?? (successOrFail ? 'Success' : 'Failure');
  const [ existingSelection, setJson ] = useSideEffectsAndSelection ()
  if ( pathToStatus === undefined ) pathToStatus = 'forTicket.status'//TODO horrible hack. fix this when have lens jumping across network boundaries nicely
  function onClick () {
    const phase: PhaseName = existingSelection?.phase as PhaseName;
    const action = existingSelection?.action;

    const sve: SetValueEvent = {
      event: 'setValue', value: successOrFail, path: pathToStatus + '.' + phase + '.' + action,
      context: context ( existingSelection?.workspaceTab, phase, action, successOrFail )
    }
    const se: EventSideEffect = { command: 'event', event: sve }
    setJson ( 'chat', se )
  }
  return <Button {...rest} variant="contained" onClick={onClick}>{display}</Button>

}

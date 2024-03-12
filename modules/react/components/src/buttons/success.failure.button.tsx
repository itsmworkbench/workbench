import { LensProps2 } from "@focuson/state";
import React from "react";
import { Button, ButtonProps } from "@mui/material";
import { PhaseName } from "@itsmworkbench/domain";
import { EventSideEffect, SideEffect, TabPhaseAndActionSelectionState } from "@itsmworkbench/react_core";
import { SetValueEvent } from "@itsmworkbench/events";


export type SuccessFailContextFn = ( tab: string | undefined, phase: PhaseName, action: string, successOrFail: boolean ) => any
export interface SuccessFailureButtonProps<S> extends LensProps2<S, SideEffect[], TabPhaseAndActionSelectionState, any>, ButtonProps {
  title?: string;
  pathToStatus: string
  successOrFail: boolean;
  context: SuccessFailContextFn
}
export function SuccessFailureButton<S> ( { state, successOrFail, title, pathToStatus, context, ...rest }: SuccessFailureButtonProps<S> ) {
  const display = title ?? (successOrFail ? 'Success' : 'Failure');

  function onClick () {
    const existingSelection = state.optJson2 () || {};
    const phase: PhaseName = existingSelection.phase;
    const action = existingSelection.action;

    const sve: SetValueEvent = {
      event: 'setValue', value: successOrFail, path: pathToStatus + '.' + phase + '.' + action,
      context: context ( existingSelection?.workspaceTab, phase, action, successOrFail )
    }
    const se: EventSideEffect = { command: 'event', event: sve }
    const newSelection: TabPhaseAndActionSelectionState = { workspaceTab: 'chat' };
    const oldSes = state.optJson1 () || []
    const newSes = [ ...oldSes, se ]
    state.setJson ( newSes, newSelection, 'Clicked in SuccessFailureButton' )
  }
  return <Button {...rest} variant="contained" onClick={onClick}>{display}</Button>

}

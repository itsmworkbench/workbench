import { LensProps2 } from "@focuson/state";
import { TabPhaseAndActionSelectionState, workbenchName } from "@itsmworkbench/react_core";
import { PhaseName } from "@itsmworkbench/domain";
import { BaseAction, dereferenceAction } from "@itsmworkbench/actions";
import { StatusIndicator, useActionInEventsFor, useVariables } from "@itsmworkbench/components";
import { Button } from "@mui/material";
import { splitAndCapitalize } from "@itsmworkbench/utils";
import React from "react";

//the first any is actually an Action
export interface ActionButtonProps<S> extends LensProps2<S, any, TabPhaseAndActionSelectionState, any> {
  name: string
  phase: PhaseName
  action: BaseAction
  status: boolean | undefined
}
export function ActionButton<S> ( { name, action, phase, status, state }: ActionButtonProps<S> ) {
  const foundAction = useActionInEventsFor ( phase, name );
  const variables = useVariables ()
  let buttonOnClick = () => {
    console.log ( 'ActionButton - action', foundAction, variables )
    let derefed = dereferenceAction ( foundAction, variables )
    console.log ( 'ActionButton - derefed', derefed )
    state.setJson ( derefed, { workspaceTab: workbenchName ( derefed.by ), phase, action: name }, derefed );
  };
  return <><Button
    variant="text"
    color="primary"
    fullWidth
    onClick={buttonOnClick}
    endIcon={<StatusIndicator action={action} value={status}/>}
    sx={{
      textTransform: 'none',
      justifyContent: 'flex-start', // This aligns text to the left
      padding: '6px 8px', // Reduces padding to make the button as small as practical
      '& .MuiButton-endIcon': {
        marginLeft: 'auto', // Pushes the icon to the right
      },
      '& .MuiSvgIcon-root': { // Ensures consistent icon size
        fontSize: '1.25rem',
      },
    }}
  >
    {splitAndCapitalize ( name )}
  </Button>

  </>
}
import React, { useState } from "react";
import { LensProps2, LensProps3 } from "@focuson/state";
import { NameAnd } from "@laoban/utils";
import { PhaseAnd, PhaseName } from "@itsmworkbench/domain";
import { Action, BaseAction } from "@itsmworkbench/actions";
import { Box, Button, Grid, Typography } from "@mui/material";
import { splitAndCapitalize } from "@itsmworkbench/utils";
import { TabPhaseAndActionSelectionState, workbenchName } from "@itsmworkbench/react_core";
import { StatusIndicator } from "@itsmworkbench/components";

export interface ActionButtonProps<S> extends LensProps2<S, TabPhaseAndActionSelectionState, PhaseAnd<NameAnd<any>>, any> {
  name: string
  phase: PhaseName
  action: BaseAction

}
export function ActionButton<S> ( { name, action, phase, state }: ActionButtonProps<S> ) {
  const [ anchorEl, setAnchorEl ] = useState ( null );
  const open = Boolean ( anchorEl );

  const handleClick = ( event: any ) => {
    setAnchorEl ( event.currentTarget );
  };

  const handleClose = () => {
    setAnchorEl ( null );
  };
  let buttonOnClick = () => state.state1 ().setJson ( { workspaceTab: workbenchName ( action.by ), phase, action: name }, action );
  return <><Button
    variant="text"
    color="primary"
    fullWidth
    onClick={buttonOnClick}
    endIcon={<StatusIndicator value={state.optJson2 ()?.[ phase ]?.[ name ]}/>}
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
export interface DisplayPhaseProps<S> extends LensProps3<S, NameAnd<Action>, TabPhaseAndActionSelectionState, PhaseAnd<NameAnd<boolean>>, any> {
  phase: PhaseName
}

export function DisplayPhase<S> ( { state, phase }: DisplayPhaseProps<S> ) {
  const nameAndActions = state.optJson1 () || {}
  const selectionState = state.state23 ()
  return <Box sx={{
    minWidth: 'fit-content',
    border: '1px solid',
    padding: 1,
    margin: 1,
    display: 'flex',
    flexDirection: 'column',
    // justifyContent: 'space-between', // This helps distribute space if needed
    height: '100%' // Makes Box fill the container height
  }}>
    <Typography variant="h6" component="h2" sx={{ marginBottom: 1 }}>
      {splitAndCapitalize ( phase )}
    </Typography>
    {Object.entries ( nameAndActions ).map ( ( [ name, action ] ) =>
      (<ActionButton state={selectionState} action={action} phase={phase} name={name}/>
      ) )}
  </Box>
}

export interface DisplayPhasesProps<S> extends LensProps3<S, PhaseAnd<NameAnd<Action>>, TabPhaseAndActionSelectionState, PhaseAnd<NameAnd<boolean>>, any> {
}
export function DisplayPhases<S> ( { state }: DisplayPhasesProps<S> ) {
  const phases = state.optJson1 () || {}
  return <Box sx={{ margin: 2 }}><Grid container spacing={2}>
    {Object.entries ( phases ).map ( ( [ name, actions ] ) => (
      <Grid item key={name}>
        <DisplayPhase state={state.focus1On ( name as PhaseName )} phase={name as PhaseName}/>
      </Grid>
    ) )}
  </Grid></Box>
}

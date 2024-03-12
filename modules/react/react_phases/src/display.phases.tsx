import React from "react";
import { LensProps, LensProps2 } from "@focuson/state";
import { NameAnd } from "@laoban/utils";
import { PhaseAnd, PhaseName } from "@itsmworkbench/domain";
import { Action, BaseAction } from "@itsmworkbench/actions";
import { Box, Button, Grid, Typography } from "@mui/material";
import { splitAndCapitalize } from "@itsmworkbench/utils";
import { TabPhaseAndActionSelectionState ,workbenchName} from "@itsmworkbench/react_core";


export interface ActionButtonProps<S> extends LensProps<S, TabPhaseAndActionSelectionState, any> {
  name: string
  action: BaseAction

}
export function ActionButton<S> ( { name, action, state }: ActionButtonProps<S> ) {
  return <Button
    variant="text"
    color="primary"
    fullWidth
    onClick={() => { state.setJson ( {workspaceTab: workbenchName(action.by)}, action ); }}
    sx={{
      textTransform: 'none',
      justifyContent: 'flex-start', // Aligns text to the left
      '& .MuiButton-startIcon': { // Adjusts startIcon (if any) to align with the text
        marginRight: '8px',
      },
      '& .MuiButton-endIcon': { // Adjusts endIcon (if any) to align with the text
        marginLeft: '8px',
      },
    }}
  >
    {splitAndCapitalize ( name )}
  </Button>
}
export interface DisplayPhaseProps<S> extends LensProps2<S, NameAnd<Action>, TabPhaseAndActionSelectionState, any> {
  phase: PhaseName
}

export function DisplayPhase<S> ( { state, phase }: DisplayPhaseProps<S> ) {
  const nameAndActions = state.optJson1 () || {}
  const selectionState = state.state2 ()
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
      (<ActionButton state={selectionState} action={action} name={name}/>
    ) )}
  </Box>
}

export interface DisplayPhasesProps<S> extends LensProps2<S, PhaseAnd<NameAnd<Action>>, TabPhaseAndActionSelectionState, any> {
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

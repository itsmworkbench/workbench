import React from "react";
import { LensProps3 } from "@focuson/state";
import { NameAnd } from "@laoban/utils";
import { PhaseAnd, PhaseName } from "@itsmworkbench/domain";
import { Action, BaseAction, phaseStatus } from "@itsmworkbench/actions";
import { Box, Button, Grid, Typography } from "@mui/material";
import { splitAndCapitalize } from "@itsmworkbench/utils";
import { TabPhaseAndActionSelectionState, workbenchName } from "@itsmworkbench/react_core";
import { StatusIndicator } from "@itsmworkbench/components";
import { Event } from "@itsmworkbench/events";
import { findActionInEventsFor, dereferenceAction } from "@itsmworkbench/knowledge_articles";

export interface ActionButtonProps<S> extends LensProps3<S, any, TabPhaseAndActionSelectionState, Event[], any> {
  name: string
  phase: PhaseName
  action: BaseAction
  status: boolean | undefined
}
export function ActionButton<S> ( { name, action, phase, status, state }: ActionButtonProps<S> ) {
  let buttonOnClick = () => {
    let found: Action = findActionInEventsFor ( state.optJson3 () || [], phase, name );
    const variables: any = state.optJson2 () || {}
    let derefed = dereferenceAction ( found, variables )
    console.log ( 'ActionButton', found )
    state.state12 ().setJson ( found, { workspaceTab: workbenchName ( derefed.by ), phase, action: name }, derefed );
  };
  return <><Button
    variant="text"
    color="primary"
    fullWidth
    onClick={buttonOnClick}
    endIcon={<StatusIndicator value={status}/>}
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
  status: boolean | undefined
  Action: ( phase: PhaseName, name: string, action: Action, status: boolean | undefined ) => React.ReactNode
}

export function DisplayPhase<S> ( { state, phase, status, Action }: DisplayPhaseProps<S> ) {
  const nameAndActions = state.optJson1 () || {}
  return <Box sx={{
    minWidth: '200px',
    border: '1px solid',
    padding: 1,
    margin: 1,
    display: 'flex',
    flexDirection: 'column',
    // justifyContent: 'space-between', // This helps distribute space if needed
    height: '100%' // Makes Box fill the container height
  }}>
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center" // Align items vertically in the center
      sx={{ marginBottom: 1 }} // You can adjust the margin as needed
    >
      <Typography variant="h6" component="h2">
        {splitAndCapitalize ( phase )}
      </Typography>

      <StatusIndicator value={status}/>
    </Box>
    {Object.entries ( nameAndActions ).map ( ( [ name, action ] ) =>
      Action ( phase, name, action, state.optJson3 ()?.[ phase ]?.[ name ] ) )}
  </Box>
}

export interface DisplayPhasesProps<S> extends LensProps3<S, PhaseAnd<NameAnd<Action>>, TabPhaseAndActionSelectionState, PhaseAnd<NameAnd<boolean>>, any> {
  Action: ( phase: PhaseName, name: string, action: Action, status: boolean | undefined ) => React.ReactNode
}
export function DisplayPhases<S> ( { state, Action }: DisplayPhasesProps<S> ) {
  const phases: PhaseAnd<NameAnd<Action>> = state.optJson1 () || ({} as any)
  const pStatus: PhaseAnd<NameAnd<boolean>> = state.optJson3 () || ({} as any)
  const ps = phaseStatus ( phases, pStatus )
  let previousPhaseOk: boolean = true
  return <Box sx={{ margin: 2 }}><Grid container spacing={2}>
    {Object.entries ( phases ).map ( ( [ name, actions ] ) => {
      const rawPhaseStatus = ps ( name as PhaseName )
      const thisPhaseStatus = previousPhaseOk === true ? rawPhaseStatus : undefined
      if ( previousPhaseOk === true ) previousPhaseOk = rawPhaseStatus;
      return (
        <Grid item key={name}>
          <DisplayPhase state={state.focus1On ( name as PhaseName )} phase={name as PhaseName} status={thisPhaseStatus} Action={Action}/>
        </Grid>
      );
    } )}
  </Grid></Box>
}

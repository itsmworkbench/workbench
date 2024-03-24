import React from "react";
import { LensProps2 } from "@focuson/state";
import { NameAnd } from "@laoban/utils";
import { PhaseAnd, PhaseName } from "@itsmworkbench/domain";
import { Action, BaseAction, phaseStatus } from "@itsmworkbench/actions";
import { Box, Button, Grid, Typography } from "@mui/material";
import { splitAndCapitalize } from "@itsmworkbench/utils";
import { TabPhaseAndActionSelectionState, workbenchName } from "@itsmworkbench/react_core";
import { Status, StatusIndicator, useActionInEventsFor, useStatus, useTicketType, useVariables } from "@itsmworkbench/components";
import { dereferenceAction } from "@itsmworkbench/actions";
import { TicketType } from "@itsmworkbench/tickettype";

//the first any is actually an Action
export interface ActionButtonProps<S> extends LensProps2<S, any, TabPhaseAndActionSelectionState, any> {
  name: string
  phase: PhaseName
  action: BaseAction
  status: boolean | undefined
}
export function ActionButton<S> ( { name, action, phase, status, state }: ActionButtonProps<S> ) {
  const foundAction = useActionInEventsFor ( phase, name );
  const variables =  useVariables()
  let buttonOnClick = () => {
    console.log ( 'ActionButton - action', foundAction,variables )
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
export interface DisplayPhaseProps {
  ticketType: TicketType
  phase: PhaseName
  status: boolean | undefined
  showStatus?: boolean
  Action: ( phase: PhaseName, name: string, action: Action, status: boolean | undefined ) => React.ReactNode
}

export function DisplayPhase ( { ticketType, phase, status, Action, showStatus }: DisplayPhaseProps ) {

  const nameAndActions: NameAnd<Action> = ticketType?.actions?.[ phase ]
  const statusForActionsinPhase = useStatus ()?.[ phase ]
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

      {showStatus && <StatusIndicator value={status}/>}
    </Box>
    {Object.entries ( nameAndActions || {} ).map ( ( [ name, action ] ) =>
      Action ( phase, name, action, statusForActionsinPhase?.[ name ] ) )}
  </Box>
}
export interface DisplayPhasesForTicketTypeProps extends DisplayPhasesProps {
  ticketType: TicketType | undefined

  pStatus?: Status
}

export function DisplayPhasesForTicketType ( { ticketType, pStatus, Action }: DisplayPhasesForTicketTypeProps ) {
  if ( !ticketType ) return <pre>No ticket type!</pre>
  const phases: PhaseAnd<NameAnd<Action>> = ticketType.actions
  const ps =  phaseStatus ( phases, pStatus )
  let previousPhaseOk: boolean|undefined = true
  return <Box sx={{ margin: 2 }}><Grid container spacing={2}>
    {Object.entries ( phases ||{}).map ( ( [ name, actions ] ) => {
      const rawPhaseStatus = ps ( name as PhaseName )
      const thisPhaseStatus = previousPhaseOk === true ? rawPhaseStatus : undefined
      if ( previousPhaseOk === true ) previousPhaseOk = rawPhaseStatus;
      return (
        <Grid item key={name}>
          <DisplayPhase ticketType={ticketType} phase={name as PhaseName} showStatus={pStatus !== undefined} status={thisPhaseStatus} Action={Action}/>
        </Grid>
      );
    } )}
  </Grid></Box>
}
export interface DisplayPhasesProps {
  Action: ( phase: PhaseName, name: string, action: Action, status: boolean | undefined ) => React.ReactNode
}
export function DisplayPhases ( { Action }: DisplayPhasesProps ) {
  let ticketType = useTicketType ();
  const pStatus: Status = useStatus ()
  return <DisplayPhasesForTicketType ticketType={ticketType} pStatus={pStatus} Action={Action}/>
}

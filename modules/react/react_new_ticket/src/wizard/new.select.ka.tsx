import React from "react";
import { LensProps } from "@focuson/state";
import { NewTicketWizardData } from "./new.ticket.wizard.domain";
import { PreviousNewWizardStepButton } from "./new.ticket.wizard.next.prev";
import { DisplayPhasesForTicketType } from "@itsmworkbench/react_phases";
import { detailsToTicketType, TicketType } from "@itsmworkbench/tickettype";
import { SelectAndLoadFromUrlStore, Status } from "@itsmworkbench/components";
import { IdAnd } from "@itsmworkbench/utils";
import Typography from "@mui/material/Typography";
import { Tooltip } from "@mui/material";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";

export interface NewSelectKaProps<S> extends LensProps<S, NewTicketWizardData, any> {

}

const initialState = detailsToTicketType ( {
  ticketType: 'General',
  approvalState: 'Needs Approval',
  validateInvolvedParties: false
} );
export function NewSelectKa<S> ( { state }: NewSelectKaProps<S> ) {
  const data = state.optJson () || {} as any
  return <div>
    <SelectAndLoadFromUrlStore basicData={{ organisation: 'me', operator: undefined as any }}
                               namespace='ka'
                               Title={<h1>Knowledge Article</h1>}
                               Summary={( ka: IdAnd<TicketType> ) =>
                                 <DisplayPhasesForTicketType ticketType={ka?.item} pStatus={{} as Status} Action={
                                   ( phase, name, action, status ) => <Tooltip title={JSON.stringify ( action )}>
                                     <Typography
                                       component="span"
                                       variant="body1"
                                       sx={{
                                         textDecoration: "underline",
                                         color: "blue",
                                         cursor: "pointer",
                                         '&:hover': {
                                           color: "darkblue",
                                         }
                                       }}
                                     >
                                       {name}
                                     </Typography>
                                   </Tooltip>
                                 }/>}
                               targetPath={'some.target.path'}
                               state={(state as any).focusOn ( 'tt' )}
                               Save={ka => {
                                 const se = {
                                   command: 'addNewTicket',
                                   organisation: 'me',
                                   ...data,
                                   aiAddedVariables: {}
                                 };
                                 return <Button
                                   variant="contained"
                                   color="primary"
                                   disabled={data?.ticketName === undefined || data?.ticketName.length === 0}
                                   endIcon={<SendIcon/>}
                                   // onClick={() => addSe ( se )}
                                 >
                                   Create or Replace Ticket
                                 </Button>;
                               }}/>


    <PreviousNewWizardStepButton state={state.focusOn ( 'currentStep' )}/>
  </div>

}
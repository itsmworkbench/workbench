import React from "react";
import { LensProps } from "@focuson/state";
import { NewTicketWizardData } from "./new.ticket.wizard.domain";
import { NextNewWizardStepButton, PreviousNewWizardStepButton } from "./new.ticket.wizard.next.prev";
import { DisplayPhasesForTicketType } from "@itsmworkbench/react_phases";
import { detailsToTicketType, TicketType } from "@itsmworkbench/tickettype";
import { SelectAndLoadFromUrlStore, Status, useSideEffects } from "@itsmworkbench/components";
import { IdAnd } from "@itsmworkbench/utils";
import Typography from "@mui/material/Typography";
import { Box, Tooltip } from "@mui/material";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import { MultiParagraphText } from "@itsmworkbench/i18n/dist/src/multiple.paragraph.text";

export interface NewSelectKaProps<S> extends LensProps<S, NewTicketWizardData, any> {

}

const initialState = detailsToTicketType ( {
  ticketType: 'General',
  approvalState: 'Needs Approval',
  validateInvolvedParties: false
} );
export function NewSelectKa<S> ( { state }: NewSelectKaProps<S> ) {
  const data = state.optJson () || {} as any
  const addSe = useSideEffects<S> ( state )
  return <div>
    <SelectAndLoadFromUrlStore basicData={{ organisation: 'me', operator: undefined as any }}
                               namespace='ka'
                               Title={<h1>Knowledge Article</h1>}
                               Text={<MultiParagraphText i18nKey={[ "knowledge.article.description", "knowledge.article.kas" ,"knowledge.article.newticket.select"]}/>}
                               TextIfNoKas={<MultiParagraphText i18nKey={[ "knowledge.article.description", "knowledge.article.nokas" ]}/>}
                               Summary={( ka: IdAnd<TicketType> | undefined ) =>
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
                                   ticketType: ka?.item,
                                   aiAddedVariables: {}
                                 };
                                 return (
                                   <Box
                                     display="flex"
                                     justifyContent="center"
                                     alignItems="center"
                                     gap={2} // Adjust the gap as needed
                                   > <PreviousNewWizardStepButton state={state.focusOn ( 'currentStep' )}/>
                                     <NextNewWizardStepButton state={state.focusOn ( 'currentStep' )} title='No existing knowledge Article'/>
                                     <Button
                                       variant="contained"
                                       color="primary"
                                       disabled={ka?.id === undefined || ka?.id?.length === 0 || data?.ticketName === undefined || data?.ticketName.length === 0}
                                       endIcon={<SendIcon/>}
                                       onClick={() => {
                                         return addSe ( se );
                                       }}
                                     >Create or Replace Ticket</Button>
                                   </Box>);
                               }}/>
  </div>

}
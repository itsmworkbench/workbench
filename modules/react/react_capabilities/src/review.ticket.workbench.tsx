import { LensProps2, LensProps3, LensState } from "@focuson/state";
import React from "react";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { DisplayMarkdown, DisplayYaml, FocusedTextArea, SelectAndLoadFromUrlStore, SuccessFailContextFn, useAiVariables, useTicketType, useYaml } from "@itsmworkbench/components";
import { splitAndCapitalize } from "@itsmworkbench/utils";
import { ReviewTicketWorkBenchContext } from "@itsmworkbench/domain";
import { Action } from "@itsmworkbench/actions";
import { Ticket } from "@itsmworkbench/tickets";
import { TicketType } from "@itsmworkbench/tickettype";
import { YamlEditor } from "@itsmworkbench/react_editors";
import SendIcon from "@mui/icons-material/Send";
import { MultiParagraphText } from "@itsmworkbench/i18n";
import CopyToClipboardButton from "@itsmworkbench/components/dist/src/buttons/copy.clipboard.button";


export interface DisplayReviewTicketWorkbenchProps<S> extends LensProps2<S, Ticket, Action, any> {
  SuccessButton: ( context: SuccessFailContextFn ) => React.ReactNode
  FailureButton: ( context: SuccessFailContextFn ) => React.ReactNode
}

export function DisplayReviewTicketWorkbench<S> ( { state, SuccessButton, FailureButton }: DisplayReviewTicketWorkbenchProps<S> ) {
  let actionState: LensState<S, any, any> = state.state2 ();
  let ticket: Ticket = state.state1 ().json ()
  const action: any = (state.optJson2 () || {})
  const attributes = action.attributes || {}
  let yamlCapability = useYaml ();
  const yamlParser = yamlCapability.parser
  const yamlWriter = yamlCapability.writer
  const ai = useAiVariables ()
  const ticktType = useTicketType ()
  const ttVariables = ticktType?.variables || []

  const contextFn = ( yaml: string ): SuccessFailContextFn => ( tab, phase, action, successOrFail ): ReviewTicketWorkBenchContext => ({
    where: { phase, action, tab },
    capability: 'ReviewTicket',
    display: {
      title: splitAndCapitalize ( action ),
      type: 'ReviewTicket',
      successOrFail,
    },
    data: { attributes: yamlParser ( yaml ) as any }
  })

  return <> <Typography variant="h4" gutterBottom>Review Ticket</Typography>
    <Box marginBottom={2}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <MultiParagraphText i18nKey='review.ticket.workbench.text'/>
          {ttVariables.length > 0 && <Typography variant="subtitle1" gutterBottom>The knowledge article you have selected needs these</Typography>}
          <ul>{ttVariables.map ( v => <li key={v}>{v}<CopyToClipboardButton textToCopy={v}/></li> )}</ul>
        </Grid>
        <Grid item xs={12} sm={8}>
          <Box>
            <Typography variant="subtitle1" gutterBottom>Ticket</Typography>
            <DisplayMarkdown md={ticket.description} maxHeight='500px'/>
          </Box>
          <Box>
            <Typography variant="subtitle1" gutterBottom>Attributes (this is Yaml)</Typography>
            <YamlEditor
              yaml={attributes}
              Save={yaml => SuccessButton ( contextFn ( (yaml || '{}').toString () ) )}
              Suggest={setYaml =>
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={<SendIcon/>}
                  onClick={() => ai ( ticket.description ).then ( res => setYaml ( yamlWriter ( res ).toString () ) )}
                >Have AI suggest attributes</Button>}
            />
          </Box>
          {FailureButton ( contextFn ( '' ) )}
        </Grid>
      </Grid>
    </Box>
  </>
}



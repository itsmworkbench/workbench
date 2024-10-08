import { LensProps2, LensState } from "@focuson/state";
import React from "react";
import { Box, Button, Grid, Typography } from "@mui/material";
import { DisplayMarkdown, IProcessEventSideEffectFn, SuccessFailContextFn, SuccessFailureButton, useAI, useTicketType, useYaml } from "@itsmworkbench/components";
import { splitAndCapitalize } from "@itsmworkbench/utils";
import { ReviewTicketWorkBenchContext } from "@itsmworkbench/domain";
import { Action } from "@itsmworkbench/actions";
import { Ticket } from "@itsmworkbench/tickets";
import { YamlEditor } from "@itsmworkbench/react_editors";
import SendIcon from "@mui/icons-material/Send";
import { MultiParagraphText } from "@itsmworkbench/i18n";
import { DisplayInfoVariables } from "@itsmworkbench/react_displayinfo";
import { yamlWriterToStringWithErrorsEmbedded } from "@itsmworkbench/yaml";
import { AI } from "@itsmworkbench/ai";


export interface DisplayReviewTicketWorkbenchProps<S> extends LensProps2<S, Ticket, Action, any> {
  processSe: IProcessEventSideEffectFn

}

export function DisplayReviewTicketWorkbench<S> ( { state, processSe }: DisplayReviewTicketWorkbenchProps<S> ) {
  let actionState: LensState<S, any, any> = state.state2 ();
  let ticket: Ticket = state.state1 ().json ()
  const action: any = (state.optJson2 () || {})
  const attributes = action.attributes || {}
  let yamlCapability = useYaml ();
  const [ yaml, setYaml ] = React.useState<string | undefined> ( yamlWriterToStringWithErrorsEmbedded ( yamlCapability.writer ) ( attributes ) )
  const yamlParser = yamlCapability.parser
  const yamlWriter = yamlCapability.writer
  const ai: AI = useAI ()
  let ticketType = useTicketType ();
  const hasKa = ticketType?.id !== undefined
  const textKey = hasKa ? 'review.ticket.workbench.haska.text' : 'review.ticket.workbench.noka.text'

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

  function callAi () {
    if ( hasKa ) {
      let needed = ticketType?.variables || [];
      let ticketVariables = ticket?.attributes || {};
      let withoutTicket = needed.filter ( v => !ticketVariables[ v ] );
      return ai.knownVariables ( ticket.description, withoutTicket )
    } else
      return ai.variables ( ticket.description );
  }
  return <> <Typography variant="h4" gutterBottom>Review Ticket</Typography>
    <Box marginBottom={2}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <MultiParagraphText i18nKey={textKey}/>
          {hasKa && <DisplayInfoVariables ticket={ticket} variables={yamlParser ( yaml || '{}' ) as any}/>}
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
              Save={yaml =>
                <SuccessFailureButton processSe={processSe(state.state1())} title='The attributes look good for now' successOrFail={true} context={contextFn ( (yaml || '{}').toString () )}/>}
              onChange={setYaml}
              Suggest={setEditorYaml =>
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={<SendIcon/>}
                  onClick={() => callAi ().then ( res => {
                    let newYaml = yamlWriter ( res ).toString ();
                    setYaml ( newYaml )
                    return setEditorYaml ( newYaml );
                  } )}
                >Have AI suggest attributes</Button>}
            />
          </Box>
          <SuccessFailureButton processSe={processSe(state.state1())} title='This ticket needs more work' successOrFail={false} context={contextFn ( '{}' )}/>
        </Grid>
      </Grid>
    </Box>
  </>
}



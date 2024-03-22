import { LensProps2, LensState } from "@focuson/state";
import React from "react";
import { SelectAndLoadFromUrlStore, SuccessFailContextFn, useTicketType } from "@itsmworkbench/components";
import { IdAnd, splitAndCapitalize } from "@itsmworkbench/utils";
import { TicketType } from "@itsmworkbench/tickettype";
import { SelectKnowledgeArticleWorkBenchContext } from "@itsmworkbench/domain";
import { Action } from "@itsmworkbench/actions";
import { MultiParagraphText } from "@itsmworkbench/i18n";
import { Tooltip, Typography } from "@mui/material";
import { parseIdentityUrlOrThrow } from "@itsmworkbench/url";
import { DisplayPhasesForTicketType } from "@itsmworkbench/react_phases";


//bit hacky... need to clean this up
export interface DisplaySelectKnowledgeArticleWorkbenchProps<S> extends LensProps2<S, Action, IdAnd<TicketType>, any> {
  targetPath: string
  SuccessButton: ( context: SuccessFailContextFn ) => React.ReactNode
  FailureButton: ( context: SuccessFailContextFn ) => React.ReactNode
}

export function DisplaySelectKnowledgeArticleWorkbench<S> ( { state, SuccessButton, FailureButton, targetPath }: DisplaySelectKnowledgeArticleWorkbenchProps<S> ) {
  const action: any = (state.optJson1 () || {})
  const appTT = useTicketType ()
  const ticketType: TicketType = action.ticketType || {}
  const actionState = state.state1 () as LensState<S, any, any>

  return <>
    <SelectAndLoadFromUrlStore basicData={{ organisation: 'me', operator: undefined as any }}
                               namespace='ka'
                               Title={<h1>Knowledge Article</h1>}
                               Text={<MultiParagraphText i18nKey={[ "knowledge.article.description", "knowledge.article.kas" ]}/>}
                               TextIfNoKas={<MultiParagraphText i18nKey={[ "knowledge.article.description", "knowledge.article.nokas" ]}/>}
                               Summary={ka => <DisplayPhasesForTicketType ticketType={ka?.item} Action={
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
                               Save={idAndTicketType => {
                                 const contextFn: SuccessFailContextFn = ( tab, phase, action, successOrFail ): SelectKnowledgeArticleWorkBenchContext => ({
                                   where: { phase, action, tab },
                                   capability: 'SelectKnowledgeArticle',
                                   display: {
                                     title: splitAndCapitalize ( action ),
                                     type: 'SelectKnowledgeArticle',
                                     successOrFail,
                                   },
                                   data: {
                                     id: parseIdentityUrlOrThrow ( idAndTicketType?.id || '' ),
                                     ticketType: {id: idAndTicketType?.id, name: idAndTicketType.name, ...(idAndTicketType?.item || {})},
                                   }
                                 })
                                 return SuccessButton ( contextFn )
                               }
                               }
                               targetPath={targetPath}
                               state={state.state2 ()}/>

  </>
}



import React from "react";
import { LensProps, LensState2 } from "@focuson/state";
import { DebugState } from "@itsmworkbench/react_core";
import { DisplayJson, SimpleTabPanel, TabPanelDetails, TabsContainer } from "@itsmworkbench/components";
import { toArray } from "@laoban/utils";

export interface DevModeProps<S> extends LensProps<S, DebugState, any> {
  maxHeight?: string
  maxWidth?: string
  titles: string[]
  forTicket: string[]
  tempData: string[]
}
function makeDevPanels ( titles: string[], keyPrefix: string, maxWidth: string | undefined, maxHeight: string | undefined, main: any ) {
  if ( main === undefined ) return []
  return toArray ( titles ).map ( t => <SimpleTabPanel key={keyPrefix + t} title={t}><DisplayJson maxWidth={maxWidth} maxHeight={maxHeight} json={main?.[ t ]}/></SimpleTabPanel> );
}
export function DevMode<S> ( { state, titles, forTicket, tempData, maxHeight, maxWidth }: DevModeProps<S> ) {
  const main: any = state.main;
  const full = <SimpleTabPanel key='full' title='Full'><DisplayJson maxWidth={maxWidth} maxHeight={maxHeight} json={main}/></SimpleTabPanel>
  const titlePanels = makeDevPanels ( titles, 'titles.', maxWidth, maxHeight, main )
  const forTicketPanels = makeDevPanels ( forTicket, 'forTicket.', maxWidth, maxHeight, main?.forTicket )
  const tempDataPanels = makeDevPanels ( tempData, 'temp.', maxWidth, maxHeight, main?.forTicket?.tempData )
  const panels = [ full,...titlePanels, ...forTicketPanels, ...tempDataPanels ]
  console.log ( 'panels', panels.length, panels.map ( p => p.props.title ) )
  const tabState: LensState2<S, DebugState, any, any> = state.doubleUp ().focus2On ( 'selectedDebugTab' ); //the first any should be a string, but the type system is struggling
  return <TabsContainer label='Dev mode data' state={tabState} children={panels}/>
}

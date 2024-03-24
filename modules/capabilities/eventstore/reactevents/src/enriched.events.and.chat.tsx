import React from "react";
import { LensProps3 } from "@focuson/state";
import { Conversation } from "@itsmworkbench/domain";
import { SideEffect } from "@itsmworkbench/react_core";
import { MainAndTypingLayout } from "@itsmworkbench/components";
import { EnrichedEvent } from "@itsmworkbench/events";
import { DisplayEnrichedEventPlugIn, DisplayEnrichedEventsUsingPlugin } from "./display.enriched.event.plugin";
import { ConversationPlugin, DisplayChatArea, UserTypingBox } from "@itsmworkbench/react_conversation";

export interface EnrichedEventsAndChatProps<S> extends LensProps3<S, Conversation, EnrichedEvent<any, any>[], SideEffect[], any> {
  eventPlugins: DisplayEnrichedEventPlugIn<S>[]
  plugins: ConversationPlugin<S>[]
  plusMenu?: React.ReactElement
  devMode?: boolean
}
export function EnrichedEventsAndChat<S> ( { state, plugins, eventPlugins, plusMenu, devMode }: EnrichedEventsAndChatProps<S> ) {
  return <MainAndTypingLayout
    Main={<DisplayEnrichedEventsUsingPlugin plugins={eventPlugins} devMode={devMode} state={state.state2 ()}/>}
    Typing={
      <><DisplayChatArea plugins={plugins} state={state.state12 ()} def={
        <UserTypingBox state={state.state13 ().focus1On ( 'chat' ).focus1On ( 'data' )} from='me' plusMenu={plusMenu}/>}/>
      </>}
  />
}


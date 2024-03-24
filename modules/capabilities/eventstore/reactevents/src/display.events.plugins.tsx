import { LensProps, LensState } from "@focuson/state";
import { ActionPluginDetails } from "@itsmworkbench/react_core";
import React from "react";
import { DisplayEnrichedEventPlugIn, DisplayEnrichedEventsUsingPlugin } from "./display.enriched.event.plugin";
import { EnrichedEvent, Event } from "@itsmworkbench/events";
import { DisplayEvents } from "./display.events";
import { EnrichedEventsAndChat, EnrichedEventsAndChatProps } from "./enriched.events.and.chat";
import { ConversationPlugin } from "@itsmworkbench/react_conversation/dist/src/conversation/conversation.plugin";

export const displayEnrichedEventsWithPlugins =
               <S, > ( devMode: boolean | undefined, plugins: DisplayEnrichedEventPlugIn<S>[] ) =>
                 ( props: <State, >( s: LensState<State, S, any> ) => LensProps<S, EnrichedEvent<any, any>[], any> ): ActionPluginDetails<S, LensProps<S, EnrichedEvent<any, any>[], any>> =>
                   ({
                     by: "events",
                     props,
                     render: ( props ) => <DisplayEnrichedEventsUsingPlugin {...props} devMode={devMode} plugins={plugins}/>
                   });

export const debugEventsPlugin = <S, > ( props: <State, >( s: LensState<State, S, any> ) => LensProps<S, Event[], any> ): ActionPluginDetails<S, LensProps<S, Event[], any>> =>
  ({
    by: "debugEvents",
    props,
    render: ( props ) => <DisplayEvents {...props} />
  })
export const debugEnrichedEventsPlugin = <S, > ( devMode: boolean | undefined, plugins: DisplayEnrichedEventPlugIn<S>[] ) =>
  ( props: <State, >( s: LensState<State, S, any> ) => LensProps<S, EnrichedEvent<any, any>[], any> ): ActionPluginDetails<S, LensProps<S, EnrichedEvent<any, any>[], any>> =>
    ({
      by: "debugEnrichedEvents",
      props,
      render: ( props ) => <DisplayEnrichedEventsUsingPlugin {...props} devMode={devMode} plugins={plugins}/>
    })
export const enrichedDisplayAndChatPlugin = <S, > (
  eventPlugins: DisplayEnrichedEventPlugIn<S>[],
  plugins: ConversationPlugin<S>[],
  plusMenu?: React.ReactElement,
  devMode?: boolean
) => ( props: <State, >( s: LensState<State, S, any> ) => EnrichedEventsAndChatProps<S> ): ActionPluginDetails<S, EnrichedEventsAndChatProps<S>> => ({
  by: "chat",
  props,
  render: ( props ) => <EnrichedEventsAndChat {...props} />

})
export const displayEventPlugins = <S, > ( devMode: boolean | undefined, eventPlugins: DisplayEnrichedEventPlugIn<S>[], conversationPlugins: ConversationPlugin<S>[], plusMenu: React.ReactElement ) => [
  debugEventsPlugin,
  debugEnrichedEventsPlugin ( devMode, eventPlugins ),
  displayEnrichedEventsWithPlugins ( devMode, eventPlugins ),
  enrichedDisplayAndChatPlugin ( eventPlugins, conversationPlugins, plusMenu, devMode )
]
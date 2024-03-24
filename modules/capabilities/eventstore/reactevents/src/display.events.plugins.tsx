import { LensProps, LensState } from "@focuson/state";
import { ActionPlugIn, ActionPluginDetails } from "@itsmworkbench/react_core";
import React from "react";
import { DisplayEnrichedEventPlugIn, DisplayEnrichedEventsUsingPlugin } from "./display.enriched.event.plugin";
import { EnrichedEvent, Event } from "@itsmworkbench/events";
import { DisplayEvents } from "./display.events";
import { EnrichedEventsAndChat, EnrichedEventsAndChatProps } from "./enriched.events.and.chat";
import { ConversationPlugin } from "@itsmworkbench/react_conversation";

export const displayEnrichedEventsWithPlugins =
               <S, > ( devMode: ( s: S ) => boolean | undefined, plugins: DisplayEnrichedEventPlugIn<S>[] ): ActionPlugIn<S, LensProps<S, EnrichedEvent<any, any>[], any>> =>
                 ( props: <State, >( s: LensState<State, S, any> ) => LensProps<S, EnrichedEvent<any, any>[], any> ): ActionPluginDetails<S, LensProps<S, EnrichedEvent<any, any>[], any>> =>
                   ({
                     by: "events",
                     props,
                     render: ( s, props ) => <DisplayEnrichedEventsUsingPlugin {...props} devMode={devMode ( s )} plugins={plugins}/>
                   });

export const debugEventsPlugin = <S, > ( props: <State, >( s: LensState<State, S, any> ) => LensProps<S, Event[], any> ): ActionPluginDetails<S, LensProps<S, Event[], any>> =>
  ({
    by: "debugEvents",
    props,
    render: ( _, props ) => <DisplayEvents {...props} />
  })


export const debugEnrichedEventsPlugin = <S, > ( devMode: ( s: S ) => boolean | undefined, plugins: DisplayEnrichedEventPlugIn<S>[] ): ActionPlugIn<S, LensProps<S, EnrichedEvent<any, any>[], any>> =>
  ( props: <State, >( s: LensState<State, S, any> ) => LensProps<S, EnrichedEvent<any, any>[], any> ): ActionPluginDetails<S, LensProps<S, EnrichedEvent<any, any>[], any>> =>
    ({
      by: "debugEnrichedEvents",
      props,
      render: ( s: S, props ) => <DisplayEnrichedEventsUsingPlugin {...props} devMode={devMode ( s )} plugins={plugins}/>
    })
export const enrichedDisplayAndChatPlugin = <S, > (
  eventPlugins: DisplayEnrichedEventPlugIn<S>[],
  plugins: ConversationPlugin<S>[],
  plusMenu?: React.ReactElement,
  devMode?: ( s: S ) => boolean | undefined
): ActionPlugIn<S, EnrichedEventsAndChatProps<S>> => ( props: <State, >( s: LensState<State, S, any> ) => EnrichedEventsAndChatProps<S> ): ActionPluginDetails<S, EnrichedEventsAndChatProps<S>> => ({
  by: "chat",
  props,
  render: ( s: S, props ) =>
    <EnrichedEventsAndChat {...props} eventPlugins={eventPlugins} plugins={plugins} plusMenu={plusMenu} devMode={devMode ( s )}/>
})
export function displayEventPlugins<S> ( devMode: ( s: S ) => boolean | undefined, eventPlugins: DisplayEnrichedEventPlugIn<S>[], conversationPlugins: ConversationPlugin<S>[], plusMenu: React.ReactElement ): ActionPlugIn<S, any>[] {
  return [
    debugEventsPlugin<S>,
    debugEnrichedEventsPlugin ( devMode, eventPlugins ),
    displayEnrichedEventsWithPlugins ( devMode, eventPlugins ),
    enrichedDisplayAndChatPlugin ( eventPlugins, conversationPlugins, plusMenu, devMode )
  ];
}
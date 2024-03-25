import { LensProps, LensState } from "@focuson/state";
import { ActionPlugIn, ActionPluginDetails, SideEffect } from "@itsmworkbench/react_core";
import React from "react";
import { DisplayEnrichedEventPlugIn, DisplayEnrichedEventsUsingPlugin } from "./display.enriched.event.plugin";
import { EnrichedEvent, Event } from "@itsmworkbench/events";
import { DisplayEvents } from "./display.events";
import { EnrichedEventsAndChat, EnrichedEventsAndChatProps } from "./enriched.events.and.chat";
import { ConversationPlugin } from "@itsmworkbench/react_conversation";
import { Lens, Optional } from "@focuson/lens";
import { Conversation } from "@itsmworkbench/domain";

export const displayEnrichedEventsWithPlugins =
               <S, State> ( devMode: ( s: State ) => boolean | undefined, plugins: DisplayEnrichedEventPlugIn<S>[] ): ActionPlugIn<S, State, LensProps<S, EnrichedEvent<any, any>[], any>> =>
                 ( props: ( s: LensState<S, State, any> ) => LensProps<S, EnrichedEvent<any, any>[], any> ): ActionPluginDetails<S, State, LensProps<S, EnrichedEvent<any, any>[], any>> =>
                   ({
                     by: "events",
                     props,
                     render: ( s, props ) => <DisplayEnrichedEventsUsingPlugin {...props} devMode={devMode ( s )} plugins={plugins}/>
                   });

export const debugEventsPlugin = <S, State> (): ActionPlugIn<S, State, LensProps<S, Event[], any>> =>
  ( props: ( s: LensState<S, State, any> ) => LensProps<S, Event[], any> ): ActionPluginDetails<S, State, LensProps<S, Event[], any>> =>
    ({
      by: "debugEvents",
      props,
      render: ( _, props ) => <DisplayEvents {...props} />
    })


export const debugEnrichedEventsPlugin = <S, State> ( devMode: ( s: State ) => boolean | undefined, plugins: DisplayEnrichedEventPlugIn<S>[] ): ActionPlugIn<S, State, LensProps<S, EnrichedEvent<any, any>[], any>> =>
  ( props: ( s: LensState<S, State, any> ) => LensProps<S, EnrichedEvent<any, any>[], any> ): ActionPluginDetails<S, State, LensProps<S, EnrichedEvent<any, any>[], any>> =>
    ({
      by: "debugEnrichedEvents",
      props,
      render: ( s: State, props ) => <DisplayEnrichedEventsUsingPlugin {...props} devMode={devMode ( s )} plugins={plugins}/>
    })
export const enrichedDisplayAndChatPlugin = <S, State> (): ActionPlugIn<S, State, EnrichedEventsAndChatProps<S>> =>
  ( props: ( s: LensState<S, State, any> ) => EnrichedEventsAndChatProps<S> ): ActionPluginDetails<S, State, EnrichedEventsAndChatProps<S>> => ({
    by: "chat",
    props,
    render: ( s: State, props ) =>
      <EnrichedEventsAndChat {...props} />
  })

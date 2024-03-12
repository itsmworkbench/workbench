import React from 'react';
import ReactDOM from 'react-dom/client';
import { lensState } from "@focuson/state";

import { addEventStoreListener, addEventStoreModifier, eventStore, polling, setEventStoreValue, startPolling } from "@itsmworkbench/eventstore";
import { apiIdStore, apiLoading, ApiLoading, sendEvents, SendEvents, } from "@itsmworkbench/apiclienteventstore";
import { defaultEventProcessor, Event, processEvents } from "@itsmworkbench/events";

import { eventSideeffectProcessor, processSideEffect, processSideEffectsInState } from '@itsmworkbench/react_core';
import { App } from './gui/app';
import { defaultNameSpaceDetails, defaultParserStore, InitialLoadDataResult, loadInitialData } from "@itsmworkbench/defaultdomains";
import { eventsL, ItsmState, logsL, newTicketL, setPageL, sideEffectsL, startAppState, ticketIdL, ticketVariablesL } from "./state/itsm.state";
import { YamlCapability } from '@itsmworkbench/yaml';
import { jsYaml } from '@itsmworkbench/jsyaml';
import { UrlStoreApiClientConfig, urlStoreFromApi } from "@itsmworkbench/urlstoreapi";
import { addAiTicketSideeffectProcessor, addNewTicketSideeffectProcessor } from "@itsmworkbench/react_new_ticket";
import { hasErrors, mapK, value } from "@laoban/utils";
import { defaultEventEnricher, EnrichedEvent, enrichEvent } from "@itsmworkbench/enrichedevents";
import { displayTicketEventPlugin } from '@itsmworkbench/react_ticket';
import { displayTicketTypeEventPlugin } from '@itsmworkbench/react_tickettype';
import { displayMessageEventPlugin } from "@itsmworkbench/react_chat";
import { displayVariablesEventPlugin } from "@itsmworkbench/react_variables";
import { apiClientForTicketVariables } from "@itsmworkbench/apiclient_ticketvariables";


const rootElement = document.getElementById ( 'root' );
if ( !rootElement ) throw new Error ( 'Failed to find the root element' );
const root = ReactDOM.createRoot ( rootElement );

const yaml: YamlCapability = jsYaml ()
const apiDetails: ApiLoading = apiLoading ( "http://localhost:1235/url/" )
const aiDetails: ApiLoading = apiLoading ( "http://localhost:1235/ai/" )
const saveDetails: SendEvents = sendEvents ( "http://localhost:1235/file1" )
const idStoreDetails = apiIdStore ( "http://localhost:1235", defaultParserStore ( yaml ) )
const urlStoreconfig: UrlStoreApiClientConfig = { apiUrlPrefix: "http://localhost:1235/url", details: defaultNameSpaceDetails ( yaml ) }
const urlStore = urlStoreFromApi ( urlStoreconfig )

const container = eventStore<ItsmState> ()
const setJson = setEventStoreValue ( container );
const sep1 = defaultEventProcessor<ItsmState> ( '', startAppState, urlStore.loadIdentity )

addEventStoreListener ( container, (( oldS, s, setJson ) =>
  root.render ( <App
    state={lensState ( s, setJson, 'Container', {} )}
    plugins={[]}
    eventPlugins={[
      displayTicketEventPlugin<ItsmState> (),
      displayVariablesEventPlugin<ItsmState> (),
      displayTicketTypeEventPlugin<ItsmState> (),
      displayMessageEventPlugin<ItsmState> () ]}
    // plugins={[ operatorConversationPlugin ( operatorL ) ]}
  /> )) );

const enricher = defaultEventEnricher ( urlStore )

const pollingDetails = polling<Event[]> ( 1000, () => container.state.selectionState.ticketId,
  async ( poll, offset ) => await urlStore.loadNamed ( poll, offset ),
  async ( events: Event[] ) => {
    if ( events.length === 0 ) return
    console.log ( 'polling', typeof events, events )
    const { state: state, errors } = await processEvents ( sep1, container.state, events )
    const enrichedEvents: EnrichedEvent<any, any>[] = await mapK<Event, EnrichedEvent<any, any>> ( events, enrichEvent ( enricher ) )
    console.log ( 'errors', errors )
    console.log ( 'state', state )
    if ( state ) {
      const newState: ItsmState = {
        ...state, variables: {},
        events: {
          events: [ ...(state.events.events), ...events ],
          enrichedEvents: [ ...(state.events.enrichedEvents), ...enrichedEvents ]
        }
      }
      setJson ( newState )
    }
  }, 0, true
)

const ai = apiClientForTicketVariables ( aiDetails )

addEventStoreModifier ( container,
  processSideEffectsInState<ItsmState> (
    processSideEffect ( [
      eventSideeffectProcessor ( urlStore.save, 'me', ticketIdL ),
      addAiTicketSideeffectProcessor ( ai, ticketVariablesL ),
      addNewTicketSideeffectProcessor ( urlStore.save, setPageL, eventsL, ticketIdL, newTicketL, 'ticket' )
    ] ),
    sideEffectsL, logsL ) )


loadInitialData ( urlStore ).then ( async ( initialDataResult: InitialLoadDataResult ) => {
  const operatorResult = hasErrors ( initialDataResult.operator ) ? undefined : value ( initialDataResult.operator )
  //OK this is a mess. Need to think about how to do operator...
  let ticketList = value ( initialDataResult.ticketList ) as any;
  const withInitialData: ItsmState = {
    ...startAppState,
    blackboard: {
      operator: operatorResult?.result || { name: 'Phil', email: 'phil@example.com' }
    } as any,
    ticketList
  }
  setJson ( withInitialData )
  startPolling ( pollingDetails )
} )

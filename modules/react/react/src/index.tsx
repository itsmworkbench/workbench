import React from 'react';
import ReactDOM from 'react-dom/client';
import { lensState } from "@focuson/state";

import { addEventStoreListener, addEventStoreModifier, eventStore, polling, setEventStoreValue, startPolling } from "@itsmworkbench/eventstore";
import { apiIdStore, apiLoading, ApiLoading, sendEvents, SendEvents, } from "@itsmworkbench/apiclienteventstore";
import { defaultEventProcessor, Event, processEvents } from "@itsmworkbench/events";

import { eventSideeffectProcessor, processSideEffect, processSideEffectsInState } from '@itsmworkbench/react_core';
import { App } from './gui/app';
import { defaultNameSpaceDetails, defaultParserStore, InitialLoadDataResult, loadInitialData } from "@itsmworkbench/defaultdomains";
import { eventsL, ItsmState, logsL, setPageL, sideEffectsL, startAppState, ticketIdL } from "./state/itsm.state";
import { YamlCapability } from '@itsmworkbench/yaml';
import { jsYaml } from '@itsmworkbench/jsyaml';
import { UrlStoreApiClientConfig, urlStoreFromApi } from "@itsmworkbench/urlstoreapi";
import { addNewTicketSideeffectProcessor } from "@itsmworkbench/react_new_ticket";
import { hasErrors, value } from "@laoban/utils";


const rootElement = document.getElementById ( 'root' );
if ( !rootElement ) throw new Error ( 'Failed to find the root element' );
const root = ReactDOM.createRoot ( rootElement );

const yaml: YamlCapability = jsYaml ()
const apiDetails: ApiLoading = apiLoading ( "http://localhost:1235/url/" )
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
    // plugins={[ operatorConversationPlugin ( operatorL ) ]}
  /> )) );

const pollingDetails = polling<Event[]> ( 1000, () => container.state.selectionState.ticketId,
  async ( poll, offset ) => await urlStore.loadNamed ( poll, offset ),
  async ( events: Event[] ) => {
    console.log ( 'polling', typeof events, events )
    const { state: state, errors } = await processEvents ( sep1, container.state, events )
    console.log ( 'errors', errors )
    console.log ( 'state', state )
    if ( state ) {
      // const result = extractVariablesForAllDomain ( defaultVariablesExtractor ( yaml ),
      //   { name: 'Phil', email: 'phil@example.com' })
      const newState = { ...state, variables: {}, events: [ ...(state.events), ...events ] }
      // console.log ( 'result with variables', result )
      setJson ( newState )
    }
  }, 0, true
)


addEventStoreModifier ( container,
  processSideEffectsInState<ItsmState> (
    processSideEffect ( [
      eventSideeffectProcessor ( saveDetails, 'conversation.messages' ),
      addNewTicketSideeffectProcessor ( urlStore.save, setPageL, eventsL, ticketIdL, 'ticket' )
    ] ),
    sideEffectsL, logsL ) )


loadInitialData ( urlStore ).then ( async ( initialDataResult: InitialLoadDataResult ) => {
  const operatorResult = hasErrors ( initialDataResult.operator ) ? undefined : value ( initialDataResult.operator )
  //OK this is a mess. Need to think about how to do operator...
  const withInitialData: ItsmState = {
    ...startAppState, blackboard: {
      operator: operatorResult?.result || { name: 'Phil', email: 'phil@example.com' }
    },
    ticketList: value(initialDataResult.ticketList) as any
  }
  setJson ( withInitialData )
  startPolling ( pollingDetails )
} )

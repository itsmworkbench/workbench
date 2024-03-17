import React from 'react';
import ReactDOM from 'react-dom/client';
import { lensState } from "@focuson/state";

import { addEventStoreListener, addEventStoreModifier, eventStore, polling, setEventStoreValue, startPolling } from "@itsmworkbench/eventstore";
import { apiIdStore, apiLoading, ApiLoading, sendEvents, SendEvents, } from "@itsmworkbench/apiclienteventstore";
import { defaultEventProcessor, Event, processEvents } from "@itsmworkbench/events";

import { eventSideeffectProcessor, processSideEffect, processSideEffectsInState } from '@itsmworkbench/react_core';
import { App } from './gui/app';
import { defaultNameSpaceDetails, defaultParserStore, InitialLoadDataResult, loadInitialData } from "@itsmworkbench/defaultdomains";
import { emailDataL, enrichedEventsO, eventsL, ItsmState, logsL, newTicketL, sideEffectsL, startAppState, tabsL, ticketIdL, ticketVariablesL } from "./state/itsm.state";
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
import { apiClientForEmail, apiClientForTicketVariables } from "@itsmworkbench/apiclient_ai";
import { addAiEmailSideEffectProcessor, addSaveKnowledgeArticleSideEffect, displayEmailEventPlugin, displayLdapEventPlugin, displayReceiveEmailEventPlugin, displaySqlEventPlugin } from '@itsmworkbench/react_capabilities';
import { UrlStoreProvider } from '@itsmworkbench/components';


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
  root.render ( <UrlStoreProvider urlStore={urlStore}><App
    state={lensState ( s, setJson, 'Container', {} )}
    plugins={[]}
    eventPlugins={[
      displayTicketEventPlugin<ItsmState> (),
      displaySqlEventPlugin<ItsmState> (),
      displayEmailEventPlugin<ItsmState> (),
      displayLdapEventPlugin<ItsmState> (),
      displayReceiveEmailEventPlugin<ItsmState> (),
      displayVariablesEventPlugin<ItsmState> (),
      displayTicketTypeEventPlugin<ItsmState> (),
      displayMessageEventPlugin<ItsmState> () ]}
    // plugins={[ operatorConversationPlugin ( operatorL ) ]}
  /></UrlStoreProvider> )) );

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
      const withEvents = eventsL.map ( state, old => [ ...(old || []), ...events ] )
      const newState = enrichedEventsO.map ( withEvents, old => [ ...(old || []), ...enrichedEvents ] )
      setJson ( newState )
    }
  }, 0, true
)

const aiVariables = apiClientForTicketVariables ( aiDetails )
const aiEmails = apiClientForEmail ( aiDetails )

addEventStoreModifier ( container,
  processSideEffectsInState<ItsmState> (
    processSideEffect ( [
      eventSideeffectProcessor ( urlStore.save, 'me', ticketIdL ),
      addAiTicketSideeffectProcessor ( aiVariables, ticketVariablesL ),
      addAiEmailSideEffectProcessor ( aiEmails, emailDataL ),
      addSaveKnowledgeArticleSideEffect ( urlStore.save, 'me' ),
      // addLoadKaSideEffect ( urlStore.loadNamed, newTicketL.focusOn ( 'ticketDetails' ) ),
      addNewTicketSideeffectProcessor ( urlStore.save, tabsL, eventsL, ticketIdL, newTicketL, 'ticket' )
    ] ),
    sideEffectsL, logsL ) )


loadInitialData ( urlStore ).then ( async ( initialDataResult: InitialLoadDataResult ) => {
  const operatorResult = hasErrors ( initialDataResult.operator ) ? undefined : value ( initialDataResult.operator )
  //OK this is a mess. Need to think about how to do operator...
  let ticketList = value ( initialDataResult.ticketList ) as any;
  let kaList = value ( initialDataResult.kaList ) as any;
  let operator = operatorResult?.result || { name: 'Phil', email: 'phil@example.com' };
  const withInitialData: ItsmState = {
    ...startAppState,
    basicData: { operator, organisation: 'me' },
    ticketList,
    kaList
  }
  setJson ( withInitialData )
  startPolling ( pollingDetails )
} )

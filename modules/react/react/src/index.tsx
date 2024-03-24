import React from 'react';
import ReactDOM from 'react-dom/client';
import { lensState } from "@focuson/state";

import { addEventStoreListener, addEventStoreModifier, eventStore, polling, setEventStoreValue, startPolling } from "@itsmworkbench/eventstore";
import { apiLoading, ApiLoading, } from "@itsmworkbench/apiclienteventstore";
import { defaultEventEnricher, defaultEventProcessor, EnrichedEvent, enrichEvent, Event, processEvents } from "@itsmworkbench/events";

import { ActionPlugIn, ActionPluginDetails, eventSideeffectProcessor, processSideEffect, processSideEffectsInState } from '@itsmworkbench/react_core';
import { App } from './gui/app';
import { defaultNameSpaceDetails, InitialLoadDataResult, loadInitialData } from "@itsmworkbench/defaultdomains";
import { emailDataL, enrichedEventsO, eventsL, forTicketO, ItsmState, logsL, newTicketL, sideEffectsL, startAppState, tabsL, ticketIdL, ticketListO, ticketVariablesL } from "./state/itsm.state";
import { YamlCapability } from '@itsmworkbench/yaml';
import { jsYaml } from '@itsmworkbench/jsyaml';
import { UrlStoreApiClientConfig, urlStoreFromApi } from "@itsmworkbench/browserurlstore";
import { hasErrors, mapK, value } from "@laoban/utils";
import { addAiTicketSideeffectProcessor, addNewTicketSideeffectProcessor, displayTicketEventPlugin } from '@itsmworkbench/reactticket';
import { addSaveKnowledgeArticleSideEffect, displayTicketTypeEventPlugin } from '@itsmworkbench/reacttickettype';

import { displayVariablesEventPlugin } from "@itsmworkbench/react_variables";
import { apiClientForEmail, apiClientForTicketVariables } from "@itsmworkbench/apiclient_ai";
import { displayLdapEventPlugin, displayLdapPlugin, displayReceiveEmailEventPlugin, displayReceiveEmailPlugin } from '@itsmworkbench/react_capabilities';
import { AiEmailProvider, AiVariablesProvider, MailerProvider, SelectionProvider, SqlerProvider, UrlStoreProvider, YamlProvider } from '@itsmworkbench/components';
import { apiClientMailer } from "@itsmworkbench/browsermailer";
import { apiClientSqler } from "@itsmworkbench/browsersql";
import { displaySqlEventPlugin } from '@itsmworkbench/reactsql';
import { addAiMailerSideEffectProcessor, displayEmailEventPlugin, displayMailerPlugin } from '@itsmworkbench/reactmailer';
import { displayMessageEventPlugin } from "@itsmworkbench/reactevents";
import { displayEventPlugins } from "@itsmworkbench/reactevents/dist/src/display.events.plugins";


const rootElement = document.getElementById ( 'root' );
if ( !rootElement ) throw new Error ( 'Failed to find the root element' );
const root = ReactDOM.createRoot ( rootElement );

const yaml: YamlCapability = jsYaml ()
let rootUrl = "http://localhost:1235/";
const aiDetails: ApiLoading = apiLoading ( rootUrl + "ai/" )
const nameSpaceDetails = defaultNameSpaceDetails ( yaml, {} );
const urlStoreconfig: UrlStoreApiClientConfig = { apiUrlPrefix: rootUrl + "url", details: nameSpaceDetails }
const urlStore = urlStoreFromApi ( urlStoreconfig )
const aiVariables = apiClientForTicketVariables ( aiDetails )
const aiEmails = apiClientForEmail ( aiDetails )

const container = eventStore<ItsmState> ()
const setJson = setEventStoreValue ( container );
const sep1 = defaultEventProcessor<ItsmState> ( '', startAppState, urlStore.loadIdentity )


const eventPlugins = [
  displayTicketEventPlugin<ItsmState> (),
  displaySqlEventPlugin<ItsmState> (),
  displayEmailEventPlugin<ItsmState> (),
  displayLdapEventPlugin<ItsmState> (),
  displayReceiveEmailEventPlugin<ItsmState> (),
  displayVariablesEventPlugin<ItsmState> (),
  displayTicketTypeEventPlugin<ItsmState> (),
  displayMessageEventPlugin<ItsmState> () ];


const displPlugins: ActionPlugIn<ItsmState, any>[] = [
  ...displayEventPlugins<ItsmState> ( ( s: ItsmState ) => s?.debug?.showDevMode, eventPlugins, [], <div>Plus Menu</div> ),
  displayMailerPlugin<ItsmState>,
  // displayReceiveEmailPlugin (),

]

const mailer = apiClientMailer ( rootUrl + "api/email" )
const sqler = apiClientSqler ( rootUrl + "api/sql" )

addEventStoreListener ( container, (( oldS, s, setJson ) => {
  return root.render ( <UrlStoreProvider urlStore={urlStore}>
    <MailerProvider mailer={mailer}>
      <SqlerProvider sqler={sqler}>
        <AiEmailProvider aiEmail={aiEmails}>
          <AiVariablesProvider aiVariables={aiVariables}>
            <YamlProvider yamlCapability={yaml}>
              <App
                state={lensState ( s, setJson, 'Container', {} )}
                plugins={[]}
                eventPlugins={eventPlugins}
              />
            </YamlProvider>
          </AiVariablesProvider>
        </AiEmailProvider>
      </SqlerProvider>
    </MailerProvider>
  </UrlStoreProvider> );
}) );

const enricher = defaultEventEnricher ( urlStore )

const pollingDetails = polling<Event[]> ( 1000, () => container.state.selectionState.ticketId,
  async ( poll, offset ) => {
    if ( container.state.ticketList === undefined ) {
      const ticketList = await urlStore.list ( { org: "me", namespace: "ticketevents", pageQuery: { page: 1, pageSize: 10 }, order: "date" } )
      if ( !hasErrors ( ticketList ) ) {
        const thisJson = container.state
        setJson ( { ...thisJson, ticketList } )
      }
    }
    return await urlStore.loadNamed ( poll, offset );
  },
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


addEventStoreModifier ( container,
  processSideEffectsInState<ItsmState> (
    processSideEffect ( [
      eventSideeffectProcessor ( urlStore.save, 'me', ticketIdL ),
      addAiTicketSideeffectProcessor ( aiVariables, ticketVariablesL ),
      addAiMailerSideEffectProcessor ( aiEmails, emailDataL ),
      addSaveKnowledgeArticleSideEffect ( urlStore.save, 'me' ),
      // addLoadKaSideEffect ( urlStore.loadNamed, newTicketL.focusOn ( 'ticketDetails' ) ),
      addNewTicketSideeffectProcessor ( urlStore.save, tabsL, forTicketO, ticketIdL, newTicketL, ticketListO, 'forTicket.ticket', 'forTicket.tempData.ticketType' )
    ] ),
    sideEffectsL, logsL, true ) )


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

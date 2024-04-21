import React from 'react';
import ReactDOM from 'react-dom/client';
import { lensState } from "@focuson/state";

import { addEventStoreListener, addEventStoreModifier, eventStore, polling, setEventStoreValue, startPolling } from "@itsmworkbench/eventstore";
import { defaultEventEnricher, defaultEventProcessor, EnrichedEvent, enrichEvent, Event, processEvents } from "@itsmworkbench/events";

import { ActionPluginDetails, eventSideeffectProcessor, processSideEffect, processSideEffectsInState } from '@itsmworkbench/react_core';
import { App } from './gui/app';
import { defaultNameSpaceDetails } from "@itsmworkbench/defaultdomains";
import { actionO, conversationL, emailDataL, enrichedEventsO, eventsL, eventsO, forTicketO, ItsmState, kaListO, kaO, logsL, newTicketL, operatorL, sideEffectsL, startAppState, tabO, tabsL, tagsL, ticketIdL, ticketL, ticketListO, ticketTypeO, ticketVariablesL } from "./state/itsm.state";
import { YamlCapability } from '@itsmworkbench/yaml';
import { jsYaml } from '@itsmworkbench/jsyaml';
import { UrlStoreApiClientConfig, urlStoreFromApi } from "@itsmworkbench/browserurlstore";
import { hasErrors, mapK, toArray } from "@laoban/utils";
import { addAiTicketSideeffectProcessor, addNewTicketSideeffectProcessor, displayNewTicketWizard, displayReviewTicketWorkbench, displayTicketEventPlugin } from '@itsmworkbench/reactticket';
import { addSaveKnowledgeArticleSideEffect, displayCreateKnowledgeArticlePlugin, displaySelectKnowledgeArticlePlugin, displayTicketTypeEventPlugin } from '@itsmworkbench/reacttickettype';

import { displayVariablesEventPlugin } from "@itsmworkbench/react_variables";
import { AiClientConfig, apiClientForAi } from "@itsmworkbench/browserai";
import { displayLdapEventPlugin, displayLdapPlugin } from '@itsmworkbench/react_capabilities';
import { AIProvider, FetchEmailerProvider, MailerProvider, SqlerProvider, UrlStoreProvider, YamlProvider } from '@itsmworkbench/components';
import { apiClientMailer } from "@itsmworkbench/browsermailer";
import { apiClientSqler } from "@itsmworkbench/browsersql";
import { displaySqlEventPlugin, displaySqlPlugin } from '@itsmworkbench/reactsql';
import { addAiMailerSideEffectProcessor, displayEmailEventPlugin, displayMailerPlugin, SuggestEmailForTicketButton } from '@itsmworkbench/reactmailer';
import { debugEnrichedEventsPlugin, debugEventsPlugin, displayEnrichedEventsWithPlugins, displayMessageEventPlugin, enrichedDisplayAndChatPlugin } from "@itsmworkbench/reactevents";
import { apiClientFetchEmailer } from "@itsmworkbench/browserfetchemail";
import { displayReceiveEmailEventPlugin, displayReceiveEmailPlugin } from "@itsmworkbench/reactfetchemail";
import { depData, dependentEngine, DependentItem, optionalTagStore, setJsonForDepData } from "@itsmworkbench/dependentdata";
import { Operator } from "@itsmworkbench/operator";
import { parseNamedUrlOrThrow } from "@itsmworkbench/urlstore";
import { FCLogRecord, futureCacheConsoleLog, futureCacheLog } from "@itsmworkbench/utils";


const rootElement = document.getElementById ( 'root' );
if ( !rootElement ) throw new Error ( 'Failed to find the root element' );
const root = ReactDOM.createRoot ( rootElement );

const yaml: YamlCapability = jsYaml ()
let rootUrl = "http://localhost:1235/";
const aiDetails: AiClientConfig = { url: rootUrl + "ai/" }
const nameSpaceDetails = defaultNameSpaceDetails ( yaml, {} );
const urlStoreconfig: UrlStoreApiClientConfig = { apiUrlPrefix: rootUrl + "url", details: nameSpaceDetails }
const urlStore = urlStoreFromApi ( urlStoreconfig )
const ai = apiClientForAi ( aiDetails )

const container = eventStore<ItsmState> ()

const operatorDi = depData ( 'operator', operatorL, {
  clean: 'leave',
  tag: ( o: Operator ) => o?.id,
  load: async () => {
    const res = await urlStore.loadNamed<Operator> ( parseNamedUrlOrThrow ( 'itsm/me/operator/me' ) )
    if ( hasErrors ( res ) ) throw new Error ( 'Failed to load operator\n' + res.join ( '\n' ) )
    return res.result
  }
} )

const ticketListDi = depData ( 'ticketList', ticketListO, {
  clean: 'nuke',
  tag: ( o: any ) => o?.names,
  load: async () => {
    const ticketList = await urlStore.list ( { org: "me", namespace: "ticketevents", pageQuery: { page: 1, pageSize: 10 }, order: "date" } )
    if ( hasErrors ( ticketList ) ) throw new Error ( 'Failed to load ticketList\n' + ticketList.join ( '\n' ) )
    return ticketList
  }
} )

const kaListDi = depData ( 'kaList', kaListO, {
  clean: 'nuke',
  tag: ( o: any ) => o?.names,
  load: async () => {
    const kaList = await urlStore.list ( { org: "me", namespace: "ka", pageQuery: { page: 1, pageSize: 1000 }, order: "date" } )
    if ( hasErrors ( kaList ) ) throw new Error ( 'Failed to load kaList\n' + kaList.join ( '\n' ) )
    return kaList
  }
} )
const deps: DependentItem<ItsmState, any>[] = [ operatorDi, ticketListDi ]
const tagStore = optionalTagStore ( tagsL );

const logForDeps: FCLogRecord<any, any>[] = []
const depEngine = dependentEngine<ItsmState> (
  { listeners: [ futureCacheLog ( logForDeps ), futureCacheConsoleLog ( 'fc -' ) ], cache: {} }, tagStore )


const setJson = setJsonForDepData ( depEngine, () => container.state, setEventStoreValue ( container ) ) ( deps, {
  setTag: ( s, name, tag ) => { // could do it with optional, but don't need to
    s.tags[ name ] = tag
    return s
  },
  updateLogs: s => {
    s.depDataLog = [ ...toArray ( s.depDataLog ), ...logForDeps ]
    logForDeps.length = 0
    return s
  },
  debug: () => container.state?.debug?.depData,
  delay: 100
} )
//
// const setJson : ( s: ItsmState ) => void = s => {
//   count++
//   const { status, vAndT, actions } = depEngine.evaluate ( deps ) ( s )
//   console.log ( 'fc - setJson', count, s, status, vAndT, )
//   console.log ( 'fc - setJson - actions', actions )
//   const { updates, newS } = depEngine.doActions ( actions )
//   const cleanedS = newS ( s );
//   console.log ( 'fc - setJson - cleanedS', cleanedS )
//   cleanedS.depDataLog = [ ...toArray ( cleanedS.depDataLog ), ...logForDeps ]
//   logForDeps.length = 0
//   setEventStoreValue ( container ) ( cleanedS )
//   console.log ( 'fc - setJson - updates', updates.length )
//   updates.forEach ( async u => {
//     // setTimeout ( async () => {
//     const r: DiRequest<ItsmState> = await u
//     const stateAndWhy = r ( container.state )
//     const { name, changed, why } = stateAndWhy
//     console.log ( 'fc - setJson - update', name, changed, why )
//
//     if ( changed ) {
//       const { s, t, tag } = stateAndWhy
//       console.log ( 'fc - setJson - t ', t )
//       console.log ( 'fc - setJson - tag', tag )
//       console.log ( 'fc - setJson - setting Json', s )
//       s.tags[ name ] = tag
//       setJson ( s ) // which is scary because this might trigger an infinite loop hence the delay
//     }
//     // }, 0 )
//   } )
// };

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

const devMode = ( s: ItsmState ) => s?.debug?.showDevMode

const displayPlugins: ActionPluginDetails<ItsmState, ItsmState, any>[] = [
  debugEventsPlugin<ItsmState, ItsmState> () ( s => ({ state: s.chainLens ( eventsO ) }) ),
  debugEnrichedEventsPlugin<ItsmState, ItsmState> ( devMode, eventPlugins ) ( s => ({ state: s.chainLens ( enrichedEventsO ) }) ),
  displayEnrichedEventsWithPlugins<ItsmState, ItsmState> ( devMode, eventPlugins ) ( s => ({ state: s.chainLens ( enrichedEventsO ) }) ),
  enrichedDisplayAndChatPlugin<ItsmState, ItsmState> () ( s =>
    ({
      state: s.tripleUp ().chain1 ( conversationL ).chain2 ( enrichedEventsO ).chainLens3 ( sideEffectsL ),
      eventPlugins,
      plugins: [],
      plusMenu: <div/>,
      devMode: devMode ( s.optJson () as ItsmState ),
    }) ),
  displayMailerPlugin<ItsmState, ItsmState> () ( s => ({
    state: s.chainLens ( actionO ),
    SuggestButton: <SuggestEmailForTicketButton state={s.doubleUp ().chain1 ( ticketL ).chain2 ( actionO )}/>
  }) ),
  displayReceiveEmailPlugin<ItsmState, ItsmState> () ( s => ({ state: s.chainLens ( actionO ) }) ),
  displayLdapPlugin<ItsmState, ItsmState> () ( s => ({ state: s.chainLens ( actionO ) }) ),
  displayReviewTicketWorkbench<ItsmState, ItsmState> () ( s => ({ state: s.doubleUp ().chain1 ( ticketL ).chain2 ( actionO ) }) ),
  displaySqlPlugin<ItsmState, ItsmState> () ( s => ({ state: s.chainLens ( actionO ) }) ),
  displaySelectKnowledgeArticlePlugin<ItsmState, ItsmState> () ( s => (
    {
      targetPath: 'forTicket.tempData.newTicket.ticketDetails',
      state: s.doubleUp ().chain1 ( actionO ).chain2 ( ticketTypeO )
    }) ),
  displayCreateKnowledgeArticlePlugin<ItsmState, ItsmState> () ( s =>
    ({
      state: s.tripleUp ().chain1 ( kaO ).chain2 ( eventsO ).chainLens3 ( sideEffectsL ),
      ticket: s.chainLens ( ticketL ).optJson ()
    }) ),
  displayNewTicketWizard<ItsmState, ItsmState> () ( s => ({ state: s.chainLens ( newTicketL ) }) ),

]

const mailer = apiClientMailer ( rootUrl + "api/email" )
const sqler = apiClientSqler ( rootUrl + "api/sql" )
const fetcher = apiClientFetchEmailer ( rootUrl + "api/fetchemail"
)


addEventStoreListener ( container, (( _, s, setJson ) => {
  return root.render ( <UrlStoreProvider urlStore={urlStore}>
    <FetchEmailerProvider fetchEmailer={fetcher}>
      <MailerProvider mailer={mailer}>
        <SqlerProvider sqler={sqler}>
          <AIProvider ai={ai}>
            <YamlProvider yamlCapability={yaml}>
              <App
                actionPlugins={displayPlugins}
                byO={tabO}
                state={lensState ( s, setJson, 'Container', {} )}
                plugins={[]}
                eventPlugins={eventPlugins}
              />
            </YamlProvider>
          </AIProvider>
        </SqlerProvider>
      </MailerProvider>
    </FetchEmailerProvider>
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
      addAiTicketSideeffectProcessor ( ai.variables, ticketVariablesL ),
      addAiMailerSideEffectProcessor ( ai.emails, emailDataL ),
      addSaveKnowledgeArticleSideEffect ( urlStore.save, 'me' ),
      // addLoadKaSideEffect ( urlStore.loadNamed, newTicketL.focusOn ( 'ticketDetails' ) ),
      addNewTicketSideeffectProcessor ( urlStore.save, tabsL, forTicketO, ticketIdL, newTicketL, ticketListO, 'forTicket.ticket', 'forTicket.tempData.ticketType' )
    ] ),
    sideEffectsL, logsL, true ) )


const withInitialData: ItsmState = {
  ...startAppState,
  basicData: { operator: undefined as any, organisation: 'me' },
  ticketList: undefined as any,
  kaList: undefined as any
}
setJson ( withInitialData )
startPolling ( pollingDetails )

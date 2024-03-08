import React from 'react';
import ReactDOM from 'react-dom/client';
import { lensState } from "@focuson/state";

import { addEventStoreListener, addEventStoreModifier, eventStore, polling, setEventStoreValue, startPolling } from "@itsmworkbench/eventstore";
import { apiIdStore, apiLoading, ApiLoading, apiLoadingFromBrowser, idStoreFromApi, listidsFromFetch, sendEvents, SendEvents, } from "@itsmworkbench/apiclienteventstore";
import { defaultEventProcessor, processEvents, stringToEvents } from "@itsmworkbench/events";

import { eventSideeffectProcessor, processSideEffect, processSideEffectsInState } from '@itsmworkbench/react_core';
import { TemplateFn } from '@itsmworkbench/components';
import { IdStore } from "@itsmworkbench/idstore";
import { ListIds } from "@itsmworkbench/listids";
import { App } from './gui/app';
import { defaultNameSpaceDetails, defaultParserStore, InitialLoadDataResult, loadInitialData } from "@itsmworkbench/defaultdomains";
import { ItsmState, logsL, setPageL, sideEffectsL, startAppState } from "./state/itsm.state";

import { YamlCapability } from '@itsmworkbench/yaml';
import { jsYaml } from '@itsmworkbench/jsyaml';
import { loadFromApi, saveToApi, UrlStoreApiClientConfig } from "@itsmworkbench/urlstoreapi";
import { addNewTicketSideeffectProcessor } from "@itsmworkbench/react_new_ticket";
import { UrlLoadFn, UrlSaveFn } from "@itsmworkbench/url";


const templateFn: TemplateFn<any> = ( state, templateName ) => {
  return state?.templates?.item?.template || ''
}

const rootElement = document.getElementById ( 'root' );
if ( !rootElement ) throw new Error ( 'Failed to find the root element' );
const root = ReactDOM.createRoot ( rootElement );

const yaml: YamlCapability = jsYaml ()
const apiDetails: ApiLoading = apiLoading ( "http://localhost:1235/file1" )
const saveDetails: SendEvents = sendEvents ( "http://localhost:1235/file1" )
const idStoreDetails = apiIdStore ( "http://localhost:1235", defaultParserStore ( yaml ) )
const urlStoreconfig: UrlStoreApiClientConfig = { apiUrlPrefix: "http://localhost:1235/url", details: defaultNameSpaceDetails ( yaml ) }
const idStore: IdStore = idStoreFromApi ( idStoreDetails )
const listIds: ListIds = listidsFromFetch ( idStoreDetails )
const loadFromUrlStore: UrlLoadFn = loadFromApi ( urlStoreconfig )
const saveToUrlStore: UrlSaveFn = saveToApi ( urlStoreconfig )

const container = eventStore<ItsmState> ()
const setJson = setEventStoreValue ( container );
const sep1 = defaultEventProcessor<ItsmState> ( '', startAppState, idStore )
addEventStoreListener ( container, (( oldS, s, setJson ) =>
  root.render ( <App
    state={lensState ( s, setJson, 'Container', {} )}
    plugins={[]}
    // plugins={[ operatorConversationPlugin ( operatorL ) ]}
  /> )) );

const pollingDetails = polling ( 1000, async s => {
  console.log ( 'polling', typeof s, s )
  const events = stringToEvents ( {}, s );
  console.log ( 'events', events )
  const { state: state, errors } = await processEvents ( sep1, container.state, events )
  console.log ( 'errors', errors )
  console.log ( 'state', state )
  if ( state ) {
    // const result = extractVariablesForAllDomain ( defaultVariablesExtractor ( yaml ),
    //   { name: 'Phil', email: 'phil@example.com' })
    const newState = { ...state, variables: {} }
    // console.log ( 'result with variables', result )
    setJson ( newState )
  }
} )


addEventStoreModifier ( container,
  processSideEffectsInState<ItsmState> (
    processSideEffect ( [
      eventSideeffectProcessor ( saveDetails, 'conversation.messages' ),
      addNewTicketSideeffectProcessor ( saveToUrlStore ,setPageL)
    ] ),
    sideEffectsL, logsL ) )

loadFromUrlStore ( "itsm:me:operator:me" ).then ( async ( res ) => {
  console.log ( 'operator', res )
} )
loadInitialData ( loadFromUrlStore ).then ( async ( initialDataResult: InitialLoadDataResult ) => {
  const withInitialData = { ...startAppState, ...initialDataResult }
  // loadInitialIds ( listIds ).then ( async ( res: InitialLoadIdResult ) => {
  //   const newState = { ...withInitialData, ...res }
  //   const cdd: ChatDisplayData<any> | undefined = await initialQuestions ( operatorL, ticketL ) ( newState )
  //
  // } )
  setJson ( withInitialData )
  startPolling ( pollingDetails, apiLoadingFromBrowser ( apiDetails ) )
} )

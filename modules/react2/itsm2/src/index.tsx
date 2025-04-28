import React from "react";
import {createRoot} from "react-dom/client";
import {Configuration, PublicClientApplication} from "@azure/msal-browser";
import {loginUsingMsal} from "@itsmworkbench/msal_login";
import {authenticateDebug, LoginConfig} from "@itsmworkbench/react_login_component";

import {makeSovereignStatePlugin, SimpleSovereignAppComponents, SimpleUnknownDisplay, SovereignApp, SovereignAppComponentsProvider, SovereignStatePlugins, SovereignStatePluginsProvider, SovereignStateProvider} from "@itsmworkbench/sovereign";
import {consoleErrorReporter, DebugStateProvider, FeatureFlags, NonFunctionalsProvider, routingDebug, useFeatureFlag, WindowUrlProvider} from "@itsmworkbench/react_utils";
import {AttributeValueOrientation, AttributeValueOrientationProvider, AttributeValueOrientations, AttributeValueProvider, SimpleAttributeValueLayout, SimpleDataLayout} from "@itsmworkbench/renderers";
import {DevModeComponentsProvider, DevModeDebug, DevModeFeatureFlags, DevModeStateForSearchProvider} from "@itsmworkbench/devmode";
import {ItsmSovereignPagePlugin} from "@itsmworkbench/itsmsovereign";
import {HomeSovereignPagePlugin} from "@itsmworkbench/homesovereign";
import {WorkbenchesSovereignPagePlugin} from "@itsmworkbench/workbenchessovereign";
import {DevModeTranslate, emptyUsedAndNotFound, TranslationUsedAndNotFoundProvider} from "@itsmworkbench/translation";
import {SimpleTranslationProvider} from "@itsmworkbench/simple_translation";
import {NavigatorPanelDefns} from "@itsmworkbench/panelnavigator";
import {DevModeItsmState, itsmState, NewTicketSovereignPanePlugin} from "@itsmworkbench/newticket_wizard";
import {SimpleWizardComponents} from "@itsmworkbench/wizard/src/simple.wizard.components";
import {WizardComponentsProvider} from "@itsmworkbench/wizard";
import {ThemeProvider} from "@itsmworkbench/themes";
import {allThemes} from "@itsmworkbench/all_themes";
import {itsmTranslation} from "@itsmworkbench/itsm_translation";
import {TicketSourceProvider} from "@itsmworkbench/ticketsource";
import {AllTicketSources} from "@itsmworkbench/all_ticketsources";
import {mockTickets} from "@itsmworkbench/mock_ticketsource/src/mock.tickets";
import {mockSystems, SystemsProvider} from "@itsmworkbench/system";
import {allRenderers} from "@itsmworkbench/all_renderers";
import {KnowledgeArticleSovereignPagePlugin} from "@itsmworkbench/knowledgearticles_sovereign";
import {UrlStoreProvider} from "@itsmworkbench/reacturlstore";
import {defaultNameSpaceDetails} from "@itsmworkbench/defaultdomains";
import {UrlStoreApiClientConfig, urlStoreFromApi} from "@itsmworkbench/browserurlstore";
import {YamlCapability} from "@itsmworkbench/yaml";
import {jsYaml} from "@itsmworkbench/jsyaml";
import {LanguageProvider} from "@itsmworkbench/language";
import {delay, NameAnd} from "@itsmworkbench/utils";
import {DevmodeSecretData, SecretDataProvider} from "@itsmworkbench/secrets";
import {AuthenticationSovereignPagePlugin} from "@itsmworkbench/authentication_sovereign";
import {authenticationDebugName, defaultSecretData} from "@itsmworkbench/authentication";
import {ServiceCallerProvider} from "@itsmworkbench/react_service_caller";
import {axiosServiceCaller} from "@itsmworkbench/axios_service_caller";
import {AuthFnProviderFromUrlStore} from "@itsmworkbench/react_authentication";
import {
    AzureChatCompletionProviderWithCache,
    useAiCacheFeatureFlag, useAiCacheFFName
} from "@itsmworkbench/azureai2_react";
import {aiDebugName, showAiPromptsFFName} from "@itsmworkbench/ai2";
import {emptyItsmState, ItsmStateProvider} from "@itsmworkbench/itsm_state";
import {objectDefnDebugName} from "@itsmworkbench/object_defn";
import {YamlProvider} from "@itsmworkbench/components";
import {DevModeAi, RememberChatCompletionProvider} from "@itsmworkbench/ai2_react";
import {InformationSovereignPane} from "@itsmworkbench/info_sovereign";
import {activeTicketsFeatureFlag, activeTicketsFF, ActiveTicketsSovereignPagePlugin} from "@itsmworkbench/activetickets_sovereign";


const debugState = {
    [authenticateDebug]: false,
    [routingDebug]: false,
    [aiDebugName]: true,
    [objectDefnDebugName]: false,
    [authenticationDebugName]: false
};

const featureFlags: FeatureFlags = {
    hv: {value: 'horizontal', description: 'Show the attribute value horizontally or vertically', options: AttributeValueOrientations},
    [showAiPromptsFFName]: {value: false, description: 'Show the AI prompts in the chat'},
    [activeTicketsFF]: activeTicketsFeatureFlag,
    [useAiCacheFFName]: useAiCacheFeatureFlag
};
export const exampleMsalConfig: Configuration = {
    auth: {
        clientId: process.env.REACT_MSAL_CLIENT_ID ?? "ec963ff8-b8c7-411e-80b1-9473d0390b3b",
        authority: `https://login.microsoftonline.com/b914a242-e718-443b-a47c-6b4c649d8c0a`,
        redirectUri: "/tile",
        postLogoutRedirectUri: "/",
    },
};
const msal = new PublicClientApplication(exampleMsalConfig);
const login: LoginConfig = loginUsingMsal({msal});

export const navPanels: NavigatorPanelDefns = {
    getStarted: {icon: 'getStarted', descriptionKey: 'nav.getStarted'},
    newTicket: {icon: 'newTicket', descriptionKey: 'nav.newTicket'},
    activeTickets: {
        icon: 'activeTickets', descriptionKey: 'nav.activeTickets',
        // selected: '',
        onSelected: (name, ff) => {
            if (!ff[activeTicketsFF].value)
                delay(0).then(() => window.location.href = 'http://localhost:1238');
        }
    },
    examineKnowledgeArticles: {icon: 'knowledgeArticles', descriptionKey: 'nav.examineKnowledgeArticles'},
    systems: {icon: 'systems', descriptionKey: 'nav.systems'},
    healthCheck: {icon: 'heartbeat', descriptionKey: 'nav.healthCheck'},
    authentication: {icon: 'key', descriptionKey: 'nav.authentication'},
    automation: {icon: 'automation', descriptionKey: 'nav.automation'},
    askForHelp: {icon: 'help', descriptionKey: 'nav.askForHelp'},
    workbenches: {icon: 'wrench', descriptionKey: 'nav.workbenches'}
}


const sovereignStatePlugins: SovereignStatePlugins = {
    plugins: {
        home: HomeSovereignPagePlugin(navPanels),
        activeTickets: ActiveTicketsSovereignPagePlugin,
        getStarted: InformationSovereignPane('getStarted.info'),
        newTicket: NewTicketSovereignPanePlugin,
        examineKnowledgeArticles: KnowledgeArticleSovereignPagePlugin,
        authentication: AuthenticationSovereignPagePlugin,
        itsm: ItsmSovereignPagePlugin,
        askForHelp: makeSovereignStatePlugin(() => <span>Ask For Help</span>),
        workbenches: WorkbenchesSovereignPagePlugin
    },
    UnknownDisplay: SimpleUnknownDisplay
}


const root = createRoot(document.getElementById('root') as HTMLElement);

export function AttributeValueOrientationFromFeatureFlagProvider({children}: { children: React.ReactNode }) {
    const hv = useFeatureFlag('hv') as AttributeValueOrientation
    return <AttributeValueOrientationProvider orientation={hv}>{children}</AttributeValueOrientationProvider>
}

const yaml: YamlCapability = jsYaml()
const rootUrl = "http://localhost:1235/";
const nameSpaceDetails = defaultNameSpaceDetails(yaml, {});
const urlStoreconfig: UrlStoreApiClientConfig = {apiUrlPrefix: rootUrl + "url", details: nameSpaceDetails}
const urlStore = urlStoreFromApi(urlStoreconfig)

const devModeComponents: NameAnd<() => React.ReactElement> = {
    Debug: DevModeDebug,
    FeatureFlags: DevModeFeatureFlags,
    Translate: DevModeTranslate,
    SecretData: DevmodeSecretData,
    [itsmState]: DevModeItsmState,
    AI: DevModeAi
};


msal.initialize({}).then(() => {
//we set up here: how we display the components, how we do state management and how we do authentication

    root.render(<React.StrictMode>
            <YamlProvider yamlCapability={jsYaml()}>
                <NonFunctionalsProvider debugState={debugState} featureFlags={featureFlags} errorReporter={consoleErrorReporter}>
                    <WindowUrlProvider>
                        <ServiceCallerProvider serviceCaller={axiosServiceCaller}>
                            <SecretDataProvider secretData={defaultSecretData()}>
                                <DevModeComponentsProvider components={devModeComponents}>
                                    <ItsmStateProvider state={emptyItsmState}>
                                        <UrlStoreProvider urlStore={urlStore}>
                                            <AuthFnProviderFromUrlStore>
                                                <RememberChatCompletionProvider remember={[]}>
                                                    <AzureChatCompletionProviderWithCache>
                                                        <AttributeValueProvider renderers={allRenderers} AttributeValueLayout={SimpleAttributeValueLayout} DataLayout={SimpleDataLayout}>
                                                            <SystemsProvider systems={mockSystems}>
                                                                <TicketSourceProvider ticketSource={AllTicketSources(mockTickets)}>
                                                                    <DebugStateProvider debugState={debugState}>
                                                                        <SovereignStatePluginsProvider plugins={sovereignStatePlugins}>
                                                                            <SovereignStateProvider>
                                                                                <LanguageProvider language='en'>
                                                                                    <TranslationUsedAndNotFoundProvider usedAndNotFound={emptyUsedAndNotFound()}>
                                                                                        <SimpleTranslationProvider translation={itsmTranslation}>
                                                                                            <ThemeProvider themes={allThemes}>
                                                                                                <DevModeStateForSearchProvider devModeState={{selected: '', visible: ''}}>
                                                                                                    {/*<AuthenticationProvider loginConfig={login}>*/}
                                                                                                    {/*    <Authenticate>*/}
                                                                                                    <SovereignAppComponentsProvider sovereignAppComponents={SimpleSovereignAppComponents}>
                                                                                                        <WizardComponentsProvider wizardComponents={SimpleWizardComponents}>
                                                                                                            <SovereignApp/>
                                                                                                        </WizardComponentsProvider>
                                                                                                    </SovereignAppComponentsProvider>

                                                                                                    {/*</Authenticate>*/}
                                                                                                    {/*</AuthenticationProvider>*/}
                                                                                                </DevModeStateForSearchProvider>
                                                                                            </ThemeProvider>
                                                                                        </SimpleTranslationProvider>
                                                                                    </TranslationUsedAndNotFoundProvider>
                                                                                </LanguageProvider>
                                                                            </SovereignStateProvider>
                                                                        </SovereignStatePluginsProvider>
                                                                    </DebugStateProvider>
                                                                </TicketSourceProvider>
                                                            </SystemsProvider>
                                                        </AttributeValueProvider>
                                                    </AzureChatCompletionProviderWithCache>
                                                </RememberChatCompletionProvider>
                                            </AuthFnProviderFromUrlStore>
                                        </UrlStoreProvider>
                                    </ItsmStateProvider>
                                </DevModeComponentsProvider>
                            </SecretDataProvider>
                        </ServiceCallerProvider>
                    </WindowUrlProvider>
                </NonFunctionalsProvider>
            </YamlProvider>
        </React.StrictMode>
    )
    ;
})


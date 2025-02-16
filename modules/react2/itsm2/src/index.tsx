import React from "react";
import {createRoot} from "react-dom/client";
import {Configuration, PublicClientApplication} from "@azure/msal-browser";
import {loginUsingMsal} from "@itsmworkbench/msal_authentication";
import {Authenticate, authenticateDebug, AuthenticationProvider, LoginConfig} from "@itsmworkbench/react_login_component";

import {makeSovereignStatePlugin, SimpleSovereignAppComponents, SimpleUnknownDisplay, SovereignApp, SovereignAppComponentsProvider, SovereignStatePlugins, SovereignStatePluginsProvider, SovereignStateProvider} from "@itsmworkbench/sovereign";
import {consoleErrorReporter, DebugStateProvider, FeatureFlags, NonFunctionalsProvider, routingDebug, useFeatureFlag, WindowUrlProvider} from "@itsmworkbench/react_utils";
import {AttributeValueOrientation, AttributeValueOrientationProvider, AttributeValueOrientations} from "@itsmworkbench/renderers";
import {DevMode, DevModeStateForSearchProvider} from "@itsmworkbench/devmode";
import {ItsmSovereignPagePlugin} from "@itsmworkbench/itsmsovereign";
import {HomeSovereignPagePlugin} from "@itsmworkbench/homesovereign";
import {emptyUsedAndNotFound, TranslationUsedAndNotFoundProvider} from "@itsmworkbench/translation";
import {SimpleTranslationProvider} from "@itsmworkbench/simple_translation";
import {NavigatorPanelDefns} from "@itsmworkbench/panelnavigator";
import {NewTicketSovereignPanePlugin} from "@itsmworkbench/newticket_wizard";
import {SimpleWizardComponents} from "@itsmworkbench/wizard/src/simple.wizard.components";
import {WizardComponentsProvider} from "@itsmworkbench/wizard";
import {itsmTheme} from "@itsmworkbench/itsm_themes/src/itsm.theme";
import {ThemeProvider} from "@itsmworkbench/themes";
import {allThemes} from "@itsmworkbench/all_themes";
import {itsmTranslation} from "@itsmworkbench/itsm_translation";


const debugState = {
    [authenticateDebug]: false,
    [routingDebug]: true,
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
    newTicket: {icon: 'new', descriptionKey: 'nav.newTicket'},
    activeTickets: {icon: 'active', descriptionKey: 'nav.activeTickets'},
    historicalTickets: {icon: 'historical', descriptionKey: 'nav.historicalTickets'},
    examineKnowledgeArticles: {icon: 'knowledge', descriptionKey: 'nav.examineKnowledgeArticles'},
    services: {icon: 'services', descriptionKey: 'nav.services'},
    healthCheck: {icon: 'health', descriptionKey: 'nav.healthCheck'},
    askForHelp: {icon: 'help', descriptionKey: 'nav.askForHelp'},
}


const sovereignStatePlugins: SovereignStatePlugins = {
    plugins: {
        home: HomeSovereignPagePlugin(navPanels),
        getStarted: makeSovereignStatePlugin(() =><span>Get Started</span>),
        newTicket: NewTicketSovereignPanePlugin,
        itsm: ItsmSovereignPagePlugin,
    },
    UnknownDisplay: SimpleUnknownDisplay
}


const featureFlags: FeatureFlags = {
    hv: {value: 'horizontal', description: 'Show the attribute value horizontally or vertically', options: AttributeValueOrientations},
};

const root = createRoot(document.getElementById('root') as HTMLElement);

export function AttributeValueOrientationFromFeatureFlagProvider({children}: { children: React.ReactNode }) {
    const hv = useFeatureFlag('hv') as AttributeValueOrientation
    return <AttributeValueOrientationProvider orientation={hv}>{children}</AttributeValueOrientationProvider>
}


msal.initialize({}).then(() => {
//we set up here: how we display the components, how we do state management and how we do authentication

    root.render(<React.StrictMode>
            <WindowUrlProvider>
                <DebugStateProvider debugState={debugState}>
                    <SovereignStatePluginsProvider plugins={sovereignStatePlugins}>
                        <SovereignStateProvider>
                            <TranslationUsedAndNotFoundProvider usedAndNotFound={emptyUsedAndNotFound()}>
                                <SimpleTranslationProvider translation={itsmTranslation}>
                                    <NonFunctionalsProvider debugState={debugState} featureFlags={featureFlags} errorReporter={consoleErrorReporter}>
                                        <ThemeProvider themes={allThemes}>
                                            <DevModeStateForSearchProvider devModeState={{selected: ''}}>
                                                <AuthenticationProvider loginConfig={login}>
                                                    <Authenticate>
                                                        <SovereignAppComponentsProvider sovereignAppComponents={SimpleSovereignAppComponents}>
                                                            <WizardComponentsProvider wizardComponents={SimpleWizardComponents}>
                                                                <DevMode/>
                                                                <SovereignApp/>
                                                            </WizardComponentsProvider>
                                                        </SovereignAppComponentsProvider>

                                                    </Authenticate>
                                                </AuthenticationProvider>
                                            </DevModeStateForSearchProvider>
                                        </ThemeProvider>
                                    </NonFunctionalsProvider>
                                </SimpleTranslationProvider>
                            </TranslationUsedAndNotFoundProvider>
                        </SovereignStateProvider>
                    </SovereignStatePluginsProvider>
                </DebugStateProvider>
            </WindowUrlProvider>
        </React.StrictMode>
    );
})


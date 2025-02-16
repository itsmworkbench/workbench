import React from "react";
import {createRoot} from "react-dom/client";
import {Configuration, PublicClientApplication} from "@azure/msal-browser";
import {loginUsingMsal} from "@itsmworkbench/msal_authentication";
import {Authenticate, authenticateDebug, AuthenticationProvider, LoginConfig} from "@itsmworkbench/react_login_component";

import {SimpleSovereignAppComponents, SimpleUnknownDisplay, SovereignApp, SovereignAppComponentsProvider, SovereignStatePlugins, SovereignStatePluginsProvider, SovereignStateProvider} from "@itsmworkbench/sovereign";
import {consoleErrorReporter, DebugStateProvider, FeatureFlags, NonFunctionalsProvider, routingDebug, useFeatureFlag, WindowUrlProvider} from "@itsmworkbench/react_utils";
import {AttributeValueOrientation, AttributeValueOrientationProvider, AttributeValueOrientations} from "@itsmworkbench/renderers";
import {DevMode, DevModeStateForSearchProvider} from "@itsmworkbench/devmode";
import {ThemeProvider} from "@mui/material/styles";
import {ItsmSovereignPagePlugin} from "@itsmworkbench/itsmsovereign";
import {HomeSovereignPagePlugin} from "@itsmworkbench/homesovereign";
import {defaultTheme} from "./mui.theme";
import {emptyUsedAndNotFound, TranslationUsedAndNotFoundProvider} from "@itsmworkbench/translation";
import {SimpleTranslationProvider} from "@itsmworkbench/simple_translation";
import {NavigatorPanelDefns} from "@itsmworkbench/panelnavigator";


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
            <ThemeProvider theme={defaultTheme}>
                <WindowUrlProvider>
                    <DebugStateProvider debugState={debugState}>
                        <SovereignStatePluginsProvider plugins={sovereignStatePlugins}>
                            <SovereignStateProvider>
                                <TranslationUsedAndNotFoundProvider usedAndNotFound={emptyUsedAndNotFound()}>
                                    <SimpleTranslationProvider>
                                        <NonFunctionalsProvider debugState={debugState} featureFlags={featureFlags} errorReporter={consoleErrorReporter}>
                                            <DevModeStateForSearchProvider devModeState={{selected: ''}}>
                                                <AuthenticationProvider loginConfig={login}>
                                                    <Authenticate>
                                                        <SovereignAppComponentsProvider sovereignAppComponents={SimpleSovereignAppComponents}>
                                                            <DevMode/>
                                                            <SovereignApp/>
                                                        </SovereignAppComponentsProvider>

                                                    </Authenticate>
                                                </AuthenticationProvider>
                                            </DevModeStateForSearchProvider>
                                        </NonFunctionalsProvider>
                                    </SimpleTranslationProvider>
                                </TranslationUsedAndNotFoundProvider>
                            </SovereignStateProvider>
                        </SovereignStatePluginsProvider>
                    </DebugStateProvider>
                </WindowUrlProvider>
            </ThemeProvider>
        </React.StrictMode>
    );
})


// Reuse the renderDevMode function from your setup

import {DebugState} from "@itsmworkbench/utils";
import {DevModeComponent, DevModeComponents} from "./devmode";
import React from "react";
import {DebugStateProvider, FeatureFlagsStateProvider, WindowUrlProviderForTests} from "@itsmworkbench/react_utils";
import {commonComponents, CommonComponentsProvider} from "@itsmworkbench/common_components";

const mockUserData = {
    email: "user@example.com",
    isDev: true,
    isAdmin: false,
    loggedIn: true,
};

const mockSearchState = {
    searches: {
        main: {count: 0, filters: {}, dataSourceToSearchResult: {}},
        immediate: {count: 0, filters: {}, dataSourceToSearchResult: {}},
    },
};
const mockFeatureFlags = {
    featureX: {value: true, description: "Enable Feature X"},
};

const mockDebugState: DebugState = {
    search: true,
    userData: true,
};

const Name1Component: DevModeComponent = () => <span>Dev Mode 1 Component</span>;
const Name2Component: DevModeComponent = () => <span>Dev Mode 2 Component</span>;
const testDevModeDisplayComponents: DevModeComponents = {
    name1: Name1Component,
    name2: Name2Component,
};


type DevModeFixtureProps = {
    url: string;
    selected: string
    children: React.ReactNode;
};
export const DevModeFixture: React.FC<DevModeFixtureProps> = ({
                                                                  url,
                                                                  selected,
                                                                  children,
                                                              }) => {
    const urlData = {url: new URL(url), parts: ["ignore"]};

    return (
        <WindowUrlProviderForTests initialUrl={url}>
            <DebugStateProvider debugState={mockDebugState}>
                <CommonComponentsProvider commonComponents={commonComponents}>
                    <FeatureFlagsStateProvider featureFlags={mockFeatureFlags}>
                        {children}
                    </FeatureFlagsStateProvider>
                </CommonComponentsProvider>
            </DebugStateProvider>
        </WindowUrlProviderForTests>
    );
};

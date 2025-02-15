import {SovereignStatePlugins, SovereignStatePluginsProvider, SovereignStateProvider} from "./sovereign.selection.state";
import React from "react";
import {TranslationProvider} from "@itsmworkbench/translation";
import {DebugStateProvider, WindowUrlProviderForTests} from "@itsmworkbench/react_utils";
import {SimpleUnknownDisplay} from "./simple.unknown.display";

export const mockTranslation = (key: string) => `${key}_translated`;


export const mockPlugins: SovereignStatePlugins = {
    UnknownDisplay: SimpleUnknownDisplay,
    plugins: {
        'sovereign1': {
            plugin: 'sovereign',
            display: () => <div>sovereign1</div>
        },
        'sovereign2': {
            plugin: 'sovereign',
            display: () => <div>sovereign2</div>
        }
    }
}
export const emptyPlugins: SovereignStatePlugins = {
    UnknownDisplay: () => {throw Error('UnknownDisplay not implemented')},
    plugins: {}
}

export type MockSovereignStateProviderProps = {
    children: React.ReactNode;
    url: string;
    remember?: string[]
    plugins?: SovereignStatePlugins
}
export const MockSovereignStateProvider = ({children, url, plugins = mockPlugins, remember = []}: MockSovereignStateProviderProps) => {
    return (
        <DebugStateProvider debugState={{}}>
            <TranslationProvider translationFn={mockTranslation}>
                <WindowUrlProviderForTests initialUrl={url} changed={(url) => {remember.push(url)}}>
                    <SovereignStatePluginsProvider plugins={mockPlugins}>
                        <SovereignStateProvider updateWindowsState={false}>
                            {children}
                        </SovereignStateProvider>
                    </SovereignStatePluginsProvider>
                </WindowUrlProviderForTests>
            </TranslationProvider>
        </DebugStateProvider>
    );
}

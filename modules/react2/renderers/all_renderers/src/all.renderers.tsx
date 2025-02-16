

import React from "react";
import { RawThemeProvider, themeForTests } from "@itsmworkbench/themes";
import { AttributeValueProvider, Renderers, SimpleAttributeValueLayout, SimpleDataLayout, SimpleDateRenderer, SimpleH1Renderer, SimpleH1WithIconAndUrlRenderer, SimpleH1WithUrlRenderer, SimpleH2Renderer, SimpleH3Renderer, SimpleJsonRenderer, SimpleLabelRenderer, SimpleTextRenderer, SimpleUrlRenderer } from "@itsmworkbench/renderers";


export const allRenderers: Renderers = {
    Text: SimpleTextRenderer,
    Label: SimpleLabelRenderer,
    Json: SimpleJsonRenderer,
    Date: SimpleDateRenderer,
    Url: SimpleUrlRenderer,
    H1: SimpleH1Renderer,
    H1WithIconAndUrl: SimpleH1WithIconAndUrlRenderer,
    H1WithUrl: SimpleH1WithUrlRenderer,
    H2: SimpleH2Renderer,
    H3: SimpleH3Renderer,
};
type AllrenderersSimpleProviderProps = {
    children: React.ReactNode;
}

export function AllRenderersSimpleProvider({ children }: AllrenderersSimpleProviderProps) {
    return <RawThemeProvider theme={themeForTests}>
        <AttributeValueProvider renderers={allRenderers} AttributeValueLayout={SimpleAttributeValueLayout} DataLayout={SimpleDataLayout}>
            {children}
        </AttributeValueProvider></RawThemeProvider>;

}

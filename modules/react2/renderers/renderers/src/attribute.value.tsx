import React, { createContext, ReactElement, ReactNode, useMemo } from "react";
import { idFrom, Render, Renderers, RenderProps, RenderProvider, useRenderers } from "./renderers";
import { DataLayout } from "./data.layout";
import { useTranslation } from "@itsmworkbench/translation";
import { makeContextFor } from "@itsmworkbench/react_utils";
import { mapRecord } from "@itsmworkbench/record_utils";

export type AttributeValueLayoutProps = {
    children: [ReactNode, ReactNode];
    'data-testid'?: string;
    orientation?: AttributeValueOrientation
    className?: string;
};
export type AttributeValueLayout = (props: AttributeValueLayoutProps) => ReactNode;

export type AttributeValueOrientation = 'horizontal' | 'vertical';
export const AttributeValueOrientations: AttributeValueOrientation[] = ['horizontal', 'vertical'];
export type AttributeValueProps<T> = RenderProps<T> & {
    orientation?: AttributeValueOrientation;
};
export type AttributeValue<T> = (props: AttributeValueProps<T>) => ReactElement;

export type AttributeValueComponents = { DataLayout: DataLayout } & {
    [K in keyof Renderers]: Renderers[K] extends Render<infer U>
    ? AttributeValue<U>
    : never;
};


type AttributeValueComponentsProviderProps = {
    AttributeValueLayout: AttributeValueLayout;
    DataLayout: DataLayout;
    renderers: Renderers;
    children: React.ReactNode;
};

export const AttributeValueContext = createContext<AttributeValueComponents | undefined>(undefined);

export const { use: useAttributeValueOrientation, Provider: AttributeValueOrientationProvider } = makeContextFor<AttributeValueOrientation, 'orientation'>('orientation', 'horizontal');

type AttributeValueRendererProps<T> = RenderProps<T> & {
    orientation?: AttributeValueOrientation;
    Renderer: Render<T>
    AttributeValueLayout: AttributeValueLayout
}

function AttributeValueRenderer<T>({ Renderer, rootId, attribute, value, AttributeValueLayout, orientation }: AttributeValueRendererProps<T>) {
    const id = idFrom(rootId, attribute);
    const translation = useTranslation();
    const { Label } = useRenderers();
    const defaultOrientation = useAttributeValueOrientation();

    const label = attribute ? translation(`${attribute}`) : "";  // Internationalized label

    return (
        <AttributeValueLayout data-testid={`${id}-av`} orientation={orientation || defaultOrientation}>
            {label && <Label rootId={rootId} attribute={attribute} value={label} />}
            <Renderer rootId={rootId} attribute={attribute} value={value} />
        </AttributeValueLayout>
    );
}

/**
 * Provides attribute-value rendering logic via context.
 * Enables injection of custom layouts and data layouts.
 */
export function AttributeValueProvider({
    children,
    renderers,
    AttributeValueLayout,
    DataLayout,
}: AttributeValueComponentsProviderProps) {
    const components = useMemo(() => {
        const mappedComponents = mapRecord(renderers, (Renderer: Render<any>, key) =>
            (props: AttributeValueProps<any>) =>
                <AttributeValueRenderer
                    Renderer={Renderer}
                    {...props}
                    AttributeValueLayout={AttributeValueLayout}
                />
        );

        return { ...mappedComponents, DataLayout };
    }, [renderers, AttributeValueLayout]);

    return (
        <AttributeValueContext.Provider value={components}>
            <RenderProvider renderers={renderers}>{children}</RenderProvider>
        </AttributeValueContext.Provider>
    );
}

export function useAttributeValueComponents(): AttributeValueComponents {
    const components = React.useContext(AttributeValueContext);
    if (!components) throw new Error("useAttributeValueComponents must be used inside an AttributeValueProvider");
    return components;
}

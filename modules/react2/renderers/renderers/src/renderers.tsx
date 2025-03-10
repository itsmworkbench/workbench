import {ReactElement} from "react";
import {makeContextFor} from "@itsmworkbench/react_utils";

export function idFrom(rootId: string, attribute: string) {
    return `${rootId}-${attribute}`;
}

export type RenderProps<T> = {
    rootId: string
    attribute: string
    value: T | undefined;
    label?: string;
    icon?: () => ReactElement;
    style?: React.CSSProperties;
    clipboard?: boolean;
};

export type TitleAndUrl = {
    title: string;
    url: string;
}
export type IconTitleAndUrl = {
    icon: () => ReactElement
    title: string;
    url: string;
}

export type Render<T> = (props: RenderProps<T>) => React.ReactNode

export type Renderers = {
    Text: Render<string>
    Json: Render<any>
    Date: Render<string>
    Url: Render<string>
    Markdown: Render<string>
    H1: Render<string>
    H1WithIconAndUrl: Render<IconTitleAndUrl>
    H1WithUrl: Render<TitleAndUrl>
    H2: Render<string>
    H3: Render<string>
    Label: Render<string>
    Status: Render<boolean>
}

export const {Provider: RenderProvider, use: useRenderers} = makeContextFor<Renderers, 'renderers'>('renderers');


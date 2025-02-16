import React from "react";
import { IconTitleAndUrl, idFrom, Render, RenderProps, TitleAndUrl } from "../renderers";
import { useTheme } from "@itsmworkbench/themes";
import { useCommonComponents } from "@itsmworkbench/common_components";

export const SimpleH1Renderer: Render<string> = ({ rootId, attribute, value }: RenderProps<string>) => {
    const id = idFrom(rootId, attribute);
    return <h1 id={id} data-testid={id}>{value || ""}</h1>;  // Fallback to empty string
};


export const SimpleH1WithIconAndUrlRenderer: Render<IconTitleAndUrl> = ({ rootId, attribute, value }: RenderProps<IconTitleAndUrl>) => {
    const id = idFrom(rootId, attribute);
    const { renderer } = useTheme();
    const { h1WithUrl, headerLink } = renderer;
    const { MouseOver } = useCommonComponents();
    const linkHover = useTheme().dataLayout.linkMouseOverColor;
    const Icon = typeof value?.icon === "function" ? value.icon() : undefined;
    return <h1 style={h1WithUrl} id={id} data-testid={id}>
        <MouseOver linkHover={linkHover}>
            <a style={headerLink} target="_blank" href={value?.url} >
                <span>{Icon}</span>
                <span style={
                    {
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                    }
                }>{value?.title}</span>
            </a>
        </MouseOver>
    </h1 >;
};


export const SimpleH1WithUrlRenderer: Render<TitleAndUrl> = ({ rootId, attribute, value }: RenderProps<TitleAndUrl>) => {
    const id = idFrom(rootId, attribute);
    const { renderer } = useTheme();
    const { h1WithUrl, headerLink } = renderer;
    const linkHover = useTheme().dataLayout.linkMouseOverColor;
    const { MouseOver } = useCommonComponents();
    return <h1 style={h1WithUrl} id={id} data-testid={id}>
        <MouseOver linkHover={linkHover}>
            <a style={headerLink} href={value?.url}>{value?.title}</a>
        </MouseOver>
    </h1>;
};

export const SimpleH2Renderer: Render<string> = ({ rootId, attribute, value }: RenderProps<string>) => {
    const id = idFrom(rootId, attribute);
    return <h2 id={id} data-testid={id}>{value || ""}</h2>;
};

export const SimpleH3Renderer: Render<string> = ({ rootId, attribute, value }: RenderProps<string>) => {
    const id = idFrom(rootId, attribute);
    return <h3 id={id} data-testid={id} style={{ margin: "0.5em 0" }}>{value || ""}</h3>;
};

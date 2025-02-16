import { idFrom, Render, RenderProps } from "../renderers";
import React, { useRef } from "react";
import { useTheme } from "@itsmworkbench/themes";
import { ellipsesInMiddle } from "@itsmworkbench/utils";
import { useCommonComponents } from "@itsmworkbench/common_components";


// Explicitly use Render<string> to handle URL rendering
export const SimpleUrlRenderer: Render<string> = ({ attribute, rootId, value, label, icon }: RenderProps<string>) => {
    const id = idFrom(rootId, attribute);
    const styles = useTheme().renderer.link;
    const linkHover = useTheme().dataLayout.linkMouseOverColor;

    const isValidUrl = (url: string) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    // Truncate URLs longer than 70 characters
    const displayUrl = value ? ellipsesInMiddle(value, 70) : "";
    const { MouseOver } = useCommonComponents();
    return (
        <MouseOver linkHover={linkHover} >
            <a
                id={id}
                data-testid={id}
                style={{ ...styles, display: "flex", gap: "0.5rem" }}
                href={value && isValidUrl(value) ? value : "#"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={value || "Not available"}
                title={value || "Not available"}
            >
                {icon && icon()}
                {label || displayUrl}
            </a>
        </MouseOver>
    );
};

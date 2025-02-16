import React, { CSSProperties } from "react";
import {useTheme} from "@itsmworkbench/themes";
import {idFrom, Render, RenderProps} from "../renderers";

// Explicitly use Render<string> to handle string or undefined values
export const SimpleTextRenderer: Render<string> = ({attribute, rootId, value}: RenderProps<string>) => {
    const isEmpty = !value || value?.trim?.() === "";
    const id = idFrom(rootId, attribute);
    const styles:CSSProperties = useTheme().renderer.text;

    return (
        <span
            id={id}
            data-testid={id}
            style={styles}
            aria-label={isEmpty ? "Not available" : undefined}
            aria-live="polite"
        >
            {isEmpty ? "" : value}
        </span>
    );
};

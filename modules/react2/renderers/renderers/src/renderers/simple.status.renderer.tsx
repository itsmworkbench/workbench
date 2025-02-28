import React, { CSSProperties } from "react";
import { useTheme } from "@itsmworkbench/themes";
import { idFrom, Render, RenderProps } from "../renderers";

export const StatusRenderer: Render<boolean> = ({ attribute, rootId, value }: RenderProps<boolean>) => {
    const id = idFrom(rootId, attribute);
    const theme = useTheme();
    const textStyles: CSSProperties = theme.renderer.text;

    // Choose icon, color, and aria-label based on the value:
    let icon: string;
    let color: string;
    let ariaLabel: string;

    if (value === undefined) {
        icon = "⏳";          // Hourglass for undefined
        color = "grey";
        ariaLabel = "Not available";
    } else if (value === true) {
        icon = "✔";           // Tick for true
        color = "green";
        ariaLabel = "True";
    } else {
        icon = "✖";           // Cross for false
        color = "red";
        ariaLabel = "False";
    }

    const combinedStyles: CSSProperties = {
        ...textStyles,
        color,
    };

    return (
        <span
            id={id}
            data-testid={id}
            style={combinedStyles}
            aria-label={ariaLabel}
            aria-live="polite"
        >
      {icon}
    </span>
    );
};

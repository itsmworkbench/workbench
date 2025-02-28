
import { idFrom, Render } from "../renderers";
import React from "react";
import {useTheme} from "@itsmworkbench/themes";

// Updated to Render<string>
export const SimpleDateRenderer: Render<string> = ({ attribute, rootId, value, style={} }) => {
    const id = idFrom(rootId, attribute);
    const styles = useTheme().renderer.text;

    function asDate(value: string | undefined): string {
        if (!value) return "Invalid date";  // Handles undefined or empty string

        const date = new Date(value);
        if (isNaN(date.getTime())) return "Invalid date";

        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString(undefined, { month: 'short' });  // Use browser locale
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    }

    const formattedDate = asDate(value);

    return (
        <time
            id={id}
            data-testid={id}
            style={styles}
            dateTime={value || ""}
            aria-label={`Formatted date: ${formattedDate}`}
            title={formattedDate}
        >
            {formattedDate}
        </time>
    );
};

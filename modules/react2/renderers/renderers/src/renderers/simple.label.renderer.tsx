import {idFrom, Render, RenderProps} from "../renderers";
import React from "react";
import {useTheme} from "@itsmworkbench/themes";

// Render<string> indicates this renderer expects a string or undefined for value
export const SimpleLabelRenderer: Render<string> = ({ rootId, attribute, value }: RenderProps<string>) => {
    const id = idFrom(rootId, attribute);
    const styles = useTheme().renderer.label;
    return <label style={styles} htmlFor={id}>{value || ""}: </label>;  // Fallback to empty string
};

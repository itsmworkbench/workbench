import React from "react";
import {Errors} from "@itsmworkbench/errors";
import {makeContextFor} from "@itsmworkbench/react_utils";

import {useTranslation} from "@itsmworkbench/translation";

export type IconSize = 'small' | 'medium' | 'large';
export type IconContextData = {
    DecorativeIcon: DecorativeIconFn;
    MeaningfulIcon: MeaningfulIconFn;
};
const sizeToPixels: Record<IconSize, number> = {
    small: 16,
    medium: 32,
    large: 64,
};

// Optional config that now includes both type and size
export type IconConfig = {
    type?: string;
    size?: IconSize;
};

// Modified types for the icon functions
export type DecorativeIconFn = (name: string, config?: IconConfig) => Icon;
export type MeaningfulIconFn = (name: string, purpose: string, config?: IconConfig) => Icon;
export type IconProps = React.HTMLProps<HTMLImageElement>
export type Icon = (props: IconProps) => React.ReactElement;

// Update calculatePath to accept an optional type, defaulting to 'png'
function calculatePath(name: string, type?: string) {
    const ext = type || 'png';
    const withType= name.indexOf('.') === -1 ? `${name}.${ext}` : name;
    const withPath = name.indexOf('/') === -1 ? `/icons/${withType}` : withType;
    return withPath
}

// Decorative icons (non-interactive)
export const decorativeIconFn: DecorativeIconFn = (name: string, config) => (props) => {
    const path = calculatePath(name, config?.type);
    const size = config?.size ? sizeToPixels[config.size] : undefined;
    return (
        <img
            src={path}
            role="presentation"
            style={size ? {width: size, height: size} : {}}
            {...props}
        />
    );
};

// Meaningful icons (interactive or informative)
export const meaningfulIconFn: MeaningfulIconFn = (name: string, purpose: string, config) => (props) => {
    const translation = useTranslation();
    const path = calculatePath(name, config?.type);
    const size = config?.size ? sizeToPixels[config.size] : undefined;
    return (
        <img
            src={path}
            alt={translation(purpose)}
            style={size ? {width: size, height: size} : {}}
            {...props}
        />
    );
};

// Error handling for missing icons
export const simpleRecover = (e: Errors): Icon => {
    throw new Error(`Icon not found:\n${e.errors.join("\n")}`);
};

// Default context values for icons
export const simpleIconContext: IconContextData = {
    DecorativeIcon: decorativeIconFn,
    MeaningfulIcon: meaningfulIconFn,
};

// Context provider and hook for icons
export const {Provider: IconProvider, use: useIcon} = makeContextFor('icons', simpleIconContext);

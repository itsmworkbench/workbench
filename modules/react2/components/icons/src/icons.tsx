import React from "react";
import {Errors} from "@itsmworkbench/errors";
import {makeContextFor} from "@itsmworkbench/react_utils";
import {useTranslation} from "@itsmworkbench/translation";

// Types for decorative and meaningful icons
export type DecorativeIconFn = (name: string, type?: string) => Icon;
export type MeaningfulIconFn = (name: string, purpose: string, type?: string) => Icon;
export type IconProps = React.HTMLProps<HTMLImageElement>
export type Icon = (props: IconProps) => React.ReactElement;

// Icon context type to manage both types of icons
export type IconContextData = {
    DecorativeIcon: DecorativeIconFn;
    MeaningfulIcon: MeaningfulIconFn;
};

// Accessible descriptions for meaningful icons

function calculatePath(name: string, type: string) {
    return name.indexOf('.') === -1 ? `icons/${name}.${type || 'png'}` : name
}

// Decorative icons (non-interactive)
export const decorativeIconFn: DecorativeIconFn = (name: string, type): Icon =>
    (props) => {
        const path = calculatePath(name, type);
        return <img
            src={`icons/${path}`}
            role="presentation"
            {...props}
        />;
    };

// Meaningful icons (interactive or informative)
export const meaningfulIconFn: MeaningfulIconFn = (name: string, purpose: string, type = 'png'): Icon =>
    (props) => {
        const translation = useTranslation()
        const path = calculatePath(name, type);
        return (
            <img
                src={`icons/${path}`}
                alt={translation(purpose)}
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

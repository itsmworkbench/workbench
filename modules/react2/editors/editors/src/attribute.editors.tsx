import React, {createContext, ReactElement, ReactNode, useMemo} from "react";
import {EditorProps, Editors, EditorsProvider} from "./editors";

import {OptionsProps} from "./simple.options.editor";
import {useTranslation} from "@itsmworkbench/translation";
import {useFeatureFlag} from "@itsmworkbench/react_utils";
import {mapRecord} from "@itsmworkbench/record_utils";
import {AttributeValueOrientation, DataLayout, idFrom, useAttributeValueOrientation} from "@itsmworkbench/renderers";


export type AttributeEditorLayoutProps = {
    children: [ReactNode, ReactNode];
    'data-testid'?: string;
    orientation?: AttributeValueOrientation;
    className?: string;
};

export type AttributeEditorLayout = (props: AttributeEditorLayoutProps) => ReactNode;

export type AttributeEditorOrientation = 'horizontal' | 'vertical';

export type AttributeEditorProps<Props> = Props & {
    orientation?: AttributeEditorOrientation;
    translate?: boolean;
};

export type AttributeEditor<Props = EditorProps<string>> = (props: AttributeEditorProps<Props>) => ReactElement;


//Would love to do this by infering... but couldn't make it work
export type AttributeEditorComponents = {
    DataLayout: DataLayout
    OneLine: AttributeEditor;
    Options: AttributeEditor<OptionsProps<any>>
};

// Context for Attribute Editors
export const AttributeEditorContext = createContext<AttributeEditorComponents | undefined>(undefined);


// AttributeEditorRenderer Component
type AttributeEditorRendererProps<T> = EditorProps<T> & {
    Editor: AttributeEditor<T>;
    AttributeEditorLayout: AttributeEditorLayout;
    translate?: boolean;
    orientation?: AttributeEditorOrientation;
};

function AttributeEditorRenderer<T>(props: AttributeEditorRendererProps<T>) {
    const {Editor, rootId, attribute, orientation, AttributeEditorLayout} = props;
    const id = idFrom(rootId, attribute);
    const translation = useTranslation();
    const defaultOrientation = useAttributeValueOrientation();

    const label = props.translate ? translation(`${attribute}`) : attribute; // Internationalized label
    return (
        <AttributeEditorLayout data-testid={`${id}-ae`} orientation={orientation || defaultOrientation}>
            <label htmlFor={id}>{label}</label>
            <Editor {...props as any} ariaLabel={`${label} editor`}/>
        </AttributeEditorLayout>
    );
}

// AttributeEditorProvider Component
type AttributeEditorProviderProps = {
    children: React.ReactNode;
    editors: Editors;
    AttributeEditorLayout: AttributeEditorLayout;
    DataLayout: DataLayout
};

export function AttributeEditorProvider({
                                            children,
                                            editors,
                                            AttributeEditorLayout,
                                            DataLayout,
                                        }: AttributeEditorProviderProps) {
    const muiFF = useFeatureFlag('mui');
    const components = useMemo(() => {
        const mappedComponents = mapRecord(editors, (Editor, key) =>
            (props: AttributeEditorProps<any>) => {
                if ((Editor as any).hasLabel) return <Editor {...props} />;
                else return <AttributeEditorRenderer
                    Editor={Editor as any /* Very hard to get this type right*/}
                    {...props}
                    AttributeEditorLayout={AttributeEditorLayout}
                />;
            }
        );
        if (muiFF)
            mappedComponents['Options'] = editors['Options'] as any;
        return {...mappedComponents, DataLayout};
    }, [editors, AttributeEditorLayout, muiFF]);

    return (
        <AttributeEditorContext.Provider value={components}>
            <EditorsProvider editors={editors}>
                {children}
            </EditorsProvider>
        </AttributeEditorContext.Provider>
    );
}

// Hook to use AttributeEditorComponents
export function useAttributeEditorComponents(): AttributeEditorComponents {
    const components = React.useContext(AttributeEditorContext);
    if (!components) throw new Error("useAttributeEditorComponents must be used inside an AttributeEditorProvider");
    return components;
}

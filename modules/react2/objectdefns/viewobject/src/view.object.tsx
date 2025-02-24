import {FieldDefn, FieldType, ObjectDefn} from "@itsmworkbench/object_defn";
import {DataLayout} from "@itsmworkbench/renderers";
import {makeContextFor} from "@itsmworkbench/react_utils";
import React from "react";
import {SimpleViewComponents} from "./simpleViewComponents";

export type ViewComponentProps<Main, T> = {
    rootId: string
    main: Main
    fieldDefn: FieldDefn<Main, T>
    showLabel?: boolean
}
export type ViewComponent<T> = <Main, >(props: ViewComponentProps<Main, T>) => React.ReactElement

export type ViewComponents = {
    DataLayout: DataLayout
    StringView: ViewComponent<string>
    EncryptedView: ViewComponent<string>
}

export type ViewObjectProps<Main> = {
    rootId: string
    main: Main
    objectDefn: ObjectDefn<Main>
}

export function findView<Main>(Views: ViewComponents, fieldType: FieldType, props: ViewComponentProps<Main, any>) {
    if (fieldType === 'encrypted') return <Views.EncryptedView {...props}/>;
    if (fieldType === 'string') return <Views.StringView {...props}/>;
    throw new Error(`Unknown field type ${fieldType}. Legal values are ${Object.keys(Views).toString()}`)
}

export function ViewObjectFromDefn<Main>({rootId, main, objectDefn}: ViewObjectProps<Main>) {
    const Views = useViewComponents();
    const DataLayout = Views.DataLayout;

    return (
        <DataLayout rootId={rootId} layout={objectDefn.layout}>
            {Object.entries(objectDefn.fields).map(([name, fieldDefn]) => {
                const {fieldType} = fieldDefn;
                return findView(Views, fieldType, {rootId, main, fieldDefn});
            })}
        </DataLayout>
    )
}

export const {use: useViewComponents, Provider: ViewComponentsProvider} = makeContextFor<ViewComponents, 'viewComponents'>('viewComponents', SimpleViewComponents);

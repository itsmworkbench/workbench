import {FieldDefn, ObjectDefn} from "@itsmworkbench/object_defn";
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

export function ViewObjectFromDefn<Main>({rootId, main, objectDefn}: ViewObjectProps<Main>) {
    const {DataLayout, StringView, EncryptedView} = useViewComponents();
    return (
        <DataLayout rootId={rootId} layout={objectDefn.layout}>
            {Object.entries(objectDefn.fields).map(([name, fieldDefn]) => {
                const {fieldType} = fieldDefn;
                const View = fieldType === 'encrypted' ? EncryptedView : StringView;
                return <View rootId={rootId} main={main} fieldDefn={fieldDefn} showLabel={true}/>
            })}
        </DataLayout>
    )
}

export const {use: useViewComponents, Provider: ViewComponentsProvider} = makeContextFor<ViewComponents, 'viewComponents'>('viewComponents', SimpleViewComponents);

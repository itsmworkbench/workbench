import React from "react";
import {DataLayout, SimpleDataLayout} from "@itsmworkbench/renderers";
import {SimpleEditString} from "./simpleEditString";
import {SimpleEditEncryptedString} from "./simpleEditEncryptedString";
import {SimpleEditBoolean} from "./simpleEditBoolean";
import {SimpleEditOptions} from "./simpleEditOptions";
import {GetterSetter, makeContextFor} from "@itsmworkbench/react_utils";
import {FieldDefn} from "@itsmworkbench/object_defn";

export type EditComponentProps<Main, T> = {
    rootId: string
    mainOps: GetterSetter<Main>
    fieldName: string
    prefix?: string //if present we translate the name
    fieldDefn: FieldDefn<Main, T>
    showLabel?: boolean
}
export type EditComponent<T> = <Main, >(props: EditComponentProps<Main, T>) => React.ReactElement

export type EditComponentWithOptionsProps<Main, T> = EditComponentProps<Main, T> & {
    options: string[]
}
export type EditComponentWithOptions<T> = <Main, >(props: EditComponentWithOptionsProps<Main, T>) => React.ReactElement

export type EditComponents = {
    DataLayout: DataLayout
    EditString: EditComponent<string>
    EditEncryptedString: EditComponent<string>
    EditBoolean: EditComponent<boolean>
    EditOptions: EditComponentWithOptions<string>
    EditStatus: EditComponent<boolean>
}

export const simpleEditComponents: EditComponents = {
    DataLayout: SimpleDataLayout,
    EditString: SimpleEditString,
    EditEncryptedString: SimpleEditEncryptedString,
    EditBoolean: SimpleEditBoolean,
    EditOptions: SimpleEditOptions,
    EditStatus: SimpleEditBoolean
}

export const {use: useEditComponents, Provider: EditComponentsProvider} = makeContextFor<EditComponents, 'editComponents'>('editComponents', simpleEditComponents);

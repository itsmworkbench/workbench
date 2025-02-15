
import {ReactNode} from "react";
import {OptionsEditor} from "./simple.options.editor";
import {GetterSetter, makeContextFor} from "@itsmworkbench/react_utils";

export type EditorProps<T> = {
    rootId: string
    attribute: string
    ops: GetterSetter<T>
    //Only needed if no label is provided
    ariaLabel?: string
}

export type Editor<Props = EditorProps<string>> = (props: Props) => ReactNode

export type Editors = {
    OneLine: Editor
    Options: OptionsEditor
}

export const {use: useEditors, Provider: EditorsProvider} = makeContextFor<Editors, 'editors'>('editors')
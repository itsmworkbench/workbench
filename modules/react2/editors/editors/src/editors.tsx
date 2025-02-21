import {ReactNode} from "react";
import {OptionsEditor} from "./simple.options.editor";
import {GetterSetter, makeContextFor} from "@itsmworkbench/react_utils";
import {NameAnd} from "@laoban/utils";
import {LensAndPath} from "@itsmworkbench/optics";


export type EditorProps<Main, T> = {
    rootId: string
    attribute: string
    ops: GetterSetter<Main>
    //Only needed if no label is provided
    ariaLabel?: string
}

export type Editor<Props = EditorProps<string>> = (props: Props) => ReactNode

export type Editors = {
    OneLine: Editor
    Options: OptionsEditor
}

export const {use: useEditors, Provider: EditorsProvider} = makeContextFor<Editors, 'editors'>('editors')
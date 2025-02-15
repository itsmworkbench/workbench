import {GetterSetter, makeContextFor} from "@itsmworkbench/react_utils";


export type SelectableButtonProps = {
    prefix: string
    selectedOps: GetterSetter<string>
    text: string
}
export type SelectableButton = (props: SelectableButtonProps) => React.ReactNode

export const {use: useSelectableButton, Provider: SelectableButtonProvider} = makeContextFor<SelectableButton, 'selectableButton'>('selectableButton')

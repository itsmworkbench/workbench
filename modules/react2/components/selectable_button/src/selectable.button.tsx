import {GetterSetter} from "@itsmworkbench/react_utils";


export type SelectableButtonProps = {
    prefix: string
    selectedOps?: GetterSetter<string>
    text: string
    onClick?: (text: string) =>void
}
export type SelectableButton = (props: SelectableButtonProps) => React.ReactNode


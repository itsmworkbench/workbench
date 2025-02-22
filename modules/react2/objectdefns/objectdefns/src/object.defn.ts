import {LensAndPath} from "@itsmworkbench/optics";
import {Codec, NameAnd} from "@itsmworkbench/utils";

export type FieldType = 'string' | 'encrypted'
export type FieldDefn<Main, T> = {
    lens: LensAndPath<Main, T>
    fieldType?: FieldType //default is string
    editable?: boolean//default is true
}
export type ObjectDefn<Main> = {
    fields: NameAnd<FieldDefn<Main, any>>
    layout: number[]
}

import {LensAndPath} from "@itsmworkbench/optics";
import {Codec, NameAnd} from "@itsmworkbench/utils";

export type FieldType = 'string' | 'encrypted' | 'options' | 'boolean'

export type SimpleFieldDefn<Main, T> = {
    lens: LensAndPath<Main, T>
    fieldType?: FieldType //default is string
    editable?: boolean//default is true
}
export type OptionsFieldDefn<Main, T> = SimpleFieldDefn<Main, T> & {
    fieldType: 'options'
    options: T[]
}
export type FieldDefn<Main, T> = SimpleFieldDefn<Main, T> | OptionsFieldDefn<Main, T>

export type ObjectDefn<Main> = {
    fields: NameAnd<FieldDefn<Main, any>>
    layout: number[]
}
